import { NextResponse } from 'next/server'
import { ADMIN_EMAIL, privateHeaders } from '../../../../../../lib/admin-auth'
import { moderationAdmin, moderationUuid } from '../../../../../../lib/moderation-server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await moderationAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders })
  const { db, actorId } = admin
  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch { /* Reject malformed JSON. */ }
  if (!moderationUuid.test(id) || !body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).length !== 1 || !('action' in body) || typeof body.action !== 'string' || !['block','unblock'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: privateHeaders })
  }
  const { data: report, error } = await db.from('member_reports').select('reported_id').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load report' }, { status: 503, headers: privateHeaders })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404, headers: privateHeaders })
  const targetId = report.reported_id
  const { data: target, error: targetError } = await db.auth.admin.getUserById(targetId)
  if (targetError || !target.user) return NextResponse.json({ error: 'Account unavailable' }, { status: 404, headers: privateHeaders })
  if (targetId === actorId || target.user.email === ADMIN_EMAIL) return NextResponse.json({ error: 'Protected administrator' }, { status: 403, headers: privateHeaders })
  const { data: ready, error: guardError } = await db.rpc('member_moderation_ready')
  if (guardError || ready !== true) return NextResponse.json({ error: 'Moderation safeguards unavailable' }, { status: 503, headers: privateHeaders })
  // Revoke before either operation: unblocking must never revive an old JWT.
  const { data: revoked, error: revokeError } = await db.rpc('revoke_reported_member_sessions', { p_report:id, p_target:targetId, p_actor:actorId })
  if (revokeError || revoked !== true) return NextResponse.json({ error: 'Unable to revoke sessions' }, { status: 503, headers: privateHeaders })
  const blocked = body.action === 'block'
  const { data: changed, error: changeError } = await db.auth.admin.updateUserById(targetId, { ban_duration: blocked ? '876000h' : 'none' })
  const actualBlocked = !!changed.user?.banned_until && Date.parse(changed.user.banned_until) > Date.now()
  if (changeError || !changed.user || actualBlocked !== blocked) return NextResponse.json({ error: 'Unable to confirm moderation action' }, { status: 502, headers: privateHeaders })
  const { error: auditError } = await db.from('member_moderation_events').insert({ target_id:targetId, actor_id:actorId, report_id:id, action:body.action })
  return NextResponse.json({ id:targetId, blocked:actualBlocked, auditPending:!!auditError }, { headers: privateHeaders })
}
