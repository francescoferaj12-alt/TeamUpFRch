'use client'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import PostModal from '../../components/PostModal'
import PublicationComposer from '../../components/community/PublicationComposer'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
export default function PublishPage(){const router=useRouter(),{session,profile,authLoading}=useAuth(),{lang}=useLang(),de=lang==='de';const [kind,setKind]=useState<'annonce'|'publication'|null>(null)
 useEffect(()=>{if(!authLoading&&!session)router.replace('/login?redirect=%2Fpublier')},[authLoading,session,router])
 return <div className="community-page"><h1>{de?'Was möchtest du teilen?':'Que souhaites-tu publier ?'}</h1>{!profile||!session?<p role="status">{de?'Wird geladen…':'Chargement…'}</p>:kind==='annonce'?<PostModal profile={profile} onClose={()=>setKind(null)} onSuccess={()=>router.replace('/annonces')}/>:kind==='publication'?<PublicationComposer onCancel={()=>setKind(null)}/>:<div className="community-choice"><button onClick={()=>setKind('annonce')}><strong>{de?'Eine Anzeige veröffentlichen':'Publier une annonce'}</strong><span>{de?'Spieler, Trainer oder Verein suchen.':'Rechercher un joueur, un coach ou un club.'}</span></button><button onClick={()=>setKind('publication')}><strong>{de?'Ein Foto oder Video teilen':'Partager une photo ou une vidéo'}</strong><span>{de?'Ein Tor, ein Spiel oder das Leben deines Teams.':'Un but, un match ou la vie de ton équipe.'}</span></button></div>}</div>
}
