import { NextResponse } from 'next/server'
import { ADMIN_EMAIL, adminPageParams, privateHeaders } from '../../../../lib/admin-auth'
import { moderationAdmin } from '../../../../lib/moderation-server'

export async function GET(request: Request) {
  const admin = await moderationAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders })
  const { db } = admin
  const { page, size, params } = adminPageParams(request)
  let query = db.from('member_reports').select('id,reported_id,reporter_id,reason,created_at,reviewed_at', { count: 'exact' })
  if (params.get('state') !== 'all') query = query.is('reviewed_at', null)
  const { data, count, error } = await query.order('created_at', { ascending: true }).order('id').range(page * size, page * size + size - 1)
  if (error) return NextResponse.json({ error: 'Unable to load reports' }, { status: 500, headers: privateHeaders })
  const rows = data || []
  const ids = [...new Set(rows.flatMap(row => [row.reported_id, row.reporter_id]))]
  const { data: members, error: namesError } = ids.length
    ? await db.from('profiles').select('id,role,first_name,last_name,club_name').in('id', ids)
    : { data: [], error: null }
  if (namesError) return NextResponse.json({ error: 'Unable to load report identities' }, { status: 503, headers: privateHeaders })
  const byId = new Map((members || []).map(member => [member.id, member]))
  const status = new Map<string, { blocked:boolean; canModerate:boolean }>()
  // At most 25 distinct reported accounts per page; no Auth emails or metadata are returned.
  for (const id of new Set(rows.map(row => row.reported_id))) {
    const { data: auth, error: authError } = await db.auth.admin.getUserById(id)
    if (authError || !auth.user) return NextResponse.json({ error: 'Unable to load moderation status' }, { status: 503, headers: privateHeaders })
    status.set(id, { blocked: !!auth.user.banned_until && Date.parse(auth.user.banned_until)>Date.now(), canModerate: auth.user.email!==ADMIN_EMAIL && id!==admin.actorId })
  }
  return NextResponse.json({ items: rows.map(row => ({ ...row, reported:byId.get(row.reported_id)||null, reporter:byId.get(row.reporter_id)||null, ...status.get(row.reported_id) })), total:count, page, size }, { headers: privateHeaders })
}
