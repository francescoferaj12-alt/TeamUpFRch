import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// TEMPORARY ROUTE — delete after use
// Sets role='admin' for the hardcoded admin email, bypassing DB triggers
// Protected by requiring the service role key in Authorization header

const TARGET_EMAIL = 'teamupfr.ch@gmail.com'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

  const { data, error } = await admin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', TARGET_EMAIL)
    .select('id, email, role')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated: data })
}
