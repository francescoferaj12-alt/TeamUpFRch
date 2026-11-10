import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { matchesAnnonce } from '../../../../lib/annonce-search'
import { notificationLang } from '../../../../lib/email-templates'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const expected = Buffer.from(`Bearer ${secret ?? ''}`)
  const provided = Buffer.from(auth ?? '')
  if (!secret || expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY
  if (!url || !key || !resendKey) return NextResponse.json({ error: 'Notifications unavailable' }, { status: 503 })

  const db = createClient(url, key, { auth: { persistSession: false } })
  const mail = new Resend(resendKey)
  const now = new Date()
  const day = now.toISOString().slice(0, 10)
  const reminderCutoff = new Date(now.getTime() - 24 * 3600_000).toISOString()
  // A fixed daily window prevents scheduler jitter from skipping new posts.
  const windowEnd = new Date(`${day}T08:00:00.000Z`)
  if (now < windowEnd) windowEnd.setUTCDate(windowEnd.getUTCDate() - 1)
  const windowStart = new Date(windowEnd.getTime() - 24 * 3600_000).toISOString()
  const sender = 'TeamUpFR <noreply@teamupfr.ch>'
  let failures = 0
  let sent = 0

  const pending = await db.from('profiles').select('id', { count: 'exact', head: true })
    .eq('role', 'club').eq('club_verification_status', 'pending').lt('created_at', reminderCutoff)
  if (pending.error) failures++
  else if (pending.count) {
    const result = await mail.emails.send({
      from: sender,
      to: 'teamupfr.ch@gmail.com',
      subject: 'TeamUpFR — demandes de clubs à traiter',
      text: `${pending.count} demande(s) de club sont en attente depuis plus de 24 h. https://teamupfr.ch/admin/clubs`,
    }, { idempotencyKey: `club-reminder/${day}` }).catch(() => null)
    if (!result || result.error) failures++
    else sent++
  }

  const [listings, searches] = await Promise.all([
    db.from('annonces').select('id,title,body,author_name,ligue,zone,position,author_type,author_id,created_at')
      .eq('status', 'active').gte('created_at', windowStart).lt('created_at', windowEnd.toISOString()).order('created_at', { ascending: false }),
    db.from('saved_annonce_searches').select('owner_id,query,ligue,zone,position,author_type,created_at')
      .eq('email_alert', true).order('id'),
  ])
  if (listings.error || searches.error) failures++
  if (listings.data?.length && searches.data?.length) {
    const authorIds = [...new Set(listings.data.map(listing => listing.author_id))]
    const authors = await db.from('public_profiles').select('id').in('id', authorIds)
    if (authors.error) failures++
    else {
      const visible = new Set((authors.data ?? []).map(author => author.id))
      const matches = new Map<string, Set<string>>()
      for (const search of searches.data) {
        for (const listing of listings.data) {
          if (!visible.has(listing.author_id) || listing.author_id === search.owner_id
            || Date.parse(listing.created_at) < Date.parse(search.created_at) || !matchesAnnonce(search, listing)) continue
          const ids = matches.get(search.owner_id) ?? new Set<string>()
          ids.add(listing.id)
          matches.set(search.owner_id, ids)
        }
      }
      for (const [ownerId, ids] of matches) {
        const { data: member, error } = await db.from('profiles').select('email,zone,notification_settings')
          .eq('id', ownerId).or('hidden.is.null,hidden.eq.false').maybeSingle()
        if (error) { failures++; continue }
        if (!member?.email) continue
        const de = notificationLang(member.zone, member.notification_settings?.language) === 'de'
        const result = await mail.emails.send({
          from: sender,
          to: member.email,
          subject: de ? 'TeamUpFR — neue Treffer für deine Suchen' : 'TeamUpFR — nouvelles annonces pour tes recherches',
          text: de
            ? `${ids.size} neue Anzeigen passen zu deinen gespeicherten Suchen. Öffne oder verwalte sie hier: https://teamupfr.ch/annonces`
            : `${ids.size} nouvelles annonces correspondent à tes recherches enregistrées. Consulte-les ou gère tes alertes ici : https://teamupfr.ch/annonces`,
        }, { idempotencyKey: `saved-searches/${windowEnd.toISOString().slice(0, 10)}/${ownerId}` }).catch(() => null)
        if (!result || result.error) failures++
        else sent++
      }
    }
  }

  return NextResponse.json({ sent, failures }, { status: failures ? 502 : 200 })
}
