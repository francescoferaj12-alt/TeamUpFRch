export const profileVideoFields = ['video1_url', 'video2_url', 'video3_url'] as const
export type ProfileVideoField = typeof profileVideoFields[number]

export function ownedVideoPath(value: string, owner: string, storageUrl: string): string | null {
  if (!value || !storageUrl) return null
  try {
    const url = new URL(value)
    const project = new URL(storageUrl)
    const prefix = `/storage/v1/object/public/videos/${owner}/`
    if (url.origin !== project.origin || !url.pathname.startsWith(prefix)) return null

    const filename = url.pathname.slice(prefix.length)
    return /^video_[123](?:_[0-9a-f-]{36})?\.[a-z0-9]{1,12}$/i.test(filename)
      ? `${owner}/${filename}`
      : null
  } catch {
    return null
  }
}
