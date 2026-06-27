import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand, type RetrieveAndGenerateCommandInput, type RetrieveAndGenerateCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import type { GuideChatRequest, GuideChatResponse, GuideCitation } from './contract.js'
import { normalizeCitations, type CitationManifest } from './citations.js'

export type RetrieveAndGenerate = (input: RetrieveAndGenerateCommandInput) => Promise<RetrieveAndGenerateCommandOutput>

export type GuideAnswererOptions = {
  retrieveAndGenerate?: RetrieveAndGenerate
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

  try {
    const manifest = options.citationManifest ?? (await citationManifest(env))
    const output = await retrieveAndGenerate({
      input: { text: request.message },
      sessionId: request.sessionId,
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId,
          modelArn,
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: Number(env.BEDROCK_RETRIEVAL_RESULT_LIMIT ?? '5'),
            },
          },
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

    const citations = normalizeCitations(extractCitationCandidates(output), manifest)
    if (citations.length === 0) {
      return { status: 'refused', answer: refusedAnswer, sessionId: output.sessionId ?? request.sessionId, citations: [] }
    }

    return {
      status: 'answered',
      answer: output.output?.text?.trim() || refusedAnswer,
      sessionId: output.sessionId ?? request.sessionId,
      citations,
    }
  } catch (error) {
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

export function resetBedrockCachesForTest(): void {
  bedrockClient = undefined
  s3Client = undefined
  cachedManifest = undefined
}
