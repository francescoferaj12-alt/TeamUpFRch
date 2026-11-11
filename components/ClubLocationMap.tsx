'use client'

import { useLang } from '../lib/lang-context'

type Props = {
  name: string
  zone?: string | null
  stadiumName?: string | null
  address?: string | null
}

export default function ClubLocationMap({ name, zone, stadiumName, address }: Props) {
  const { lang } = useLang()
  const de = lang === 'de'
  const location = address?.trim()
    ? [stadiumName?.trim() || name, address.trim(), 'Suisse']
    : [stadiumName?.trim(), name, zone?.trim(), 'Suisse']
  const query = location.filter(Boolean).join(', ')
  const embed = new URL('https://maps.google.com/maps')
  embed.search = new URLSearchParams({ q: query, output: 'embed', hl: lang, z: address?.trim() ? '16' : '14' }).toString()
  const search = `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query })}`
  const directions = `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: query })}`

  return (
    <section className="club-location" aria-label={de ? 'Standort des Vereins' : 'Localisation du club'}>
      <iframe
        src={embed.toString()}
        title={de ? `Karte: ${name}` : `Carte : ${name}`}
        width="600"
        height="340"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="club-location-info">
        <h3>{stadiumName || name}</h3>
        <p>{address || (de ? 'Suche nach dem Vereinsnamen — Stadionadresse noch nicht angegeben.' : 'Recherche par nom du club — adresse du stade non renseignée.')}</p>
        <div className="club-location-actions">
          <a href={search} target="_blank" rel="noopener noreferrer">
            {de ? 'In Google Maps öffnen' : 'Ouvrir dans Google Maps'}
          </a>
          <a href={directions} target="_blank" rel="noopener noreferrer">
            {de ? 'Route planen' : 'Itinéraire'} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <style>{`
        .club-location { min-width:0; overflow:hidden; border:1px solid rgba(255,255,255,.12); border-radius:20px; background:#0D1F4A; }
        .club-location iframe { display:block; width:100%; max-width:100%; height:340px; border:0; background:#e5e7eb; }
        .club-location-info { padding:20px; }
        .club-location-info h3 { margin:0 0 8px; font-family:'Russo One',sans-serif; font-size:16px; color:#fff; overflow-wrap:anywhere; }
        .club-location-info p { margin:0 0 16px; color:rgba(255,255,255,.7); font-size:13px; line-height:1.6; overflow-wrap:anywhere; }
        .club-location-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .club-location-actions a { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:44px; padding:10px 14px; border:1px solid rgba(255,255,255,.2); border-radius:10px; color:#fff; text-decoration:none; font-size:13px; font-weight:600; }
        .club-location-actions a:last-child { background:#FF3A3A; border-color:#FF3A3A; }
        .club-location-actions a:hover { border-color:#fff; }
        .club-location-actions a:focus-visible { outline:3px solid #fff; outline-offset:3px; }
        @media(max-width:480px) { .club-location iframe { height:300px; } .club-location-actions a { flex:1 1 160px; } }
      `}</style>
    </section>
  )
}
