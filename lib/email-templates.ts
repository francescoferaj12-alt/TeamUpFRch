// TeamUpFR — Email HTML templates (FR / DE)

export type Lang = 'fr' | 'de'

/** Infer language from profile zone — Sensebezirk is German-speaking */
export function zoneLang(zone?: string | null): Lang {
  return zone === 'Sensebezirk' ? 'de' : 'fr'
}

const BASE_URL = 'https://teamupfr.ch'
const LOGO = `${BASE_URL}/images/logo-official.jpeg`
const RED = '#e63946'
const BG = '#030a24'
const CARD_BG = '#061540'

function wrapper(content: string, lang: Lang): string {
  const footer = lang === 'de'
    ? 'Du erhältst diese E-Mail, weil du bei TeamUpFR registriert bist.'
    : 'Tu reçois cet email car tu es inscrit·e sur TeamUpFR.'
  const manage = lang === 'de' ? 'Benachrichtigungen verwalten' : 'Gérer mes notifications'
  const tagline = lang === 'de' ? 'Der Amateurfussball des Kantons Freiburg' : 'Le football amateur du canton de Fribourg'
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d1a3a;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1a3a;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:${BG};border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
  <tr><td align="center" style="padding:36px 32px 0;">
    <img src="${LOGO}" alt="TeamUpFR" width="60" height="60" style="border-radius:12px;display:block;margin:0 auto 20px;">
  </td></tr>
  <tr><td style="padding:0 32px 32px;">${content}</td></tr>
  <tr><td style="padding:20px 32px 28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
    <p style="color:rgba(255,255,255,0.35);font-size:12px;line-height:1.7;margin:0;">
      <strong style="color:rgba(255,255,255,0.5);">TeamUpFR</strong> · ${tagline}<br>
      <a href="${BASE_URL}" style="color:${RED};text-decoration:none;font-weight:600;">teamupfr.ch</a>
    </p>
    <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:10px 0 0;">
      ${footer}<br>
      <a href="${BASE_URL}/dashboard" style="color:rgba(255,255,255,0.4);text-decoration:underline;">${manage}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function redBtn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${RED};color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-top:8px;">${label}</a>`
}

function quote(text: string): string {
  return `<div style="background:rgba(255,255,255,0.05);border-left:3px solid ${RED};border-radius:0 8px 8px 0;padding:14px 18px;margin:18px 0;font-style:italic;color:rgba(255,255,255,0.75);font-size:14px;line-height:1.55;">"${text}"</div>`
}

