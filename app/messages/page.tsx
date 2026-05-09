'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Profile, Message, avatarSrc } from '../../lib/supabase'
import UserAvatar from '../../components/UserAvatar'
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

type MobileView = 'list' | 'chat' | 'newChat'

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
  const [searchConv, setSearchConv] = useState('')
  const [searchNewUser, setSearchNewUser] = useState('')
  const [newUserResults, setNewUserResults] = useState<Profile[]>([])
  const [pendingFile, setPendingFile] = useState<{ url: string; type: 'image' | 'video' | 'file'; name: string } | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const bodyRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const newChatInputRef = useRef<HTMLInputElement>(null)
  const activePartnerRef = useRef<string | null>(null)
  const isMobileRef = useRef(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const partnerParam = searchParams.get('partner')
  const { session, profile: authProfile, authLoading } = useAuth()

  // Mobile detection
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 900
      setIsMobile(mobile)
      isMobileRef.current = mobile
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-focus new chat input when view opens
  useEffect(() => {
    if (mobileView === 'newChat') {
      const timer = setTimeout(() => newChatInputRef.current?.focus(), 60)
      return () => clearTimeout(timer)
    }
  }, [mobileView])

  // Keep ref in sync for realtime handler
  useEffect(() => { activePartnerRef.current = activePartnerId }, [activePartnerId])

  // Auto-focus composer when landing via ?partner= link
  useEffect(() => {
    if (partnerParam && activePartnerId === partnerParam) {
      inputRef.current?.focus()
    }
  }, [partnerParam, activePartnerId])

  // Mark messages as read whenever active conversation changes
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

  // Debounced user search for new chat
  useEffect(() => {
    if (!searchNewUser || searchNewUser.length < 2 || !profile) {
      setNewUserResults([])
      return
    }
    const q = searchNewUser.toLowerCase()
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,club_name,role,avatar_url,ligue')
        .neq('id', profile.id)
        .neq('hidden', true)
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,club_name.ilike.%${q}%`)
        .limit(20)
      if (data) setNewUserResults(data as Profile[])
    }, 250)
    return () => clearTimeout(timer)
  }, [searchNewUser, profile?.id])

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
          if (isMobileRef.current) setMobileView('chat')
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
        if (isMobileRef.current) setMobileView('chat')
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
            lastMessage: '', lastTime: '', unread: 0, messages: [],
          }
          setConversations([virtualConv, ...convList])
          setActivePartnerId(partnerParam)
          if (isMobileRef.current) setMobileView('chat')
        } else {
          setConversations(convList)
          if (convList.length > 0 && !isMobileRef.current) setActivePartnerId(convList[0].partnerId)
        }
      }
    } else {
      setConversations(convList)
      if (convList.length > 0 && !isMobileRef.current) setActivePartnerId(convList[0].partnerId)
    }
    setLoading(false)
  }

  // Scroll to bottom when messages change or conversation switches
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [activePartnerId, conversations])

  // Realtime: incoming messages
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

  // ── File upload ──────────────────────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    e.target.value = ''
    if (file.size > 20 * 1024 * 1024) { alert('Fichier trop lourd (max 20 Mo)'); return }
    setUploadingFile(true)
    const fileType = getFileType(file)
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${profile.id}/${timestamp}_${safeName}`
    const { data, error } = await supabase.storage
      .from('message-files')
      .upload(path, file, { upsert: false, contentType: file.type })
    if (error) { alert('Erreur upload: ' + error.message); setUploadingFile(false); return }
    const { data: urlData } = supabase.storage.from('message-files').getPublicUrl(data.path)
    setPendingFile({ url: urlData.publicUrl, type: fileType, name: file.name })
    setUploadingFile(false)
  }

  // ── Send message ─────────────────────────────────────────────────────────────
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

  function openConversation(partnerId: string) {
    selectConversation(partnerId)
    setMobileView('chat')
  }

  function startNewChat(user: Profile) {
    const userName = user.role === 'club'
      ? (user.club_name || '—')
      : `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—'
    const existing = conversations.find(c => c.partnerId === user.id)
    if (existing) {
      setActivePartnerId(user.id)
      setMobileView('chat')
      setSearchNewUser('')
      setNewUserResults([])
      return
    }
    const virtualConv: Conversation = {
      partnerId: user.id,
      partnerName: userName,
      partnerRole: user.role,
      partnerEmail: '',
      partnerAvatar: user.avatar_url || null,
      lastMessage: '', lastTime: '', unread: 0, messages: [],
    }
    setConversations(prev => [virtualConv, ...prev])
    setActivePartnerId(user.id)
    setMobileView('chat')
    setSearchNewUser('')
    setNewUserResults([])
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const activeConv = conversations.find(c => c.partnerId === activePartnerId)
  const filteredConvs = conversations.filter(c =>
    !searchConv || c.partnerName.toLowerCase().includes(searchConv.toLowerCase())
  )
  const roleLabel = (role: string) =>
    role === 'club' ? t.messages.role_club[lang]
    : role === 'coach' ? t.messages.role_coach[lang]
    : t.messages.role_player[lang]
  const roleEmoji = (role: string) =>
    role === 'club' ? '🏟️' : role === 'coach' ? '🧑‍🏫' : '👤'
  const myName = profile
    ? (profile.role === 'club'
        ? (profile.club_name || '').slice(0, 2)
        : `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase())
    : t.messages.me[lang]

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem', background:'#030a24' }}>
      <div style={{ width:40, height:40, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  const sidebar = (
    <aside className="msg-sidebar">
      {/* Header with title + "+" button */}
      <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexShrink:0 }}>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.4rem', letterSpacing:1, color:'#fff' }}>
          {t.messages.title[lang]}
        </div>
        <button
          onClick={() => setMobileView('newChat')}
          title={t.messages.new_msg_btn[lang]}
          style={{ width:36, height:36, background:'#e63946', border:'none', borderRadius:'50%', color:'#fff', fontSize:22, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(230,57,70,.4)', flexShrink:0, lineHeight:1, transition:'transform .15s,background .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          +
        </button>
      </div>

      {/* Search existing conversations */}
      <div style={{ padding:'.65rem 1rem', flexShrink:0 }}>
        <input
          value={searchConv}
          onChange={e => setSearchConv(e.target.value)}
          placeholder={t.messages.search_conv_pl[lang]}
          style={{ width:'100%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', borderRadius:8, padding:'8px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
        />
      </div>

      {/* Conversation list */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {filteredConvs.length === 0 ? (
          <div style={{ padding:'2.5rem 1rem', textAlign:'center', color:'rgba(255,255,255,.4)', fontSize:13 }}>
            {conversations.length === 0 ? (
              <>
                <div style={{ fontSize:36, marginBottom:10, opacity:.5 }}>💬</div>
                <div style={{ marginBottom:14 }}>{t.messages.no_conv_yet[lang]}</div>
                <button
                  onClick={() => setMobileView('newChat')}
                  style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}
                >
                  + {t.messages.new_msg_btn[lang]}
                </button>
              </>
            ) : (
              t.messages.no_results[lang]
            )}
          </div>
        ) : filteredConvs.map(c => {
          const isActive = c.partnerId === activePartnerId
          return (
            <div
              key={c.partnerId}
              onClick={() => openConversation(c.partnerId)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'.85rem 1rem', cursor:'pointer', borderLeft:`3px solid ${isActive ? '#e63946' : 'transparent'}`, background: isActive ? 'rgba(230,57,70,.12)' : 'transparent', borderBottom:'1px solid rgba(255,255,255,.06)', transition:'background .15s' }}
            >
              <Link href={`/profil/${c.partnerId}`} onClick={e => e.stopPropagation()} style={{ textDecoration:'none', flexShrink:0, display:'block', width:42, height:42, borderRadius:12, overflow:'hidden' }}>
                <UserAvatar userId={c.partnerId} size={42} radius={12}
                  fallback={<div style={{ width:42, height:42, borderRadius:12, background: isActive ? 'rgba(230,57,70,.3)' : 'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#fff' }}>{roleEmoji(c.partnerRole)}</div>}
                />
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
  )

  // ── Chat main panel ───────────────────────────────────────────────────────────
  const chatMain = (
    <section className="msg-main">
      {!activeConv ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, flexDirection:'column', gap:'1rem', color:'rgba(255,255,255,.4)', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'3.5rem', opacity:.35 }}>💬</div>
          <div style={{ fontSize:22, fontFamily:"'Bebas Neue', sans-serif", letterSpacing:1, color:'rgba(255,255,255,.7)' }}>
            {t.messages.select_chat_title[lang]}
          </div>
          <div style={{ fontSize:13, maxWidth:260 }}>{t.messages.select_chat_desc[lang]}</div>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div className="msg-header">
            {isMobile && (
              <button
                onClick={() => setMobileView('list')}
                aria-label={t.messages.back[lang]}
                style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:9, color:'#fff', width:36, height:36, cursor:'pointer', fontSize:17, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
              >
                ←
              </button>
            )}
            <Link href={`/profil/${activeConv.partnerId}`} style={{ textDecoration:'none', flexShrink:0, display:'block', width:42, height:42, borderRadius:12, overflow:'hidden' }}>
              <UserAvatar userId={activeConv.partnerId} size={42} radius={12}
                fallback={<div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{roleEmoji(activeConv.partnerRole)}</div>}
              />
            </Link>
            <div style={{ flex:1, minWidth:0 }}>
              <Link href={`/profil/${activeConv.partnerId}`} style={{ fontWeight:700, fontSize:15, color:'#fff', textDecoration:'none', display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {activeConv.partnerName}
              </Link>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:.5 }}>
                {roleLabel(activeConv.partnerRole)}
              </div>
            </div>
          </div>

          {/* Messages */}
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
                      ? <img src={avatarSrc(profile.avatar_url)!} alt="" style={{ width:28, height:28, borderRadius:8, objectFit:'cover', flexShrink:0 }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                      : <div style={{ width:28, height:28, borderRadius:8, background:'#e63946', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{myName?.slice(0, 2) || t.messages.me[lang]}</div>
                  ) : (
                    <div style={{ width:28, height:28, borderRadius:8, overflow:'hidden', flexShrink:0 }}>
                      <UserAvatar userId={activeConv.partnerId} size={28} radius={8}
                        fallback={<div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{roleEmoji(activeConv.partnerRole)}</div>}
                      />
                    </div>
                  )}
                  <div style={{ maxWidth:'70%' }}>
                    <div style={{ background: fromMe ? '#e63946' : 'rgba(255,255,255,.08)', color:'#fff', padding:'.65rem .95rem', borderRadius:14, borderBottomLeftRadius: fromMe ? 14 : 4, borderBottomRightRadius: fromMe ? 4 : 14, fontSize:14, lineHeight:1.5 }}>
                      {hasText && <div>{m.text}</div>}
                      {hasFile && (
                        <div style={{ marginTop: hasText ? 8 : 0 }}>
                          {m.file_type === 'image' && (
                            <img src={m.file_url} alt={m.file_name || 'image'}
                              style={{ maxWidth:220, maxHeight:200, borderRadius:8, display:'block', cursor:'pointer', objectFit:'cover' }}
                              onClick={() => window.open(m.file_url, '_blank')}
                            />
                          )}
                          {m.file_type === 'video' && (
                            <video src={m.file_url} controls playsInline style={{ maxWidth:260, borderRadius:8, display:'block' }} />
                          )}
                          {m.file_type === 'file' && (
                            <a href={m.file_url} target="_blank" rel="noopener noreferrer" download={m.file_name || 'fichier'}
                              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'rgba(255,255,255,.15)', borderRadius:8, color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600 }}>
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
            <div style={{ background:'rgba(255,255,255,.05)', borderTop:'1px solid rgba(255,255,255,.08)', padding:'.6rem 1.25rem', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              {pendingFile.type === 'image' && (
                <img src={pendingFile.url} alt="" style={{ height:52, width:52, objectFit:'cover', borderRadius:8 }} />
              )}
              {pendingFile.type !== 'image' && (
                <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'rgba(255,255,255,.7)' }}>
                  {pendingFile.type === 'video' ? '🎬' : '📎'} {pendingFile.name}
                </div>
              )}
              <div style={{ flex:1, fontSize:12, color:'rgba(255,255,255,.5)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {pendingFile.type === 'image' ? pendingFile.name : ''}
              </div>
              <button onClick={() => setPendingFile(null)} style={{ background:'rgba(255,255,255,.12)', border:'none', borderRadius:6, color:'rgba(255,255,255,.7)', cursor:'pointer', padding:'4px 8px', fontSize:13 }}>✕</button>
            </div>
          )}

          {/* Composer */}
          <div className="msg-input-wrap">
            <input ref={fileInputRef} type="file" style={{ display:'none' }} onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.zip" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
              title={lang === 'fr' ? 'Joindre un fichier' : 'Datei anhängen'}
              style={{ width:38, height:38, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:9, color:'rgba(255,255,255,.7)', fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {uploadingFile ? '⏳' : '📎'}
            </button>
            <input
              ref={inputRef}
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
  )

  // ── New chat panel (modal on desktop, fullscreen on mobile) ──────────────────
  const newChatPanel = (
    <div className={isMobile ? 'msg-new-chat-mobile' : 'msg-new-chat-desktop'}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.07)', flexShrink:0 }}>
        <button
          onClick={() => { setMobileView('list'); setSearchNewUser(''); setNewUserResults([]) }}
          aria-label={t.messages.back[lang]}
          style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:9, color:'#fff', width:36, height:36, cursor:'pointer', fontSize: isMobile ? 17 : 14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
        >
          {isMobile ? '←' : '✕'}
        </button>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, color:'#fff' }}>
          {t.messages.new_msg_title[lang]}
        </div>
      </div>

      {/* Search input */}
      <div style={{ padding:'.75rem 1rem', flexShrink:0 }}>
        <input
          ref={newChatInputRef}
          value={searchNewUser}
          onChange={e => setSearchNewUser(e.target.value)}
          placeholder={t.messages.search_users_pl[lang]}
          style={{ width:'100%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:8, padding:'10px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
        />
      </div>

      {/* Results */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 .5rem .75rem' }}>
        {searchNewUser.length < 2 && (
          <div style={{ padding:'2rem 1rem', textAlign:'center', color:'rgba(255,255,255,.4)', fontSize:13 }}>
            {t.messages.search_min_chars[lang]}
          </div>
        )}
        {searchNewUser.length >= 2 && newUserResults.length === 0 && (
          <div style={{ padding:'2rem 1rem', textAlign:'center', color:'rgba(255,255,255,.4)', fontSize:13 }}>
            {t.messages.no_user_found_pre[lang]} «{searchNewUser}»
          </div>
        )}
        {newUserResults.map(user => {
          const userName = user.role === 'club'
            ? (user.club_name || '—')
            : `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—'
          return (
            <div
              key={user.id}
              onClick={() => startNewChat(user)}
              className="msg-user-result"
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', cursor:'pointer', borderRadius:12, border:'1px solid transparent', marginBottom:2, transition:'all .15s' }}
            >
              <div style={{ width:42, height:42, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <UserAvatar userId={user.id} size={42} radius={12}
                  fallback={<div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{roleEmoji(user.role)}</div>}
                />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:.5 }}>
                  {roleLabel(user.role)}{user.ligue ? ` · ${user.ligue}` : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="msg-wrap">
      {/* Sidebar: always on desktop, only in 'list' view on mobile */}
      {(!isMobile || mobileView === 'list') && sidebar}

      {/* Chat main: always on desktop, only in 'chat' view on mobile */}
      {(!isMobile || mobileView === 'chat') && chatMain}

      {/* Desktop backdrop for new chat modal */}
      {mobileView === 'newChat' && !isMobile && (
        <div
          onClick={() => { setMobileView('list'); setSearchNewUser(''); setNewUserResults([]) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:99 }}
        />
      )}

      {/* New chat: modal on desktop, fullscreen panel on mobile */}
      {mobileView === 'newChat' && newChatPanel}

      <style>{`
        .msg-wrap {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - 60px - 100px);
          min-height: 600px;
          overflow: hidden;
          position: relative;
          background: #030a24;
        }
        @media (max-width: 900px) {
          .msg-wrap {
            grid-template-columns: 1fr;
            height: calc(100dvh - 60px);
            min-height: 0;
          }
        }
        .msg-sidebar {
          background: #061540;
          border-right: 1px solid rgba(255,255,255,.07);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .msg-main {
          display: flex;
          flex-direction: column;
          background: #030a24;
          overflow: hidden;
        }
        .msg-header {
          background: #061540;
          border-bottom: 1px solid rgba(255,255,255,.07);
          padding: .85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .msg-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: .75rem;
        }
        .msg-input-wrap {
          background: #061540;
          border-top: 1px solid rgba(255,255,255,.07);
          padding: .85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .msg-new-chat-mobile {
          position: absolute;
          inset: 0;
          background: #030a24;
          display: flex;
          flex-direction: column;
          z-index: 20;
        }
        .msg-new-chat-desktop {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 480px;
          max-height: 580px;
          background: #061540;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 80px rgba(0,0,0,.7);
          z-index: 100;
        }
        .msg-user-result:hover {
          background: rgba(230,57,70,.1) !important;
          border-color: rgba(230,57,70,.3) !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
