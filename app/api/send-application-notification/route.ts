import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isThrottled } from '../../../lib/email-throttle'
import { newApplicationHtml, zoneLang } from '../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  console.log('🟡 [API/apply-notify] POST received')
  if (!process.env.RESEND_API_KEY) {
    console.log('🔴 [API/apply-notify] RESEND_API_KEY not set — skipping')
    return NextResponse.json({ ok: true, skipped: true })
  }

  const body = await req.json()
  const { toEmail, toName, applicantName, applicantRole, annonceTitle, applicantId, annonceId, receiverZone } = body
  console.log('🟡 [API/apply-notify] Payload:', { toEmail, applicantName, annonceTitle, receiverZone })
  if (!toEmail) {
    console.log('🔴 [API/apply-notify] No toEmail — skipping')
    return NextResponse.json({ ok: true, skipped: true })
  }

  if (isThrottled(toEmail, 'newApplication')) {
    console.log('🟡 [API/apply-notify] Throttled for', toEmail)
    return NextResponse.json({ ok: true, throttled: true })
  }

  const lang = zoneLang(receiverZone)
  const de = lang === 'de'
  const subject = de
    ? `Neue Bewerbung für deine Anzeige "${annonceTitle}"`
    : `Nouvelle candidature pour ton annonce "${annonceTitle}"`

  const html = newApplicationHtml({ toName, applicantName, applicantRole: applicantRole || 'player', annonceTitle, applicantId, annonceId, lang })

  const resend = new Resend(process.env.RESEND_API_KEY)
  console.log('🟡 [API/apply-notify] Sending email to', toEmail)
  const { data: sendData, error } = await resend.emails.send({ from: FROM, to: toEmail, subject, html })
  if (error) {
    console.error('🔴 [API/apply-notify] Resend error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  console.log('🟡 [API/apply-notify] Email sent OK, id:', sendData?.id)
  return NextResponse.json({ ok: true })
}
