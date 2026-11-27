'use client'
import {useEffect,useState} from 'react'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {supabase} from '../../lib/supabase'
// Coalesce simultaneous reads when the same author appears several times.
const pendingReads=new Map<string,Promise<boolean>>()
function followState(uid:string,target:string){
 const key=uid+':'+target
 const existing=pendingReads.get(key);if(existing)return existing
 const request=Promise.resolve(supabase.from('member_follows').select('followed_id').eq('follower_id',uid).eq('followed_id',target).maybeSingle()).then(({data,error})=>{if(error)throw Error('Follow unavailable');return !!data}).finally(()=>pendingReads.delete(key))
 pendingReads.set(key,request);return request
}
type FollowChange={uid:string;memberId:string;followed:boolean}
export default function FollowButton({memberId}:{memberId:string}){
 const {session}=useAuth(),{lang}=useLang();const de=lang==='de',uid=session?.user.id
 const [followed,setFollowed]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(false),[retry,setRetry]=useState(0)
 useEffect(()=>{
  setFollowed(null);setError(false)
  if(!uid||uid===memberId)return
  let active=true,changed=false
  const update=(event:Event)=>{const detail=(event as CustomEvent<FollowChange>).detail;if(detail?.uid===uid&&detail.memberId===memberId){changed=true;setFollowed(detail.followed);setError(false)}}
  window.addEventListener('community-follow-changed',update)
  followState(uid,memberId).then(value=>{if(active&&!changed)setFollowed(value)}).catch(()=>{if(active)setError(true)})
  return()=>{active=false;window.removeEventListener('community-follow-changed',update)}
 },[uid,memberId,retry])
 if(!uid||uid===memberId)return null
 async function toggle(){
  if(busy||followed===null)return;setBusy(true);setError(false)
  try{
   const result=followed?await supabase.from('member_follows').delete().eq('follower_id',uid!).eq('followed_id',memberId).select('followed_id'):await supabase.from('member_follows').insert({followed_id:memberId}).select('followed_id')
   if(result.error||!result.data?.length)throw Error('Follow unavailable')
   window.dispatchEvent(new CustomEvent<FollowChange>('community-follow-changed',{detail:{uid:uid!,memberId,followed:!followed}}))
  }catch{setError(true)}finally{setBusy(false)}
 }
 return <div className="community-follow"><button className="btn btn-sm" disabled={busy||followed===null} onClick={toggle} aria-pressed={!!followed}>{busy?'…':followed?(de?'Abonniert ✓':'Abonné ✓'):(de?'Folgen':'Suivre')}</button>{error&&<span role="alert">{de?'Nicht verfügbar.':'Action indisponible.'} <button onClick={()=>setRetry(n=>n+1)}>{de?'Erneut versuchen':'Réessayer'}</button></span>}</div>
}
