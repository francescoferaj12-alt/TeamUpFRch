import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Allowed profile fields — whitelist to prevent injection
const ALLOWED_FIELDS = new Set([
  'id', 'email', 'role', 'first_name', 'last_name', 'position', 'genre',
  'ligue', 'zone', 'foot', 'club_name', 'aff_club_id', 'bio', 'birthdate',
  'available', 'hidden', 'coach_experience', 'coach_diploma',
  'coach_specialty', 'coach_availability',
  'club_verification_status', 'club_email_is_professional',
])

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, profileData } = body as {
    userId: string
    profileData: Record<string, unknown>
  }

  if (!userId || !profileData || typeof userId !== 'string') {
    return NextResponse.json({ error: 'Missing userId or profileData' }, { status: 400 })
  }

  // Whitelist fields
  const safe: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(profileData)) {
    if (ALLOWED_FIELDS.has(k)) safe[k] = v
  }

  // Ensure id matches userId (prevent spoofing other profiles)
  safe.id = userId

  // Use service role key if configured (bypasses RLS) — preferred
  // Fall back to anon key if not configured
  const supabase = createClient(url, serviceRoleKey ?? anonKey, {
    auth: { persistSession: false },
  })

  // Verify the user exists in auth.users before creating profile
  if (serviceRoleKey) {
    const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId)
    if (authErr || !authUser.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(safe, { onConflict: 'id' })

  if (error) {
    console.error('create-profile error:', error)
    if (error.message?.includes('birthdate')) {
      // Retry without birthdate (column type mismatch guard)
      const { birthdate: _bd, ...withoutBirthdate } = safe
      const { error: retry } = await supabase
        .from('profiles')
        .upsert(withoutBirthdate, { onConflict: 'id' })
      if (retry) {
        console.error('create-profile retry error:', retry)
        return NextResponse.json({ error: retry.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
