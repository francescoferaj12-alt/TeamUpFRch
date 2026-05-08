'use client'

import { useEffect, useState } from 'react'
import { supabase, avatarSrc } from '../lib/supabase'

interface Props {
  userId: string
  size?: number
  radius?: number
  fallback: React.ReactNode
}

// Fetches avatar_url directly from DB for a given userId — same pattern as
// /profil/[id] which is known to work. Avoids relying on pre-fetched maps
// that can be stale or miss the field due to browser-cached 403 responses.
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
        if (data?.avatar_url) {
          // Generate a URL without the ?t= timestamp baked in at upload time.
          // This produces a different URL string from any pre-v9 cached 403,
          // forcing a fresh browser request regardless of browser cache state.
          const path = data.avatar_url.match(/\/avatars\/(.+?)(\?|$)/)?.[1]
          if (path) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
            setSrc(urlData.publicUrl + '?cb=3')
          } else {
            setSrc(avatarSrc(data.avatar_url))
          }
        }
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
