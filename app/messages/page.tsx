'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Profile, Message } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'

type Conversation = {
  partnerId: string
  partnerName: string
  partnerRole: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: Message[]
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
  const bodyRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const partnerParam = searchParams.get('partner')
  const { session, profile: authProfile, authLoading } = useAuth()

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
        const { data: partner } = await supabase.from('profiles').select('id,first_name,last_name,club_name,role').eq('id', partnerParam).single()
        if (partner) {
          setConversations([{
            partnerId: partner.id,
            partnerName: partner.role === 'club' ? (partner.club_name || '—') : `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || '—',
            partnerRole: partner.role,
            lastMessage: '', lastTime: '', unread: 0, messages: [],
          }])
          setActivePartnerId(partnerParam)
        }
      }
      setLoading(false)
      return
    }

    const partnerIds = [...new Set(msgs.map((m: Message) => m.sender_id === prof.id ? m.receiver_id : m.sender_id))]
    const { data: partners } = await supabase.from('profiles').select('id,first_name,last_name,club_name,role').in('id', partnerIds)

    const partnerMap: Record<string, { name: string; role: string }> = {}
    for (const p of (partners || [])) {
      partnerMap[p.id] = {
        name: p.role === 'club' ? p.club_name : `${p.first_name || ''} ${p.last_name || ''}`.trim() || '—',
        role: p.role
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
          lastMessage: '',
          lastTime: '',
          unread: 0,
          messages: []
        }
      }
      convMap[partnerId].messages.push(m)
      convMap[partnerId].lastMessage = m.text
      convMap[partnerId].lastTime = new Date(m.created_at).toLocaleTimeString(lang === 'fr' ? 'fr-CH' : 'de-CH', { hour: '2-digit', minute: '2-digit' })
      if (!m.read && m.receiver_id === prof.id) convMap[partnerId].unread++
    }

    const convList = Object.values(convMap).sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at || ''
      const bLast = b.messages[b.messages.length - 1]?.created_at || ''
      return bLast.localeCompare(aLast)
    })

    // If coming from a profile/club link with ?partner=ID
    if (partnerParam) {
      const existing = convList.find(c => c.partnerId === partnerParam)
      if (existing) {
        setConversations(convList)
        setActivePartnerId(partnerParam)
        await supabase.from('messages').update({ read: true }).eq('sender_id', partnerParam).eq('receiver_id', prof.id).eq('read', false)
      } else {
        // New conversation — fetch partner profile and create virtual entry
        const { data: partner } = await supabase.from('profiles').select('id,first_name,last_name,club_name,role').eq('id', partnerParam).single()
        if (partner) {
          const virtualConv: Conversation = {
            partnerId: partner.id,
            partnerName: partner.role === 'club' ? (partner.club_name || '—') : `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || '—',
            partnerRole: partner.role,
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

  // Realtime: refetch conversations when a new message arrives for me
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel(`msg-rt-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${profile.id}`,
      }, () => { loadMessages(profile) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  async function handleSend() {
    const txt = input.trim()
    if (!txt || !profile || !activePartnerId || sending) return
    setSending(true)
    const { data: newMsg } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: activePartnerId,
      text: txt,
      read: false
    }).select().single()

    if (newMsg) {
      setConversations((prev) => {
        const existing = prev.find((c) => c.partnerId === activePartnerId)
        const timeStr = new Date().toLocaleTimeString(lang === 'fr' ? 'fr-CH' : 'de-CH', { hour: '2-digit', minute: '2-digit' })
        if (existing) {
          return prev.map((c) => c.partnerId === activePartnerId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: txt, lastTime: timeStr }
            : c
          )
        }
        // First message in a new conversation — update the virtual entry
        return prev.map((c) => c.partnerId === activePartnerId
          ? { ...c, messages: [newMsg], lastMessage: txt, lastTime: timeStr }
          : c
        )
      })
    }
    setInput('')
    setSending(false)
  }

  async function selectConversation(partnerId: string) {
    setActivePartnerId(partnerId)
    if (!profile) return
    await supabase.from('messages').update({ read: true }).eq('sender_id', partnerId).eq('receiver_id', profile.id).eq('read', false)
    setConversations((prev) => prev.map((c) => c.partnerId === partnerId ? { ...c, unread: 0 } : c))
  }

  const activeConv = conversations.find((c) => c.partnerId === activePartnerId)
  const filteredConvs = conversations.filter((c) => !search || c.partnerName.toLowerCase().includes(search.toLowerCase()))

  const roleEmoji = (role: string) => role === 'club' ? '🏟️' : role === 'coach' ? '🧑‍🏫' : '👤'
  const roleLabel = (role: string) => role === 'club' ? t.messages.role_club[lang] : role === 'coach' ? t.messages.role_coach[lang] : t.messages.role_player[lang]
  const myName = profile ? (profile.role === 'club' ? profile.club_name : `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()) : t.messages.me[lang]

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
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, marginBottom:'.75rem', color:'#fff' }}>{t.messages.title[lang]}</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.messages.search_pl[lang]}
            style={{ width:'100%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', borderRadius:8, padding:'8px 12px', fontSize:13, fontFamily:'inherit', outline:'none' }}
          />
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {filteredConvs.length === 0 ? (
            <div style={{ padding:'2rem 1rem', textAlign:'center', color:'rgba(255,255,255,.4)', fontSize:13 }}>
              {conversations.length === 0
                ? t.messages.no_conv[lang]
                : t.messages.no_results[lang]}
            </div>
          ) : filteredConvs.map((c) => {
            const isActive = c.partnerId === activePartnerId
            return (
              <button key={c.partnerId} onClick={() => selectConversation(c.partnerId)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'.85rem 1rem', cursor:'pointer', borderLeft:`3px solid ${isActive ? '#e63946' : 'transparent'}`, background: isActive ? 'rgba(230,57,70,.12)' : 'transparent', width:'100%', border:'none', borderBottom:'1px solid rgba(255,255,255,.06)', textAlign:'left' }}>
                <div style={{ width:42, height:42, borderRadius:12, background: isActive ? 'rgba(230,57,70,.3)' : 'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, color:'#fff' }}>
                  {roleEmoji(c.partnerRole)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#fff' }}>{c.partnerName}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.lastMessage}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>{c.lastTime}</span>
                  {c.unread > 0 && (
                    <span style={{ width:18, height:18, background:'#e63946', borderRadius:'50%', fontSize:10, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
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
              {t.messages.no_selected_desc[lang]} <a href="/recherche" style={{ color:'#e63946' }}>{t.messages.recherche_link[lang]}</a>.
            </div>
          </div>
        ) : (
          <>
            <div className="msg-header">
              <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                {roleEmoji(activeConv.partnerRole)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{activeConv.partnerName}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>
                  {roleLabel(activeConv.partnerRole)}
                </div>
              </div>
            </div>

            <div className="msg-body" ref={bodyRef}>
              {activeConv.messages.map((m, i) => {
                const fromMe = m.sender_id === profile?.id
                const time = new Date(m.created_at).toLocaleTimeString(lang === 'fr' ? 'fr-CH' : 'de-CH', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={m.id || i} style={{ display:'flex', alignItems:'flex-end', gap:8, flexDirection: fromMe ? 'row-reverse' : 'row' }}>
                    <div style={{ width:28, height:28, borderRadius:8, background: fromMe ? '#e63946' : 'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: fromMe ? 11 : 14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {fromMe ? (myName?.slice(0, 2) || t.messages.me[lang]) : roleEmoji(activeConv.partnerRole)}
                    </div>
                    <div style={{ maxWidth:'70%' }}>
                      <div style={{ background: fromMe ? '#e63946' : 'rgba(255,255,255,.08)', color:'#fff', padding:'.65rem .95rem', borderRadius:14, borderBottomLeftRadius: fromMe ? 14 : 4, borderBottomRightRadius: fromMe ? 4 : 14, fontSize:14, lineHeight:1.5 }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:3, textAlign: fromMe ? 'right' : 'left' }}>{time}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="msg-input-wrap">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={t.messages.write_pl[lang]}
                style={{ flex:1, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:10, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }}
              />
              <button onClick={handleSend} disabled={sending || !input.trim()}
                style={{ width:40, height:40, background: input.trim() ? '#e63946' : 'rgba(255,255,255,.1)', border:'none', borderRadius:10, color:'#fff', fontSize:18, cursor: input.trim() ? 'pointer' : 'default', flexShrink:0, transition:'background .15s' }}>
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
        .msg-header { background: #061540; border-bottom: 1px solid rgba(255,255,255,.07); padding: .85rem 1.25rem; display: flex; align-items: center; gap: 12px; }
        .msg-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
        .msg-input-wrap { background: #061540; border-top: 1px solid rgba(255,255,255,.07); padding: .85rem 1.25rem; display: flex; align-items: center; gap: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
