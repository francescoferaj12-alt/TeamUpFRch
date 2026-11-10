import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { captureError } from '../../../../lib/logger'
import { timingSafeEqual } from 'node:crypto'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Allowed profile fields — whitelist to prevent injection
const ALLOWED_FIELDS = new Set([
  'id', 'email', 'role', 'first_name', 'last_name', 'position', 'genre',
  'ligue', 'zone', 'foot', 'club_name', 'aff_club_id', 'bio', 'birthdate',
  'available', 'hidden', 'coach_experience', 'coach_diploma',
  'coach_specialty', 'coach_availability',
  'club_verification_status', 'club_email_is_professional',
])

export async function POST(req: NextRequest) {
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Profile service is not configured' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, profileData, profileToken } = body as {
    userId: string
    profileData: Record<string, unknown>
    profileToken?: string
  }

  if (!userId || !profileData || typeof userId !== 'string') {
    return NextResponse.json({ error: 'Missing userId or profileData' }, { status: 400 })
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
  }

  // Whitelist fields
  const safe: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(profileData)) {
    if (ALLOWED_FIELDS.has(k)) safe[k] = v
  }
  if (!['player', 'coach', 'club'].includes(String(safe.role))) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Ensure id matches userId (prevent spoofing other profiles)
  safe.id = userId

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })

  // This endpoint is only for the initial sign-up flow. Never let a caller
  // overwrite an existing profile or create one for an unrelated account.
  const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId)
  if (authErr || !authUser.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Sign-up may have no session until email confirmation. Prove possession of
  // the one-time value submitted with that Auth sign-up, not just its public ID.
  const expectedToken = authUser.user.user_metadata?.profile_creation_token
  if (typeof profileToken !== 'string' || typeof expectedToken !== 'string'
    || !/^[0-9a-f-]{36}$/i.test(profileToken) || !/^[0-9a-f-]{36}$/i.test(expectedToken)
    || !timingSafeEqual(Buffer.from(profileToken, 'utf8'), Buffer.from(expectedToken, 'utf8'))) {
    return NextResponse.json({ error: 'Invalid registration proof' }, { status: 403 })
  }

  const createdAt = Date.parse(authUser.user.created_at)
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > 15 * 60 * 1000) {
    return NextResponse.json({ error: 'Profile creation window expired' }, { status: 403 })
  }

  const authEmail = authUser.user.email?.trim().toLowerCase()
  const requestedEmail = typeof safe.email === 'string' ? safe.email.trim().toLowerCase() : ''
  if (!authEmail || !requestedEmail || authEmail !== requestedEmail) {
    return NextResponse.json({ error: 'Email does not match the account' }, { status: 403 })
  }
  safe.email = authUser.user.email
  const language = authUser.user.user_metadata?.language
  if (language === 'fr' || language === 'de') safe.notification_settings = { language }
  // These fields must never be granted by a public sign-up request.
  safe.hidden = true
  if (safe.role === 'club') safe.club_verification_status = 'pending'

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  if (profileLookupError) {
    captureError(profileLookupError, { api: 'create-profile-lookup', userId })
    return NextResponse.json({ error: 'Could not verify profile state' }, { status: 500 })
  }
  if (existingProfile) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 409 })
  }

  const { error } = await supabase
    .from('profiles')
    .insert(safe)

  if (error) {
    captureError(error, { api: 'create-profile', userId })
    if (error.message?.includes('birthdate')) {
      const { birthdate: _bd, ...withoutBirthdate } = safe
      const { error: retry } = await supabase
        .from('profiles')
        .insert(withoutBirthdate)
      if (retry) {
        captureError(retry, { api: 'create-profile-retry', userId })
        return NextResponse.json({ error: retry.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
