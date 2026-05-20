'use client'

import { useEffect, useState } from 'react'

export interface TocItem {
  id: string
  num: string
  label: string
}

interface TocProps {
  title: string
  items: TocItem[]
}

export default function Toc({ title, items }: TocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const handler = () => {
      const els = document.querySelectorAll<HTMLElement>('.legal-section[id]')
      if (!els.length) return
      const scrollY = window.scrollY + 160
      let idx = 0
      els.forEach((s, i) => { if (s.offsetTop <= scrollY) idx = i })
      setActiveId(els[idx]?.id ?? items[0].id)
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav style={{ paddingTop: 28, paddingBottom: 28, borderTop: '1px solid rgba(255,255,255,.12)', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
      <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: '3px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 20 }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => {
          const active = activeId === item.id
          return (
            <li key={item.id} style={{ borderLeft: `2px solid ${active ? '#FF3A3A' : 'rgba(255,255,255,.12)'}`, transition: 'border-color .3s' }}>
              <a
                href={`#${item.id}`}
                onClick={e => handleClick(e, item.id)}
                style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 0 9px 16px', fontSize: 13, color: active ? '#fff' : 'rgba(255,255,255,.6)', textDecoration: 'none', lineHeight: 1.3, transition: 'color .3s' }}
              >
                <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 10, color: '#FF3A3A', flexShrink: 0 }}>{item.num}</span>
                <span>{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
