'use client'

import Link from 'next/link'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

export default function Footer() {
  const { lang } = useLang()

  const platformLinks = [
    ['/recherche',   t.nav.recherche[lang]],
    ['/clubs',       t.nav.clubs[lang]],
    ['/annonces',    t.nav.annonces[lang]],
    ['/dashboard',   t.nav.dashboard[lang]],
    ['/candidatures',t.nav.candidatures[lang]],
  ]

  const aboutLinks = [
    ['/a-propos', t.nav.apropos[lang]],
    ['/faq',      t.nav.faq[lang]],
    ['/privacy',  t.footer.privacy_link[lang]],
    ['/cgu',      t.footer.cgu_link[lang]],
  ]

  const colHead: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    marginBottom: 18,
    color: '#e63946',
    letterSpacing: '0.05em',
  }
  const colLink: React.CSSProperties = {
    display: 'block',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    fontSize: 14,
    marginBottom: 10,
    transition: 'color 0.2s',
  }

  return (
    <footer style={{ background: '#000', padding: '70px 0 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div className="hp-footer-grid">
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 18 }}>
              <img
                src="/images/logo-official.jpeg"
                alt="TeamUpFR"
                style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 9, border: '2px solid rgba(255,255,255,.18)' }}
              />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1 }}>
                <span style={{ color:'#e63946' }}>TeamUp</span><span style={{ color:'#000', WebkitTextStroke:'1px white' }}>F</span><span style={{ color:'#fff' }}>R</span>
              </span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.65, maxWidth: 300 }}>
              {t.footer.motto[lang]}.<br />{t.footer.location[lang]}.
            </p>
          </div>

          {/* Platform */}
          <div>
            <div style={colHead}>{t.footer.platform[lang]}</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {platformLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={colLink}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <div style={colHead}>{t.footer.about_section[lang]}</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {aboutLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={colLink}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div style={colHead}>{t.footer.contact_section[lang]}</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <a href="mailto:teamupfr.ch@gmail.com" style={colLink}>
                  teamupfr.ch@gmail.com
                </a>
              </li>
              <li>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>🇨🇭 Fribourg, Suisse</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            {t.footer.copyright[lang]} {t.footer.rights[lang]}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            {t.footer.languages[lang]}
          </p>
        </div>
      </div>

      <style>{`
        .hp-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
        }
        @media (max-width: 900px) {
          .hp-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .hp-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
