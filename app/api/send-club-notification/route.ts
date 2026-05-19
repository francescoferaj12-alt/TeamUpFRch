import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { newClubNotificationHtml } from '../../../lib/email-templates'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
const ADMIN_CLUBS_URL = 'https://teamupfr.ch/admin/clubs'

export async function POST(req: NextRequest) {
  const { clubName, clubEmail, affClubName, emailIsProfessional } = await req.json()

  if (!clubName || !clubEmail) return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: true })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'TeamUpFR <noreply@teamupfr.ch>',
    to: ADMIN_EMAIL,
    subject: `🏟️ Nouveau club à valider : ${clubName}`,
    html: newClubNotificationHtml({
      clubName,
      clubEmail,
      affClubName: affClubName || null,
      emailIsProfessional: !!emailIsProfessional,
      adminUrl: ADMIN_CLUBS_URL,
    }),
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
