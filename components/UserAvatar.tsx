'use client'

import { useEffect, useState } from 'react'
import { supabase, avatarSrc } from '../lib/supabase'

interface Props {
  userId: string
  size?: number
  radius?: number
  fallback: React.ReactNode
}

export default function UserAvatar({ userId, size = 42, radius = 12, fallback }: Props) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        const url = avatarSrc(data?.avatar_url)
        if (url) setSrc(url)
      })
  }, [userId])

  if (!src) return <>{fallback}</>

  return (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block' }}
      onError={() => setSrc(null)}
    />
  )
}
