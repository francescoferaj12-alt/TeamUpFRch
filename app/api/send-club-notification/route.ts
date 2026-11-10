import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { newClubNotificationHtml } from '../../../lib/email-templates'
import { isThrottled } from '../../../lib/email-throttle'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const ADMIN_CLUBS_URL = 'https://teamupfr.ch/admin/clubs'

export async function POST(req: NextRequest) {
  let userId: unknown
  try {
    ({ userId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return NextResponse.json({ error: 'Notification service is not configured' }, { status: 503 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const [{ data: authResult, error: authError }, { data: club, error: profileError }] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from('profiles')
      .select('id,email,role,club_name,aff_club_id,club_email_is_professional,created_at,club_verification_status')
      .eq('id', userId)
      .maybeSingle(),
  ])
  if (authError || !authResult.user || profileError || !club || club.role !== 'club') {
    return NextResponse.json({ error: 'New club registration not found' }, { status: 404 })
  }
  const ageMs = Date.now() - Date.parse(authResult.user.created_at)
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 15 * 60 * 1000 || club.club_verification_status !== 'pending') {
    return NextResponse.json({ error: 'Registration is not eligible for notification' }, { status: 403 })
  }
  if (isThrottled(userId, 'clubSignupNotification')) {
    return NextResponse.json({ ok: true, throttled: true })
  }
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subjectClubName = (club.club_name || 'Nouveau club').replace(/[\r\n]/g, ' ').slice(0, 100)
  const { error } = await resend.emails.send({
    from: 'TeamUpFR <noreply@teamupfr.ch>',
    to: ADMIN_EMAIL,
    subject: `🏟️ Nouveau club à valider : ${subjectClubName}`,
    html: newClubNotificationHtml({
      clubName: club.club_name || 'Non renseigné',
      clubEmail: club.email,
      affClubName: club.aff_club_id ? `Affiliation #${club.aff_club_id}` : null,
      emailIsProfessional: !!club.club_email_is_professional,
      adminUrl: ADMIN_CLUBS_URL,
    }),
  })

  if (error) return NextResponse.json({ error: 'Could not send notification email' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
