import Link from 'next/link';
import { notFound } from 'next/navigation';
import { clubs, fcBulleRoster, annonces } from '../../../lib/data';

const slugMap: Record<string, string> = {
  bulle: 'club1',
  duedingen: 'club2',
  fribourg: 'club3'
};

export function generateStaticParams() {
  return Object.keys(slugMap).map((slug) => ({ slug }));
}

export default function ClubPage({ params }: { params: { slug: string } }) {
  const clubId = slugMap[params.slug];
  const club = clubs.find((c) => c.id === clubId);
  if (!club) notFound();

  const clubAnnonces = annonces.filter((a) => a.authorId === clubId);

  return (
    <div className="wrap">
      {/* BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #063a1a, #0d7a36)',
          borderRadius: 20,
          padding: '2rem',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -10,
            top: -10,
            fontSize: '8rem',
            opacity: 0.06,
            pointerEvents: 'none'
          }}
        >
          ⚽
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.25rem',
            flexWrap: 'wrap',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: 'rgba(255,255,255,.15)',
              border: '3px solid rgba(255,255,255,.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              flexShrink: 0
            }}
          >
            {club.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,.5)',
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: '.25rem'
              }}
            >
              Club officiel
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '2.5rem',
                color: '#fff',
                letterSpacing: 1,
                lineHeight: 1,
                marginBottom: '.3rem'
              }}
            >
              {club.name}
            </div>
            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <ClubChip>🏆 {club.ligue}</ClubChip>
              <ClubChip>📍 {club.zone}</ClubChip>
              <ClubChip>👥 {club.rosterCount} joueurs</ClubChip>
              <ClubChip>⭐ {club.rating} / 5</ClubChip>
              {club.recruiting && (
                <ClubChip
                  style={{
                    background: 'rgba(13,122,54,.4)',
                    borderColor: 'rgba(13,122,54,.5)'
                  }}
                >
                  🟢 Recrute
                </ClubChip>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '.75rem' }}>
              <Link href="/candidatures" className="btn btn-red btn-sm">
                📋 Voir candidatures
              </Link>
              <Link
                href="/messages"
                className="btn btn-sm"
                style={{
                  background: 'rgba(255,255,255,.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,.3)'
                }}
              >
                💬 Contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '1.25rem'
        }}
        className="club-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* ROSTER */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1 }}>
                👥 Roster 2024–25
              </div>
              <button className="btn btn-blue btn-sm">+ Ajouter</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['#', 'Joueur', 'Pos.', 'Âge', 'Note', ''].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '.8px',
                          padding: '.6rem .75rem',
                          borderBottom: '2px solid var(--gray-light)'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fcBulleRoster.map((p) => (
                    <RosterRow key={p.num} {...p} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANNONCES */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1 }}>
                📢 Nos annonces
              </div>
              <Link href="/annonces" className="btn btn-red btn-sm">
                + Nouvelle annonce
              </Link>
            </div>

            {clubAnnonces.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Aucune annonce active pour le moment.
              </p>
            ) : (
              clubAnnonces.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '1.25rem',
                    marginBottom: '.85rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '.75rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px'
                      }}
                    >
                      🔍 Recrutement
                    </span>
                    <span className="badge badge-green">🟢 Active</span>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      marginBottom: '.85rem',
                      fontWeight: 500
                    }}
                  >
                    {a.body}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '.85rem' }}>
                    <span className="badge badge-blue">{a.ligue}</span>
                    {a.position && <span className="badge badge-amber">{a.position}</span>}
                    <span className="badge badge-gray">📍 {a.zone}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '.75rem' }}>
                    Candidatures :{' '}
                    <span style={{ fontWeight: 700, color: 'var(--blue-mid)' }}>
                      {a.candidatesCount}
                    </span>{' '}
                    reçues ·{' '}
                    <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
                      {a.pendingCount} en attente
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Link href="/candidatures" className="btn btn-blue btn-sm">
                      Voir candidatures
                    </Link>
                    <button className="btn btn-ghost btn-sm">Modifier</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red)' }}
                    >
                      Clôturer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* GALERIE */}
          <div className="card card-sm">
            <SectionH>📸 Galerie</SectionH>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                'linear-gradient(135deg, #063a1a, #0d7a36)',
                'linear-gradient(135deg, #0a1f5c, #1a6fd4)',
                'linear-gradient(135deg, #3a0010, #a02030)'
              ].map((bg, i) => (
                <div
                  key={i}
                  style={{
                    background: bg,
                    borderRadius: 10,
                    aspectRatio: '4 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff'
                  }}
                >
                  {['🏟️', '⚽', '🏆'][i]}
                </div>
              ))}
              <div
                style={{
                  background: 'var(--gray-light)',
                  borderRadius: 10,
                  aspectRatio: '4 / 3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 4,
                  border: '2px dashed var(--gray-mid)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>➕</span>
                <span style={{ fontSize: 11 }}>Ajouter</span>
              </div>
            </div>
          </div>

          {/* INFOS */}
          <div className="card card-sm">
            <SectionH>ℹ️ Informations</SectionH>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: 14 }}>
              {[
                ['Fondé en', String(club.founded)],
                ['Terrain', club.stadium],
                ['Président', club.president],
                ['Entraîneur', club.coach],
                ['Contact', club.email]
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: k === 'Contact' ? 'var(--blue-bright)' : 'inherit' }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SAISON */}
          <div className="card card-sm">
            <SectionH>📊 Saison en cours</SectionH>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
              <SeasonStat value={club.season.wins} label="Victoires" color="var(--green)" />
              <SeasonStat value={club.season.draws} label="Nuls" color="var(--amber)" />
              <SeasonStat value={club.season.losses} label="Défaites" color="var(--red)" />
              <SeasonStat value={club.season.rank} label="Classement" color="var(--blue-mid)" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .club-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ClubChip({
  children,
  style
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        background: 'rgba(255,255,255,.15)',
        border: '1px solid rgba(255,255,255,.25)',
        color: 'rgba(255,255,255,.9)',
        fontSize: 12,
        padding: '3px 11px',
        borderRadius: 100,
        ...style
      }}
    >
      {children}
    </span>
  );
}

