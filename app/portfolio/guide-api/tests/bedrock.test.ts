import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { RetrieveAndGenerateCommandInput, RetrieveAndGenerateCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime'
import { answerWithBedrock } from '../src/bedrock.js'

const env = {
  BEDROCK_KNOWLEDGE_BASE_ID: 'KB123',
  BEDROCK_MODEL_ARN: 'arn:aws:bedrock:ap-northeast-1::foundation-model/amazon.nova-lite-v1:0',
  BEDROCK_GUARDRAIL_ID: 'gr-123',
  BEDROCK_GUARDRAIL_VERSION: '1',
  BEDROCK_MAX_OUTPUT_TOKENS: '500',
  BEDROCK_RETRIEVAL_RESULT_LIMIT: '4',
} as NodeJS.ProcessEnv

const manifest = {
  sources: {
    'knowledge/CICD.md': { title: 'CI/CD Workflow', source: 'docs/portfolio/CICD.md' },
  },
}

describe('Bedrock Knowledge Base adapter', () => {
  it('calls RetrieveAndGenerate with output limits, guardrail config, and browser session id', async () => {
    let observed: RetrieveAndGenerateCommandInput | undefined
    const response = await answerWithBedrock(
      { message: 'How does Hiraya deploy infrastructure?', sessionId: 'session-1' },
      {
        env,
        citationManifest: manifest,
        retrieveAndGenerate: async (input) => {
          observed = input
          return answeredOutput()
        },
      },
    )

    assert.equal(response.status, 'answered')
    assert.equal(response.answer, 'Hiraya deploys infrastructure through reviewed Terraform and GitHub Actions gates.')
    assert.equal(response.sessionId, 'bedrock-session-1')
    assert.deepEqual(response.citations, [{ title: 'CI/CD Workflow', source: 'docs/portfolio/CICD.md' }])
    assert.equal(observed?.sessionId, 'session-1')
    const config = observed?.retrieveAndGenerateConfiguration?.knowledgeBaseConfiguration
    assert.equal(config?.knowledgeBaseId, 'KB123')
    assert.equal(config?.generationConfiguration?.inferenceConfig?.textInferenceConfig?.maxTokens, 500)
    assert.equal(config?.generationConfiguration?.guardrailConfiguration?.guardrailId, 'gr-123')
    assert.equal(config?.retrievalConfiguration?.vectorSearchConfiguration?.numberOfResults, 4)
  })

  it('refuses generated text when Bedrock returns no usable citations', async () => {
    const response = await answerWithBedrock(
      { message: 'Invent something without evidence' },
      {
        env,
        citationManifest: manifest,
        retrieveAndGenerate: async () => ({ $metadata: {}, output: { text: 'Unsupported generated claim.' }, sessionId: 'bedrock-session-2', citations: [] }),
      },
    )

    assert.equal(response.status, 'refused')
    assert.equal(response.sessionId, 'bedrock-session-2')
    assert.equal(response.citations.length, 0)
    assert.doesNotMatch(response.answer, /Unsupported generated claim/)
  })

  it('maps Knowledge Base not-ready errors to an application-level not_ready response', async () => {
    const response = await answerWithBedrock(
      { message: 'Is the KB ready?' },
      {
        env,
        retrieveAndGenerate: async () => {
          const error = new Error('knowledge base data source ingestion is not ready')
          error.name = 'ResourceNotFoundException'
          throw error
        },
      },
    )

    assert.equal(response.status, 'not_ready')
    assert.match(response.answer, /preparing curated project knowledge/i)
  })

  it('does not expose raw retrieved chunk text in normalized citations', async () => {
    const response = await answerWithBedrock(
      { message: 'What is CI/CD?' },
      {
        env,
        citationManifest: manifest,
        retrieveAndGenerate: async () => ({
          ...answeredOutput(),
          citations: [
            {
              generatedResponsePart: { textResponsePart: { text: 'answer', span: { start: 0, end: 6 } } },
              retrievedReferences: [
                {
                  content: { text: 'raw retrieved chunk must stay server-side' },
                  location: { type: 'S3', s3Location: { uri: 's3://bucket/knowledge/CICD.md' } },
                },
              ],
            },
          ],
        }),
      },
    )

    assert.equal(response.status, 'answered')
    assert.doesNotMatch(JSON.stringify(response), /raw retrieved chunk/)
  })

  it('refuses unknown knowledge citations instead of exposing raw S3 labels', async () => {
    const response = await answerWithBedrock(
      { message: 'What does an unknown source say?' },
      {
        env,
        citationManifest: manifest,
        retrieveAndGenerate: async () => ({
          ...answeredOutput(),
          citations: [
            {
              generatedResponsePart: { textResponsePart: { text: 'answer', span: { start: 0, end: 6 } } },
              retrievedReferences: [
                {
                  content: { text: 'raw chunk' },
                  location: { type: 'S3', s3Location: { uri: 's3://bucket/knowledge/UNKNOWN.md' } },
                },
              ],
            },
          ],
        }),
      },
    )

    assert.equal(response.status, 'refused')
    assert.equal(response.citations.length, 0)
    assert.doesNotMatch(JSON.stringify(response), /s3:\/\/bucket\/knowledge\/UNKNOWN\.md/)
  })
})

function answeredOutput(): RetrieveAndGenerateCommandOutput {
  return {
    $metadata: {},
    output: { text: 'Hiraya deploys infrastructure through reviewed Terraform and GitHub Actions gates.' },
    sessionId: 'bedrock-session-1',
    citations: [
      {
        generatedResponsePart: { textResponsePart: { text: 'answer', span: { start: 0, end: 6 } } },
        retrievedReferences: [
          {
            content: { text: 'raw chunk' },
            location: { type: 'S3', s3Location: { uri: 's3://bucket/knowledge/CICD.md' } },
          },
        ],
      },
    ],
  }
}