// ── New message ─────────────────────────────────────────────────────────────
export function newMessageHtml(opts: {
  toName: string
  fromName: string
  preview: string
  fromUserId: string
  lang: Lang
}): string {
  const { toName, fromName, preview, fromUserId, lang } = opts
  const de = lang === 'de'
  const msgUrl = `${BASE_URL}/messages?partner=${fromUserId}`
  const content = `
    <h1 style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;font-size:30px;color:#fff;margin:0 0 12px;letter-spacing:0.03em;">
      ${de ? 'Neue Nachricht!' : 'Nouveau message !'}
    </h1>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.6;margin:0 0 4px;">
      ${de ? `Hallo <strong style="color:#fff;">${toName}</strong>,` : `Salut <strong style="color:#fff;">${toName}</strong>,`}
    </p>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.6;margin:0;">
      ${de ? `<strong style="color:#fff;">${fromName}</strong> hat dir geschrieben:` : `<strong style="color:#fff;">${fromName}</strong> t'a écrit :`}
    </p>
    ${quote(preview)}
    <div style="text-align:center;margin-top:20px;">
      ${redBtn(msgUrl, de ? 'Antworten →' : 'Répondre →')}
    </div>`
  return wrapper(content, lang)
}

// ── New application ─────────────────────────────────────────────────────────
export function newApplicationHtml(opts: {
  toName: string
  applicantName: string
  applicantRole: string
  annonceTitle: string
  applicantId: string
  annonceId: string
  lang: Lang
}): string {
  const { toName, applicantName, applicantRole, annonceTitle, applicantId, lang } = opts
  const de = lang === 'de'
  const profileUrl = `${BASE_URL}/profil/${applicantId}`
  const appsUrl = `${BASE_URL}/candidatures`
  const roleLabel = de
    ? (applicantRole === 'player' ? 'Spieler' : applicantRole === 'coach' ? 'Trainer' : 'Verein')
    : (applicantRole === 'player' ? 'Joueur' : applicantRole === 'coach' ? 'Coach' : 'Club')
  const content = `
    <h1 style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;font-size:30px;color:#fff;margin:0 0 12px;letter-spacing:0.03em;">
      ${de ? 'Neue Bewerbung!' : 'Nouvelle candidature !'}
    </h1>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.6;margin:0 0 16px;">
      ${de
        ? `Hallo <strong style="color:#fff;">${toName}</strong>, <strong style="color:#fff;">${applicantName}</strong> (${roleLabel}) hat sich für deine Anzeige beworben:`
        : `Salut <strong style="color:#fff;">${toName}</strong>, <strong style="color:#fff;">${applicantName}</strong> (${roleLabel}) a postulé à ton annonce :`}
    </p>
    <div style="background:${CARD_BG};border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <div style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
        ${de ? 'Anzeige' : 'Annonce'}
      </div>
      <div style="color:#fff;font-size:16px;font-weight:700;">${annonceTitle}</div>
    </div>
    <div style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      ${redBtn(profileUrl, de ? 'Profil ansehen →' : 'Voir le profil →')}
      <a href="${appsUrl}" style="display:inline-block;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);padding:13px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.12);margin-top:8px;">
        ${de ? 'Alle Bewerbungen' : 'Voir toutes mes candidatures'}
      </a>
    </div>`
  return wrapper(content, lang)
}

// ── Application status (accepted / rejected) ────────────────────────────────
export function applicationStatusHtml(opts: {
  toName: string
  status: 'accepted' | 'rejected'
  clubName: string
  annonceTitle: string
  lang: Lang
}): string {
  const { toName, status, clubName, annonceTitle, lang } = opts
  const de = lang === 'de'
  const isAccepted = status === 'accepted'
  const msgUrl = `${BASE_URL}/messages`
  const color = isAccepted ? '#4cdb7a' : '#ff6b6b'
  const icon = isAccepted ? '✅' : '❌'
  const headingFr = isAccepted ? `${clubName} a accepté ta candidature !` : `Réponse de ${clubName}`
  const headingDe = isAccepted ? `${clubName} hat deine Bewerbung angenommen!` : `Antwort von ${clubName}`
  const bodyFr = isAccepted
    ? `Félicitations <strong style="color:#fff;">${toName}</strong> ! Le club <strong style="color:#fff;">${clubName}</strong> a accepté ta candidature pour l'annonce <strong style="color:#fff;">${annonceTitle}</strong>. Prends contact pour la suite !`
    : `Bonjour <strong style="color:#fff;">${toName}</strong>, le club <strong style="color:#fff;">${clubName}</strong> n'a pas retenu ta candidature pour <strong style="color:#fff;">${annonceTitle}</strong>. Ne te décourage pas — d'autres opportunités t'attendent !`
  const bodyDe = isAccepted
    ? `Glückwunsch <strong style="color:#fff;">${toName}</strong>! Der Verein <strong style="color:#fff;">${clubName}</strong> hat deine Bewerbung für die Anzeige <strong style="color:#fff;">${annonceTitle}</strong> angenommen. Nimm Kontakt auf!`
    : `Hallo <strong style="color:#fff;">${toName}</strong>, der Verein <strong style="color:#fff;">${clubName}</strong> hat deine Bewerbung für <strong style="color:#fff;">${annonceTitle}</strong> nicht berücksichtigt. Kopf hoch — weitere Chancen warten!`
  const content = `
    <div style="text-align:center;margin-bottom:16px;font-size:2.5rem;">${icon}</div>
    <h1 style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;font-size:28px;color:${color};margin:0 0 16px;letter-spacing:0.03em;text-align:center;">
      ${de ? headingDe : headingFr}
    </h1>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.65;margin:0 0 24px;">
      ${de ? bodyDe : bodyFr}
    </p>
    ${isAccepted ? `<div style="text-align:center;">${redBtn(msgUrl, de ? 'Kontakt aufnehmen →' : 'Contacter le club →')}</div>` : `<div style="text-align:center;"><a href="${BASE_URL}/annonces" style="display:inline-block;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);padding:13px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.12);">${de ? 'Andere Anzeigen suchen →' : "Voir d'autres annonces →"}</a></div>`}`
  return wrapper(content, lang)
}

