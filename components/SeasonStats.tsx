import type { Profile } from '../lib/supabase'
import type { Lang } from '../lib/translations'

type Props = {
  profile: Pick<Profile, 'goals' | 'assists' | 'matches' | 'goals_prev' | 'assists_prev' | 'matches_prev'>
  lang: Lang
  large?: boolean
}

export default function SeasonStats({ profile, lang, large = false }: Props) {
  const now = new Date()
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const current = [profile.goals, profile.assists, profile.matches]
  const previous = [profile.goals_prev, profile.assists_prev, profile.matches_prev]
  const hasPrevious = previous.some(value => value != null)
  const missing = [...current, ...(hasPrevious ? previous : [])].some(value => value == null)
  const labels = lang === 'de' ? ['Tore', 'Vorlagen', 'Spiele'] : ['Buts', 'Assists', 'Matchs']
  const colors = ['#FF3A3A', '#3A7AFF', '#2ED27F']

  function row(values: (number | undefined | null)[], isPrevious = false) {
    return <div className={`season-stats-row${isPrevious ? ' previous' : ''}`}>
      {values.map((value, index) => {
        const old = previous[index]
        const delta = !isPrevious && value != null && old != null ? value - old : null
        return <div className="season-stat" key={labels[index]}>
          <div className="season-stat-value" style={{ color: value == null ? '#c7d1e3' : colors[index] }}>{value ?? '—'}</div>
          <div className="season-stat-label">{labels[index]}</div>
          {delta !== null && <div className="season-stat-delta" style={{ color: delta > 0 ? '#2ED27F' : delta < 0 ? '#ff9a9a' : '#c7d1e3' }}
            title={lang === 'de' ? 'Vergleich zur letzten Saison' : 'Comparaison avec la saison précédente'}>
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)}
          </div>}
        </div>
      })}
    </div>
  }

  return <section className={`season-stats${large ? ' large' : ''}`} aria-label={lang === 'de' ? 'Saisonstatistiken' : 'Statistiques de saison'}>
    <div className="season-stats-heading">
      <h3>{lang === 'de' ? 'Aktuelle Saison' : 'Saison actuelle'}</h3>
      <span>{year} – {String(year + 1).slice(2)}</span>
    </div>
    {row(current)}
    {hasPrevious && <>
      <div className="season-stats-heading previous">
        <h3>{lang === 'de' ? 'Letzte Saison' : 'Saison précédente'}</h3>
        <span>{year - 1} – {String(year).slice(2)}</span>
      </div>
      {row(previous, true)}
    </>}
    {missing && <p className="season-stats-note">{lang === 'de' ? '— : nicht angegeben' : '— : non renseigné'}</p>}
  </section>
}
