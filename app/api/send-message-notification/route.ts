import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isThrottled } from '../../../lib/email-throttle'
import { newMessageHtml, zoneLang } from '../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: true })

  const { receiverEmail, receiverName, senderName, senderUserId, messagePreview, receiverZone } = await req.json()
  if (!receiverEmail) return NextResponse.json({ ok: true, skipped: true })

  if (isThrottled(receiverEmail, 'newMessage')) return NextResponse.json({ ok: true, throttled: true })

  const lang = zoneLang(receiverZone)
  const de = lang === 'de'
  const subject = de
    ? `${senderName} hat dir eine Nachricht gesendet — TeamUpFR`
    : `${senderName} t'a envoyé un message — TeamUpFR`

  const html = newMessageHtml({
    toName: receiverName || '',
    fromName: senderName,
    preview: messagePreview || '…',
    fromUserId: senderUserId || '',
    lang,
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({ from: FROM, to: receiverEmail, subject, html })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
