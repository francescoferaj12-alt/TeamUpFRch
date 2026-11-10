import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { profileId?: unknown; verified?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (typeof body.profileId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.profileId) || typeof body.verified !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 })
  }
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: club, error } = await admin.from('profiles')
    .select('email,club_name,role')
    .eq('id', body.profileId)
    .maybeSingle()
  if (error || !club || club.role !== 'club' || !club.email) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 })
  }

  const name = escapeHtml(club.club_name || 'Votre club')
  const subject = body.verified
    ? `✓ Votre club "${club.club_name || 'TeamUpFR'}" a été vérifié sur TeamUp FR`
    : `Votre badge de vérification a été retiré — TeamUp FR`
  const content = body.verified
    ? `<h2>Club vérifié !</h2><p>Félicitations, le club <strong>${name}</strong> a été officiellement vérifié sur TeamUp FR.</p><p>Le badge de vérification est maintenant visible sur votre profil.</p>`
    : `<h2>Badge de vérification retiré</h2><p>Le badge du club <strong>${name}</strong> a été retiré sur TeamUp FR.</p><p>Si vous pensez que c'est une erreur, contactez teamupfr.ch@gmail.com.</p>`
  const html = `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#030a24;color:#fff;padding:2rem;border-radius:16px">${content}<p style="color:#aaa;font-size:12px;margin-top:2rem">TeamUp FR — La plateforme football du canton de Fribourg</p></div>`
  const { error: sendError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'TeamUp FR <noreply@teamupfr.ch>', to: club.email, subject, html,
  })
  if (sendError) return NextResponse.json({ error: 'Could not send email' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
