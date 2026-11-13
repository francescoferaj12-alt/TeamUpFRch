'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, type Profile } from '../lib/supabase'
import type { Lang } from '../lib/translations'
import { parseSeasonStatistics, seasonStatFields, type SeasonStatField } from '../lib/season-statistics'

type Props = { profile: Profile; lang: Lang; onClose: () => void; onSaved: (updated: Partial<Profile>) => void }

export default function SeasonStatsModal({ profile, lang, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [values, setValues] = useState(() => Object.fromEntries(seasonStatFields.map(field => [field, profile[field] == null ? '' : String(profile[field])])) as Record<SeasonStatField, string>)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const title = lang === 'de' ? 'Saisonstatistiken bearbeiten' : 'Modifier les statistiques'
  const year = new Date().getFullYear() - (new Date().getMonth() < 6 ? 1 : 0)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    let payload
    try { payload = parseSeasonStatistics(values) } catch {
      setError(lang === 'de' ? 'Bitte gib ganze Zahlen ab 0 ein.' : 'Saisis des nombres entiers à partir de 0.'); return
    }
    setSaving(true); setError('')
    try {
      const { data, error: failure } = await supabase.from('profiles').update(payload).eq('id', profile.id).eq('role', 'player')
        .select('goals,assists,matches,goals_prev,assists_prev,matches_prev').single()
      if (failure || !data) throw new Error('save_failed')
      onSaved(data); onClose()
    } catch {
      setError(lang === 'de' ? 'Speichern fehlgeschlagen. Deine Eingaben bleiben erhalten. Bitte versuche es erneut.' : 'Enregistrement impossible. Tes réponses sont conservées. Réessaie.')
    } finally { setSaving(false) }
  }

  return <dialog ref={dialog} className="season-edit-dialog" aria-labelledby="season-edit-title"
    onCancel={event => { if (saving) event.preventDefault(); else onClose() }}>
    <form onSubmit={save}>
      <div className="season-edit-heading"><h2 id="season-edit-title">{title}</h2>
        <button type="button" disabled={saving} onClick={onClose} aria-label={lang === 'de' ? 'Schliessen' : 'Fermer'}>×</button>
      </div>
      <p>{lang === 'de' ? 'Saisonzahlen für alle Vereine zusammen. Die Zahlen jeder Karrierestation bearbeitest du unter dem jeweiligen Verein.' : 'Tes totaux de saison, tous clubs confondus. Les chiffres de chaque étape du parcours se modifient dans le club concerné.'}</p>
      {[false, true].map(previous => <fieldset key={String(previous)} disabled={saving}>
        <legend>{previous ? (lang === 'de' ? 'Letzte Saison' : 'Saison précédente') : (lang === 'de' ? 'Aktuelle Saison' : 'Saison actuelle')} · {year - (previous ? 1 : 0)}–{year + (previous ? 0 : 1)}</legend>
        <div className="season-edit-grid">{(['matches', 'goals', 'assists'] as const).map((name, index) => {
          const field = `${name}${previous ? '_prev' : ''}` as SeasonStatField
          const label = (lang === 'de' ? ['Spiele', 'Tore', 'Vorlagen'] : ['Matchs joués', 'Buts', 'Passes décisives'])[index]
          return <label key={field}>{label}<input name={field} type="number" inputMode="numeric" min={0} max={2147483647} step={1}
            value={values[field]} placeholder="—" onChange={event => setValues(current => ({ ...current, [field]: event.target.value }))} /></label>
        })}</div>
      </fieldset>)}
      <p className="season-edit-help">{lang === 'de' ? 'Leer = nicht angegeben. 0 = kein Spiel, Tor oder Assist.' : 'Vide = non renseigné. 0 = aucun match, but ou passe décisive.'}</p>
      {error && <p role="alert" className="season-edit-error">{error}</p>}
      <div className="season-edit-actions"><button type="button" disabled={saving} onClick={onClose}>{lang === 'de' ? 'Abbrechen' : 'Annuler'}</button>
        <button type="submit" disabled={saving}>{saving ? (lang === 'de' ? 'Speichern…' : 'Enregistrement…') : (lang === 'de' ? 'Speichern' : 'Enregistrer')}</button></div>
    </form>
  </dialog>
}
