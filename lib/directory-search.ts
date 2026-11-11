import { footballLabel } from './football-labels'
import type { Lang } from './translations'

export function directoryQueries(query: string, lang: Lang, values: string[]): string[] {
  const text = query.trim().slice(0, 120)
  if (!text) return []
  return [...new Set([text, ...values.filter(value =>
    footballLabel(value, lang).toLocaleLowerCase().includes(text.toLocaleLowerCase())
  )])].slice(0, 64)
}
