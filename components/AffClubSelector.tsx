'use client'

import { useState } from 'react'
import ClubNameInput from './ClubNameInput'
import type { CSSProperties } from 'react'

interface Props {
  value: number | null
  onChange: (clubId: number | null, clubName: string) => void
  required?: boolean
  language: 'fr' | 'de'
  inputStyle?: CSSProperties
  error?: string
}

export default function AffClubSelector({ value, onChange, required, language: lang, inputStyle, error }: Props) {
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const message = error || (touched && required && value === null
    ? (lang === 'de' ? 'Wähle deinen Verein aus der offiziellen AFF-Liste' : 'Sélectionne ton club depuis la liste officielle AFF') : '')
  return <div onBlur={() => setTouched(true)}>
    <ClubNameInput value={name} lang={lang} label={lang === 'de' ? 'Dein Verein' : 'Ton club'} style={inputStyle}
      onChange={text => { setName(text); onChange(null, '') }}
      onSelect={club => { setName(club.name); onChange(club.id, club.name); setTouched(true) }} />
    {message && <p role="alert" style={{ color: '#ffb6bc', fontSize: 12, marginTop: 5 }}>{message}</p>}
  </div>
}
