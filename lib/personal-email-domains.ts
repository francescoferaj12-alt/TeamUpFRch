const PERSONAL_EMAIL_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'hotmail.com', 'hotmail.fr', 'hotmail.de', 'hotmail.ch',
  'outlook.com', 'outlook.fr', 'outlook.de', 'outlook.ch',
  'live.com', 'live.fr', 'live.de', 'live.ch',
  'msn.com',
  // Yahoo
  'yahoo.com', 'yahoo.fr', 'yahoo.de', 'yahoo.ch', 'ymail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Swiss ISPs
  'bluewin.ch', 'sunrise.ch', 'swisscom.ch',
  'hispeed.ch', 'freesurf.ch', 'vtx.ch', 'datacomm.ch',
  // GMX / Web.de
  'gmx.com', 'gmx.de', 'gmx.ch', 'gmx.fr', 'gmx.net', 'gmx.at',
  'web.de', 'freenet.de',
  // French ISPs
  'orange.fr', 'sfr.fr', 'wanadoo.fr', 'laposte.net',
  'free.fr', 'bouyguestelecom.fr', 'numericable.fr',
  // Privacy
  'protonmail.com', 'proton.me', 'pm.me',
  'tutanota.com', 'tutamail.com',
  // Other
  'aol.com', 'aim.com', 'mail.com', 'inbox.com',
])

export function isPersonalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return !!domain && PERSONAL_EMAIL_DOMAINS.has(domain)
}
