import Link from 'next/link';
import { players } from '../../lib/data';

export default function ProfilPage() {
  const p = players[0]; // Lucas Martin

  return (
    <div className="wrap">
      {/* HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))',
          borderRadius: 20,
          padding: '2rem',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem',
            flexWrap: 'wrap',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3a8cff, #1a5fb4)',
              border: '3px solid rgba(255,255,255,.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              flexShrink: 0,
              position: 'relative'
            }}
          >
            {p.avatar}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                width: 22,
                height: 22,
                background: 'var(--blue-bright)',
                borderRadius: '50%',
                border: '2px solid var(--blue-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff'
              }}
            >
              ✓
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '2.2rem',
                color: '#fff',
                letterSpacing: 1,
                lineHeight: 1,
                marginBottom: 4
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,.7)',
                fontSize: 14,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: '.75rem',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,.15)',
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                ⚡ {p.position}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,.15)',
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                🦵 Pied {p.foot.toLowerCase()}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                {p.age} ans · {p.zone}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(255,255,255,.1)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: 'rgba(255,255,255,.85)',
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 100
                }}
              >
                🏆 {p.ligue}
              </span>
              <span
                style={{
                  background: p.available ? 'rgba(13,122,54,.3)' : 'rgba(255,255,255,.1)',
                  border: `1px solid ${p.available ? 'rgba(13,122,54,.5)' : 'rgba(255,255,255,.2)'}`,
                  color: 'rgba(255,255,255,.95)',
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 100
                }}
              >
                {p.available ? '🟢 Disponible' : '⚪ Indisponible'}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,.1)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: 'rgba(255,255,255,.85)',
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 100
                }}
              >
                ⭐ {p.rating} / 5
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/messages" className="btn btn-red btn-sm">
              💬 Contacter
            </Link>
            <button
              className="btn btn-sm"
              style={{
                background: 'rgba(255,255,255,.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.3)'
              }}
            >
              🔖 Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="profile-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* STATS */}
          <div className="card">
            <CardTitle>📊 Statistiques 2024–25</CardTitle>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <StatBox value={p.stats.goals} label="Buts" />
              <StatBox value={p.stats.assists} label="Assists" />
              <StatBox value={p.stats.matches} label="Matchs" />
              <StatBox value={`${p.stats.passAcc}%`} label="Passes réussies" />
              <StatBox value={p.stats.avgRating} label="Note moy." />
              <StatBox value={p.stats.yellow} label="Cartons J." />
            </div>

            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1rem',
                letterSpacing: 1,
                marginBottom: '1rem',
                paddingTop: '.5rem'
              }}
            >
              Attributs techniques
            </div>
            {Object.entries(p.attributes).map(([key, val]) => {
              const labels: Record<string, string> = {
                dribble: 'Dribble',
                pass: 'Passe',
                shot: 'Tir',
                speed: 'Vitesse',
                defense: 'Défense',
                physical: 'Physique'
              };
              return <Bar key={key} label={labels[key]} value={val as number} />;
            })}
          </div>

          {/* VIDEOS */}
          <div className="card">
            <CardTitle>🎬 Highlights vidéo</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              {p.videos.map((v, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    background:
                      i === 0
                        ? 'linear-gradient(135deg, #0d2560, #1a5fb4)'
                        : i === 1
                        ? 'linear-gradient(135deg, #2d1060, #6b3aad)'
                        : 'linear-gradient(135deg, #063a1a, #0d7a36)',
                    aspectRatio: '16 / 9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      background: 'rgba(255,255,255,.9)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16
                    }}
                  >
                    ▶
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,.7))',
                      padding: '.5rem .75rem',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    {v.title} · {v.duration}
                  </div>
                </div>
              ))}
              <div
                style={{
                  borderRadius: 12,
                  background: 'var(--gray-light)',
                  border: '2px dashed var(--gray-mid)',
                  aspectRatio: '16 / 9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 4,
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 22 }}>➕</span>
                <span style={{ fontSize: 11 }}>Ajouter une vidéo</span>
              </div>
            </div>
          </div>

          {/* BIO */}
          <div className="card">
            <CardTitle>📝 À propos</CardTitle>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                lineHeight: 1.7
              }}
            >
              {p.bio}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* INFOS */}
          <div className="card">
            {p.available && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--green-bg)',
                  color: 'var(--green)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 100,
                  marginBottom: '1rem'
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--green)'
                  }}
                />
                Disponible
              </div>
            )}
            <CardTitle>ℹ️ Informations</CardTitle>
            {[
              ['Âge', `${p.age} ans`],
              ['Nationalité', '🇨🇭 Suisse'],
              ['Pied dominant', p.foot],
              ['Taille', `${p.height} cm`],
              ['Poids', `${p.weight} kg`],
              ['Zone', p.zone],
              ['Ligue actuelle', p.ligue]
            ].map(([k, v]) => (
              <InfoRow key={k} k={k} v={v} />
            ))}
          </div>

          {/* PARCOURS */}
          <div className="card">
            <CardTitle>🏆 Parcours</CardTitle>
            {p.history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: i < p.history.length - 1 ? '1px solid var(--gray-light)' : 'none'
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'var(--blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0
                  }}
                >
                  🏟️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.club}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
                    {h.period}
                    {h.matches ? ` · ${h.matches} matchs` : ''}
                  </div>
                  <span className="badge badge-blue">{h.ligue}</span>
                </div>
              </div>
            ))}
          </div>

          {/* RATINGS */}
          <div className="card">
            <CardTitle>⭐ Évaluations</CardTitle>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1rem' }}>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '3rem',
                  color: 'var(--blue-mid)',
                  lineHeight: 1
                }}
              >
                {p.rating}
              </div>
              <div>
                <div style={{ fontSize: 18, letterSpacing: 2 }}>★★★★★</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Basé sur 11 avis</div>
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                background: 'var(--gray-bg)',
                borderRadius: 10,
                padding: '.85rem',
                lineHeight: 1.6,
                fontStyle: 'italic'
              }}
            >
              "Excellent milieu, très technique et toujours disponible pour l'équipe."
              <br />
              <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontStyle: 'normal' }}>
                — Coach Dupont, FC Fribourg
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.25rem;
        }
        @media (max-width: 720px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.2rem',
        letterSpacing: 1,
        marginBottom: '1rem',
        paddingBottom: '.75rem',
        borderBottom: '1px solid var(--gray-light)'
      }}
    >
      {children}
    </div>
  );
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        background: 'var(--gray-bg)',
        borderRadius: 12,
        padding: '1rem',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2rem',
          color: 'var(--blue-mid)',
          lineHeight: 1
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 4
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: '.85rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          marginBottom: 5
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--blue-mid)' }}>{value}</span>
      </div>
      <div
        style={{
          height: 7,
          background: 'var(--gray-light)',
          borderRadius: 100,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            borderRadius: 100,
            background: 'linear-gradient(90deg, var(--blue-bright), #5ba8ff)'
          }}
        />
      </div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--gray-light)',
        fontSize: 14
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}
