'use client';

import { useState } from 'react';
import { applications as initialApps } from '../../lib/data';

type Status = 'all' | 'pending' | 'accepted' | 'rejected';

export default function CandidaturesPage() {
  const [apps, setApps] = useState(initialApps);
  const [filter, setFilter] = useState<Status>('all');

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length
  };

  function setStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    setApps((cs) => cs.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="wrap">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '.75rem'
        }}
      >
        <div>
          <div className="section-label">FC Bulle — Attaquant 3ème Ligue</div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '2rem',
              letterSpacing: 1
            }}
          >
            Candidatures reçues
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">{counts.pending} en attente</span>
          <span className="badge badge-green">{counts.accepted} acceptées</span>
          <span className="badge badge-red">{counts.rejected} refusées</span>
          <button className="btn btn-ghost btn-sm">Exporter CSV</button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(
          [
            ['all', `Toutes (${counts.all})`],
            ['pending', `⏳ En attente (${counts.pending})`],
            ['accepted', `✅ Acceptées (${counts.accepted})`],
            ['rejected', `❌ Refusées (${counts.rejected})`]
          ] as const
        ).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f as Status)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: `1.5px solid ${filter === f ? 'var(--blue-bright)' : 'var(--border)'}`,
              background: filter === f ? 'var(--blue-light)' : '#fff',
              color: filter === f ? 'var(--blue-mid)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div>
        {filtered.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)'
            }}
          >
            Aucune candidature dans cette catégorie.
          </div>
        ) : (
          filtered.map((a) => <CandidatureCard key={a.id} app={a} onSetStatus={setStatus} />)
        )}
      </div>
    </div>
  );
}

function CandidatureCard({
  app,
  onSetStatus
}: {
  app: (typeof initialApps)[number];
  onSetStatus: (id: string, status: 'pending' | 'accepted' | 'rejected') => void;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid var(--border)',
        padding: '1.25rem',
        marginBottom: '.85rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 13,
          background: 'var(--blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          flexShrink: 0
        }}
      >
        👤
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '.4rem'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>{app.applicantName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <StatusIndicator status={app.status} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.date}</span>
            <span className="badge badge-blue">⭐ {app.applicantRating}</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: '.2rem 0 .5rem' }}>
          {app.applicantDetail}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '.6rem' }}>
          {app.tags.map((t) => (
            <span key={t} className="badge badge-blue">
              {t}
            </span>
          ))}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-dark)',
            background: 'var(--gray-bg)',
            borderRadius: 8,
            padding: '.5rem .75rem',
            lineHeight: 1.5,
            fontStyle: 'italic',
            marginBottom: '.6rem'
          }}
        >
          "{app.message}"
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {app.status === 'pending' && (
            <>
              <button
                className="btn btn-green btn-sm"
                onClick={() => onSetStatus(app.id, 'accepted')}
              >
                ✅ Accepter
              </button>
              <button
                className="btn btn-red btn-sm"
                onClick={() => onSetStatus(app.id, 'rejected')}
              >
                ❌ Refuser
              </button>
              <button className="btn btn-outline btn-sm">💬 Message</button>
              <button className="btn btn-ghost btn-sm">👤 Profil</button>
            </>
          )}
          {app.status === 'accepted' && (
            <>
              <span
                className="badge badge-green"
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                ✅ Candidature acceptée
              </span>
              <button className="btn btn-outline btn-sm">💬 Message</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onSetStatus(app.id, 'pending')}>
                ↩ Annuler
              </button>
            </>
          )}
          {app.status === 'rejected' && (
            <>
              <span
                className="badge badge-red"
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                ❌ Candidature refusée
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => onSetStatus(app.id, 'pending')}>
                ↩ Reconsidérer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: 'pending' | 'accepted' | 'rejected' }) {
  const map = {
    pending: { color: 'var(--amber)', label: 'En attente' },
    accepted: { color: 'var(--green)', label: 'Acceptée' },
    rejected: { color: 'var(--red)', label: 'Refusée' }
  };
  const m = map[status];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        color: m.color
      }}
    >
      <span
        style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }}
      />
      {m.label}
    </div>
  );
}
