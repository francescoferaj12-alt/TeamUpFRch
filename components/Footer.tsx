'use client'

import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

export default function Footer() {
  const { lang } = useLang()

  const platformLinks = [
    ['/recherche', t.nav.recherche[lang]],
    ['/clubs', t.nav.clubs[lang]],
    ['/candidatures', t.nav.candidatures[lang]],
    ['/messages', t.nav.messages[lang]],
    ['/dashboard', t.nav.dashboard[lang]],
  ]

  const aboutLinks = [
    ['/a-propos', t.nav.apropos[lang]],
    ['/faq', t.nav.faq[lang]],
    ['/privacy', t.footer.privacy_link[lang]],
    ['/cgu', t.footer.cgu_link[lang]],
  ]

  return (
    <footer style={{ background: 'var(--blue-dark)', color: 'rgba(255,255,255,.5)', padding: '3rem 2rem 2rem', fontSize: 13 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: 2, color: '#fff', marginBottom: '.5rem' }}>
              TeamUp<span style={{ color: '#ff4444' }}>FR</span>
            </div>
            <div style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
              {t.footer.motto[lang]}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{t.footer.location[lang]}</div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '.75rem', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{t.footer.platform[lang]}</div>
            {platformLinks.map(([href, label]) => (
              <a key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,.45)', marginBottom: '.4rem', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>

          {/* About */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '.75rem', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{t.footer.about_section[lang]}</div>
            {aboutLinks.map(([href, label]) => (
              <a key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,.45)', marginBottom: '.4rem', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '.75rem', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{t.footer.contact_section[lang]}</div>
            <a href="mailto:teamupfr.ch@gmail.com" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', display: 'block', marginBottom: '.4rem' }}>
              📧 teamupfr.ch@gmail.com
            </a>
            <div style={{ color: 'rgba(255,255,255,.3)', marginTop: '1rem', fontSize: 12 }}>
              🇨🇭 Fribourg, Suisse
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>{t.footer.copyright[lang]} {t.footer.rights[lang]}</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>{t.footer.languages[lang]}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
