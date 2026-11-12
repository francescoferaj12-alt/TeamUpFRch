import { NextResponse } from 'next/server'
import { adminClient, privateHeaders } from '../../../../../../lib/admin-auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = await adminClient(request)
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  let verified: unknown
  try { verified = (await request.json()).verified } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  if (!/^[a-f0-9-]{36}$/i.test(id) || typeof verified !== 'boolean') return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { data, error } = await db.from('profiles').update({ verified }).eq('id', id).in('role', ['player', 'coach']).select('id,verified').maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to update badge' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Member not found; clubs use approval' }, { status: 404 })
  return NextResponse.json(data, { headers: privateHeaders })
}
