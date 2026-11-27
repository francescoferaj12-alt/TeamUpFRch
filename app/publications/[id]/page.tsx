'use client'
import {useEffect,useState} from 'react'
import {useParams} from 'next/navigation'
import Link from 'next/link'
import {supabase} from '../../../lib/supabase'
import {useAuth} from '../../../lib/auth-context'
import {useLang} from '../../../lib/lang-context'
import {CommunityPost} from '../../../lib/community'
import PublicationCard from '../../../components/community/PublicationCard'
export default function PublicationPage(){
 const {id}=useParams<{id:string}>(),{session,mediaReady}=useAuth(),{lang}=useLang(),de=lang==='de'
 const uid=session?.user.id
 const [post,setPost]=useState<CommunityPost|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false),[retry,setRetry]=useState(0)
 useEffect(()=>{let active=true;setLoading(true);setPost(null);setError(false);async function load(){try{const p=await supabase.from('community_posts').select('*').eq('id',id).maybeSingle();if(p.error)throw Error();if(p.data){const a=await supabase.from('public_profiles').select('id,role,first_name,last_name,club_name,avatar_url').eq('id',p.data.author_id).maybeSingle();if(a.error)throw Error();if(active)setPost({...p.data,author:a.data||undefined})}}catch{if(active)setError(true)}finally{if(active)setLoading(false)}}if(uid&&mediaReady)void load();else setLoading(false);return()=>{active=false}},[id,uid,mediaReady,retry])
 return <div className="community-page"><Link href="/annonces">← {de?'Zum Feed':'Retour au fil'}</Link>{loading?<p role="status">{de?'Wird geladen…':'Chargement…'}</p>:error?<div role="alert"><p>{de?'Laden fehlgeschlagen.':'Impossible de charger la publication.'}</p><button onClick={()=>setRetry(n=>n+1)}>{de?'Erneut versuchen':'Réessayer'}</button></div>:post?<PublicationCard post={post}/>:<p>{de?'Diese Veröffentlichung ist nicht verfügbar.':'Cette publication n’est plus disponible.'}</p>}</div>
}
