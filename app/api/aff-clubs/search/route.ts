import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { captureError } from '../../../../lib/logger'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q || q.length < 1 || q.length > 100) {
    return NextResponse.json({ clubs: [] })
  }

  const supabase = createClient(url, anonKey)
  const { data, error } = await supabase
    .from('aff_clubs')
    .select('id, aff_number, name')
    .ilike('name_normalized', `%${q.toLowerCase()}%`)
    .order('name')
    .limit(10)

  if (error) {
    captureError(error, { api: 'aff-clubs/search', query: q })
    return NextResponse.json({ clubs: [] }, { status: 500 })
  }

  return NextResponse.json(
    { clubs: data ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  )
}
