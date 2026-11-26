import { NextResponse } from 'next/server'
import { privateHeaders } from '../../../../../../lib/admin-auth'

import { moderationAdmin } from '../../../../../../lib/moderation-server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await moderationAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders })
  const { db } = admin
  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch { /* Invalid JSON fails closed. */ }
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)
    || !body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).length !== 1 || !('action' in body) || body.action !== 'review') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: privateHeaders })
  }
  const { data, error } = await db.from('member_reports')
    .update({ reviewed_at: new Date().toISOString() }).eq('id', id).is('reviewed_at', null)
    .select('id,reviewed_at').maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to review report' }, { status: 500, headers: privateHeaders })
  if (!data) return NextResponse.json({ error: 'Report missing or already reviewed' }, { status: 409, headers: privateHeaders })
  return NextResponse.json(data, { headers: privateHeaders })
}
