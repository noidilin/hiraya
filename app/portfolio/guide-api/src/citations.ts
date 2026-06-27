import type { GuideCitation } from './contract.js'

export type CitationManifest = {
  sources?: Record<string, GuideCitation>
}

type RawCitation = Partial<GuideCitation> & Record<string, unknown>

const fallbackCitation: GuideCitation = {
  title: 'Project Brief',
  source: 'docs/portfolio/PROJECT_BRIEF.md',
}

export function localAnsweredCitation(): GuideCitation {
  return fallbackCitation
}

export function normalizeCitations(rawCitations: RawCitation[], manifest?: CitationManifest): GuideCitation[] {
  const seen = new Set<string>()
  const normalized: GuideCitation[] = []

  for (const citation of rawCitations) {
    const rawSource = stringValue(citation.source).trim()
    const manifestCitation = lookupManifestCitation(rawSource, manifest)
    if (!manifestCitation && isKnowledgeStorageSource(rawSource)) continue

    const title = (manifestCitation?.title ?? stringValue(citation.title)).trim()
    const source = (manifestCitation?.source ?? rawSource).trim()

    if (!title || !source) continue

    const key = `${title}\0${source}`
    if (seen.has(key)) continue

    seen.add(key)
    normalized.push({ title, source })
  }

  return normalized
}

function lookupManifestCitation(source: string, manifest: CitationManifest | undefined): GuideCitation | undefined {
  if (!manifest?.sources) return undefined
  const key = source.replace(/^s3:\/\/[^/]+\/knowledge\//, 'knowledge/')
  return manifest.sources[source] ?? manifest.sources[key] ?? manifest.sources[key.replace(/^knowledge\//, 'docs/portfolio/')]
}

function isKnowledgeStorageSource(source: string): boolean {
  return /^s3:\/\/[^/]+\/knowledge\//.test(source) || /^knowledge\//.test(source)
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
