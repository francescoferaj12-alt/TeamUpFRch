import type { Session } from '@supabase/supabase-js'
let queue:Promise<unknown>=Promise.resolve()
export function syncMediaSession(session:Session|null):Promise<boolean> {
  // Serialize login/refresh/logout so a slow earlier login cannot restore a
  // media cookie after a subsequent logout or account switch.
  const next=queue.catch(()=>{}).then(async()=>{
    const response=await fetch('/api/media/session',{method:session?'POST':'DELETE',credentials:'same-origin',cache:'no-store',headers:session?{Authorization:`Bearer ${session.access_token}`}:{}})
    return response.ok
  }).catch(()=>false)
  queue=next
  return next
}
