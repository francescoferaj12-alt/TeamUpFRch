'use client'
import {useEffect,useState,ReactNode} from 'react'
import {supabase,Annonce} from '../../lib/supabase'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {CommunityAuthor,CommunityPost} from '../../lib/community'
import PublicationCard from './PublicationCard'
type Item={kind:'annonce'|'publication';id:string;content:Annonce&CommunityPost}
export default function CommunityFeed({kind,query,renderAnnonce}:{kind:'all'|'publication';query:string;renderAnnonce:(a:Annonce)=>ReactNode}){
 const {session,mediaReady}=useAuth(),{lang}=useLang(),de=lang==='de'
 const uid=session?.user.id
 const [state,setState]=useState<{items:Item[];total:number}>({items:[],total:0}),[page,setPage]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(false),[retry,setRetry]=useState(0)
 useEffect(()=>setPage(0),[kind,query])
 useEffect(()=>{let active=true;setLoading(true);setError(false)
 async function load(){try{const {data,error}=await supabase.rpc('browse_community_feed',{p_kind:kind,p_query:query,p_page:page});if(error||!data)throw Error();const ids=[...new Set((data.items as Item[]).map(i=>i.content.author_id))];const profiles=ids.length?await supabase.from('public_profiles').select('id,first_name,last_name,club_name,avatar_url,role,verified').in('id',ids):{data:[],error:null};if(profiles.error)throw Error();const authors=new Map<string,CommunityAuthor>((profiles.data||[]).map(p=>[p.id,p]));if(active)setState({items:(data.items as Item[]).map(i=>({...i,content:{...i.content,author:authors.get(i.content.author_id),profiles:authors.get(i.content.author_id)}})),total:data.total})}catch{if(active)setError(true)}finally{if(active)setLoading(false)}}
 if(uid&&mediaReady)void load();else{setState({items:[],total:0});setLoading(false)}return()=>{active=false}
 },[kind,query,page,retry,uid,mediaReady])
 if(loading)return <p role="status">{de?'Beiträge werden geladen…':'Chargement du fil…'}</p>
 if(error)return <div role="alert"><p>{de?'Der Feed ist momentan nicht verfügbar.':'Le fil est momentanément indisponible.'}</p><button onClick={()=>setRetry(n=>n+1)}>{de?'Erneut versuchen':'Réessayer'}</button></div>
 return <><p className="community-meta" aria-live="polite">{state.total} {de?'Beiträge':'éléments'}</p>{!state.items.length?<div className="an-empty"><h2>{de?'Noch keine Beiträge':'Aucune publication pour le moment'}</h2></div>:<div className="community-grid">{state.items.map(item=>item.kind==='annonce'?<div key={'a'+item.id}>{renderAnnonce(item.content)}</div>:<PublicationCard key={'p'+item.id} post={item.content} onDeleted={()=>setRetry(n=>n+1)}/>)}</div>}{state.total>24&&<nav className="community-pagination" aria-label={de?'Feed-Seiten':'Pages du fil'}><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>{de?'Zurück':'Précédent'}</button><span>{page+1} / {Math.ceil(state.total/24)}</span><button disabled={(page+1)*24>=state.total} onClick={()=>setPage(p=>p+1)}>{de?'Weiter':'Suivant'}</button></nav>}</>
}
