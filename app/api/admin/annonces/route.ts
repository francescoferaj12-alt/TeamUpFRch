import { NextResponse } from 'next/server'
import { adminClient, adminPageParams, privateHeaders } from '../../../../lib/admin-auth'
import { ANNONCE_VALID_MS, currentAnnonceFilter } from '../../../../lib/annonce-lifecycle'

export async function GET(request: Request) {
  const db = await adminClient(request)
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { params, page, size, query } = adminPageParams(request)
  let select = db.from('annonces').select('id,author_id,author_name,author_type,title,body,zone,ligue,status,created_at,last_confirmed_at', { count: 'exact' })
  const state = params.get('state')
  const cutoff = new Date(Date.now() - ANNONCE_VALID_MS).toISOString()
  if (state === 'closed') select = select.eq('status', 'closed')
  if (state === 'current') select = select.eq('status', 'active').or(currentAnnonceFilter())
  if (state === 'stale') select = select.eq('status', 'active').or(`last_confirmed_at.lte.${cutoff},and(last_confirmed_at.is.null,created_at.lte.${cutoff})`)
  if (query) select = select.or(`title.ilike.%${query}%,author_name.ilike.%${query}%`)
  const { data, count, error } = await select.order('created_at', { ascending: false }).order('id').range(page * size, page * size + size - 1)
  if (error) return NextResponse.json({ error: 'Unable to load listings' }, { status: 500, headers: privateHeaders })
  return NextResponse.json({ items: data, total: count, page, size }, { headers: privateHeaders })
}
