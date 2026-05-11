import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isThrottled } from '../../../lib/email-throttle'
import { applicationStatusHtml, zoneLang } from '../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  console.log('🟡 [API/app-status] POST received')
  if (!process.env.RESEND_API_KEY) {
    console.log('🔴 [API/app-status] RESEND_API_KEY not set — skipping')
    return NextResponse.json({ ok: true, skipped: true })
  }

  const body = await req.json()
  const { toEmail, toName, status, clubName, annonceTitle, receiverZone } = body
  console.log('🟡 [API/app-status] Payload:', { toEmail, status, clubName, annonceTitle })
  if (!toEmail || !status) {
    console.log('🔴 [API/app-status] Missing toEmail or status — skipping')
    return NextResponse.json({ ok: true, skipped: true })
  }

  if (isThrottled(toEmail, `appStatus:${status}`)) {
    console.log('🟡 [API/app-status] Throttled for', toEmail)
    return NextResponse.json({ ok: true, throttled: true })
  }

  const lang = zoneLang(receiverZone)
  const de = lang === 'de'
  const isAccepted = status === 'accepted'
  const subject = isAccepted
    ? (de ? `${clubName} hat deine Bewerbung angenommen!` : `${clubName} a accepté ta candidature !`)
    : (de ? `Antwort von ${clubName} auf deine Bewerbung` : `Réponse de ${clubName} à ta candidature`)

  const html = applicationStatusHtml({ toName, status, clubName, annonceTitle, lang })

  const resend = new Resend(process.env.RESEND_API_KEY)
  console.log('🟡 [API/app-status] Sending email to', toEmail, '— status:', status)
  const { data: sendData, error } = await resend.emails.send({ from: FROM, to: toEmail, subject, html })
  if (error) {
    console.error('🔴 [API/app-status] Resend error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  console.log('🟡 [API/app-status] Email sent OK, id:', sendData?.id)
  return NextResponse.json({ ok: true })
}
