import { adminClient } from './admin-auth'
import { mediaReader } from './media-server'

export async function moderationAdmin(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) return null
  const reader = await mediaReader(token)
  if (!reader?.admin) return null
  const db = await adminClient(request)
  return db ? { db, actorId: reader.id } : null
}
export const moderationUuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
