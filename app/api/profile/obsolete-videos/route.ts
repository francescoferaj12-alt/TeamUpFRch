import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ownedVideoPath, profileVideoFields } from '../../../../lib/profile-videos'

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })

  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const urls: unknown = body?.urls
  if (!Array.isArray(urls) || urls.length > 3 || urls.some(value => typeof value !== 'string' || value.length > 2048)) {
    return NextResponse.json({ error: 'Invalid video URLs' }, { status: 400 })
  }
  const paths = urls.map(value => ownedVideoPath(value, user.id, url))
  if (paths.some(path => !path)) return NextResponse.json({ error: 'Invalid video owner or path' }, { status: 400 })

  const { data: profile, error: readError } = await admin.from('profiles')
    .select('video1_url,video2_url,video3_url')
    .eq('id', user.id).single()
  if (readError || !profile) return NextResponse.json({ error: 'Could not read profile' }, { status: 503 })

  const active = new Set(profileVideoFields.map(field => ownedVideoPath(profile[field] || '', user.id, url)))
  const obsolete = [...new Set(paths.filter((path): path is string => !!path && !active.has(path)))]
  if (obsolete.length === 0) return NextResponse.json({ ok: true })

  const { error: removeError } = await admin.storage.from('videos').remove(obsolete)
  if (removeError) return NextResponse.json({ error: 'Could not delete videos' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
