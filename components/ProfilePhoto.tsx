'use client'

import { useEffect, useRef, useState } from 'react'

export default function ProfilePhoto({ src, name, lang, fallback }: {
  src: string; name: string; lang: 'fr' | 'de'; fallback: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [largeFailed, setLargeFailed] = useState(false)
  const de = lang === 'de'
  const alt = de ? `Profilfoto: ${name}` : `Photo de profil de ${name}`

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  if (failedSrc === src) return <span role="img" aria-label={alt}>{fallback}</span>

  return <>
    <button type="button" className="profile-photo-open" aria-haspopup="dialog"
      aria-label={de ? `Profilfoto von ${name} vergrössern` : `Agrandir la photo de ${name}`}
      onClick={() => { setLargeFailed(false); dialog.current?.showModal(); setOpen(true) }}>
      <img src={src} alt={alt} style={{ width:'100%', height:'100%', objectFit:'cover' }}
        onError={() => { setFailedSrc(src); setOpen(false) }} />
    </button>
    <dialog ref={dialog} className="profile-photo-dialog" aria-label={alt}
      onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>
      <div className="profile-photo-view">
        <button type="button" className="profile-photo-close" aria-label={de ? 'Foto schliessen' : 'Fermer la photo'} onClick={() => dialog.current?.close()}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        {open && (largeFailed
          ? <p role="status">{de ? 'Das Foto konnte nicht geladen werden.' : 'La photo n’a pas pu être chargée.'}</p>
          : <img src={src} alt={alt} onError={() => setLargeFailed(true)} />)}
        <p className="profile-photo-name">{name}</p>
      </div>
    </dialog>
    <style>{`
      .profile-photo-open{display:block;width:100%;height:100%;padding:0;border:0;background:transparent;color:inherit;cursor:zoom-in}
      .profile-photo-open:focus-visible{outline:3px solid #fff;outline-offset:-5px;border-radius:50%}
      .profile-photo-dialog{border:0;padding:0;background:transparent;color:#fff;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow:auto}
      .profile-photo-dialog::backdrop{background:rgba(2,6,18,.92)}
      .profile-photo-view{position:relative;padding:56px 8px 8px;text-align:center}
      .profile-photo-view>img{display:block;margin:auto;max-width:min(90vw,1000px);max-height:calc(100vh - 150px);max-height:calc(100dvh - 150px);width:auto;height:auto;object-fit:contain;border-radius:12px}
      .profile-photo-close{position:absolute;right:8px;top:4px;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid #94a3b8;border-radius:50%;background:#17243a;color:#fff;cursor:pointer}
      .profile-photo-close:focus-visible{outline:3px solid #fff;outline-offset:3px}
      .profile-photo-name{margin:12px 0 4px;font-size:14px;overflow-wrap:anywhere}
    `}</style>
  </>
}
