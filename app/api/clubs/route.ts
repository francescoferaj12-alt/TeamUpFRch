import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, club_name, first_name, last_name, zone, avatar_url')
    .eq('role', 'club')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: 'Unable to load clubs' }, { status: 500 })

  const clubs = (data || []).map((p: { id: string; club_name?: string; first_name?: string; last_name?: string; zone?: string; avatar_url?: string }) => ({
    id: p.id,
    name: p.club_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Club',
    zone: p.zone || '',
    avatar_url: p.avatar_url || null,
  }))

  return NextResponse.json(clubs, { headers: { 'Cache-Control': 'private, no-store' } })
}
