import type { SupabaseClient } from '@supabase/supabase-js'

const buckets = ['avatars', 'videos', 'message-files'] as const
const safeSegment = (value: string) => !!value && value !== '.' && value !== '..' && !/[\\/\u0000-\u001f\u007f]/.test(value)

/** Only folders rooted at the authenticated account ID can be removed. */
export async function removeAccountMedia(admin: SupabaseClient, accountId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(accountId)) {
    throw new Error('Invalid account ID')
  }
  let operations = 0
  for (const bucket of buckets) {
    const storage = admin.storage.from(bucket)
    async function empty(folder: string, depth: number): Promise<void> {
      if (depth > 4) throw new Error('Media folder nesting limit')
      // Re-read page zero after removal: offset pagination would skip files.
      for (;;) {
        if (++operations > 100) throw new Error('Media cleanup limit; retry required')
        const { data, error } = await storage.list(folder, { limit: 100, sortBy: { column: 'name', order: 'asc' } })
        if (error || !data) throw new Error('Could not list account media')
        if (!data.length) return
        const paths: string[] = []
        for (const item of data) {
          if (!safeSegment(item.name)) throw new Error('Unsafe media name')
          const path = `${folder}/${item.name}`
          if (!path.startsWith(`${accountId}/`)) throw new Error('Invalid media owner')
          if (item.id) paths.push(path)
          else await empty(path, depth + 1)
        }
        if (paths.length) {
          const { error: removeError } = await storage.remove(paths)
          if (removeError) throw new Error('Could not remove account media')
        }
      }
    }
    await empty(accountId, 0)
  }
}
