import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { clubName, clubEmail, verified } = await req.json()

  if (!clubEmail) return NextResponse.json({ error: 'No email' }, { status: 400 })

  const subject = verified
    ? `✓ Votre club "${clubName}" a été vérifié sur TeamUp FR`
    : `Votre badge de vérification a été retiré — TeamUp FR`

  const html = verified
    ? `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#030a24;color:#fff;padding:2rem;border-radius:16px;">
        <div style="font-size:2rem;margin-bottom:1rem">🏟️ ✓</div>
        <h2 style="color:#1d9bf0;margin-top:0">Club vérifié !</h2>
        <p>Félicitations, le club <strong>${clubName}</strong> a été officiellement vérifié sur <strong>TeamUp FR</strong>.</p>
        <p>Le badge de vérification bleu est maintenant visible sur votre profil et dans toutes les recherches.</p>
        <a href="https://teamupfr.ch/clubs" style="display:inline-block;background:#1d9bf0;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:1rem">
          Voir mon profil
        </a>
        <p style="color:rgba(255,255,255,.4);font-size:12px;margin-top:2rem">TeamUp FR — La plateforme football du canton de Fribourg</p>
      </div>
    `
    : `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#030a24;color:#fff;padding:2rem;border-radius:16px;">
        <h2 style="color:#e63946;margin-top:0">Badge de vérification retiré</h2>
        <p>Le badge de vérification du club <strong>${clubName}</strong> a été retiré sur TeamUp FR.</p>
        <p>Si vous pensez que c'est une erreur, contactez-nous à <a href="mailto:teamupfr.ch@gmail.com" style="color:#1d9bf0">teamupfr.ch@gmail.com</a>.</p>
        <p style="color:rgba(255,255,255,.4);font-size:12px;margin-top:2rem">TeamUp FR — La plateforme football du canton de Fribourg</p>
      </div>
    `

  const { error } = await resend.emails.send({
    from: 'TeamUp FR <noreply@teamupfr.ch>',
    to: clubEmail,
    subject,
    html,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ ok: true })
}
