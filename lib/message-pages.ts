import type { Message } from './supabase'

export function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const byId = new Map(existing.map(message => [message.id, message]))
  for (const message of incoming) byId.set(message.id, message)
  return [...byId.values()].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
}

export function pageCursor(items: { created_at:string;id:string }[]) {
  const last=items.at(-1)
  return last ? { p_before:last.created_at,p_before_id:last.id } : {}
}
