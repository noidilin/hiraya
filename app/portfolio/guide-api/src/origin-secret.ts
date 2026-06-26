import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

let cachedOriginSecret: string | undefined
let secretsManagerClient: SecretsManagerClient | undefined

export async function expectedOriginSecret(): Promise<string | undefined> {
  if (cachedOriginSecret !== undefined) return cachedOriginSecret

  const localSecret = process.env.GUIDE_ORIGIN_SECRET
  if (localSecret) {
    cachedOriginSecret = localSecret
    return cachedOriginSecret
  }

  const secretArn = process.env.GUIDE_ORIGIN_SECRET_ARN
  if (!secretArn) return undefined

  const client = secretsManagerClient ?? new SecretsManagerClient({})
  secretsManagerClient = client
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }))
  cachedOriginSecret = response.SecretString ?? decodeSecretBinary(response.SecretBinary)
  return cachedOriginSecret
}

export function resetOriginSecretCacheForTest(): void {
  cachedOriginSecret = undefined
}

function decodeSecretBinary(secretBinary: Uint8Array | undefined): string | undefined {
  if (!secretBinary) return undefined
  return Buffer.from(secretBinary).toString('utf8')
}
