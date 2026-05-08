'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Profile, Message } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'

type Conversation = {
  partnerId: string
  partnerName: string
  partnerRole: string
  partnerEmail: string
  partnerAvatar: string | null
  lastMessage: string
  lastTime: string
  unread: number
  messages: Message[]
}

function getFileType(file: File): 'image' | 'video' | 'file' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'file'
}

export default function MessagesPage() {
  const { lang } = useLang()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [pendingFile, setPendingFile] = useState<{ url: string; type: 'image' | 'video' | 'file'; name: string } | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activePartnerRef = useRef<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const partnerParam = searchParams.get('partner')
  const { session, profile: authProfile, authLoading } = useAuth()

  // Keep ref in sync for realtime handler
  useEffect(() => { activePartnerRef.current = activePartnerId }, [activePartnerId])

  // Mark messages as read whenever the active conversation changes (covers auto-select too)
  useEffect(() => {
    if (!activePartnerId || !profile) return
    const pid = activePartnerId
    const rid = profile.id
    ;(async () => {
      await supabase.from('messages')
        .update({ read: true })
        .eq('sender_id', pid)
        .eq('receiver_id', rid)
        .eq('read', false)
      setConversations(prev => prev.map(c =>
        c.partnerId === pid ? { ...c, unread: 0 } : c
      ))
      // Notify Navbar directly so badge clears immediately
      window.dispatchEvent(new Event('messages-read'))
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartnerId, profile?.id])

  useEffect(() => {
    if (authLoading) return
    if (!session || !authProfile) { router.push('/login'); return }
    setProfile(authProfile)
    loadMessages(authProfile)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session, authProfile])

  async function loadMessages(prof: Profile) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${prof.id},receiver_id.eq.${prof.id}`)
      .order('created_at', { ascending: true })

    if (!msgs || msgs.length === 0) {
      if (partnerParam) {
        const { data: partner } = await supabase
          .from('profiles')
          .select('id,first_name,last_name,club_name,role,email,avatar_url')
          .eq('id', partnerParam).single()
        if (partner) {
          setConversations([{
            partnerId: partner.id,
            partnerName: partner.role === 'club'
              ? (partner.club_name || '—')
              : `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || '—',
            partnerRole: partner.role,
            partnerEmail: partner.email || '',
            partnerAvatar: partner.avatar_url || null,
            lastMessage: '', lastTime: '', unread: 0, messages: [],
          }])
          setActivePartnerId(partnerParam)
        }
      }
      setLoading(false)
      return
    }

    const partnerIds = [...new Set(msgs.map((m: Message) => m.sender_id === prof.id ? m.receiver_id : m.sender_id))]
    const { data: partners } = await supabase
      .from('profiles')
      .select('id,first_name,last_name,club_name,role,email,avatar_url')
      .in('id', partnerIds)

    const partnerMap: Record<string, { name: string; role: string; email: string; avatar: string | null }> = {}
    for (const p of (partners || [])) {
      partnerMap[p.id] = {
        name: p.role === 'club'
          ? (p.club_name || '—')
          : `${p.first_name || ''} ${p.last_name || ''}`.trim() || '—',
        role: p.role,
        email: p.email || '',
        avatar: p.avatar_url || null,
      }
    }

    const convMap: Record<string, Conversation> = {}
    for (const m of msgs) {
      const partnerId = m.sender_id === prof.id ? m.receiver_id : m.sender_id
      if (!convMap[partnerId]) {
        convMap[partnerId] = {
          partnerId,
          partnerName: partnerMap[partnerId]?.name || '—',
          partnerRole: partnerMap[partnerId]?.role || '',
          partnerEmail: partnerMap[partnerId]?.email || '',
          partnerAvatar: partnerMap[partnerId]?.avatar || null,
          lastMessage: '',
          lastTime: '',
          unread: 0,
          messages: []
        }
      }
      convMap[partnerId].messages.push(m)
      convMap[partnerId].lastMessage = m.text || (m.file_url ? `📎 ${m.file_name || 'Fichier'}` : '')
      convMap[partnerId].lastTime = new Date(m.created_at).toLocaleTimeString(
        lang === 'fr' ? 'fr-CH' : 'de-CH',
        { hour: '2-digit', minute: '2-digit' }
      )
      if (!m.read && m.receiver_id === prof.id) convMap[partnerId].unread++
    }

    const convList = Object.values(convMap).sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at || ''
      const bLast = b.messages[b.messages.length - 1]?.created_at || ''
      return bLast.localeCompare(aLast)
    })

    if (partnerParam) {
      const existing = convList.find(c => c.partnerId === partnerParam)
      if (existing) {
        setConversations(convList)
        setActivePartnerId(partnerParam)
        await supabase.from('messages').update({ read: true })
          .eq('sender_id', partnerParam).eq('receiver_id', prof.id).eq('read', false)
      } else {
        const { data: partner } = await supabase
          .from('profiles')
          .select('id,first_name,last_name,club_name,role,email,avatar_url')
          .eq('id', partnerParam).single()
        if (partner) {
          const virtualConv: Conversation = {
            partnerId: partner.id,
            partnerName: partner.role === 'club'
              ? (partner.club_name || '—')
              : `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || '—',
            partnerRole: partner.role,
            partnerEmail: partner.email || '',
            partnerAvatar: partner.avatar_url || null,
            lastMessage: '',
            lastTime: '',
            unread: 0,
            messages: [],
          }
          setConversations([virtualConv, ...convList])
          setActivePartnerId(partnerParam)
        } else {
          setConversations(convList)
          if (convList.length > 0 && !activePartnerId) setActivePartnerId(convList[0].partnerId)
        }
      }
    } else {
      setConversations(convList)
      if (convList.length > 0 && !activePartnerId) setActivePartnerId(convList[0].partnerId)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [activePartnerId, conversations])

  // Realtime: new message arrives
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel(`msg-rt-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${profile.id}`,
      }, async (payload: any) => {
        // Auto-mark as read if the conversation is currently open
        const incomingSenderId = payload.new?.sender_id
        if (incomingSenderId && incomingSenderId === activePartnerRef.current) {
          await supabase.from('messages').update({ read: true })
            .eq('sender_id', incomingSenderId)
            .eq('receiver_id', profile.id)
            .eq('read', false)
        }
        loadMessages(profile)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  // ── File upload ─────────────────────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    e.target.value = ''

    if (file.size > 20 * 1024 * 1024) {
      alert('Fichier trop lourd (max 20 Mo)')
      return
    }

    setUploadingFile(true)
    const fileType = getFileType(file)
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${profile.id}/${timestamp}_${safeName}`

    const { data, error } = await supabase.storage
      .from('message-files')
      .upload(path, file, { upsert: false, contentType: file.type })

    if (error) {
      alert('Erreur upload: ' + error.message)
      setUploadingFile(false)
      return
    }

    const { data: urlData } = supabase.storage.from('message-files').getPublicUrl(data.path)
    setPendingFile({ url: urlData.publicUrl, type: fileType, name: file.name })
    setUploadingFile(false)
  }

  // ── Send message ─────────────────────────────────────────────────────────
  async function handleSend() {
    const txt = input.trim()
    if ((!txt && !pendingFile) || !profile || !activePartnerId || sending) return
    setSending(true)

    const { data: newMsg } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: activePartnerId,
      text: txt,
      file_url: pendingFile?.url || null,
      file_type: pendingFile?.type || null,
      file_name: pendingFile?.name || null,
      read: false
    }).select().single()

    if (newMsg) {
      const timeStr = new Date().toLocaleTimeString(
        lang === 'fr' ? 'fr-CH' : 'de-CH',
        { hour: '2-digit', minute: '2-digit' }
      )
      const preview = txt || (pendingFile ? `📎 ${pendingFile.name}` : '')
      setConversations(prev => prev.map(c => c.partnerId === activePartnerId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: preview, lastTime: timeStr }
        : c
      ))

      // Fire-and-forget email notification
      const _pid = activePartnerId
      const _txt = txt
      const _pf = pendingFile
      ;(async () => {
        try {
          const { data: receiver } = await supabase.from('profiles')
            .select('email,first_name,last_name,club_name,role')
            .eq('id', _pid).single()
          if (!receiver?.email) return
          const senderName = profile.role === 'club'
            ? (profile.club_name || 'Un club')
            : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Un utilisateur'
          const receiverName = receiver.role === 'club'
            ? (receiver.club_name || '')
            : `${receiver.first_name || ''} ${receiver.last_name || ''}`.trim()
          await fetch('/api/send-message-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiverEmail: receiver.email,
              receiverName,
              senderName,
              messagePreview: _txt.slice(0, 120) || (_pf ? `[Fichier: ${_pf.name}]` : ''),
            }),
          })
        } catch {}
      })()
    }

    setInput('')
    setPendingFile(null)
    setSending(false)
  }

  async function selectConversation(partnerId: string) {
    setActivePartnerId(partnerId)
    if (!profile) return
    await supabase.from('messages').update({ read: true })
      .eq('sender_id', partnerId).eq('receiver_id', profile.id).eq('read', false)
    setConversations(prev => prev.map(c => c.partnerId === partnerId ? { ...c, unread: 0 } : c))
    window.dispatchEvent(new Event('messages-read'))
  }

  const activeConv = conversations.find(c => c.partnerId === activePartnerId)
  const filteredConvs = conversations.filter(c => !search || c.partnerName.toLowerCase().includes(search.toLowerCase()))

  const roleEmoji = (role: string) => role === 'club' ? '🏟️' : role === 'coach' ? '🧑‍🏫' : '👤'
  const roleLabel = (role: string) =>
    role === 'club' ? t.messages.role_club[lang]
    : role === 'coach' ? t.messages.role_coach[lang]
    : t.messages.role_player[lang]
  const myName = profile
    ? (profile.role === 'club' ? profile.club_name : `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase())
    : t.messages.me[lang]

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem', background:'#030a24' }}>
      <div style={{ width:40, height:40, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div className="msg-wrap">
      {/* SIDEBAR */}
      <aside className="msg-sidebar">
        <div style={{ padding:'1rem', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, marginBottom:'.75rem', color:'#fff' }}>
            {t.messages.title[lang]}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.messages.search_pl[lang]}
            style={{ width:'100%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', borderRadius:8, padding:'8px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
          />
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {filteredConvs.length === 0 ? (
            <div style={{ padding:'2rem 1rem', textAlign:'center', color:'rgba(255,255,255,.4)', fontSize:13 }}>
              {conversations.length === 0 ? t.messages.no_conv[lang] : t.messages.no_results[lang]}
            </div>
          ) : filteredConvs.map(c => {
            const isActive = c.partnerId === activePartnerId
            return (
              <div key={c.partnerId} onClick={() => selectConversation(c.partnerId)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'.85rem 1rem', cursor:'pointer', borderLeft:`3px solid ${isActive ? '#e63946' : 'transparent'}`, background: isActive ? 'rgba(230,57,70,.12)' : 'transparent', width:'100%', borderBottom:'1px solid rgba(255,255,255,.06)', textAlign:'left' }}>
                <Link href={`/profil/${c.partnerId}`} onClick={e => e.stopPropagation()} style={{ textDecoration:'none', flexShrink:0, display:'block', width:42, height:42 }}>
                  {c.partnerAvatar
                    ? <img src={c.partnerAvatar} alt="" style={{ width:42, height:42, borderRadius:12, objectFit:'cover', display:'block' }} />
                    : <div style={{ width:42, height:42, borderRadius:12, background: isActive ? 'rgba(230,57,70,.3)' : 'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#fff' }}>{roleEmoji(c.partnerRole)}</div>
                  }
                </Link>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#fff' }}>{c.partnerName}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.lastMessage}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>{c.lastTime}</span>
                  {c.unread > 0 && (
                    <span style={{ width:18, height:18, background:'#e63946', borderRadius:'50%', fontSize:10, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* MAIN */}
      <section className="msg-main">
        {!activeConv ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, flexDirection:'column', gap:'1rem', color:'rgba(255,255,255,.4)', padding:'2rem' }}>
            <div style={{ fontSize:'3rem' }}>💬</div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{t.messages.no_selected[lang]}</div>
            <div style={{ fontSize:13 }}>
              {t.messages.no_selected_desc[lang]}{' '}
              <a href="/recherche" style={{ color:'#e63946' }}>{t.messages.recherche_link[lang]}</a>.
            </div>
          </div>
        ) : (
          <>
            <div className="msg-header">
              <Link href={`/profil/${activeConv.partnerId}`} style={{ textDecoration:'none', flexShrink:0, display:'block', width:42, height:42 }}>
                {activeConv.partnerAvatar
                  ? <img src={activeConv.partnerAvatar} alt="" style={{ width:42, height:42, borderRadius:12, objectFit:'cover', display:'block' }} />
                  : <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{roleEmoji(activeConv.partnerRole)}</div>
                }
              </Link>
              <div style={{ flex:1 }}>
                <Link href={`/profil/${activeConv.partnerId}`} style={{ fontWeight:700, fontSize:15, color:'#fff', textDecoration:'none' }}>{activeConv.partnerName}</Link>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{roleLabel(activeConv.partnerRole)}</div>
              </div>
            </div>

            <div className="msg-body" ref={bodyRef}>
              {activeConv.messages.map((m, i) => {
                const fromMe = m.sender_id === profile?.id
                const time = new Date(m.created_at).toLocaleTimeString(
                  lang === 'fr' ? 'fr-CH' : 'de-CH',
                  { hour: '2-digit', minute: '2-digit' }
                )
                const hasText = !!m.text
                const hasFile = !!m.file_url

                return (
                  <div key={m.id || i} style={{ display:'flex', alignItems:'flex-end', gap:8, flexDirection: fromMe ? 'row-reverse' : 'row' }}>
                    {fromMe ? (
                      profile?.avatar_url
                        ? <img src={profile.avatar_url} alt="" style={{ width:28, height:28, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                        : <div style={{ width:28, height:28, borderRadius:8, background:'#e63946', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{myName?.slice(0, 2) || t.messages.me[lang]}</div>
                    ) : (
                      activeConv.partnerAvatar
                        ? <img src={activeConv.partnerAvatar} alt="" style={{ width:28, height:28, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                        : <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{roleEmoji(activeConv.partnerRole)}</div>
                    )}
                    <div style={{ maxWidth:'70%' }}>
                      <div style={{ background: fromMe ? '#e63946' : 'rgba(255,255,255,.08)', color:'#fff', padding: hasFile ? '.65rem .95rem' : '.65rem .95rem', borderRadius:14, borderBottomLeftRadius: fromMe ? 14 : 4, borderBottomRightRadius: fromMe ? 4 : 14, fontSize:14, lineHeight:1.5 }}>
                        {hasText && <div>{m.text}</div>}
                        {hasFile && (
                          <div style={{ marginTop: hasText ? 8 : 0 }}>
                            {m.file_type === 'image' && (
                              <img
                                src={m.file_url}
                                alt={m.file_name || 'image'}
                                style={{ maxWidth:220, maxHeight:200, borderRadius:8, display:'block', cursor:'pointer', objectFit:'cover' }}
                                onClick={() => window.open(m.file_url, '_blank')}
                              />
                            )}
                            {m.file_type === 'video' && (
                              <video
                                src={m.file_url}
                                controls
                                playsInline
                                style={{ maxWidth:260, borderRadius:8, display:'block' }}
                              />
                            )}
                            {m.file_type === 'file' && (
                              <a
                                href={m.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={m.file_name || 'fichier'}
                                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'rgba(255,255,255,.15)', borderRadius:8, color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600 }}
                              >
                                📎 {m.file_name || 'Télécharger'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:3, textAlign: fromMe ? 'right' : 'left' }}>{time}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pending file preview */}
            {pendingFile && (
              <div style={{ background:'rgba(255,255,255,.05)', borderTop:'1px solid rgba(255,255,255,.08)', padding:'.6rem 1.25rem', display:'flex', alignItems:'center', gap:10 }}>
                {pendingFile.type === 'image' && (
                  <img src={pendingFile.url} alt="" style={{ height:52, width:52, objectFit:'cover', borderRadius:8 }} />
                )}
                {pendingFile.type === 'video' && (
                  <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'rgba(255,255,255,.7)' }}>🎬 {pendingFile.name}</div>
                )}
                {pendingFile.type === 'file' && (
                  <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'rgba(255,255,255,.7)' }}>📎 {pendingFile.name}</div>
                )}
                <div style={{ flex:1, fontSize:12, color:'rgba(255,255,255,.5)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {pendingFile.type === 'image' ? pendingFile.name : ''}
                </div>
                <button onClick={() => setPendingFile(null)} style={{ background:'rgba(255,255,255,.12)', border:'none', borderRadius:6, color:'rgba(255,255,255,.7)', cursor:'pointer', padding:'4px 8px', fontSize:13 }}>✕</button>
              </div>
            )}

            <div className="msg-input-wrap">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                style={{ display:'none' }}
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.zip"
              />
              {/* Attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                title={lang === 'fr' ? 'Joindre un fichier' : 'Datei anhängen'}
                style={{ width:38, height:38, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:9, color:'rgba(255,255,255,.7)', fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s' }}
              >
                {uploadingFile ? '⏳' : '📎'}
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={t.messages.write_pl[lang]}
                style={{ flex:1, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:10, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }}
              />
              <button onClick={handleSend} disabled={sending || (!input.trim() && !pendingFile)}
                style={{ width:40, height:40, background:(input.trim() || pendingFile) ? '#e63946' : 'rgba(255,255,255,.1)', border:'none', borderRadius:10, color:'#fff', fontSize:18, cursor:(input.trim() || pendingFile) ? 'pointer' : 'default', flexShrink:0, transition:'background .15s' }}>
                ➤
              </button>
            </div>
          </>
        )}
      </section>

      <style>{`
        .msg-wrap { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 60px - 100px); min-height: 600px; overflow: hidden; }
        @media (max-width: 700px) { .msg-wrap { grid-template-columns: 1fr; height: auto; } .msg-sidebar { max-height: 240px; } }
        .msg-sidebar { background: #061540; border-right: 1px solid rgba(255,255,255,.07); display: flex; flex-direction: column; overflow: hidden; }
        .msg-main { display: flex; flex-direction: column; background: #030a24; overflow: hidden; }
        .msg-header { background: #061540; border-bottom: 1px solid rgba(255,255,255,.07); padding: .85rem 1.25rem; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .msg-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
        .msg-input-wrap { background: #061540; border-top: 1px solid rgba(255,255,255,.07); padding: .85rem 1.25rem; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
