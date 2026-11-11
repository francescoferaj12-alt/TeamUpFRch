'use client'

import { useEffect, useState } from 'react'
import { supabase, avatarSrc } from '../lib/supabase'

interface Props {
  userId: string
  avatarUrl?: string | null
  size?: number
  radius?: number
  fallback: React.ReactNode
}

export default function UserAvatar({ userId, avatarUrl, size = 42, radius = 12, fallback }: Props) {
  const [loaded, setLoaded] = useState<{ userId: string; src: string | null } | null>(null)
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || avatarUrl !== undefined) return
    let active = true
    supabase
      .from('public_profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (active) setLoaded({ userId, src: avatarSrc(data?.avatar_url) ?? null })
      })
    return () => { active = false }
  }, [userId, avatarUrl])

  const src = avatarUrl !== undefined ? avatarSrc(avatarUrl) : loaded?.userId === userId ? loaded.src : null
  if (!src || src === brokenSrc) return <>{fallback}</>

  return (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block' }}
      onError={() => setBrokenSrc(src)}
    />
  )
}
