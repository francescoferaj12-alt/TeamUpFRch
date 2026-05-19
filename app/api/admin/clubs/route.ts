import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  const { data: { user } } = await admin.auth.getUser(token)
  return user?.email === ADMIN_EMAIL ? user : null
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('profiles')
    .select('id,email,role,club_name,avatar_url,zone,ligue,verified,club_verification_status,club_verified_at,club_rejection_reason,club_email_is_professional,aff_club_id,created_at,aff_clubs(id,name,aff_number)')
    .eq('role', 'club')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clubs: data })
}
