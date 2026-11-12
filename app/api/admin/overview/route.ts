import { NextResponse } from 'next/server'
import { adminClient, privateHeaders } from '../../../../lib/admin-auth'
import { ANNONCE_VALID_MS, currentAnnonceFilter } from '../../../../lib/annonce-lifecycle'

export async function GET(request: Request) {
  const db = await adminClient(request)
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cutoff = new Date(Date.now() - ANNONCE_VALID_MS).toISOString()
  const results = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    ...['player', 'coach', 'club'].map(role => db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', role)),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'club').or('club_verification_status.is.null,club_verification_status.eq.pending'),
    db.from('annonces').select('id', { count: 'exact', head: true }).eq('status', 'active').or(currentAnnonceFilter()),
    db.from('annonces').select('id', { count: 'exact', head: true }).eq('status', 'active').or(`last_confirmed_at.lte.${cutoff},and(last_confirmed_at.is.null,created_at.lte.${cutoff})`),
    db.from('annonces').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
    db.from('member_reports').select('id', { count: 'exact', head: true }).is('reviewed_at', null),
    db.from('applications').select('id', { count: 'exact', head: true }),
    db.from('messages').select('id', { count: 'exact', head: true }),
  ])
  if (results.some(result => result.error)) return NextResponse.json({ error: 'Unable to load overview' }, { status: 500, headers: privateHeaders })
  const keys = ['members', 'players', 'coaches', 'clubs', 'pendingClubs', 'currentAnnonces', 'staleAnnonces', 'closedAnnonces', 'openReports', 'applications', 'messages']
  return NextResponse.json(Object.fromEntries(keys.map((key, index) => [key, results[index].count || 0])), { headers: privateHeaders })
}
