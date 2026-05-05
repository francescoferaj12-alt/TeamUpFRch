'use client';

import { useState } from 'react';
import Link from 'next/link';
import { applications, conversations } from '../../lib/data';

type Section = 'vue' | 'candidatures' | 'roster' | 'annonces' | 'messages' | 'settings';

export default function DashboardPage() {
  const [section, setSection] = useState<Section>('vue');

  return (
    <div className="dash-grid">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-club-badge">
          <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>🦅</div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: 1,
              color: '#fff'
            }}
          >
            FC Bulle
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>3ème Ligue · Admin</div>
        </div>

        <SidebarSection label="Principal" />
        <SidebarLink
          icon="📊"
          label="Vue d'ensemble"
          active={section === 'vue'}
          onClick={() => setSection('vue')}
        />
        <SidebarLink
          icon="📋"
          label="Candidatures"
          active={section === 'candidatures'}
          onClick={() => setSection('candidatures')}
          badge={3}
          badgeColor="var(--red)"
        />
        <SidebarLink
          icon="👥"
          label="Roster"
          active={section === 'roster'}
          onClick={() => setSection('roster')}
        />

        <SidebarSection label="Contenu" />
        <SidebarLink
          icon="📢"
          label="Annonces"
          active={section === 'annonces'}
          onClick={() => setSection('annonces')}
        />
        <SidebarLink
          icon="💬"
          label="Messages"
          active={section === 'messages'}
          onClick={() => setSection('messages')}
          badge={3}
          badgeColor="var(--blue-bright)"
        />

        <SidebarSection label="Paramètres" />
        <SidebarLink
          icon="⚙️"
          label="Réglages club"
          active={section === 'settings'}
          onClick={() => setSection('settings')}
        />
      </aside>

      {/* MAIN */}
      <div className="dash-main">
        {section === 'vue' && <VueSection />}
        {section === 'candidatures' && <CandidaturesSection />}
        {section === 'roster' && <RosterSection />}
        {section === 'annonces' && <AnnoncesSection />}
        {section === 'messages' && <MessagesSection />}
        {section === 'settings' && <SettingsSection />}
      </div>

      <style>{`
        .dash-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: calc(100vh - 60px - 100px);
        }
        @media (max-width: 700px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
        .dash-sidebar {
          background: var(--blue-dark);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dash-club-badge {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 12px;
          padding: .85rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        .dash-main {
          padding: 1.5rem;
          overflow-y: auto;
          background: var(--gray-bg);
        }
      `}</style>
    </div>
  );
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'rgba(255,255,255,.35)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        padding: '.75rem .5rem .3rem',
        marginTop: '.5rem'
      }}
    >
      {label}
    </div>
  );
}

function SidebarLink({
  icon,
  label,
  active,
  onClick,
  badge,
  badgeColor
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '.65rem .85rem',
        borderRadius: 9,
        color: active ? '#fff' : 'rgba(255,255,255,.65)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        border: 'none',
        background: active ? 'rgba(255,255,255,.15)' : 'transparent',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'inherit'
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background: 'rgba(255,255,255,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          flexShrink: 0
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span
          style={{
            background: badgeColor || 'var(--blue-bright)',
            color: '#fff',
            borderRadius: 100,
            fontSize: 10,
            padding: '1px 7px',
            fontWeight: 700
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── SECTIONS ── */

function VueSection() {
  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Dashboard</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>
          Vue d'ensemble
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <KPI value="342" label="Vues du profil" delta="▲ +18% ce mois" deltaUp color="var(--blue-mid)" />
        <KPI
          value="8"
          label="Candidatures"
          delta="▲ +3 cette semaine"
          deltaUp
          color="var(--red)"
        />
        <KPI value="24" label="Joueurs roster" delta="▲ +2 vs saison passée" deltaUp color="var(--green)" />
        <KPI value="3" label="Messages non lus" delta="Répondre →" color="var(--amber)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: 1,
              marginBottom: '1rem'
            }}
          >
            ⚡ Activité récente
          </div>
          {[
            { icon: '📋', bg: 'var(--blue-light)', text: 'Kevin Suter a postulé pour le poste d\'attaquant', time: 'Il y a 1h' },
            { icon: '👁️', bg: 'var(--amber-bg)', text: 'FC Fribourg a consulté votre page club', time: 'Il y a 2h' },
            { icon: '💬', bg: 'var(--blue-light)', text: 'Nouveau message de Lucas Martin', time: 'Il y a 3h' },
            { icon: '✅', bg: 'var(--green-bg)', text: 'Candidature de Thomas Grandjean acceptée', time: 'Hier' }
          ].map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '.75rem',
                padding: '.75rem',
                background: '#fff',
                borderRadius: 10,
                border: '1px solid var(--border)',
                marginBottom: '.6rem'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: a.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  flexShrink: 0
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
                {a.text}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: 1,
              marginBottom: '1rem'
            }}
          >
            📋 Candidatures en attente
          </div>
          {applications
            .filter((a) => a.status === 'pending')
            .slice(0, 3)
            .map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '.65rem 0',
                  borderBottom: '1px solid var(--gray-light)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: 'var(--blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16
                  }}
                >
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.applicantName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {a.tags[0]} · {a.date}
                  </div>
                </div>
                <Link href="/candidatures" className="btn btn-green btn-sm">
                  Voir →
                </Link>
              </div>
            ))}
          <Link
            href="/candidatures"
            className="btn btn-blue btn-full"
            style={{ marginTop: '.75rem', justifyContent: 'center' }}
          >
            Voir toutes les candidatures →
          </Link>
        </div>
      </div>
    </>
  );
}

