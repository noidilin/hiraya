import { BedrockAgentRuntimeClient, RetrieveCommand, RetrieveAndGenerateCommand, type RetrieveAndGenerateCommandInput, type RetrieveAndGenerateCommandOutput, type RetrieveCommandInput, type RetrieveCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import type { GuideChatRequest, GuideChatResponse, GuideCitation } from './contract.js'
import { normalizeCitations, type CitationManifest } from './citations.js'

export type RetrieveAndGenerate = (input: RetrieveAndGenerateCommandInput) => Promise<RetrieveAndGenerateCommandOutput>
export type Retrieve = (input: RetrieveCommandInput) => Promise<RetrieveCommandOutput>

export type GuideAnswererOptions = {
  retrieveAndGenerate?: RetrieveAndGenerate
  retrieve?: Retrieve
  citationManifest?: CitationManifest
  env?: NodeJS.ProcessEnv
}

const refusedAnswer = 'I could not find enough curated Hiraya project evidence to answer that. Try asking about architecture, CI/CD, security gates, team roles, or documented decisions.'
const notReadyAnswer = 'Hiraya Guide is still preparing curated project knowledge. Please try again after ingestion completes.'
const errorAnswer = 'Hiraya Guide hit an unexpected service error. Please try again later.'

let bedrockClient: BedrockAgentRuntimeClient | undefined
let s3Client: S3Client | undefined
let cachedManifest: CitationManifest | undefined

export async function answerWithBedrock(request: GuideChatRequest, options: GuideAnswererOptions = {}): Promise<GuideChatResponse> {
  const env = options.env ?? process.env
  const knowledgeBaseId = env.BEDROCK_KNOWLEDGE_BASE_ID
  const modelArn = env.BEDROCK_MODEL_ARN

  if (!knowledgeBaseId || !modelArn) {
    return { status: 'not_ready', answer: notReadyAnswer, sessionId: request.sessionId, citations: [] }
  }

  const retrieveAndGenerate = options.retrieveAndGenerate ?? defaultRetrieveAndGenerate
  const retrieve = options.retrieve ?? (options.retrieveAndGenerate ? undefined : defaultRetrieve)

  try {
    const manifest = options.citationManifest ?? (await citationManifest(env))
    const retrievalConfiguration = {
      vectorSearchConfiguration: {
        numberOfResults: Number(env.BEDROCK_RETRIEVAL_RESULT_LIMIT ?? '5'),
      },
    }
    const retrieved = retrieve
      ? await retrieve({
          knowledgeBaseId,
          retrievalQuery: { text: request.message },
          retrievalConfiguration,
        })
      : undefined
    const output = await retrieveAndGenerate({
      input: { text: request.message },
      sessionId: request.sessionId,
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId,
          modelArn,
          retrievalConfiguration,
          generationConfiguration: {
            inferenceConfig: {
              textInferenceConfig: {
                maxTokens: Number(env.BEDROCK_MAX_OUTPUT_TOKENS ?? '700'),
                temperature: 0.2,
                topP: 0.9,
              },
            },
            guardrailConfiguration: guardrailConfiguration(env),
            promptTemplate: {
              textPromptTemplate: [
                'You are Hiraya Guide, a portfolio-facing assistant.',
                'Answer only from the retrieved Curated Project Knowledge.',
                'If the retrieved knowledge is insufficient, say you do not have enough curated evidence.',
                'Do not reveal raw retrieved chunks.',
                '$search_results$',
                'Question: $query$',
              ].join('\n'),
            },
          },
        },
      },
    })

    const citationCandidates = [...extractRetrievedCitationCandidates(retrieved), ...extractCitationCandidates(output)]
    const citations = normalizeCitations(citationCandidates, manifest)
    const answer = output.output?.text?.trim() || refusedAnswer
    if (citations.length === 0) {
      console.warn(JSON.stringify({ component: 'bedrock', warning: 'no_normalized_citations', candidateCount: citationCandidates.length, candidateSources: citationCandidates.map((citation) => citation.source).slice(0, 5), manifestSourceCount: manifest?.sources ? Object.keys(manifest.sources).length : 0 }))
      return { status: 'refused', answer: refusedAnswer, sessionId: output.sessionId ?? request.sessionId, citations: [] }
    }
    if (isInsufficientEvidenceAnswer(answer)) {
      return { status: 'refused', answer: refusedAnswer, sessionId: output.sessionId ?? request.sessionId, citations: [] }
    }

    return {
      status: 'answered',
      answer,
      sessionId: output.sessionId ?? request.sessionId,
      citations,
    }
  } catch (error) {
    console.error(JSON.stringify({ component: 'bedrock', error: errorSummary(error) }))
    if (isNotReadyError(error)) {
      return { status: 'not_ready', answer: notReadyAnswer, sessionId: request.sessionId, citations: [] }
    }

    return { status: 'error', answer: errorAnswer, sessionId: request.sessionId, citations: [] }
  }
}

