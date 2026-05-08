'use client'

import { useLang } from '../lib/lang-context'

export default function LangSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.1)', borderRadius: 8, padding: 3 }}>
      <button
        onClick={() => setLang('fr')}
        style={{
          background: lang === 'fr' ? 'rgba(255,255,255,.2)' : 'transparent',
          border: 'none', borderRadius: 6,
          padding: '4px 10px',
          color: lang === 'fr' ? '#fff' : 'rgba(255,255,255,.5)',
          fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all .15s'
        }}
      >
        FR
      </button>
      <button
        onClick={() => setLang('de')}
        style={{
          background: lang === 'de' ? 'rgba(255,255,255,.2)' : 'transparent',
          border: 'none', borderRadius: 6,
          padding: '4px 10px',
          color: lang === 'de' ? '#fff' : 'rgba(255,255,255,.5)',
          fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all .15s'
        }}
      >
        DE
      </button>
    </div>
  )
}
