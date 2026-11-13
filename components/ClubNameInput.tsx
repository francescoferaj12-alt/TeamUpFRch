'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Lang } from '../lib/translations'

type Club = { id: number; aff_number: number; name: string }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect?: (club: Club) => void
  lang: Lang
  label: string
  style?: CSSProperties
}

export default function ClubNameInput({ value, onChange, onSelect, lang, label, style }: Props) {
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const [clubs, setClubs] = useState<Club[]>([])
  const [opened, setOpened] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(-1)
  const [browseAll, setBrowseAll] = useState(true)
  const results = browseAll ? clubs : clubs.filter(club => normalize(club.name).includes(normalize(value)))

  useEffect(() => {
    if (!opened || loaded) return
    const controller = new AbortController()
    setFailed(false)
    fetch('/api/aff-clubs/search', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('clubs')
      const data = await response.json()
      setClubs((data.clubs || []).filter((club: Club) => ![5146, 5154, 5157, 5149, 5144].includes(club.aff_number) && !/futsal/i.test(club.name)))
      setLoaded(true)
    }).catch(error => { if (error.name !== 'AbortError') setFailed(true) })
    return () => controller.abort()
  }, [opened, loaded])

  function select(club: Club) {
    onChange(club.name)
    onSelect?.(club)
    setOpened(false)
    setActive(-1)
  }

  useEffect(() => {
    if (active >= 0) container.current?.querySelector(`#${CSS.escape(id)}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, id])

  return <div ref={container} className="club-name-input" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpened(false)
  }}>
    <input role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={opened}
      aria-controls={`${id}-list`} aria-activedescendant={opened && active >= 0 ? `${id}-option-${active}` : undefined}
      autoComplete="off" value={value} style={style}
      placeholder={lang === 'de' ? 'Verein suchen…' : 'Rechercher un club…'}
      onFocus={() => { setOpened(true); setBrowseAll(true); setActive(-1) }}
      onClick={() => setOpened(true)}
      onChange={event => { onChange(event.target.value); setBrowseAll(false); setOpened(true); setActive(-1) }}
      onKeyDown={event => {
        if (event.key === 'Escape') { setOpened(false); return }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); setOpened(true)
          setActive(index => results.length ? Math.max(0, Math.min(results.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))) : -1)
        }
        if (event.key === 'Enter' && opened && active >= 0 && results[active]) {
          event.preventDefault(); select(results[active])
        }
      }} />
    {opened && <div className="club-name-options" id={`${id}-list`} role="listbox" aria-label={label}>
      {!loaded && <div className="club-name-status" role="status">{failed
        ? (lang === 'de' ? 'Liste nicht verfügbar. Erneut öffnen, um es nochmals zu versuchen.' : 'Liste indisponible. Rouvre le champ pour réessayer.')
        : (lang === 'de' ? 'Vereine werden geladen…' : 'Chargement des clubs…')}</div>}
      {loaded && results.length === 0 && <div className="club-name-status" role="status">{lang === 'de' ? 'Kein Verein gefunden. Du kannst den Namen selbst eingeben.' : 'Aucun club trouvé. Tu peux saisir son nom librement.'}</div>}
      {results.map((club, index) => <button key={club.id} id={`${id}-option-${index}`} role="option"
        aria-selected={active === index} type="button" tabIndex={-1}
        onMouseDown={event => event.preventDefault()} onClick={() => select(club)}>
        {club.name}
      </button>)}
    </div>}
  </div>
}
