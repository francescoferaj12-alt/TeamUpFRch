'use client';

import { useState, useRef, useEffect } from 'react';
import { conversations as initialConvs, Conversation } from '../../lib/data';

export default function MessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>(initialConvs);
  const [activeId, setActiveId] = useState(initialConvs[0].id);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  const active = convs.find((c) => c.id === activeId)!;

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [active.messages.length, activeId]);

  function handleSelect(id: string) {
    setActiveId(id);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  function handleSend() {
    const txt = input.trim();
    if (!txt) return;
    const time = new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    setConvs((cs) =>
      cs.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { fromMe: true, text: txt, time }], lastMessage: txt }
          : c
      )
    );
    setInput('');
    // Simulated reply
    setTimeout(() => {
      const reply = "Merci pour ton message ! Je reviens vers toi rapidement. 👍";
      const replyTime = new Date().toLocaleTimeString('fr-CH', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setConvs((cs) =>
        cs.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, { fromMe: false, text: reply, time: replyTime }],
                lastMessage: reply
              }
            : c
        )
      );
    }, 1200);
  }

  const filteredConvs = convs.filter((c) =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="msg-wrap">
      {/* SIDEBAR */}
      <aside className="msg-sidebar">
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.3rem',
              letterSpacing: 1,
              marginBottom: '.75rem'
            }}
          >
            Messages
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Rechercher…"
            style={{
              width: '100%',
              background: 'var(--gray-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.map((c) => {
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '.85rem 1rem',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${isActive ? 'var(--blue-bright)' : 'transparent'}`,
                  background: isActive ? 'var(--blue-light)' : 'transparent',
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid var(--gray-light)',
                  textAlign: 'left'
                }}
              >
                <div className={`msg-avatar ${c.avatarClass}`}>{c.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {c.lastMessage}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
                  {c.unread > 0 && (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        background: 'var(--blue-bright)',
                        borderRadius: '50%',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* MAIN */}
      <section className="msg-main">
        <div className="msg-header">
          <div className={`msg-avatar ${active.avatarClass}`}>{active.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{active.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{active.type} · En ligne</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <IconBtn>👤</IconBtn>
            <IconBtn>📹</IconBtn>
            <IconBtn>⋯</IconBtn>
          </div>
        </div>

        <div className="msg-body" ref={bodyRef}>
          <div
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-muted)',
              padding: '.25rem 0'
            }}
          >
            Aujourd'hui
          </div>
          {active.messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                flexDirection: m.fromMe ? 'row-reverse' : 'row'
              }}
            >
              <div
                className={`msg-bubble-av ${m.fromMe ? '' : active.avatarClass}`}
                style={{
                  background: m.fromMe ? 'var(--blue-bright)' : undefined,
                  color: m.fromMe ? '#fff' : undefined,
                  fontSize: m.fromMe ? 11 : 14,
                  fontWeight: m.fromMe ? 700 : 400
                }}
              >
                {m.fromMe ? 'LM' : active.emoji}
              </div>
              <div style={{ maxWidth: '70%' }}>
                <div
                  style={{
                    background: m.fromMe ? 'var(--blue-bright)' : '#fff',
                    color: m.fromMe ? '#fff' : 'var(--text-dark)',
                    border: m.fromMe ? 'none' : '1px solid var(--border)',
                    padding: '.65rem .95rem',
                    borderRadius: 14,
                    borderBottomLeftRadius: m.fromMe ? 14 : 4,
                    borderBottomRightRadius: m.fromMe ? 4 : 14,
                    fontSize: 14,
                    lineHeight: 1.5
                  }}
                >
                  {m.text}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginTop: 3,
                    textAlign: m.fromMe ? 'right' : 'left'
                  }}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="msg-input-wrap">
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              color: 'var(--text-muted)',
              padding: 4
            }}
          >
            📎
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrire un message…"
            style={{
              flex: 1,
              background: 'var(--gray-bg)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              width: 40,
              height: 40,
              background: 'var(--blue-bright)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            ➤
          </button>
        </div>
      </section>

      <style>{`
        .msg-wrap {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - 60px - 100px);
          min-height: 600px;
          overflow: hidden;
        }
        @media (max-width: 700px) {
          .msg-wrap { grid-template-columns: 1fr; height: auto; }
          .msg-sidebar { max-height: 240px; }
        }
        .msg-sidebar {
          background: #fff;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .msg-main {
          display: flex;
          flex-direction: column;
          background: var(--gray-bg);
          overflow: hidden;
        }
        .msg-header {
          background: #fff;
          border-bottom: 1px solid var(--border);
          padding: .85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
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
          background: #fff;
          border-top: 1px solid var(--border);
          padding: .85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .msg-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .msg-bubble-av {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .avatar-blue { background: #deeafa; }
        .avatar-red { background: #fde8e8; }
        .avatar-green { background: var(--green-bg); }
      `}</style>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: 'var(--gray-bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        width: 34,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 16
      }}
    >
      {children}
    </button>
  );
}
