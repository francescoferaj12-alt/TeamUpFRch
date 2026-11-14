import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const mediaHeaders = { 'Cache-Control': 'private, no-store, max-age=0', 'Pragma': 'no-cache', 'Vary': 'Cookie, Authorization', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' }
export const mediaCookie = (req: NextRequest) => new URL(req.url).protocol === 'https:' ? '__Host-teamupfr-media' : 'teamupfr-media'
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  return req.headers.get('sec-fetch-site') !== 'cross-site' && (!origin || origin === new URL(req.url).origin)
}
export function mediaToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1] || req.cookies.get(mediaCookie(req))?.value
  return token && token.length <= 3800 ? token : null
}
export async function mediaReader(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const client = createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}})
  // PostgREST validates the JWT signature/expiry; the RPC checks the real Auth
  // session, confirmed address and ban state. No client metadata grants access.
  const {data,error} = await client.rpc('profile_media_reader')
  if (error || !data || typeof data.id !== 'string') return null
  return { id: data.id as string, admin: data.admin === true }
}
