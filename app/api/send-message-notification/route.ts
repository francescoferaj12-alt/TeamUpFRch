import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { receiverEmail, receiverName, senderName, messagePreview } = await req.json()

  if (!receiverEmail) return NextResponse.json({ ok: true, skipped: true })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: true })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#030a24;color:#fff;padding:2rem;border-radius:16px;">
      <div style="font-size:2.5rem;margin-bottom:1rem">💬</div>
      <h2 style="color:#e63946;margin-top:0">Nouveau message</h2>
      <p style="color:rgba(255,255,255,.8)">Bonjour <strong>${receiverName || ''}</strong>,</p>
      <p style="color:rgba(255,255,255,.8)"><strong>${senderName}</strong> vous a envoyé un message sur <strong>TeamUp FR</strong>&nbsp;:</p>
      <div style="background:rgba(255,255,255,.07);border-left:3px solid #e63946;border-radius:0 10px 10px 0;padding:1rem 1.25rem;margin:1.25rem 0;font-style:italic;color:rgba(255,255,255,.7);font-size:15px;">
        "${messagePreview}"
      </div>
      <a href="https://teamupfr.ch/messages" style="display:inline-block;background:#e63946;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-top:.5rem">
        Répondre sur TeamUp FR →
      </a>
      <p style="color:rgba(255,255,255,.35);font-size:12px;margin-top:2.5rem;border-top:1px solid rgba(255,255,255,.08);padding-top:1rem">
        TeamUp FR — La plateforme football du canton de Fribourg<br>
        Pour gérer vos notifications, accédez à votre profil.
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: 'TeamUp FR <noreply@teamupfr.ch>',
    to: receiverEmail,
    subject: `💬 ${senderName} vous a envoyé un message — TeamUp FR`,
    html,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
