import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('profiles')
    .select('id, club_name, first_name, last_name, zone, avatar_url')
    .eq('role', 'club')
    .or('hidden.is.null,hidden.eq.false')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json([], { status: 200 })

  const clubs = (data || []).map((p: { id: string; club_name?: string; first_name?: string; last_name?: string; zone?: string; avatar_url?: string }) => ({
    id: p.id,
    name: p.club_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Club',
    zone: p.zone || '',
    avatar_url: p.avatar_url || null,
  }))

  return NextResponse.json(clubs)
}
