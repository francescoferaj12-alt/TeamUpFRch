'use client'
import {useEffect,useState} from 'react'
import {useParams} from 'next/navigation'
import Link from 'next/link'
import {supabase,Annonce} from '../../../lib/supabase'
import {useAuth} from '../../../lib/auth-context'
import {useLang} from '../../../lib/lang-context'
export default function AnnoncePage(){
 const {id}=useParams<{id:string}>(),{session}=useAuth(),{lang}=useLang(),de=lang==='de'
 const uid=session?.user.id
 const [annonce,setAnnonce]=useState<Annonce|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false),[retry,setRetry]=useState(0),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{let active=true;setLoading(true);setSent(false);setAnnonce(null);async function load(){const r=await supabase.rpc('browse_community_feed',{p_kind:'annonce',p_id:id});if(active){setError(!!r.error);setAnnonce(r.data?.items?.[0]?.content||null);setLoading(false)}}if(uid)void load();else setLoading(false);return()=>{active=false}},[id,uid,retry])
 async function apply(event:React.FormEvent){event.preventDefault();if(!session||busy||sent)return;setBusy(true);setError(false);try{const r=await fetch('/api/applications/create',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({annonce_id:id,message})});if(!r.ok)throw Error();setSent(true)}catch{setError(true)}finally{setBusy(false)}}
 return <div className="community-page"><Link href="/annonces">← {de?'Zum Feed':'Retour au fil'}</Link>{error&&<p role="alert">{de?'Aktion fehlgeschlagen.':'Action impossible.'} <button onClick={()=>setRetry(n=>n+1)}>{de?'Erneut versuchen':'Réessayer'}</button></p>}{loading?<p role="status">{de?'Wird geladen…':'Chargement…'}</p>:!annonce?<p>{de?'Diese Anzeige ist nicht mehr verfügbar.':'Cette annonce n’est plus disponible.'}</p>:<article className="community-card"><p>{de?'Anzeige':'Annonce'}</p><Link href={`/profil/${annonce.author_id}`}>{annonce.author_name}</Link><h1>{annonce.title}</h1><p className="community-body">{annonce.body}</p><Link href={`/messages?partner=${annonce.author_id}`}>{de?'Nachricht senden':'Envoyer un message'}</Link>{session?.user.id!==annonce.author_id&&(sent?<p role="status">{de?'Bewerbung gesendet.':'Candidature envoyée.'}</p>:<form onSubmit={apply} className="community-composer"><label>{de?'Deine Bewerbung':'Ta candidature'}<textarea value={message} maxLength={2000} required onChange={e=>setMessage(e.target.value)} disabled={busy}/></label><button className="btn btn-red" disabled={busy}>{busy?'…':de?'Bewerben':'Postuler'}</button></form>)}</article>}</div>
}