function CandidaturesSection() {
  return (
    <div className="card">
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.5rem',
          letterSpacing: 1,
          marginBottom: '1rem'
        }}
      >
        📋 Toutes les candidatures
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: 14 }}>
        Gestion complète des candidatures dans la page dédiée.
      </p>
      <Link href="/candidatures" className="btn btn-red">
        Ouvrir le gestionnaire →
      </Link>
    </div>
  );
}

function RosterSection() {
  return (
    <div className="card">
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.5rem',
          letterSpacing: 1,
          marginBottom: '1rem'
        }}
      >
        👥 Roster du club
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: 14 }}>
        Consulte et gère ton effectif depuis la page club.
      </p>
      <Link href="/club/bulle" className="btn btn-green">
        Voir le roster →
      </Link>
    </div>
  );
}

function AnnoncesSection() {
  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Contenu</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>
          Publier une annonce
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label className="field-label">Type d'annonce</label>
            <select className="input">
              <option>🔍 Recrutement joueur</option>
              <option>🧑‍🏫 Recherche coach</option>
              <option>📢 Information générale</option>
              <option>🏆 Résultat match</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Ligue concernée</label>
            <select className="input">
              <option>3ème Ligue (seniors)</option>
              <option>4ème Ligue</option>
              <option>Junior A</option>
              <option>Junior B</option>
              <option>Junior C</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label className="field-label">Position recherchée</label>
            <select className="input">
              <option>Attaquant</option>
              <option>Milieu offensif</option>
              <option>Milieu défensif</option>
              <option>Défenseur</option>
              <option>Gardien</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Disponibilité souhaitée</label>
            <input className="input" type="date" defaultValue="2025-08-01" />
          </div>
        </div>
        <div className="field">
          <label className="field-label">Description de l'annonce</label>
          <textarea
            className="input"
            rows={4}
            defaultValue="FC Bulle recherche un attaquant pour renforcer son effectif en 3ème Ligue pour la saison 2025–26."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label className="field-label">Contact</label>
            <input className="input" defaultValue="fcbulle@fr.ch" />
          </div>
          <div className="field">
            <label className="field-label">Visibilité</label>
            <select className="input">
              <option>🌍 Publique</option>
              <option>🔒 Membres uniquement</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-red"
            onClick={() => alert('✅ Annonce publiée avec succès sur TeamUpFR !')}
          >
            📢 Publier l'annonce
          </button>
          <button className="btn btn-ghost">Prévisualiser</button>
          <button className="btn btn-ghost">Sauvegarder brouillon</button>
        </div>
      </div>
    </>
  );
}

function MessagesSection() {
  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Boîte de réception</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>
          Messages du club
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        {conversations.map((c) => (
          <Link
            key={c.id}
            href="/messages"
            className="card card-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0
              }}
            >
              {c.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.type}</div>
              <div
                style={{
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: c.unread > 0 ? 'var(--text-dark)' : 'var(--text-muted)',
                  fontWeight: c.unread > 0 ? 500 : 400
                }}
              >
                {c.lastMessage}
              </div>
            </div>
            {c.unread > 0 && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--blue-bright)',
                  flexShrink: 0
                }}
              />
            )}
          </Link>
        ))}
      </div>
    </>
  );
}

function SettingsSection() {
  return (
    <div className="card">
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.5rem',
          letterSpacing: 1,
          marginBottom: '1rem'
        }}
      >
        ⚙️ Réglages du club
      </div>
      <div className="field">
        <label className="field-label">Nom du club</label>
        <input className="input" defaultValue="FC Bulle" />
      </div>
      <div className="field">
        <label className="field-label">Email contact</label>
        <input className="input" defaultValue="fcbulle@fr.ch" />
      </div>
      <div className="field">
        <label className="field-label">Description</label>
        <textarea
          className="input"
          rows={4}
          defaultValue="Club historique de la Gruyère, le FC Bulle évolue en 3ème Ligue avec une équipe ambitieuse et un esprit familial."
        />
      </div>
      <button className="btn btn-blue">Enregistrer les modifications</button>
    </div>
  );
}

function KPI({
  value,
  label,
  delta,
  deltaUp,
  color
}: {
  value: string;
  label: string;
  delta?: string;
  deltaUp?: boolean;
  color: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid var(--border)',
        padding: '1.25rem'
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2.5rem',
          color,
          lineHeight: 1,
          marginBottom: '.25rem'
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '.8px'
        }}
      >
        {label}
      </div>
      {delta && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginTop: '.4rem',
            color: deltaUp ? 'var(--green)' : 'var(--text-muted)'
          }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
