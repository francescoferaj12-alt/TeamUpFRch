import type { SupabaseClient } from '@supabase/supabase-js'
import type { Message } from './supabase'

export function isMessageAttachmentPath(path: string, senderId: string): boolean {
  return path.startsWith(`${senderId}/`)
    && /^[0-9a-f-]{36}\/[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(path)
}

// Private object paths are persisted; short-lived URLs exist only in UI state.
export async function resolveMessageAttachments(client: SupabaseClient, messages: Message[]): Promise<Message[]> {
  const paths = [...new Set(messages.flatMap(message =>
    message.file_url && isMessageAttachmentPath(message.file_url, message.sender_id) ? [message.file_url] : []
  ))]
  if (!paths.length) return messages.map(message => ({ ...message, file_url: undefined }))
  const { data } = await client.storage.from('message-files').createSignedUrls(paths, 3600)
  const urls = new Map((data || []).map(file => [file.path, file.signedUrl]))
  return messages.map(message => ({
    ...message,
    file_url: message.file_url && isMessageAttachmentPath(message.file_url, message.sender_id)
      ? urls.get(message.file_url) || undefined : undefined,
  }))
}
