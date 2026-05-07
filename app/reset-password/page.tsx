'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase puts tokens in the URL hash — listen for the session to be set
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/profil'), 3000)
  }

  const inputStyle = {
    width: '100%', background: 'var(--gray-bg)', border: '1.5px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: 'var(--text-dark)'
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: '2.5rem 2rem', boxShadow: '0 4px 32px rgba(0,0,0,.07)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1, marginBottom: '.25rem' }}>
            Nouveau mot de passe
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Choisis un nouveau mot de passe sécurisé
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: '.5rem' }}>Mot de passe mis à jour !</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Redirection vers ton profil…</div>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--gray-light)', borderTopColor: 'var(--blue-bright)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ fontSize: 14 }}>Vérification du lien…</div>
            <div style={{ fontSize: 12, marginTop: '.5rem' }}>Si la page reste bloquée, le lien a peut-être expiré.</div>
            <button onClick={() => router.push('/login')} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--blue-bright)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Demander un nouveau lien
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fce8e8', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Nouveau mot de passe</div>
              <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" required minLength={6} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Confirmer le mot de passe</div>
              <input style={inputStyle} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Répète le mot de passe" required minLength={6} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 9, padding: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit' }}>
              {loading ? '⏳ Mise à jour…' : 'Mettre à jour le mot de passe →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
