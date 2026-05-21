export type Lang = 'fr' | 'de'

export function relativeTime(dateStr: string, lang: Lang = 'fr'): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return lang === 'fr' ? 'à l\'instant'  : 'gerade eben'
  if (mins < 60) return lang === 'fr' ? `il y a ${mins} min` : `vor ${mins} Min`
  const h = Math.floor(diff / 3_600_000)
  if (h < 24)   return lang === 'fr' ? `il y a ${h}h`  : `vor ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)  return lang === 'fr' ? 'hier'           : 'gestern'
  if (d < 7)    return lang === 'fr' ? `il y a ${d}j`  : `vor ${d}T`
  const w = Math.floor(d / 7)
  if (w < 5)    return lang === 'fr' ? `il y a ${w} sem.` : `vor ${w} Wo.`
  const m = Math.floor(d / 30)
  return         lang === 'fr' ? `il y a ${m}m`        : `vor ${m}M`
}
