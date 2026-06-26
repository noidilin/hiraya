import type { GuideCitation } from './contract.js'

type RawCitation = Partial<GuideCitation> & Record<string, unknown>

const fallbackCitation: GuideCitation = {
  title: 'Project Brief',
  source: 'docs/portfolio/PROJECT_BRIEF.md',
}

export function localAnsweredCitation(): GuideCitation {
  return fallbackCitation
}

export function normalizeCitations(rawCitations: RawCitation[]): GuideCitation[] {
  const seen = new Set<string>()
  const normalized: GuideCitation[] = []

  for (const citation of rawCitations) {
    const title = typeof citation.title === 'string' ? citation.title.trim() : ''
    const source = typeof citation.source === 'string' ? citation.source.trim() : ''

    if (!title || !source) continue

    const key = `${title}\0${source}`
    if (seen.has(key)) continue

    seen.add(key)
    normalized.push({ title, source })
  }

  return normalized
}