function guardrailConfiguration(env: NodeJS.ProcessEnv): { guardrailId: string; guardrailVersion: string } | undefined {
  if (!env.BEDROCK_GUARDRAIL_ID || !env.BEDROCK_GUARDRAIL_VERSION) return undefined
  return { guardrailId: env.BEDROCK_GUARDRAIL_ID, guardrailVersion: env.BEDROCK_GUARDRAIL_VERSION }
}

function extractCitationCandidates(output: RetrieveAndGenerateCommandOutput): GuideCitation[] {
  const candidates: GuideCitation[] = []
  for (const citation of output.citations ?? []) {
    for (const reference of citation.retrievedReferences ?? []) {
      const uri = reference.location?.s3Location?.uri
      if (uri) candidates.push({ title: uri, source: uri })
    }
  }
  return candidates
}

function extractRetrievedCitationCandidates(output: RetrieveCommandOutput | undefined): GuideCitation[] {
  const candidates: GuideCitation[] = []
  for (const result of output?.retrievalResults ?? []) {
    const uri = result.location?.s3Location?.uri
    if (uri) candidates.push({ title: uri, source: uri })
  }
  return candidates
}

async function defaultRetrieve(input: RetrieveCommandInput): Promise<RetrieveCommandOutput> {
  const client = bedrockClient ?? new BedrockAgentRuntimeClient({})
  bedrockClient = client
  return client.send(new RetrieveCommand(input))
}

async function defaultRetrieveAndGenerate(input: RetrieveAndGenerateCommandInput): Promise<RetrieveAndGenerateCommandOutput> {
  const client = bedrockClient ?? new BedrockAgentRuntimeClient({})
  bedrockClient = client
  return client.send(new RetrieveAndGenerateCommand(input))
}

async function citationManifest(env: NodeJS.ProcessEnv): Promise<CitationManifest | undefined> {
  if (cachedManifest !== undefined) return cachedManifest
  if (!env.CITATION_MANIFEST_BUCKET || !env.CITATION_MANIFEST_KEY) return undefined

  const client = s3Client ?? new S3Client({})
  s3Client = client
  const response = await client.send(new GetObjectCommand({ Bucket: env.CITATION_MANIFEST_BUCKET, Key: env.CITATION_MANIFEST_KEY }))
  const text = await response.Body?.transformToString()
  cachedManifest = text ? (JSON.parse(text) as CitationManifest) : undefined
  return cachedManifest
}

function isNotReadyError(error: unknown): boolean {
  const record = error as { name?: string; message?: string } | undefined
  const value = `${record?.name ?? ''} ${record?.message ?? ''}`
  return /ResourceNotFound|not.?found|not.?ready|ingest|sync/i.test(value)
}

function isInsufficientEvidenceAnswer(answer: string): boolean {
  return /do not have enough curated evidence|could not find enough curated|insufficient curated evidence/i.test(answer)
}

function errorSummary(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { message: String(error) }
  const record = error as Error & { name?: string; $metadata?: { httpStatusCode?: number; requestId?: string } }
  return {
    name: record.name,
    message: record.message,
    httpStatusCode: record.$metadata?.httpStatusCode,
    requestId: record.$metadata?.requestId,
  }
}

export function resetBedrockCachesForTest(): void {
  bedrockClient = undefined
  s3Client = undefined
  cachedManifest = undefined
}
