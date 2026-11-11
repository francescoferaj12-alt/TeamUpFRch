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

export const MAX_PROFILE_VIDEO_BYTES = 20 * 1024 * 1024
export const MAX_PROFILE_VIDEO_FILES = 6 // three active files plus three replacements

export function uploadProfileVideo(file: File, path: string, token: string, onProgress: (percent:number)=>void, signal?:AbortSignal):Promise<void> {
  if(file.size>MAX_PROFILE_VIDEO_BYTES)return Promise.reject(new Error('Video exceeds 20 MiB'))
  const origin=process.env.NEXT_PUBLIC_SUPABASE_URL
  const apiKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if(!origin||!apiKey) return Promise.reject(new Error('Storage unavailable'))
  return new Promise((resolve,reject)=>{
    const xhr=new XMLHttpRequest()
    const abort=()=>xhr.abort()
    const finish=(error?:Error)=>{signal?.removeEventListener('abort',abort);error?reject(error):resolve()}
    xhr.open('POST',`${origin}/storage/v1/object/videos/${path.split('/').map(encodeURIComponent).join('/')}`)
    xhr.setRequestHeader('Authorization',`Bearer ${token}`)
    xhr.setRequestHeader('apikey',apiKey)
    xhr.setRequestHeader('x-upsert','false')
    xhr.timeout=180_000
    xhr.upload.onprogress=event=>{if(event.lengthComputable)onProgress(Math.min(99,Math.round(event.loaded/event.total*100)))}
    xhr.onload=()=>xhr.status>=200&&xhr.status<300?finish():finish(new Error(`Upload failed (${xhr.status})`))
    xhr.onerror=()=>finish(new Error('Upload network error'))
    xhr.ontimeout=()=>finish(new Error('Upload timed out'))
    xhr.onabort=()=>finish(new Error('Upload cancelled'))
    signal?.addEventListener('abort',abort,{once:true})
    if(signal?.aborted){finish(new Error('Upload cancelled'));return}
    const body=new FormData();body.append('cacheControl','3600');body.append('',file)
    xhr.send(body)
  })
}
