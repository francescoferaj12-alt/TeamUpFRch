const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export type ProfileMedia = { bucket: 'avatars' | 'videos'; path: string; owner: string }
export function mediaPath(bucket: string, parts: string[]): ProfileMedia | null {
  if (!['avatars','videos'].includes(bucket) || parts.length < 2 || parts.length > 5 || !uuid.test(parts[0])) return null
  if (parts.some(p => !p || p === '.' || p === '..' || /[\\/%\x00-\x1f\x7f]/.test(p) || p.length > 200)) return null
  return { bucket: bucket as ProfileMedia['bucket'], path: parts.join('/'), owner: parts[0] }
}
export function parseProfileMedia(value: string, projectUrl: string): ProfileMedia | null {
  try {
    const relative = value.startsWith('/api/media/')
    const url = new URL(value, relative ? 'https://teamupfr.invalid' : undefined)
    let parts: string[]
    if (relative) parts = url.pathname.slice('/api/media/'.length).split('/')
    else {
      if (!projectUrl || url.origin !== new URL(projectUrl).origin) return null
      const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|authenticated|sign)\/(.*)$/)
      if (!match) return null
      parts = match[1].split('/')
    }
    parts = parts.map(decodeURIComponent)
    return mediaPath(parts[0], parts.slice(1))
  } catch { return null }
}
export function profileMediaUrl(bucket: string, path: string): string {
  const media = mediaPath(bucket, path.split('/'))
  if (!media) throw new Error('Invalid profile media path')
  return `/api/media/${media.bucket}/${media.path.split('/').map(encodeURIComponent).join('/')}`
}
export function profileMediaSrc(value: string | null | undefined): string | null {
  if (!value) return null
  const media = parseProfileMedia(value, process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  if (!media) return value
  // Preserve only the harmless version marker; never propagate signed URL tokens.
  const marker = new URL(value, 'https://teamupfr.invalid').searchParams.get('t')
  return profileMediaUrl(media.bucket,media.path) + (marker && /^\d+$/.test(marker) ? `?t=${marker}` : '')
}
