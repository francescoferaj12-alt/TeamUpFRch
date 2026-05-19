import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { clubDeletedHtml, zoneLang } from '../../../../../../lib/email-templates'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) { console.error('[delete] No Authorization header'); return null }
  if (!serviceRoleKey) { console.error('[delete] SUPABASE_SERVICE_ROLE_KEY not set'); return null }
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error) console.error('[delete] auth.getUser error:', error.message)
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await requireAdmin(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  const { reason } = await req.json()
  if (!reason?.trim()) return NextResponse.json({ error: 'Reason required' }, { status: 400 })

  console.log('[delete] Deleting club id:', id)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

  // Fetch profile before deletion (for email)
  const { data: profile } = await admin
    .from('profiles')
    .select('email,club_name,zone')
    .eq('id', id)
    .single()

  // Send deletion email BEFORE deleting (while email still accessible)
  if (profile?.email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const lang = zoneLang(profile.zone)
      await resend.emails.send({
        from: 'TeamUpFR <noreply@teamupfr.ch>',
        to: profile.email,
        subject: lang === 'de'
          ? `Ihr TeamUpFR-Konto wurde entfernt`
          : `Votre compte TeamUpFR a été supprimé`,
        html: clubDeletedHtml({ clubName: profile.club_name || profile.email, reason: reason.trim(), lang }),
      })
      console.log('[delete] Deletion email sent to', profile.email)
    } catch (e) {
      console.warn('[delete] Email exception:', e)
    }
  }

  // Cascade delete in FK-safe order
  // 1. Messages (sender or receiver)
  const { error: msgErr } = await admin
    .from('messages')
    .delete()
    .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
  if (msgErr) console.warn('[delete] messages error:', msgErr.message)

  // 2. Applications by this user as applicant
  const { error: appErr } = await admin
    .from('applications')
    .delete()
    .eq('applicant_id', id)
  if (appErr) console.warn('[delete] applications (applicant) error:', appErr.message)

  // 3. Applications on this club's annonces
  const { data: annonces } = await admin
    .from('annonces')
    .select('id')
    .eq('author_id', id)
  const annonceIds = (annonces ?? []).map((a: { id: string }) => a.id)
  if (annonceIds.length > 0) {
    const { error: appAnnErr } = await admin
      .from('applications')
      .delete()
      .in('annonce_id', annonceIds)
    if (appAnnErr) console.warn('[delete] applications (annonces) error:', appAnnErr.message)
  }

  // 4. Annonces
  const { error: annErr } = await admin.from('annonces').delete().eq('author_id', id)
  if (annErr) console.warn('[delete] annonces error:', annErr.message)

  // 5. Career experiences
  const { error: careerErr } = await admin.from('career_experiences').delete().eq('user_id', id)
  if (careerErr) console.warn('[delete] career_experiences error:', careerErr.message)

  // 6. Coach certificates
  const { error: certErr } = await admin.from('coach_certificates').delete().eq('coach_id', id)
  if (certErr) console.warn('[delete] coach_certificates error:', certErr.message)

  // 7. Profile row
  const { error: profileErr } = await admin.from('profiles').delete().eq('id', id)
  if (profileErr) {
    console.error('[delete] profiles error:', profileErr.message)
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  // 8. Auth user (last — FK constraint direction)
  const { error: authErr } = await admin.auth.admin.deleteUser(id)
  if (authErr) console.error('[delete] auth.admin.deleteUser error:', authErr.message)

  console.log('[delete] Club deleted successfully:', id)
  return NextResponse.json({ ok: true })
}
