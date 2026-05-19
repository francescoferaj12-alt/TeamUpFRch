import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isThrottled } from '../../../lib/email-throttle'
import { newApplicationHtml, zoneLang } from '../../../lib/email-templates'
import { captureError } from '../../../lib/logger'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: true })

  const body = await req.json()
  const { toEmail, toName, applicantName, applicantRole, annonceTitle, applicantId, annonceId, receiverZone } = body
  if (!toEmail) return NextResponse.json({ ok: true, skipped: true })

  if (isThrottled(toEmail, 'newApplication')) return NextResponse.json({ ok: true, throttled: true })

  const lang = zoneLang(receiverZone)
  const de = lang === 'de'
  const subject = de
    ? `Neue Bewerbung für deine Anzeige "${annonceTitle}"`
    : `Nouvelle candidature pour ton annonce "${annonceTitle}"`

  const html = newApplicationHtml({ toName, applicantName, applicantRole: applicantRole || 'player', annonceTitle, applicantId, annonceId, lang })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({ from: FROM, to: toEmail, subject, html })
  if (error) {
    captureError(error, { api: 'send-application-notification', toEmail })
    return NextResponse.json({ error }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
