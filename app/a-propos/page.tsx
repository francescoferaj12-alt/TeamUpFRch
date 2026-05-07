'use client'

import Link from 'next/link'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'

export default function AProposPage() {
  const { lang } = useLang()

  const members = [
    {
      name: 'Tiago',
      age: 28,
      role: t.apropos.tiago_role[lang],
      emoji: '🧑‍🏫',
      flag: '🇵🇹',
      origin: t.apropos.tiago_origin[lang],
      color: '#e02020',
      bg: 'linear-gradient(135deg, #6b0000, #e02020)',
      desc: t.apropos.tiago_desc[lang],
      tag: t.apropos.tiago_tag[lang],
    },
    {
      name: 'Francesco',
      age: 21,
      role: t.apropos.fran_role[lang],
      emoji: '⚽',
      flag: '🇮🇹🇦🇱',
      origin: t.apropos.fran_origin[lang],
      color: '#1a6fd4',
      bg: 'linear-gradient(135deg, #0a1f5c, #1a6fd4)',
      desc: t.apropos.fran_desc[lang],
      tag: t.apropos.fran_tag[lang],
    },
    {
      name: 'Hugo',
      age: 21,
      role: t.apropos.hugo_role[lang],
      emoji: '🏃',
      flag: '🇵🇹',
      origin: t.apropos.hugo_origin[lang],
      color: '#0d7a36',
      bg: 'linear-gradient(135deg, #063a1a, #0d7a36)',
      desc: t.apropos.hugo_desc[lang],
      tag: t.apropos.hugo_tag[lang],
    },
  ]

  const missions = [
    { icon: '👁️', title: t.apropos.val_visibility[lang], desc: t.apropos.val_visibility_desc[lang] },
    { icon: '🤝', title: t.apropos.val_connection[lang], desc: t.apropos.val_connection_desc[lang] },
    { icon: '🆓', title: t.apropos.val_free[lang], desc: t.apropos.val_free_desc[lang] },
    { icon: '🇨🇭', title: t.apropos.val_local[lang], desc: t.apropos.val_local_desc[lang] },
  ]

  const timeline = [
    { date: '2024', icon: '💡', title: t.apropos.tl1_title[lang], desc: t.apropos.tl1_desc[lang] },
    { date: '2024–2025', icon: '🛠️', title: t.apropos.tl2_title[lang], desc: t.apropos.tl2_desc[lang] },
    { date: '2025', icon: '🚀', title: t.apropos.tl3_title[lang], desc: t.apropos.tl3_desc[lang] },
    { date: t.apropos.tl4_date[lang], icon: '🌟', title: t.apropos.tl4_title[lang], desc: t.apropos.tl4_desc[lang] },
  ]

  const ageSuffix = t.apropos.age_suffix[lang]

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg,#030a24 0%,#061540 60%,#0a1f5c 100%)', padding:'6rem 2rem 5rem', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L0 30h30V0zm0 60L60 30H30v30z' fill='%23fff' fill-opacity='.02'/%3E%3C/svg%3E")` }} />
        <div style={{ position:'relative', maxWidth:700, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:100, padding:'6px 18px', marginBottom:'1.5rem' }}>
            <span style={{ fontSize:14 }}>⚽</span>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.85)', textTransform:'uppercase' }}>{t.apropos.hero_badge[lang]}</span>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3rem,8vw,6rem)', color:'#fff', letterSpacing:3, lineHeight:1, marginBottom:'1rem' }}>
            {t.apropos.hero_title1[lang]}<br />
            <span style={{ color:'#e63946' }}>{t.apropos.hero_title2[lang]}</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:18, lineHeight:1.7, maxWidth:580, margin:'0 auto' }}>
            {t.apropos.hero_desc[lang]}
          </p>
        </div>
      </section>

      {/* ORIGINE */}
      <section style={{ padding:'5rem 2rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#e63946', marginBottom:'.75rem' }}>{t.apropos.origin_badge[lang]}</div>
              <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:1, marginBottom:'1.5rem', lineHeight:1.05 }}>
                {t.apropos.origin_title[lang]}
              </h2>
              <p style={{ fontSize:16, color:'rgba(255,255,255,.6)', lineHeight:1.8, marginBottom:'1.25rem' }}>{t.apropos.origin_p1[lang]}</p>
              <p style={{ fontSize:16, color:'rgba(255,255,255,.6)', lineHeight:1.8, marginBottom:'1.25rem' }}>{t.apropos.origin_p2[lang]}</p>
              <p style={{ fontSize:16, color:'rgba(255,255,255,.6)', lineHeight:1.8 }}>{t.apropos.origin_p3[lang]}</p>
            </div>
            <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:20, padding:'2.5rem', position:'relative' }}>
              <div style={{ position:'absolute', top:-16, right:-16, width:60, height:60, background:'#e63946', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', boxShadow:'0 8px 24px rgba(230,57,70,.3)' }}>
                💡
              </div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'5rem', color:'rgba(255,255,255,.1)', lineHeight:1, marginBottom:'.5rem' }}>"</div>
              <p style={{ fontSize:18, lineHeight:1.7, color:'rgba(255,255,255,.8)', fontStyle:'italic', marginTop:'-2rem' }}>
                {t.apropos.quote[lang]}
              </p>
              <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#e02020,#ff8c42)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🧑‍🏫</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>Tiago</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{t.apropos.quote_sub[lang]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ background:'rgba(255,255,255,.015)', padding:'5rem 2rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#e63946', marginBottom:'.75rem' }}>{t.apropos.team_badge[lang]}</div>
            <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:1 }}>
              {t.apropos.team_title[lang]}
            </h2>
            <p style={{ color:'rgba(255,255,255,.45)', fontSize:15, marginTop:'.75rem', maxWidth:500, margin:'.75rem auto 0' }}>
              {t.apropos.team_desc[lang]}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'1.5rem' }}>
            {members.map(m => (
              <div key={m.name} style={{ background:'rgba(255,255,255,.04)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,.08)' }}>
                <div style={{ background:m.bg, padding:'2rem', textAlign:'center', position:'relative' }}>
                  <div style={{ fontSize:'3.5rem', marginBottom:'.75rem' }}>{m.emoji}</div>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem', color:'#fff', letterSpacing:1 }}>{m.name}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginTop:4 }}>{m.flag} {m.age}{ageSuffix}</div>
                  <div style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', borderRadius:100, padding:'3px 10px', fontSize:11, color:'#fff', fontWeight:600 }}>{m.tag}</div>
                </div>
                <div style={{ padding:'1.5rem' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:m.color, textTransform:'uppercase', letterSpacing:1, marginBottom:'.25rem' }}>{m.role}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:'.75rem', fontStyle:'italic' }}>{m.origin}</div>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,.55)', lineHeight:1.7 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding:'5rem 2rem' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#e63946', marginBottom:'.75rem' }}>{t.apropos.mission_badge[lang]}</div>
          <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2rem,5vw,3.5rem)', letterSpacing:1, marginBottom:'1.5rem', lineHeight:1.05 }}>
            {t.apropos.mission_title1[lang]}<br />
            <span style={{ color:'#e63946' }}>{t.apropos.mission_title2[lang]}</span>
          </h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.55)', lineHeight:1.8, marginBottom:'3rem', maxWidth:600, margin:'0 auto 3rem' }}>
            {t.apropos.mission_desc[lang]}
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1.5rem', marginBottom:'3rem' }}>
            {missions.map(v => (
              <div key={v.title} style={{ padding:'1.5rem', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:16, textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>{v.icon}</div>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'.5rem' }}>{v.title}</div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ background:'rgba(255,255,255,.015)', padding:'5rem 2rem' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:'.75rem' }}>{t.apropos.timeline_badge[lang]}</div>
            <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:1, color:'#fff' }}>{t.apropos.timeline_title[lang]}</h2>
          </div>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:20, top:0, bottom:0, width:2, background:'rgba(255,255,255,.08)' }} />
            {timeline.map((e, i) => (
              <div key={i} style={{ display:'flex', gap:'1.5rem', marginBottom:'2rem', position:'relative' }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background: i === 3 ? '#e63946' : 'rgba(255,255,255,.07)', border:'2px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0, zIndex:1 }}>
                  {e.icon}
                </div>
                <div style={{ paddingTop:'.5rem' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#e63946', textTransform:'uppercase', letterSpacing:1, marginBottom:'.25rem' }}>{e.date}</div>
                  <div style={{ fontWeight:600, fontSize:15, color:'#fff', marginBottom:'.35rem' }}>{e.title}</div>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.6 }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg,#e63946,#c0202e)', padding:'5rem 2rem', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2.5rem,6vw,4rem)', color:'#fff', letterSpacing:3, marginBottom:'1rem' }}>
            {t.apropos.cta_title[lang]}
          </h2>
          <p style={{ color:'rgba(255,255,255,.85)', fontSize:16, lineHeight:1.7, marginBottom:'2rem' }}>
            {t.apropos.cta_desc[lang]}
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/login" style={{ background:'#fff', color:'#e63946', padding:'14px 36px', borderRadius:10, fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:2, textDecoration:'none', fontWeight:700 }}>
              {t.apropos.cta_btn1[lang]}
            </Link>
            <Link href="/recherche" style={{ background:'transparent', color:'#fff', padding:'14px 36px', borderRadius:10, fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:2, textDecoration:'none', border:'2px solid rgba(255,255,255,.5)' }}>
              {t.apropos.cta_btn2[lang]}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
