'use client'
import {useState} from 'react'
import Link from 'next/link'
import {CommunityPost,communityName} from '../../lib/community'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {relativeTime} from '../../lib/utils/time'
import {avatarSrc} from '../../lib/supabase'
import FollowButton from './FollowButton'
import MemberSafetyActions from '../MemberSafetyActions'
export default function PublicationCard({post,onDeleted}:{post:CommunityPost;onDeleted?:()=>void}){
 const {lang}=useLang(),{session,mediaReady}=useAuth(),de=lang==='de'
 const [play,setPlay]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(false),[deleted,setDeleted]=useState(false)
 const name=communityName(post.author)||(de?'Mitglied':'Membre'),src=`/api/community/media/${post.id}`
 async function remove(){if(!session||!window.confirm(de?'Diese Veröffentlichung und ihre Datei löschen?':'Supprimer cette publication et son fichier ?'))return;setBusy(true);setError(false);try{const r=await fetch(`/api/community/posts/${post.id}`,{method:'DELETE',headers:{Authorization:`Bearer ${session.access_token}`}});if(!r.ok)throw Error();setDeleted(true);onDeleted?.()}catch{setError(true)}finally{setBusy(false)}}
 if(deleted)return <p role="status">{de?'Veröffentlichung gelöscht.':'Publication supprimée.'}</p>
 return <article className="community-card" aria-label={de?`Veröffentlichung von ${name}`:`Publication de ${name}`}><div className="community-author"><Link href={`/profil/${post.author_id}`}>{mediaReady&&post.author?.avatar_url&&<img src={avatarSrc(post.author.avatar_url)!} alt=""/>}<strong>{name}</strong></Link><FollowButton memberId={post.author_id}/></div><div className="community-meta"><span>{de?'Veröffentlichung':'Publication'}</span><time dateTime={post.created_at}>{relativeTime(post.created_at,lang)}</time></div>{post.body&&<p className="community-body">{post.body}</p>}{mediaReady&&(post.media_kind==='image'?<img className="community-photo" src={src} alt={post.body.slice(0,160)||(de?`Foto von ${name}`:`Photo de ${name}`)} loading="lazy" onError={()=>setError(true)}/>:play?<video className="community-video" src={src} controls playsInline preload="none" onError={()=>setError(true)}/>:<button className="community-play" onClick={()=>setPlay(true)} aria-label={de?`Video von ${name} laden`:`Charger la vidéo de ${name}`}><span aria-hidden="true">▶</span>{de?'Video laden':'Charger la vidéo'}</button>)}{error&&<p role="alert">{de?'Aktion oder Datei nicht verfügbar.':'Action ou fichier indisponible.'}</p>}<div className="community-actions"><Link href={`/publications/${post.id}`}>{de?'Öffnen':'Ouvrir'}</Link><Link href={`/messages?partner=${post.author_id}`}>{de?'Nachricht':'Message'}</Link>{session?.user.id===post.author_id?<button onClick={remove} disabled={busy}>{de?'Löschen':'Supprimer'}</button>:<MemberSafetyActions memberId={post.author_id}/>}</div></article>
}
