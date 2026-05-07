'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase, Profile } from './supabase'

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

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data ?? null)
  }

  const refreshProfile = async () => {
    if (session) await loadProfile(session.user.id)
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      if (s) {
        loadProfile(s.user.id).finally(() => { if (mounted) setAuthLoading(false) })
      } else {
        setAuthLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return
      setSession(s)
      if (!s) {
        setProfile(null)
        setAuthLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        await loadProfile(s.user.id)
        if (mounted) setAuthLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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
