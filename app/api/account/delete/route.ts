import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { removeAccountMedia } from '../../../../lib/account-deletion'

export const maxDuration = 60
const headers = { 'Cache-Control': 'private, no-store' }
const reply = (code: string, status: number) => NextResponse.json({ error: code }, { status, headers })

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) return reply('UNAUTHORIZED', 401)
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin) return reply('INVALID_ORIGIN', 403)
  if (!req.headers.get('content-type')?.startsWith('application/json')) return reply('INVALID_REQUEST', 400)
  const raw = await req.text()
  if (raw.length > 1024) return reply('INVALID_REQUEST', 400)
  let body
  try { body = JSON.parse(raw) } catch { return reply('INVALID_REQUEST', 400) }
  if (!body || body.confirmation !== 'DELETE' || Object.keys(body).some(key => key !== 'confirmation')) {
    return reply('CONFIRMATION_REQUIRED', 400)
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return reply('UNAVAILABLE', 503)
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user || !user.email_confirmed_at) return reply('UNAUTHORIZED', 401)
  // Account ID and ownership always come from the verified session, never JSON.
  if (user.email === 'teamupfr.ch@gmail.com') return reply('OWNER_ACCOUNT_REQUIRES_SUPPORT', 409)
  const lastSignIn = Date.parse(user.last_sign_in_at || '')
  if (!Number.isFinite(lastSignIn) || lastSignIn > Date.now() + 60_000 || Date.now() - lastSignIn > 600_000) {
    return reply('REAUTHENTICATION_REQUIRED', 401)
  }
  // Deployment must install the restrictive Storage policy first. Banning the
  // account then prevents its already-issued JWTs from racing new file uploads.
  const ready = await admin.rpc('account_storage_deletion_ready')
  if (ready.error || ready.data !== true) return reply('UNAVAILABLE', 503)
  const signedOut = await admin.auth.admin.signOut(token, 'global')
  if (signedOut.error) return reply('UNAVAILABLE', 503)
  const locked = await admin.auth.admin.updateUserById(user.id, { ban_duration: '24h' })
  if (locked.error) return reply('UNAVAILABLE', 503)
  try {
    await removeAccountMedia(admin, user.id)
    // Live foreign keys cascade Auth -> profile -> announcements, applications,
    // messages, career and certificates; other member tables cascade from Auth.
    const deleted = await admin.auth.admin.deleteUser(user.id, false)
    if (deleted.error) throw new Error('Could not delete account')
    return NextResponse.json({ ok: true }, { headers })
  } catch {
    // Do not leave a failed cleanup as an unexplained 24-hour lockout. Some
    // media may already be gone; the UI states that clearly and permits retry.
    const restored = await admin.auth.admin.updateUserById(user.id, { ban_duration: 'none' })
    return reply(restored.error ? 'CLEANUP_FAILED_ACCOUNT_LOCKED' : 'CLEANUP_INCOMPLETE', 502)
  }
}
