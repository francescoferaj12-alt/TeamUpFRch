'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']
const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [mode, setMode] = useState<'login'|'register'|'forgot'>('login')
  const [role, setRole] = useState<'player'|'coach'|'club'>('player')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/profil'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [ligue, setLigue] = useState('')
  const [zone, setZone] = useState('')
  const [foot, setFoot] = useState('Droit')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [clubName, setClubName] = useState('')

  const regYear = new Date().getFullYear()
  const regYears = Array.from({ length: 55 }, (_, i) => regYear - 14 - i)
  const regDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const regMonths = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  const [bio, setBio] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
    router.push(redirectTo)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
        emailRedirectTo: 'https://team-up-f-rch.vercel.app/profil'
      }
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id, email, role,
        first_name: firstName, last_name: lastName,
        position: role === 'player' ? position : null,
        ligue, zone,
        foot: role === 'player' ? foot : null,
        birthdate: (birthDay && birthMonth && birthYear)
          ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}`
          : null,
        club_name: role === 'club' ? clubName : null,
        bio, available: true
      })
      if (profileError) { setError('Erreur profil: ' + profileError.message); setLoading(false); return }
    }

    setSuccess("Compte créé ! Vérifie ton email pour confirmer, puis connecte-toi.")
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://team-up-f-rch.vercel.app/reset-password'
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('Lien de réinitialisation envoyé ! Vérifie ton email.')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://team-up-f-rch.vercel.app/profil' }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const inputStyle = {
    width: '100%', background: 'var(--gray-bg)', border: '1.5px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: 'var(--text-dark)'
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px - 100px)', display: 'flex' }}>

      {/* LEFT — branding */}
      <div className="login-left" style={{ flex: 1, background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>CANTON DE FRIBOURG</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#fff', letterSpacing: 2, lineHeight: 1 }}>
          TeamUp<span style={{ color: 'var(--red-light)' }}>FR</span>
        </h1>
        <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.5)', margin: '.5rem 0 2rem' }}>Ton équipe, ton avenir</p>
        {[
          { i: '👤', t: 'Profils joueurs avec stats & highlights' },
          { i: '🏟️', t: 'Pages officielles de clubs' },
          { i: '💬', t: 'Messagerie directe intégrée' },
          { i: '📢', t: 'Annonces de recrutement' },
          { i: '🔍', t: 'Recherche avancée par ligue & zone' }
        ].map(f => (
          <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.65rem', color: 'rgba(255,255,255,.75)', fontSize: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{f.i}</div>
            {f.t}
          </div>
        ))}
      </div>

      {/* RIGHT — form */}
      <div style={{ width: 460, flexShrink: 0, background: '#fff', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' ? (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: 1, marginBottom: '.25rem' }}>Mot de passe oublié</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Entre ton email pour recevoir un lien de réinitialisation.
            </div>

            {error && <div style={{ background: '#fce8e8', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: '1rem' }}>⚠️ {error}</div>}
            {success && <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--green)', marginBottom: '1rem' }}>✅ {success}</div>}

            {!success && (
              <form onSubmit={handleForgot}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email</div>
                  <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.ch" required />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 9, padding: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit' }}>
                  {loading ? '⏳ Envoi…' : 'Envoyer le lien →'}
                </button>
              </form>
            )}

            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--blue-bright)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: 1, marginBottom: '.25rem' }}>
              {mode === 'login' ? 'Bienvenue !' : 'Créer ton compte'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {mode === 'login' ? 'Connecte-toi à ta plateforme' : 'Rejoins la communauté TeamUpFR'}
            </div>

            {/* SWITCHER */}
            <div style={{ display: 'flex', background: 'var(--gray-bg)', borderRadius: 10, padding: 4, marginBottom: '1.25rem' }}>
              {(['login','register'] as const).map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                  flex: 1, background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? 'var(--blue-mid)' : 'var(--text-muted)',
                  border: 'none', padding: 8, borderRadius: 7, fontSize: 14, fontWeight: 600,
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.1)' : 'none', cursor: 'pointer', fontFamily: 'inherit'
                }}>{m === 'login' ? 'Connexion' : 'Inscription'}</button>
              ))}
            </div>

            {error && <div style={{ background: '#fce8e8', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: '1rem' }}>⚠️ {error}</div>}
            {success && <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--green)', marginBottom: '1rem' }}>✅ {success}</div>}

            {/* GOOGLE OAUTH */}
            {mode === 'login' && (
              <>
                <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9,
                  padding: '10px 14px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', color: 'var(--text-dark)', marginBottom: '1rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,.06)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>ou avec email</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              </>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>

              {mode === 'register' && <>
                {/* ROLE */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Tu es…</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {(['player','coach','club'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} style={{
                        background: role === r ? 'var(--blue-light)' : 'var(--gray-bg)',
                        border: `1.5px solid ${role === r ? 'var(--blue-bright)' : 'var(--border)'}`,
                        color: role === r ? 'var(--blue-mid)' : 'var(--text-muted)',
                        borderRadius: 10, padding: '10px 4px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>{{ player: '👤 Joueur', coach: '🧑‍🏫 Coach', club: '🏟️ Club' }[r]}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Prénom</div>
                    <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Lucas" required />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Nom</div>
                    <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Martin" required />
                  </div>
                </div>

                {role === 'club' && <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Nom du club</div>
                  <input style={inputStyle} value={clubName} onChange={e => setClubName(e.target.value)} placeholder="FC Bulle" required />
                </div>}

                {role === 'player' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Position</div>
                    <select style={inputStyle} value={position} onChange={e => setPosition(e.target.value)} required>
                      <option value="">Choisir…</option>
                      {POSITIONS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Pied dominant</div>
                    <select style={inputStyle} value={foot} onChange={e => setFoot(e.target.value)}>
                      <option>Droit</option><option>Gauche</option><option>Ambidextre</option>
                    </select>
                  </div>
                </div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Ligue</div>
                    <select style={inputStyle} value={ligue} onChange={e => setLigue(e.target.value)} required>
                      <option value="">Choisir…</option>
                      {LIGUES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Zone</div>
                    <select style={inputStyle} value={zone} onChange={e => setZone(e.target.value)} required>
                      <option value="">Choisir…</option>
                      {ZONES.map(z => <option key={z}>{z}</option>)}
                    </select>
                  </div>
                </div>

                {role !== 'club' && <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Date de naissance</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 6 }}>
                    <select style={inputStyle} value={birthDay} onChange={e => setBirthDay(e.target.value)} required>
                      <option value="">Jour</option>
                      {regDays.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select style={inputStyle} value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required>
                      <option value="">Mois</option>
                      {regMonths.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select style={inputStyle} value={birthYear} onChange={e => setBirthYear(e.target.value)} required>
                      <option value="">Année</option>
                      {regYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>}

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Présentation courte</div>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }} value={bio} onChange={e => setBio(e.target.value)} placeholder="Présente-toi en quelques mots…" />
                </div>
              </>}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email</div>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.ch" required />
              </div>

              <div style={{ marginBottom: mode === 'login' ? 0 : '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Mot de passe</div>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'var(--blue-bright)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? 'Min. 6 caractères' : '••••••••'} required minLength={6} />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', marginTop: '1.25rem',
                background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 9,
                padding: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? .7 : 1, fontFamily: 'inherit'
              }}>
                {loading ? '⏳ Chargement…' : mode === 'login' ? 'Se connecter →' : 'Créer mon profil →'}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}
