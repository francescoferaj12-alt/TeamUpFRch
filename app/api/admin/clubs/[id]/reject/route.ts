import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { clubRejectedHtml, zoneLang } from '../../../../../../lib/email-templates'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) { console.error('[reject] No Authorization header'); return null }
  if (!serviceRoleKey) { console.error('[reject] SUPABASE_SERVICE_ROLE_KEY not set'); return null }
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  const { data: { user }, error: authErr } = await admin.auth.getUser(token)
  if (authErr) console.error('[reject] auth.getUser error:', authErr.message)
  if (!user) { console.error('[reject] No user from token'); return null }
  if (user.email !== ADMIN_EMAIL) { console.error('[reject] Not admin:', user.email); return null }
  return user
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await requireAdmin(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { reason } = await req.json()
  if (typeof reason !== 'string' || !reason.trim()) return NextResponse.json({ error: 'Reason required' }, { status: 400 })

  console.log('[reject] Rejecting club id:', id, 'reason:', reason)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

  const { data: profile, error: fetchErr } = await admin
    .from('profiles')
    .select('email,club_name,zone')
    .eq('id', id)
    .eq('role', 'club')
    .single()

  if (fetchErr || !profile) {
    console.error('[reject] Fetch error:', fetchErr?.message)
    return NextResponse.json({ error: 'Club not found' }, { status: 404 })
  }

  // Badge and approval status must change together.
  const { error: statusErr } = await admin
    .from('profiles')
    .update({
      club_verification_status: 'rejected',
      club_rejection_reason: reason.trim(),
      club_verified_at: null,
      verified: false,
    })
    .eq('id', id)

  if (statusErr) {
    console.error('[reject] status update error:', statusErr.message, statusErr.code)
    return NextResponse.json({ error: statusErr.message, code: statusErr.code }, { status: 500 })
  }
  console.log('[reject] club_verification_status set to rejected ✓')

  // Send rejection email (non-fatal)
  if (profile.email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const lang = zoneLang(profile.zone)
      const { error: emailErr } = await resend.emails.send({
        from: 'TeamUpFR <noreply@teamupfr.ch>',
        to: profile.email,
        subject: lang === 'de'
          ? `Ihre Verifikationsanfrage wurde abgelehnt — TeamUpFR`
          : `Votre demande de vérification a été refusée — TeamUpFR`,
        html: clubRejectedHtml({ clubName: profile.club_name || profile.email, reason: reason.trim(), lang }),
      })
      if (emailErr) console.warn('[reject] Email error:', emailErr)
    } catch (e) {
      console.warn('[reject] Email exception:', e)
    }
  }

  return NextResponse.json({ ok: true })
}
