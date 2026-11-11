'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase, Profile } from './supabase'

const PROFILE_CACHE_KEY = 'teamup-profile-cache'

function readCachedProfile(): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch { return null }
}

function writeCachedProfile(p: Profile | null) {
  if (typeof window === 'undefined') return
  try {
    if (p) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p))
    else localStorage.removeItem(PROFILE_CACHE_KEY)
  } catch {}
}

type AuthCtx = {
  session: Session | null
  profile: Profile | null
  authLoading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  profile: null,
  authLoading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const activeUserRef = useRef<string | null>(null)
  const pendingProfiles = useRef(new Map<string, Promise<void>>())

  async function loadProfile(uid: string) {
    const existing = pendingProfiles.current.get(uid)
    if (existing) return existing
    const pending = (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
      if (activeUserRef.current !== uid) return
      setProfile(data ?? null)
      writeCachedProfile(data ?? null)
    })().finally(() => { pendingProfiles.current.delete(uid) })
    pendingProfiles.current.set(uid, pending)
    return pending
  }

  const refreshProfile = async () => {
    if (session) await loadProfile(session.user.id)
  }

  useEffect(() => {
    let mounted = true

    // 1. Optimistically hydrate profile from cache (instant first paint)
    const cached = readCachedProfile()
    if (cached) setProfile(cached)

    // 2. Validate session — fast (reads localStorage)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      activeUserRef.current = s?.user.id ?? null
      setSession(s)

      if (s) {
        if (cached && cached.id === s.user.id) {
          // Cache valid → unblock UI immediately, refresh DB in background
          setAuthLoading(false)
          loadProfile(s.user.id)
        } else {
          // No cache or different user → fetch blocking
          if (cached) writeCachedProfile(null)
          loadProfile(s.user.id).finally(() => { if (mounted) setAuthLoading(false) })
        }
      } else {
        // Not logged in → clear any stale cache
        if (cached) { setProfile(null); writeCachedProfile(null) }
        setAuthLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return
      activeUserRef.current = s?.user.id ?? null
      setSession(s)
      if (!s) {
        setProfile(null)
        writeCachedProfile(null)
        setAuthLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const c = readCachedProfile()
        if (c && c.id === s.user.id) {
          setProfile(c)
          setAuthLoading(false)
          // Auth callbacks run under the session lock. Defer database calls
          // until the callback returns so they cannot wait on their own lock.
          setTimeout(() => { if (mounted) void loadProfile(s.user.id) }, 0)
        } else {
          setAuthLoading(true)
          setTimeout(() => {
            if (!mounted) return
            void loadProfile(s.user.id).finally(() => {
              if (mounted && activeUserRef.current === s.user.id) setAuthLoading(false)
            })
          }, 0)
        }
      }
    })

    return () => {
      mounted = false
      activeUserRef.current = null
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, authLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
