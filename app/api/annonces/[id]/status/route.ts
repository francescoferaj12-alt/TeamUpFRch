import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid listing' }, { status: 400 })
  let action: unknown
  try { action = (await request.json()).action } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  if (!['confirm', 'close', 'reopen'].includes(action as string)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
  const { data: { user }, error: authError } = await db.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (action !== 'close') {
    const { data: profile, error } = await db.from('profiles').select('role,club_verification_status').eq('id', user.id).single()
    if (error || !profile || (profile.role === 'club' && profile.club_verification_status !== 'approved')) return NextResponse.json({ error: 'Club approval required' }, { status: 403 })
  }
  const expected = action === 'reopen' ? 'closed' : 'active'
  const update = action === 'close' ? { status: 'closed' } : { status: 'active', last_confirmed_at: new Date().toISOString() }
  const { data, error } = await db.from('annonces').update(update).eq('id', id).eq('author_id', user.id).eq('status', expected).select('*').maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to update listing' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Listing missing or already changed' }, { status: 409 })
  return NextResponse.json({ annonce: data }, { headers: { 'Cache-Control': 'private, no-store' } })
}