// ── Club approved (to club) ──────────────────────────────────────────────────
export function clubApprovedHtml(opts: {
  clubName: string
  lang: Lang
}): string {
  const { clubName, lang } = opts
  const de = lang === 'de'
  const content = `
    <div style="text-align:center;margin-bottom:16px;font-size:2.5rem;">✅</div>
    <h1 style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;font-size:30px;color:#4cdb7a;margin:0 0 12px;letter-spacing:0.03em;">
      ${de ? 'Ihr Verein wurde verifiziert!' : 'Votre club a été vérifié !'}
    </h1>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.65;margin:0 0 8px;">
      ${de
        ? `<strong style="color:#fff;">${clubName}</strong> ist jetzt offiziell auf TeamUpFR verifiziert.`
        : `Le club <strong style="color:#fff;">${clubName}</strong> est maintenant officiellement vérifié sur TeamUpFR.`}
    </p>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.65;margin:0 0 24px;">
      ${de
        ? 'Das Verifikations-Badge ist auf Ihrem Profil und in der Suche sichtbar. Sie können jetzt Anzeigen veröffentlichen.'
        : "Le badge vérifié est visible sur votre profil et dans la recherche. Vous pouvez désormais publier des annonces."}
    </p>
    <div style="text-align:center;">
      ${redBtn(`${BASE_URL}/profil`, de ? 'Mein Profil ansehen →' : 'Voir mon profil →')}
    </div>`
  return wrapper(content, lang)
}

// ── Club rejected (to club) ──────────────────────────────────────────────────
export function clubRejectedHtml(opts: {
  clubName: string
  reason: string
  lang: Lang
}): string {
  const { clubName, reason, lang } = opts
  const de = lang === 'de'
  const content = `
    <div style="text-align:center;margin-bottom:16px;font-size:2.5rem;">❌</div>
    <h1 style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;font-size:30px;color:#ff6b6b;margin:0 0 12px;letter-spacing:0.03em;">
      ${de ? 'Verifikation abgelehnt' : 'Vérification refusée'}
    </h1>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.65;margin:0 0 8px;">
      ${de
        ? `Leider wurde der Antrag von <strong style="color:#fff;">${clubName}</strong> abgelehnt.`
        : `La demande de vérification du club <strong style="color:#fff;">${clubName}</strong> a été refusée.`}
    </p>
    <div style="background:rgba(255,255,255,0.05);border-left:3px solid #ff6b6b;border-radius:0 8px 8px 0;padding:14px 18px;margin:18px 0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.55;">
      ${de ? 'Grund:' : 'Raison :'} ${reason}
    </div>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.65;margin:0 0 24px;">
      ${de
        ? 'Wenn Sie Fragen haben, kontaktieren Sie uns bitte per E-Mail.'
        : 'Si vous pensez qu\'il s\'agit d\'une erreur, contactez-nous par email.'}
    </p>
    <div style="text-align:center;">
      <a href="mailto:teamupfr.ch@gmail.com" style="display:inline-block;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);padding:13px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.12);">
        ${de ? 'Kontakt aufnehmen' : 'Nous contacter'}
      </a>
    </div>`
  return wrapper(content, lang)
}

// ── New club notification (to admin) ─────────────────────────────────────────
export function newClubNotificationHtml(opts: {
  clubName: string
  clubEmail: string
  affClubName?: string | null
  emailIsProfessional: boolean
  adminUrl: string
}): string {
  const { clubName, clubEmail, affClubName, emailIsProfessional, adminUrl } = opts
  const lang: Lang = 'fr'
  const emailBadge = emailIsProfessional
    ? `<span style="display:inline-block;background:rgba(76,219,122,0.15);color:#4cdb7a;border:1px solid rgba(76,219,122,0.3);border-radius:100px;padding:2px 10px;font-size:12px;font-weight:700;">Email pro</span>`
    : `<span style="display:inline-block;background:rgba(255,165,0,0.15);color:#ffa500;border:1px solid rgba(255,165,0,0.3);border-radius:100px;padding:2px 10px;font-size:12px;font-weight:700;">Email perso</span>`
  const content = `
    <h1 style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;font-size:28px;color:#fff;margin:0 0 16px;letter-spacing:0.03em;">
      🏟️ Nouveau club à valider
    </h1>
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;width:40%;">Club</td>
            <td style="color:#fff;font-size:15px;font-weight:700;">${clubName}</td></tr>
        <tr><td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Email</td>
            <td style="color:#fff;font-size:14px;">${clubEmail} ${emailBadge}</td></tr>
        ${affClubName ? `<tr><td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Club AFF</td>
            <td style="color:#fff;font-size:14px;">${affClubName}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;">
      ${redBtn(adminUrl, 'Valider sur le dashboard →')}
    </div>`
  return wrapper(content, lang)
}
