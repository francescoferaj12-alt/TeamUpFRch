'use client'

import { useEffect, useId, useRef, useState } from 'react'

export default function AnnonceBody({ text, lang }: { text: string; lang: 'fr' | 'de' }) {
  const id = useId()
  const content = useRef<HTMLParagraphElement>(null)
  const [expandedText, setExpandedText] = useState<string | null>(null)
  const [overflows, setOverflows] = useState(false)
  const expanded = expandedText === text

  useEffect(() => {
    if (expanded) return
    const element = content.current
    if (!element) return
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1)
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(element)
    window.addEventListener('resize', measure)
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure) }
  }, [text, expanded])

  return (
    <div className="an-card-body">
      <p ref={content} id={id} style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
        ...(expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }) }}>
        {text}
      </p>
      {(overflows || expanded) && <button type="button" aria-expanded={expanded} aria-controls={id}
        className="an-read-more" onClick={() => setExpandedText(expanded ? null : text)}>
        {lang === 'de' ? (expanded ? 'Weniger anzeigen' : 'Mehr lesen') : (expanded ? 'Voir moins' : 'Lire la suite')}
      </button>}
    </div>
  )
}
