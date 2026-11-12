import { NextResponse } from 'next/server'
import { adminClient, adminPageParams, privateHeaders } from '../../../../lib/admin-auth'

export async function GET(request: Request) {
  const db = await adminClient(request)
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { params, page, size, query } = adminPageParams(request)
  let select = db.from('profiles').select('id,role,first_name,last_name,email,club_name,zone,ligue,verified,hidden,created_at,club_verification_status,profile_completed', { count: 'exact' })
  const role = params.get('role')
  if (role && ['player', 'coach', 'club'].includes(role)) select = select.eq('role', role)
  if (query) select = select.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,club_name.ilike.%${query}%`)
  const { data, count, error } = await select.order('created_at', { ascending: false }).order('id').range(page * size, page * size + size - 1)
  if (error) return NextResponse.json({ error: 'Unable to load members' }, { status: 500, headers: privateHeaders })
  return NextResponse.json({ items: data, total: count, page, size }, { headers: privateHeaders })
}
