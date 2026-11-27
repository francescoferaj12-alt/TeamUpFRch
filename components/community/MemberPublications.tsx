'use client'
import {useEffect,useState} from 'react'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {supabase} from '../../lib/supabase'
import {CommunityPost} from '../../lib/community'
import PublicationCard from './PublicationCard'
export default function MemberPublications({memberId}:{memberId:string}){
 const {session,mediaReady}=useAuth(),{lang}=useLang(),de=lang==='de';const uid=session?.user.id;const [posts,setPosts]=useState<CommunityPost[]>([]),[page,setPage]=useState(0),[total,setTotal]=useState(0),[error,setError]=useState(false),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0)
 useEffect(()=>{let active=true;setError(false);setLoading(true);async function load(){try{const p=await supabase.from('community_posts').select('*',{count:'exact'}).eq('author_id',memberId).order('created_at',{ascending:false}).order('id',{ascending:false}).range(page*6,page*6+5);if(p.error)throw Error();const a=await supabase.from('public_profiles').select('id,role,first_name,last_name,club_name,avatar_url').eq('id',memberId).maybeSingle();if(a.error)throw Error();if(active){setPosts((p.data||[]).map(post=>({...post,author:a.data||undefined})));setTotal(p.count||0)}}catch{if(active)setError(true)}finally{if(active)setLoading(false)}}if(uid&&mediaReady)void load();else{setPosts([]);setLoading(false)}return()=>{active=false}},[memberId,uid,mediaReady,page,retry])
 return <section style={{margin:'30px 0'}}><h2>{de?'Veröffentlichungen':'Publications'}</h2>{loading?<p role="status">{de?'Wird geladen…':'Chargement…'}</p>:error?<p role="alert">{de?'Beiträge nicht verfügbar.':'Publications indisponibles.'} <button onClick={()=>setRetry(n=>n+1)}>{de?'Erneut versuchen':'Réessayer'}</button></p>:posts.length?<div className="community-grid">{posts.map(post=><PublicationCard key={post.id} post={post} onDeleted={()=>setRetry(n=>n+1)}/>)}</div>:<p>{de?'Noch keine Veröffentlichungen.':'Aucune publication pour le moment.'}</p>}{total>6&&<nav className="community-pagination"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>{de?'Zurück':'Précédent'}</button><span>{page+1}/{Math.ceil(total/6)}</span><button disabled={(page+1)*6>=total} onClick={()=>setPage(p=>p+1)}>{de?'Weiter':'Suivant'}</button></nav>}</section>
}
