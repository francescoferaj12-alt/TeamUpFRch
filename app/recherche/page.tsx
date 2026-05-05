'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { players, coaches, clubs, ligues, zones, positions } from '../../lib/data';

type ResultType = 'all' | 'player' | 'coach' | 'team';

interface ResultItem {
  type: 'player' | 'coach' | 'team';
  id: string;
  name: string;
  sub: string;
  emoji: string;
  available: boolean;
  ligue: string;
  position?: string;
  zone: string;
  age?: number;
  tags: string[];
  stats: { v: string | number; k: string }[];
  href: string;
}

export default function SearchPage() {
  const [type, setType] = useState<ResultType>('all');
  const [query, setQuery] = useState('');
  const [filterLigue, setFilterLigue] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterDispo, setFilterDispo] = useState(true);

  const allResults = useMemo<ResultItem[]>(() => {
    const playerItems: ResultItem[] = players.map((p) => ({
      type: 'player',
      id: p.id,
      name: p.name,
      sub: `${p.position} · ${p.age} ans`,
      emoji: '👤',
      available: p.available,
      ligue: p.ligue,
      position: p.position,
      zone: p.zone,
      age: p.age,
      tags: [p.ligue, p.zone, `Pied ${p.foot.toLowerCase()}`],
      stats: [
        { v: p.stats.goals, k: 'Buts' },
        { v: p.stats.assists, k: 'Assists' },
        { v: p.stats.matches, k: 'Matchs' }
      ],
      href: '/profil'
    }));

    const coachItems: ResultItem[] = coaches.map((c) => ({
      type: 'coach',
      id: c.id,
      name: c.name,
      sub: `Coach ${c.license} · ${c.experience} ans exp.`,
      emoji: '🧑‍🏫',
      available: c.available,
      ligue: '',
      zone: c.zone,
      age: c.age,
      tags: [c.license, c.philosophy, c.zone],
      stats: [
        { v: c.experience, k: 'Ans exp.' },
        { v: c.pastClubs.length, k: 'Clubs' },
        { v: c.age, k: 'Âge' }
      ],
      href: '/recherche'
    }));

    const clubItems: ResultItem[] = clubs.map((c) => ({
      type: 'team',
      id: c.id,
      name: c.name,
      sub: `${c.ligue} · ${c.zone}`,
      emoji: c.emoji,
      available: c.recruiting,
      ligue: c.ligue,
      zone: c.zone,
      tags: [c.ligue, c.zone, c.recruiting ? 'Recrute' : 'Complet'],
      stats: [
        { v: c.rosterCount, k: 'Joueurs' },
        { v: c.season.wins, k: 'Victoires' },
        { v: c.rating, k: 'Note' }
      ],
      href: '/club/bulle'
    }));

    return [...playerItems, ...coachItems, ...clubItems];
  }, []);

  const filtered = useMemo(() => {
    return allResults.filter((r) => {
      if (type !== 'all' && r.type !== type) return false;
      if (filterDispo && !r.available) return false;
      if (filterLigue && r.ligue !== filterLigue) return false;
      if (filterPos && r.type === 'player' && r.position !== filterPos) return false;
      if (filterZone && r.zone !== filterZone) return false;
      if (filterAge && r.age) {
        const ages: Record<string, [number, number]> = {
          '16–19 ans': [16, 19],
          '20–25 ans': [20, 25],
          '26–30 ans': [26, 30],
          '30+ ans': [30, 99]
        };
        const range = ages[filterAge];
        if (range && (r.age < range[0] || r.age > range[1])) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.sub.toLowerCase().includes(q) &&
          !r.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [allResults, type, filterDispo, filterLigue, filterPos, filterZone, filterAge, query]);

  const counts = {
    all: filtered.length,
    player: filtered.filter((r) => r.type === 'player').length,
    coach: filtered.filter((r) => r.type === 'coach').length,
    team: filtered.filter((r) => r.type === 'team').length
  };

  return (
    <>
      {/* HERO SEARCH */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-mid) 100%)',
          padding: '2.5rem 1.5rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '2.5rem',
              color: '#fff',
              letterSpacing: 2,
              marginBottom: '.25rem'
            }}
          >
            Recherche <span style={{ color: 'var(--red-light)' }}>Avancée</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginBottom: '1.25rem' }}>
            Trouve joueurs, coachs et clubs dans le canton de Fribourg
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, club, position, ligue…"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,.95)',
                border: 'none',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              style={{
                background: 'var(--red)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 22px',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* TYPE TABS */}
      <div
        style={{
          background: '#fff',
          padding: '.85rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 6,
          maxWidth: '100%',
          overflowX: 'auto'
        }}
      >
        {(
          [
            ['all', 'Tous', counts.all],
            ['player', '👤 Joueurs', counts.player],
            ['coach', '🧑‍🏫 Coachs', counts.coach],
            ['team', '🏟️ Clubs', counts.team]
          ] as const
        ).map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => setType(t as ResultType)}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: `1.5px solid ${type === t ? 'var(--blue-bright)' : 'var(--border)'}`,
              background: type === t ? 'var(--blue-light)' : '#fff',
              color: type === t ? 'var(--blue-mid)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {label}{' '}
            <span
              style={{
                background: 'var(--blue-light)',
                color: 'var(--blue-mid)',
                borderRadius: 100,
                padding: '1px 7px',
                fontSize: 11,
                marginLeft: 4
              }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* FILTERS BAR */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          padding: '.85rem 1.5rem',
          display: 'flex',
          gap: '.75rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setFilterDispo(!filterDispo)}
          style={{
            border: `1.5px solid ${filterDispo ? 'var(--blue-bright)' : 'var(--border)'}`,
            background: filterDispo ? 'var(--blue-light)' : 'var(--gray-bg)',
            color: filterDispo ? 'var(--blue-mid)' : 'inherit',
            borderRadius: 100,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          🟢 Disponible
        </button>

        <FilterSelect
          value={filterLigue}
          onChange={setFilterLigue}
          placeholder="Toutes les ligues"
          options={ligues.flatMap((g) => g.items)}
        />
        <FilterSelect
          value={filterPos}
          onChange={setFilterPos}
          placeholder="Toutes positions"
          options={positions}
        />
        <FilterSelect
          value={filterZone}
          onChange={setFilterZone}
          placeholder="Toute la zone"
          options={zones}
        />
        <FilterSelect
          value={filterAge}
          onChange={setFilterAge}
          placeholder="Tout âge"
          options={['16–19 ans', '20–25 ans', '26–30 ans', '30+ ans']}
        />

        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* RESULTS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
          padding: '1.5rem'
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)'
            }}
          >
            😕 Aucun résultat. Modifie tes filtres.
          </div>
        ) : (
          filtered.map((r) => <ResultCard key={r.id} item={r} />)
        )}
      </div>
    </>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'var(--gray-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: 100,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'inherit'
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ResultCard({ item }: { item: ResultItem }) {
  const stripeColors = {
    player: 'linear-gradient(90deg,#1a6fd4,#5b9eff)',
    coach: 'linear-gradient(90deg,#e02020,#ff8c42)',
    team: 'linear-gradient(90deg,#0d7a36,#1db954)'
  };
  const bgClass = {
    player: '#deeafa',
    coach: '#fde8e8',
    team: 'var(--green-bg)'
  };

  return (
    <Link
      href={item.href}
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid var(--border)',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'block',
        transition: 'all .15s'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: stripeColors[item.type]
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.85rem' }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: bgClass[item.type],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0
          }}
        >
          {item.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.sub}</div>
        </div>
        <span className={`badge ${item.available ? 'badge-green' : 'badge-gray'}`}>
          {item.available ? 'Dispo' : 'Indisponible'}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: '.85rem' }}>
        {item.tags.map((t) => (
          <span key={t} className="badge badge-blue">
            {t}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 6,
          marginBottom: '.85rem'
        }}
      >
        {item.stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: 'var(--gray-bg)',
              borderRadius: 8,
              padding: '.4rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.3rem',
                color: 'var(--blue-mid)',
                lineHeight: 1
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '.8px'
              }}
            >
              {s.k}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <span
          className="btn btn-blue btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
        >
          Contacter
        </span>
        <span
          className="btn btn-ghost btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
        >
          Profil
        </span>
      </div>
    </Link>
  );
}
