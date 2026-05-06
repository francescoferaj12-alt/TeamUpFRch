import Link from 'next/link';

export default function AProposPage() {
  return (
    <>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, var(--blue-dark) 0%, #0d2d7a 60%, var(--blue-mid) 100%)',
        padding: '6rem 2rem 5rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L0 30h30V0zm0 60L60 30H30v30z' fill='%23fff' fill-opacity='.03'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 18px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: 14 }}>⚽</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>Notre histoire</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#fff', letterSpacing: 3, lineHeight: 1, marginBottom: '1rem' }}>
            Nés du terrain,<br />
            <span style={{ color: 'var(--red-light)' }}>pour le terrain</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 18, lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
            TeamUpFR n'est pas né dans un bureau. Il est né d'une frustration réelle, vécue par trois jeunes passionnés de football aux origines diverses — unis par Fribourg et par le ballon rond.
          </p>
        </div>
      </section>

      {/* ORIGINE */}
      <section style={{ background: '#fff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.75rem' }}>L'origine</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1, marginBottom: '1.5rem', lineHeight: 1.05 }}>
                Un projet d'école devenu une vraie mission
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                Tout commence sur les bancs de l'école. Nous devions rendre un projet sur un <strong style={{ color: 'var(--text-dark)' }}>service innovant</strong> — le sujet était libre. C'est là que Tiago a eu la lumière.
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                En tant qu'entraîneur, il vivait chaque saison le même problème : <strong style={{ color: 'var(--text-dark)' }}>trouver des joueurs, c'est une affaire de réseau.</strong> Si tu ne connais personne, tu ne trouves personne.
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Francesco, arrivé d'Italie à 14 ans, l'avait vécu de l'autre côté — chercher une équipe dans un pays qu'il découvrait. Trois expériences différentes, un même constat. Un même manque. Une seule solution.
              </p>
            </div>
            <div style={{ background: 'var(--gray-bg)', borderRadius: 20, padding: '2.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(224,32,32,.3)' }}>
                💡
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '5rem', color: 'var(--gray-light)', lineHeight: 1, marginBottom: '.5rem' }}>"</div>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-dark)', fontStyle: 'italic', marginTop: '-2rem' }}>
                Dans le football amateur, tu trouves une équipe par les connaissances. Si tu ne connais personne, tu joues nulle part. Ce n'est pas normal.
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #e02020, #ff8c42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧑‍🏫</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Tiago</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Coach · Co-fondateur · 28 ans</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ background: 'var(--gray-bg)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.75rem' }}>L'équipe</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1 }}>
              Trois origines, une passion
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: '.75rem', maxWidth: 500, margin: '.75rem auto 0' }}>
              Portugais, italo-albanais — tous réunis à Fribourg par le football. C'est peut-être ça qui nous a donné la sensibilité pour ce projet.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                name: 'Tiago',
                age: 28,
                role: 'Coach & Co-fondateur',
                emoji: '🧑‍🏫',
                flag: '🇵🇹',
                origin: 'Origines portugaises · Né à Fribourg',
                color: '#e02020',
                bg: 'linear-gradient(135deg, #6b0000, #e02020)',
                desc: "L'idée originale. En tant qu'entraîneur, il cherchait des joueurs chaque saison sans trouver de solution. Sa frustration est devenue notre mission.",
                tag: "💡 L'idée"
              },
              {
                name: 'Francesco',
                age: 21,
                role: 'Joueur & Co-fondateur',
                emoji: '⚽',
                flag: '🇮🇹🇦🇱',
                origin: 'Italo-albanais · Arrivé à Fribourg il y a 7 ans',
                color: '#1a6fd4',
                bg: 'linear-gradient(135deg, #0a1f5c, #1a6fd4)',
                desc: "Arrivé en Suisse à 14 ans, il a vécu de l'intérieur la difficulté de trouver une équipe sans réseau dans un pays nouveau. Cette expérience est au cœur du projet.",
                tag: "🎯 La vision"
              },
              {
                name: 'Hugo',
                age: 21,
                role: 'Joueur & Co-fondateur',
                emoji: '🏃',
                flag: '🇵🇹',
                origin: 'Origines portugaises · Né à Fribourg',
                color: '#0d7a36',
                bg: 'linear-gradient(135deg, #063a1a, #0d7a36)',
                desc: "Joueur passionné, il connaît le football amateur fribourgeois de l'intérieur. Son expérience terrain a façonné chaque détail de la plateforme.",
                tag: "⚡ L'énergie"
              }
            ].map(m => (
              <div key={m.name} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ background: m.bg, padding: '2rem', textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '.75rem' }}>{m.emoji}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: 1 }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>{m.flag} {m.age} ans</div>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#fff', fontWeight: 600 }}>{m.tag}</div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.25rem' }}>{m.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: '.75rem', fontStyle: 'italic' }}>{m.origin}</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ background: '#fff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.75rem' }}>Notre mission</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 1, marginBottom: '1.5rem', lineHeight: 1.05 }}>
            Que chaque joueur trouve<br />
            <span style={{ color: 'var(--red)' }}>son équipe</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '3rem', maxWidth: 600, margin: '0 auto 3rem' }}>
            Notre mission est simple : dans le football amateur fribourgeois, le talent ne doit plus être limité par le réseau. Chaque joueur mérite d'être vu. Chaque club mérite de trouver le bon profil.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { icon: '👁️', title: 'Visibilité', desc: 'Chaque joueur visible, peu importe son réseau ou ses origines' },
              { icon: '🤝', title: 'Connexion', desc: 'Joueurs, coachs et clubs réunis sur une seule plateforme' },
              { icon: '🆓', title: 'Gratuité', desc: '100% gratuit pour tous — toujours' },
              { icon: '🇨🇭', title: 'Local', desc: 'Fait pour Fribourg, par des jeunes de Fribourg' },
            ].map(v => (
              <div key={v.title} style={{ padding: '1.5rem', background: 'var(--gray-bg)', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{v.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1, marginBottom: '.5rem' }}>{v.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ background: 'var(--blue-dark)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '.75rem' }}>Notre parcours</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1, color: '#fff' }}>De l'idée au lancement</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,.1)' }} />
            {[
              { date: '2024', icon: '💡', title: "L'idée naît", desc: "Tiago propose le projet en classe. Hugo et Francesco rejoignent immédiatement. Ce qui devait être un travail scolaire devient une vraie vision." },
              { date: '2024–2025', icon: '🛠️', title: 'Construction de la plateforme', desc: "Des mois de travail pour créer quelque chose de vraiment utile pour les joueurs et clubs fribourgeois." },
              { date: '2025', icon: '🚀', title: 'TeamUpFR est en ligne', desc: "La plateforme est lancée. Joueurs, coachs et clubs du canton peuvent s'inscrire gratuitement." },
              { date: 'Bientôt', icon: '🌟', title: 'La suite', desc: "Domaine teamupfr.ch, app mobile, partenariats avec les clubs et l'AFAS. La communauté grandit." },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: i === 3 ? 'var(--red)' : 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, zIndex: 1 }}>
                  {e.icon}
                </div>
                <div style={{ paddingTop: '.5rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-bright)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.25rem' }}>{e.date}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: '.35rem' }}>{e.title}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--red)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#fff', letterSpacing: 3, marginBottom: '1rem' }}>
            Rejoins l'aventure
          </h2>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 16, lineHeight: 1.7, marginBottom: '2rem' }}>
            Nous sommes trois jeunes qui ont cru en une idée née en classe. Aujourd'hui c'est une vraie plateforme. Demain c'est ta communauté.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#fff', color: 'var(--red)', padding: '14px 36px', borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 2, textDecoration: 'none', fontWeight: 700 }}>
              Créer mon profil
            </Link>
            <Link href="/recherche" style={{ background: 'transparent', color: '#fff', padding: '14px 36px', borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 2, textDecoration: 'none', border: '2px solid rgba(255,255,255,.5)' }}>
              Explorer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
