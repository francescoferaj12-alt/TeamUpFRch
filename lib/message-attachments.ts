import type { SupabaseClient } from '@supabase/supabase-js'
import type { Message } from './supabase'

export function isMessageAttachmentPath(path: string, senderId: string): boolean {
  return path.startsWith(`${senderId}/`)
    && /^[0-9a-f-]{36}\/[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(path)
}

export type AttachmentCache = Map<string, { url: string; expiresAt: number }>

// Private object paths are persisted; short-lived URLs exist only in UI state.
export async function resolveMessageAttachments(client: SupabaseClient, messages: Message[], cache?: AttachmentCache): Promise<Message[]> {
  const paths = [...new Set(messages.flatMap(message =>
    message.file_url && isMessageAttachmentPath(message.file_url, message.sender_id) ? [message.file_url] : []
  ))]
  if (!paths.length) return messages.map(message => ({ ...message, file_url: undefined }))
  const now=Date.now()
  const missing=paths.filter(path=>!cache?.get(path)||cache.get(path)!.expiresAt<now+300_000)
  const {data}=missing.length?await client.storage.from('message-files').createSignedUrls(missing,3600):{data:[]}
  const urls=new Map((data||[]).map(file=>[file.path,file.signedUrl]))
  for(const [path,url] of urls)if(path&&url)cache?.set(path,{url,expiresAt:now+3_600_000})
  if(cache)for(const [path,value]of cache){if(value.expiresAt<=now)cache.delete(path);else if(paths.includes(path)&&!urls.get(path))urls.set(path,value.url)}
  return messages.map(message => ({
    ...message,
    file_url: message.file_url && isMessageAttachmentPath(message.file_url, message.sender_id)
      ? urls.get(message.file_url) || undefined : undefined,
  }))
}
