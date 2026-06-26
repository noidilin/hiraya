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
    const manifestCitation = lookupManifestCitation(citation.source, manifest)
    const title = (manifestCitation?.title ?? stringValue(citation.title)).trim()
    const source = (manifestCitation?.source ?? stringValue(citation.source)).trim()

    if (!title || !source) continue

    const key = `${title}\0${source}`
    if (seen.has(key)) continue

    seen.add(key)
    normalized.push({ title, source })
  }

  return normalized
}

function lookupManifestCitation(source: unknown, manifest: CitationManifest | undefined): GuideCitation | undefined {
  if (!manifest?.sources || typeof source !== 'string') return undefined
  const key = source.replace(/^s3:\/\/[^/]+\/knowledge\//, 'knowledge/')
  return manifest.sources[source] ?? manifest.sources[key] ?? manifest.sources[key.replace(/^knowledge\//, 'docs/portfolio/')]
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
