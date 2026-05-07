'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Profile, Message } from '../../lib/supabase'

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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!prof) { router.push('/login'); return }
      setProfile(prof)

      await loadMessages(prof)
    }
    load()
  }, [router])

  async function loadMessages(prof: Profile) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${prof.id},receiver_id.eq.${prof.id}`)
      .order('created_at', { ascending: true })

    if (!msgs || msgs.length === 0) {
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
      convMap[partnerId].lastTime = new Date(m.created_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
      if (!m.read && m.receiver_id === prof.id) convMap[partnerId].unread++
    }

    const convList = Object.values(convMap).sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at || ''
      const bLast = b.messages[b.messages.length - 1]?.created_at || ''
      return bLast.localeCompare(aLast)
    })

    setConversations(convList)
    if (convList.length > 0 && !activePartnerId) setActivePartnerId(convList[0].partnerId)
    setLoading(false)
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [activePartnerId, conversations])

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
        if (existing) {
          return prev.map((c) => c.partnerId === activePartnerId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: txt, lastTime: new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) }
            : c
          )
        }
        return prev
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
  const myName = profile ? (profile.role === 'club' ? profile.club_name : `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()) : 'Moi'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '4px solid var(--gray-light)', borderTopColor: 'var(--blue-bright)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div className="msg-wrap">
      {/* SIDEBAR */}
      <aside className="msg-sidebar">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, marginBottom: '.75rem' }}>Messages</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Rechercher…"
            style={{ width: '100%', background: 'var(--gray-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {conversations.length === 0
                ? 'Aucune conversation.\nContacte quelqu\'un depuis la recherche.'
                : 'Aucun résultat.'}
            </div>
          ) : filteredConvs.map((c) => {
            const isActive = c.partnerId === activePartnerId
            return (
              <button key={c.partnerId} onClick={() => selectConversation(c.partnerId)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.85rem 1rem', cursor: 'pointer', borderLeft: `3px solid ${isActive ? 'var(--blue-bright)' : 'transparent'}`, background: isActive ? 'var(--blue-light)' : 'transparent', width: '100%', border: 'none', borderBottom: '1px solid var(--gray-light)', textAlign: 'left' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: isActive ? 'var(--blue-bright)' : 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: isActive ? '#fff' : 'inherit' }}>
                  {roleEmoji(c.partnerRole)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.partnerName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.lastTime}</span>
                  {c.unread > 0 && (
                    <span style={{ width: 18, height: 18, background: 'var(--blue-bright)', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', padding: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Aucune conversation sélectionnée</div>
            <div style={{ fontSize: 13 }}>Contacte quelqu'un depuis la <a href="/recherche" style={{ color: 'var(--blue-bright)' }}>recherche</a>.</div>
          </div>
        ) : (
          <>
            <div className="msg-header">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {roleEmoji(activeConv.partnerRole)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeConv.partnerName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {activeConv.partnerRole === 'club' ? 'Club' : activeConv.partnerRole === 'coach' ? 'Coach' : 'Joueur'}
                </div>
              </div>
            </div>

            <div className="msg-body" ref={bodyRef}>
              {activeConv.messages.map((m, i) => {
                const fromMe = m.sender_id === profile?.id
                const time = new Date(m.created_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={m.id || i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: fromMe ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: fromMe ? 'var(--blue-bright)' : 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fromMe ? 11 : 14, fontWeight: fromMe ? 700 : 400, color: fromMe ? '#fff' : 'inherit', flexShrink: 0 }}>
                      {fromMe ? (myName?.slice(0, 2) || 'Moi') : roleEmoji(activeConv.partnerRole)}
                    </div>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ background: fromMe ? 'var(--blue-bright)' : '#fff', color: fromMe ? '#fff' : 'var(--text-dark)', border: fromMe ? 'none' : '1px solid var(--border)', padding: '.65rem .95rem', borderRadius: 14, borderBottomLeftRadius: fromMe ? 14 : 4, borderBottomRightRadius: fromMe ? 4 : 14, fontSize: 14, lineHeight: 1.5 }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: fromMe ? 'right' : 'left' }}>{time}</div>
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
                placeholder="Écrire un message…"
                style={{ flex: 1, background: 'var(--gray-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={handleSend} disabled={sending || !input.trim()}
                style={{ width: 40, height: 40, background: input.trim() ? 'var(--blue-bright)' : 'var(--gray-mid)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'background .15s' }}>
                ➤
              </button>
            </div>
          </>
        )}
      </section>

      <style>{`
        .msg-wrap { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 60px - 100px); min-height: 600px; overflow: hidden; }
        @media (max-width: 700px) { .msg-wrap { grid-template-columns: 1fr; height: auto; } .msg-sidebar { max-height: 240px; } }
        .msg-sidebar { background: #fff; border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
        .msg-main { display: flex; flex-direction: column; background: var(--gray-bg); overflow: hidden; }
        .msg-header { background: #fff; border-bottom: 1px solid var(--border); padding: .85rem 1.25rem; display: flex; align-items: center; gap: 12px; }
        .msg-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
        .msg-input-wrap { background: #fff; border-top: 1px solid var(--border); padding: .85rem 1.25rem; display: flex; align-items: center; gap: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
