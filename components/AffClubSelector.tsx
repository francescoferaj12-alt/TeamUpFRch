'use client'

import { useEffect, useRef, useState } from 'react'

interface AffClub {
  id: number
  aff_number: number
  name: string
}

interface Props {
  value: number | null
  onChange: (clubId: number | null, clubName: string) => void
  required?: boolean
  language: 'fr' | 'de'
  inputStyle?: React.CSSProperties
  error?: string
}

const LABELS = {
  label:       { fr: 'Ton club',                                        de: 'Dein Verein' },
  placeholder: { fr: 'Cherche ton club...',                             de: 'Suche deinen Verein...' },
  no_results:  { fr: 'Aucun club trouvé',                               de: 'Kein Verein gefunden' },
  err_required:{ fr: 'Sélectionne ton club depuis la liste officielle AFF', de: 'Wähle deinen Verein aus der offiziellen AFF-Liste' },
}

export default function AffClubSelector({ value, onChange, required, language: lang, inputStyle, error: externalError }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AffClub[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const [touched, setTouched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/aff-clubs/search?q=${encodeURIComponent(q)}`)
        const json = await res.json()
        setResults(json.clubs ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    // If user types freely after a selection, clear the selection
    if (value !== null) {
      onChange(null, '')
      setSelectedName('')
    }
    search(v)
  }

  const handleSelect = (club: AffClub) => {
    onChange(club.id, club.name)
    setSelectedName(club.name)
    setQuery(club.name)
    setOpen(false)
    setResults([])
    setTouched(true)
  }

  const handleBlur = () => {
    setTouched(true)
    // Small delay so click on dropdown registers first
    setTimeout(() => setOpen(false), 150)
  }

  const hasError = touched && required && value === null
  const displayError = externalError || (hasError ? LABELS.err_required[lang] : '')

  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,.07)',
    border: `1.5px solid ${displayError ? '#e63946' : 'rgba(255,255,255,.12)'}`,
    borderRadius: 9,
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    color: value ? '#fff' : 'rgba(255,255,255,.5)',
    ...inputStyle,
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: displayError ? 0 : undefined }}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        onBlur={handleBlur}
        placeholder={LABELS.placeholder[lang]}
        autoComplete="off"
        style={baseInputStyle}
      />

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#0d1f4a', border: '1px solid rgba(255,255,255,.15)',
          borderRadius: 10, marginTop: 4, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
        }}>
          {loading && (
            <div style={{ padding: '10px 14px', color: 'rgba(255,255,255,.4)', fontSize: 13 }}>…</div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div style={{ padding: '10px 14px', color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
              {LABELS.no_results[lang]}
            </div>
          )}
          {!loading && results.map(club => (
            <div
              key={club.id}
              onMouseDown={() => handleSelect(club)}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,.06)',
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(230,57,70,.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span>{club.name}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginLeft: 8 }}>#{club.aff_number}</span>
            </div>
          ))}
        </div>
      )}

      {displayError && (
        <div style={{ color: '#e63946', fontSize: 12, marginTop: 5 }}>{displayError}</div>
      )}
    </div>
  )
}
