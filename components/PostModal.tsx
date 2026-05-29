'use client'

import { useState, useRef } from 'react'
import { supabase, Profile, Annonce, avatarSrc } from '../lib/supabase'
import { liguesHomme, liguesFemme } from '../lib/data'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

const ALL_LIGUE_GROUPS = [...liguesHomme, ...liguesFemme]
const ZONES  = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

// ——— SVG helpers ————————————————————————————————
const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoX        = ({ s = 16 }: { s?: number }) => <Svg size={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>
const IcoSend     = ({ s = 14 }: { s?: number }) => <Svg size={s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>
const IcoSave     = ({ s = 14 }: { s?: number }) => <Svg size={s}><polyline points="20 6 9 17 4 12"/></Svg>
const IcoPencil   = ({ s = 14 }: { s?: number }) => <Svg size={s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>
const IcoClock    = ({ s = 32 }: { s?: number }) => <Svg size={s}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Svg>
const IcoStop     = ({ s = 32 }: { s?: number }) => <Svg size={s}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Svg>
const IcoBuilding = ({ s = 20 }: { s?: number }) => <Svg size={s}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
const IcoCoach    = ({ s = 20 }: { s?: number }) => <Svg size={s}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
const IcoPlayer   = ({ s = 20 }: { s?: number }) => <Svg size={s}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>

interface Props {
  profile: Profile
  annonce?: Annonce        // if provided → edit mode
  onClose: () => void
  onSuccess: (a: Annonce) => void
}

export default function PostModal({ profile, annonce, onClose, onSuccess }: Props) {
  const { lang } = useLang()
  const [title, setTitle] = useState(annonce?.title || '')
  const [body, setBody] = useState(annonce?.body || '')
  const [ligue, setLigue] = useState(annonce?.ligue || profile.ligue || '')
  const [zone, setZone] = useState(annonce?.zone || profile.zone || '')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const editing = !!annonce

  const authorName = profile.role === 'club'
    ? (profile.club_name || profile.email)
    : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email

  async function handlePublish() {
    setSubmitted(true)
    if (!title.trim()) {
      setError('Le titre est requis.')
      setTimeout(() => titleRef.current?.focus(), 0)
      return
    }
    if (!body.trim()) {
      setError('Le texte est requis.')
      setTimeout(() => bodyRef.current?.focus(), 0)
      return
    }
    setPublishing(true)
    setError('')

    if (editing) {
      const { data, error: err } = await supabase
        .from('annonces')
        .update({ title: title.trim(), body: body.trim(), ligue: ligue || null, zone: zone || null })
        .eq('id', annonce!.id)
        .select()
        .single()
      setPublishing(false)
      if (err) { setError('Erreur lors de la modification.'); return }
      onSuccess(data)
    } else {
      const { data, error: err } = await supabase.from('annonces').insert({
        author_id: profile.id,
        author_name: authorName,
        author_type: profile.role,
        title: title.trim(),
        body: body.trim(),
        ligue: ligue || null,
        position: profile.position || null,
        zone: zone || profile.zone || '',
        status: 'active',
      }).select().single()
      setPublishing(false)
      if (err) { setError('Erreur lors de la publication. Réessaie.'); return }
      onSuccess(data)
    }
  }

  const RoleIcon = profile.role === 'club' ? IcoBuilding : profile.role === 'coach' ? IcoCoach : IcoPlayer
  const avatarGrad = profile.role === 'club'
    ? 'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)'
    : profile.role === 'coach'
    ? 'linear-gradient(135deg,#FF9A3A 0%,#c4651f 100%)'
    : 'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)'

  const gateStatus = profile.club_verification_status
  const isGated = profile.role === 'club' && gateStatus !== 'approved'

  return (
    <>
      <style>{`
        @keyframes pmFadeIn { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

        .pm-overlay {
          position:fixed; inset:0;
          background:rgba(13,31,74,.85);
          backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          z-index:1000; display:flex; align-items:center;
          justify-content:center; padding:1rem;
        }
        .pm-modal {
          background:linear-gradient(180deg,#142659 0%,#0d1f4a 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:20px;
          padding:32px; max-width:520px; width:100%;
          box-shadow:0 24px 80px rgba(0,0,0,.6); color:#fff;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
          animation:pmFadeIn .22s cubic-bezier(.22,1,.36,1);
          -webkit-font-smoothing:antialiased;
        }

        .pm-header {
          display:flex; align-items:center; gap:14px; margin-bottom:28px;
        }
        .pm-avatar {
          width:44px; height:44px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          overflow:hidden; position:relative;
        }
        .pm-avatar img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .pm-avatar svg { position:relative; z-index:1; }
        .pm-author-info { flex:1; min-width:0; }
        .pm-author-name { font-weight:700; font-size:15px; color:#fff; }
        .pm-author-sub  { font-size:12px; color:rgba(255,255,255,.45); margin-top:2px; }
        .pm-header-mode {
          font-family:'Russo One',sans-serif; font-size:11px; letter-spacing:2px;
          text-transform:uppercase; color:rgba(255,255,255,.4);
          display:flex; align-items:center; gap:6px; white-space:nowrap;
        }
        .pm-close {
          width:32px; height:32px; border-radius:8px; flex-shrink:0;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
          color:rgba(255,255,255,.5); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:background .2s,color .2s;
        }
        .pm-close:hover { background:rgba(255,255,255,.12); color:#fff; }

        .pm-field { margin-bottom:18px; }
        .pm-label {
          display:block; font-size:11px; font-weight:600; text-transform:uppercase;
          letter-spacing:1px; color:rgba(255,255,255,.55); margin-bottom:8px;
        }
        .pm-input, .pm-textarea, .pm-select {
          width:100%; box-sizing:border-box;
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.12); border-radius:10px;
          color:#fff; padding:11px 14px; font-size:14px;
          outline:none; font-family:inherit;
          transition:border-color .25s,background .25s;
        }
        .pm-input:focus, .pm-textarea:focus, .pm-select:focus {
          border-color:#FF3A3A; background:rgba(255,255,255,.06);
        }
        .pm-input::placeholder, .pm-textarea::placeholder { color:rgba(255,255,255,.3); }
        .pm-input.pm-err, .pm-textarea.pm-err { border-color:rgba(255,58,58,.7); }
        .pm-textarea { resize:vertical; }
        .pm-select {
          appearance:none; -webkit-appearance:none; cursor:pointer;
          padding-right:40px;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>");
          background-repeat:no-repeat; background-position:right 14px center;
        }
        .pm-select option { background:#0d1f4a; color:#fff; }

        .pm-field-err {
          display:flex; align-items:center; gap:5px;
          font-size:12px; color:#FF3A3A; margin-top:5px;
        }
        .pm-field-err::before {
          content:''; width:5px; height:5px; border-radius:50%;
          background:#FF3A3A; flex-shrink:0;
        }

        .pm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }

        .pm-error-box {
          background:rgba(255,58,58,.08); border:1px solid rgba(255,58,58,.25);
          border-radius:10px; padding:10px 14px;
          font-size:13px; color:#FF3A3A; margin-bottom:18px;
        }

        .pm-btns { display:flex; gap:10px; }
        .pm-btn-publish {
          flex:1; background:#FF3A3A; color:#fff; border:none; border-radius:10px;
          padding:13px; font-size:14px; font-weight:700; cursor:pointer;
          font-family:inherit;
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity .2s,transform .2s,box-shadow .2s;
        }
        .pm-btn-publish:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(255,58,58,.4); }
        .pm-btn-publish:disabled { opacity:.55; cursor:not-allowed; }
        .pm-btn-cancel {
          background:rgba(255,255,255,.06); color:rgba(255,255,255,.7);
          border:1px solid rgba(255,255,255,.22); border-radius:10px;
          padding:13px 22px; font-size:14px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:background .2s;
        }
        .pm-btn-cancel:hover { background:rgba(255,255,255,.1); }

        /* Gate */
        .pm-gate { text-align:center; padding:20px 12px; }
        .pm-gate-icon {
          width:72px; height:72px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 20px;
        }
        .pm-gate-icon.pending  { background:rgba(255,154,58,.1); border:1px solid rgba(255,154,58,.3); color:#FF9A3A; }
        .pm-gate-icon.rejected { background:rgba(255,58,58,.1);  border:1px solid rgba(255,58,58,.3);  color:#FF3A3A; }
        .pm-gate-title {
          font-family:'Russo One',sans-serif; font-size:1.25rem; letter-spacing:.5px; margin-bottom:10px;
        }
        .pm-gate-title.pending  { color:#FF9A3A; }
        .pm-gate-title.rejected { color:#FF3A3A; }
        .pm-gate-body { color:rgba(255,255,255,.6); font-size:14px; line-height:1.6; margin-bottom:6px; }
        .pm-gate-note { color:rgba(255,255,255,.4); font-size:13px; margin-bottom:20px; }
        .pm-gate-callout {
          background:rgba(255,154,58,.08); border:1px solid rgba(255,154,58,.2);
          border-radius:10px; padding:12px 16px; text-align:left;
          font-size:13px; color:rgba(255,154,58,.9); margin-bottom:20px; line-height:1.5;
        }
        .pm-gate-close {
          background:rgba(255,255,255,.06); color:rgba(255,255,255,.7);
          border:1px solid rgba(255,255,255,.22); border-radius:10px;
          padding:10px 24px; font-size:14px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:background .2s;
        }
        .pm-gate-close:hover { background:rgba(255,255,255,.1); }

        @media (max-width:480px) {
          .pm-modal { padding:24px 20px; }
          .pm-grid  { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="pm-overlay" onClick={onClose}>
        <div className="pm-modal" onClick={e => e.stopPropagation()}>

          {/* Club verification gate */}
          {isGated && (
            <div className="pm-gate">
              <div className={`pm-gate-icon ${gateStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                {gateStatus === 'rejected' ? <IcoStop s={32} /> : <IcoClock s={32} />}
              </div>
              <div className={`pm-gate-title ${gateStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                {t.clubVerif.post_blocked_title[lang]}
              </div>
              <p className="pm-gate-body">{t.clubVerif.post_blocked_body[lang]}</p>
              {gateStatus === 'rejected'
                ? <div className="pm-gate-callout">{t.clubVerif.post_blocked_rejected[lang]}</div>
                : <p className="pm-gate-note">{t.clubVerif.post_blocked_pending[lang]}</p>
              }
              <button className="pm-gate-close" onClick={onClose}>Fermer</button>
            </div>
          )}

          {/* Normal form — non-club or approved club */}
          {!isGated && (
            <>
              {/* Header */}
              <div className="pm-header">
                <div className="pm-avatar" style={{ background: profile.avatar_url ? 'transparent' : avatarGrad }}>
                  {profile.avatar_url
                    ? <img src={avatarSrc(profile.avatar_url)!} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : <RoleIcon s={20} />
                  }
                </div>
                <div className="pm-author-info">
                  <div className="pm-author-name">{authorName}</div>
                  <div className="pm-author-sub">
                    {profile.role === 'player' ? 'Joueur' : profile.role === 'coach' ? 'Coach' : 'Club'}
                    {profile.zone ? ` · ${profile.zone}` : ''}
                  </div>
                </div>
                <div className="pm-header-mode">
                  {editing ? <><IcoPencil s={13} />Modifier</> : <><IcoSend s={13} />Nouveau post</>}
                </div>
                <button className="pm-close" onClick={onClose} aria-label="Fermer">
                  <IcoX s={16} />
                </button>
              </div>

              {/* Title */}
              <div className="pm-field">
                <label className="pm-label">Titre <span style={{ color: '#FF3A3A' }}>*</span></label>
                <input
                  ref={titleRef}
                  autoFocus
                  className={`pm-input${submitted && !title.trim() ? ' pm-err' : ''}`}
                  value={title}
                  onChange={e => { setTitle(e.target.value); if (error) setError('') }}
                  placeholder="Ex: Je cherche un club pour la saison prochaine"
                />
                {submitted && !title.trim() && <div className="pm-field-err">Titre requis</div>}
              </div>

              {/* Body */}
              <div className="pm-field">
                <label className="pm-label">Message <span style={{ color: '#FF3A3A' }}>*</span></label>
                <textarea
                  ref={bodyRef}
                  rows={4}
                  className={`pm-textarea${submitted && !body.trim() ? ' pm-err' : ''}`}
                  value={body}
                  onChange={e => { setBody(e.target.value); if (error) setError('') }}
                  placeholder="Décris ta situation, tes attentes, ta disponibilité…"
                />
                {submitted && !body.trim() && <div className="pm-field-err">Message requis</div>}
              </div>

              {/* Optional: Ligue + Zone */}
              <div className="pm-grid">
                <div>
                  <label className="pm-label">Ligue (optionnel)</label>
                  <select className="pm-select" value={ligue} onChange={e => setLigue(e.target.value)}>
                    <option value="">—</option>
                    {ALL_LIGUE_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map(l => <option key={l} value={l}>{l}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pm-label">Zone (optionnel)</label>
                  <select className="pm-select" value={zone} onChange={e => setZone(e.target.value)}>
                    <option value="">—</option>
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="pm-error-box">{error}</div>}

              <div className="pm-btns">
                <button
                  className="pm-btn-publish"
                  onClick={handlePublish}
                  disabled={publishing || !title.trim() || !body.trim()}
                >
                  {publishing
                    ? 'En cours…'
                    : editing
                    ? <><IcoSave s={16} />Enregistrer</>
                    : <><IcoSend s={16} />Publier</>
                  }
                </button>
                <button className="pm-btn-cancel" onClick={onClose}>Annuler</button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
