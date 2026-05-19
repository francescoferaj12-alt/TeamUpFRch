import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { clubRejectedHtml, zoneLang } from '../../../../../../lib/email-templates'

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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  const { reason } = await req.json()
  if (!reason?.trim()) return NextResponse.json({ error: 'Reason required' }, { status: 400 })

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

  const { data: profile, error: fetchErr } = await admin
    .from('profiles')
    .select('email,club_name,zone')
    .eq('id', id)
    .single()
  if (fetchErr || !profile) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

  const { error } = await admin
    .from('profiles')
    .update({
      club_verification_status: 'rejected',
      club_rejection_reason: reason.trim(),
      verified: false,
    })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (profile.email && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const lang = zoneLang(profile.zone)
    await resend.emails.send({
      from: 'TeamUpFR <noreply@teamupfr.ch>',
      to: profile.email,
      subject: lang === 'de'
        ? `Ihre Verifikationsanfrage wurde abgelehnt — TeamUpFR`
        : `Votre demande de vérification a été refusée — TeamUpFR`,
      html: clubRejectedHtml({ clubName: profile.club_name || profile.email, reason: reason.trim(), lang }),
    })
  }

  return NextResponse.json({ ok: true })
}
