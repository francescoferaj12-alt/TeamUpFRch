import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { clubApprovedHtml, zoneLang } from '../../../../../../lib/email-templates'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    console.error('[approve] No Authorization header')
    return null
  }
  if (!serviceRoleKey) {
    console.error('[approve] SUPABASE_SERVICE_ROLE_KEY not set')
    return null
  }
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  const { data: { user }, error: authErr } = await admin.auth.getUser(token)
  if (authErr) console.error('[approve] auth.getUser error:', authErr.message)
  if (!user) { console.error('[approve] No user from token'); return null }
  if (user.email !== ADMIN_EMAIL) { console.error('[approve] Not admin:', user.email); return null }
  return user
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await requireAdmin(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  console.log('[approve] Approving club id:', id)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

  // Fetch club profile first
  const { data: profile, error: fetchErr } = await admin
    .from('profiles')
    .select('email,club_name,zone,verified,club_verification_status')
    .eq('id', id)
    .single()

  if (fetchErr) {
    console.error('[approve] Fetch error:', fetchErr.message, fetchErr.code)
    return NextResponse.json({ error: 'Club not found: ' + fetchErr.message }, { status: 404 })
  }
  if (!profile) {
    console.error('[approve] No profile found for id:', id)
    return NextResponse.json({ error: 'Club not found' }, { status: 404 })
  }
  console.log('[approve] Found club:', profile.club_name, 'current status:', profile.club_verification_status)

  // Step 1: update verification status fields (new columns — should not be blocked by trigger)
  const { error: statusErr } = await admin
    .from('profiles')
    .update({
      club_verification_status: 'approved',
      club_verified_at: new Date().toISOString(),
      club_rejection_reason: null,
    })
    .eq('id', id)

  if (statusErr) {
    console.error('[approve] club_verification_status update error:', statusErr.message, statusErr.code, statusErr.details, statusErr.hint)
    return NextResponse.json({
      error: statusErr.message,
      code: statusErr.code,
      details: statusErr.details,
      hint: statusErr.hint,
    }, { status: 500 })
  }
  console.log('[approve] club_verification_status set to approved ✓')

  // Step 2: try to set verified=true — may be blocked by profiles_block_protected_updates trigger
  const { error: verifiedErr } = await admin
    .from('profiles')
    .update({ verified: true })
    .eq('id', id)

  if (verifiedErr) {
    // Non-fatal: log but continue — club_verification_status is the source of truth
    console.warn('[approve] verified=true blocked (trigger?):', verifiedErr.message, verifiedErr.code)
  } else {
    console.log('[approve] verified=true set ✓')
  }

  // Send approval email (non-fatal)
  if (profile.email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const lang = zoneLang(profile.zone)
      const { error: emailErr } = await resend.emails.send({
        from: 'TeamUpFR <noreply@teamupfr.ch>',
        to: profile.email,
        subject: lang === 'de'
          ? `✓ Ihr Club "${profile.club_name}" wurde verifiziert`
          : `✓ Votre club "${profile.club_name}" a été vérifié — TeamUpFR`,
        html: clubApprovedHtml({ clubName: profile.club_name || profile.email, lang }),
      })
      if (emailErr) console.warn('[approve] Email send error:', emailErr)
      else console.log('[approve] Approval email sent to', profile.email)
    } catch (e) {
      console.warn('[approve] Email exception:', e)
    }
  }

  return NextResponse.json({ ok: true })
}
