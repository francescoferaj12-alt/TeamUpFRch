import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isThrottled } from '../../../lib/email-throttle'
import { applicationStatusHtml, zoneLang } from '../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: true })

  const { toEmail, toName, status, clubName, annonceTitle, receiverZone } = await req.json()
  if (!toEmail || !status) return NextResponse.json({ ok: true, skipped: true })

  if (isThrottled(toEmail, `appStatus:${status}`)) return NextResponse.json({ ok: true, throttled: true })

  const lang = zoneLang(receiverZone)
  const de = lang === 'de'
  const isAccepted = status === 'accepted'
  const subject = isAccepted
    ? (de ? `${clubName} hat deine Bewerbung angenommen!` : `${clubName} a accepté ta candidature !`)
    : (de ? `Antwort von ${clubName} auf deine Bewerbung` : `Réponse de ${clubName} à ta candidature`)

  const html = applicationStatusHtml({ toName, status, clubName, annonceTitle, lang })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({ from: FROM, to: toEmail, subject, html })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
