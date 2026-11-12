import { createClient } from '@supabase/supabase-js'

export const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'
export async function adminClient(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: { user }, error } = await db.auth.getUser(token)
  return !error && user?.email === ADMIN_EMAIL ? db : null
}

export const privateHeaders = { 'Cache-Control': 'private, no-store' }
export function adminPageParams(request: Request) {
  const params = new URL(request.url).searchParams
  const rawPage = Number(params.get('page') || 0)
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? Math.min(rawPage, 100000) : 0
  const query = (params.get('q') || '').trim().slice(0, 80).replace(/[,%_*()\\]/g, ' ')
  return { params, page, size: 25, query }
}
