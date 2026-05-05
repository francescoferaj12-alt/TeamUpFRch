'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const links = [
  { href: '/recherche', label: 'Recherche' },
  { href: '/profil', label: 'Profil' },
  { href: '/messages', label: 'Messages' },
  { href: '/club/bulle', label: 'Clubs' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/candidatures', label: 'Candidatures' }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <Logo size={34} />
        <span className="nav-brand">TeamUp<span>FR</span></span>
      </Link>

      <div className="nav-links" style={{ overflow: 'auto', maxWidth: '60vw' }}>
        {links.map((l) => {
          const active = pathname?.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={`nav-link ${active ? 'active' : ''}`}>
              {l.label}
            </Link>
          );
        })}
      </div>

      <div className="nav-right">
        <button className="nav-icon-btn" aria-label="Notifications">
          🔔
          <span className="nav-dot" />
        </button>
        <Link href="/profil" className="nav-avatar" aria-label="Mon profil">
          LM
        </Link>
      </div>
    </nav>
  );
}