function SectionH({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.1rem',
        letterSpacing: 1,
        marginBottom: '1rem'
      }}
    >
      {children}
    </div>
  );
}

function RosterRow({
  num,
  name,
  pos,
  age,
  rating,
  available
}: {
  num: number;
  name: string;
  pos: string;
  age: number;
  rating: number;
  available: boolean;
}) {
  const posColors: Record<string, string> = {
    ATT: '#e02020',
    MIL: '#1a6fd4',
    DEF: '#0d7a36',
    GB: '#a05a00'
  };
  return (
    <tr style={{ borderBottom: '1px solid var(--gray-light)' }}>
      <td
        style={{
          padding: '.65rem .75rem',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.1rem',
          color: 'var(--blue-mid)'
        }}
      >
        {num}
      </td>
      <td style={{ padding: '.65rem .75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14
            }}
          >
            ⚽
          </div>
          <span style={{ fontWeight: 600 }}>{name}</span>
        </div>
      </td>
      <td style={{ padding: '.65rem .75rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: '50%', background: posColors[pos] }}
          />
          <b>{pos}</b>
        </span>
      </td>
      <td style={{ padding: '.65rem .75rem', color: 'var(--text-muted)' }}>{age} ans</td>
      <td style={{ padding: '.65rem .75rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--blue-mid)' }}>⭐ {rating}</span>
      </td>
      <td style={{ padding: '.65rem .75rem' }}>
        {available ? (
          <span className="badge badge-green">Dispo</span>
        ) : (
          <span className="badge badge-gray">Indispo</span>
        )}
      </td>
    </tr>
  );
}

function SeasonStat({
  value,
  label,
  color
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'var(--gray-bg)',
        borderRadius: 10,
        padding: '.75rem',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.8rem',
          color
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '.8px'
        }}
      >
        {label}
      </div>
    </div>
  );
}
