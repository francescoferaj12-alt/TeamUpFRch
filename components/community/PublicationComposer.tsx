'use client'
import {useEffect,useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '../../lib/supabase'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {communityFileError} from '../../lib/community'
export default function PublicationComposer({onCancel}:{onCancel:()=>void}){
 const {session}=useAuth(),{lang}=useLang(),router=useRouter(),de=lang==='de'
 const [file,setFile]=useState<File|null>(null),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState('')
 const pending=useRef<string|null>(null)
 useEffect(()=>{if(!file){setPreview('');return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file])
 async function publish(e:React.FormEvent){e.preventDefault();if(!session||!file||busy)return;setBusy(true);setError('');let uploaded=false
 try{
  const issue=communityFileError(file);if(issue)throw Error(issue)
  let upload:Blob=file;const kind=file.type.startsWith('image/')?'image':'video'
  if(kind==='image'){
   const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1920/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);upload=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('image')),'image/jpeg',.85))}finally{bitmap.close()}
  }
  // Retry the same publication ID if a network response was lost.
  const id=pending.current||crypto.randomUUID();pending.current=id
  const path=`${session.user.id}/${id}/${kind==='image'?'photo.jpg':'video.mp4'}`
  const existing=await supabase.from('community_posts').select('id').eq('id',id).maybeSingle()
  if(existing.error)throw Error('request')
  if(existing.data){router.push(`/publications/${id}`);return}
  const result=await supabase.storage.from('community-media').upload(path,upload,{contentType:kind==='image'?'image/jpeg':'video/mp4',upsert:false})
  if(result.error&&result.error.message!=='The resource already exists')throw Error('upload')
  uploaded=true
  const saved=await supabase.from('community_posts').insert({id,body:body.trim(),media_kind:kind,media_path:path}).select('id').single()
  if(saved.error){
   // An uncertain response may already have committed. Never remove its media blindly.
   const check=await supabase.from('community_posts').select('id').eq('id',id).maybeSingle()
   if(!check.error&&!check.data){await supabase.storage.from('community-media').remove([path]);pending.current=null}
   if(!check.data)throw Error(saved.error.code==='23514'?'quota':'request')
  }
  router.push(`/publications/${id}`)
 }catch(e){const code=e instanceof Error?e.message:'';setError(code==='size'?(de?'Die Datei darf höchstens 20 MB gross sein.':'Le fichier doit faire au maximum 20 Mo.'):code==='format'?(de?'Wähle ein JPEG-, PNG-, WebP-Foto oder ein MP4-Video.':'Choisis une photo JPEG, PNG, WebP ou une vidéo MP4.'):code==='quota'?(de?'Maximal 5 Veröffentlichungen pro 24 Stunden.':'Maximum 5 publications sur 24 heures.'):uploaded?(de?'Veröffentlichung nicht bestätigt. Versuche es erneut.':'Publication non confirmée. Réessaie.'): (de?'Upload nicht möglich. Prüfe deine Verbindung oder das verfügbare Speicherkontingent.':'Envoi impossible. Vérifie ta connexion ou le quota de stockage disponible.'))}finally{setBusy(false)}}
 return <form onSubmit={publish} className="community-composer"><h2>{de?'Deinen Fussballmoment teilen':'Partage ton moment de foot'}</h2><p>{de?'Nur für angemeldete Mitglieder sichtbar.':'Visible uniquement par les membres connectés.'}</p><label>{de?'Foto oder Video':'Photo ou vidéo'}<input type="file" required accept="image/jpeg,image/png,image/webp,video/mp4" disabled={busy} onChange={e=>{setFile(e.target.files?.[0]||null);pending.current=null;setError('')}}/></label><small>{de?'JPEG, PNG, WebP oder MP4 · maximal 20 MB · 5 Veröffentlichungen / 24 h':'JPEG, PNG, WebP ou MP4 · 20 Mo maximum · 5 publications / 24 h'}</small>{preview&&(file?.type.startsWith('video/')?<video src={preview} controls playsInline preload="metadata"/>:<img src={preview} alt={de?'Vorschau':'Aperçu'}/>)}<label>{de?'Dein Text':'Ton texte'}<textarea value={body} maxLength={2000} disabled={busy} onChange={e=>setBody(e.target.value)} placeholder={de?'Ein Tor, ein Spiel, ein gemeinsamer Moment…':'Un but, un match, un moment d’équipe…'}/></label><small>{de?'Teile nur Inhalte, die du veröffentlichen darfst.':'Partage uniquement des contenus que tu as le droit de publier.'}</small>{error&&<p role="alert">{error}</p>}<div className="community-actions"><button type="button" disabled={busy} onClick={onCancel}>{de?'Zurück':'Retour'}</button><button className="btn btn-red" disabled={busy||!file}>{busy?(de?'Wird veröffentlicht…':'Publication…'):(de?'Veröffentlichen':'Publier')}</button></div></form>
}
