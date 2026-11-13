import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { captureError } from '../../../../lib/logger'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length > 100) {
    return NextResponse.json({ clubs: [] })
  }

  const supabase = createClient(url, anonKey)
  let query = supabase
    .from('aff_clubs')
    .select('id, aff_number, name')
    .not('name', 'ilike', '%futsal%')
    // Futsal-only clubs confirmed against each AFF club's team competitions.
    // Approved by Francesco after reviewing the complete AFF audit (2026-11-13).
    .not('aff_number', 'in', '(5146,5154,5157,5149,5144)')
    .order('name')
    .limit(500)
  const normalized = q.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[%_,()*\\]/g, '')
  if (normalized) query = query.ilike('name_normalized', `%${normalized}%`)
  const { data, error } = await query

  if (error) {
    captureError(error, { api: 'aff-clubs/search', query: q })
    return NextResponse.json({ clubs: [] }, { status: 500 })
  }

  return NextResponse.json(
    { clubs: data ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  )
}
