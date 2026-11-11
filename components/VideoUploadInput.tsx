'use client'

import { useRef, useState, useEffect, ChangeEvent } from 'react'
import { ownedVideoPath, MAX_PROFILE_VIDEO_BYTES, uploadProfileVideo } from '../lib/profile-videos'
import { supabase } from '../lib/supabase'

interface Props {
  value: string
  onChange: (url: string) => void
  placeholder: string
  profileId: string
  index: number
  inpSt: React.CSSProperties
  otherDurations?: number[]
  onDurationChange?: (d: number | null) => void
  lang?: string
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    const timeout=setTimeout(()=>{URL.revokeObjectURL(url);video.src='';reject(new Error('Cannot read duration'))},15000)
    video.onloadedmetadata = () => { clearTimeout(timeout);URL.revokeObjectURL(url); Number.isFinite(video.duration)?resolve(video.duration):reject(new Error('Invalid duration')) }
    video.onerror = () => { clearTimeout(timeout);URL.revokeObjectURL(url); reject(new Error('Cannot read duration')) }
    video.src = url
  })
}

export default function VideoUploadInput({ value, onChange, placeholder, profileId, index, inpSt, otherDurations, onDurationChange, lang }: Props) {
  const mounted=useRef(true)
  const busy=useRef(false)
  const uploadController=useRef<AbortController|null>(null)
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;uploadController.current?.abort()}},[])
  useEffect(()=>{
    if(index!==1)return
    void supabase.auth.getSession().then(({data:{session}})=>{if(session)void fetch('/api/profile/obsolete-videos',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({urls:[],cleanup:true})}).catch(()=>{})})
  },[profileId,index])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const [deleteRequested, setDeleteRequested] = useState<string | null>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || busy.current) return
    if (!file.type.startsWith('video/')) { alert(lang === 'de' ? 'Wähle eine Videodatei aus.' : 'Seuls les fichiers vidéo sont acceptés'); return }
    if (file.size > MAX_PROFILE_VIDEO_BYTES) { alert(lang==='de'?'Maximal 20 MB pro Video. Für grössere Videos kannst du einen YouTube-Link verwenden.':'Maximum 20 Mo par vidéo. Pour une vidéo plus lourde, utilise un lien YouTube.'); return }

    busy.current=true
    let nextDuration:number|null=null
    // Duration check — YouTube links are exempt, only applies to file uploads
    if (onDurationChange !== undefined || (otherDurations && otherDurations.length > 0)) {
      let duration = 0
      try { duration = await getVideoDuration(file) } catch { busy.current=false;alert(lang==='de'?'Dieses Video konnte nicht gelesen werden. Verwende MP4, MOV oder WebM.':'Cette vidéo est illisible. Utilise MP4, MOV ou WebM.');return }
      const othersSum = (otherDurations || []).reduce((a, b) => a + b, 0)
      if (duration + othersSum > 900) {
        const om = Math.floor(othersSum / 60), os = Math.round(othersSum % 60)
        const tm = Math.floor(duration / 60)
        const msg = lang === 'de'
          ? `Maximale Gesamtdauer 15 Min. Aktuelle Videos: ${om} Min ${os} s. Dieses Video: ${tm} Min. Hinzufügen nicht möglich.`
          : `Durée totale max 15 min. Vidéos actuelles: ${om} min ${os} s. Cette vidéo: ${tm} min. Impossible d'ajouter.`
        alert(msg)
        busy.current=false
        e.target.value = ''
        return
      }
      nextDuration=duration
    }

    setUploading(true)
    setProgress(0)
    e.target.value = ''

    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'mp4'
    const path = `${profileId}/video_${index}_${crypto.randomUUID()}.${ext}`

    uploadController.current=new AbortController()
    try {
      const {data:{session}}=await supabase.auth.getSession()
      if(!session)throw new Error('Authentication required')
      await uploadProfileVideo(file,path,session.access_token,percent=>{if(mounted.current)setProgress(percent)},uploadController.current.signal)
    } catch {
      busy.current=false
      if(!mounted.current)return
      alert(lang==='de'?'Upload nicht abgeschlossen. Prüfe deine Verbindung und den verfügbaren Videospeicher. Dein bisheriges Video bleibt erhalten.':'Envoi non terminé. Vérifie ta connexion et ton espace vidéo disponible. Ta vidéo précédente est conservée.')
      setUploading(false);setProgress(0);return
    }
    busy.current=false
    if(!mounted.current)return
    setProgress(100)
    if(nextDuration!==null)onDurationChange?.(nextDuration)
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path)
    onChange(urlData.publicUrl + '?t=' + Date.now())
    setTimeout(() => { if(mounted.current){setUploading(false);setProgress(0)} }, 600)
  }

  const isUploaded = Boolean(ownedVideoPath(value, profileId, process.env.NEXT_PUBLIC_SUPABASE_URL || ''))
  const removeLabel = isUploaded
    ? (lang === 'de' ? 'Video endgültig löschen' : 'Supprimer définitivement la vidéo')
    : (lang === 'de' ? 'Video vom Profil entfernen' : 'Retirer la vidéo du profil')
  const isVideo = value && !value.includes('youtube') && !value.includes('youtu.be')

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{ ...inpSt, flex: 1 }}
          disabled={uploading}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label={lang === 'de' ? 'Video aus der Galerie auswählen' : 'Choisir une vidéo dans la galerie'}
          style={{
            flexShrink: 0, width: 40, height: 40,
            background: uploading ? 'rgba(255,58,58,.15)' : 'rgba(255,255,255,.08)',
            border: '1.5px solid rgba(255,255,255,.15)',
            borderRadius: 9, cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, transition: 'all .2s',
          }}
        >
          {uploading ? '⏳' : '📱'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Duration hint */}
      <div style={{ fontSize: 12, color:'#c7d1e3', marginTop: 4, lineHeight: 1.4 }}>
        {lang === 'de'
          ? 'Max. 20 MB pro Video, 3 Videos und 15 Min. insgesamt. Grössere Videos: YouTube-Link.'
          : 'Max. 20 Mo par vidéo, 3 vidéos et 15 min au total. Vidéos plus lourdes : lien YouTube.'}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg, #FF3A3A, #FF3A3A)',
            width: `${progress}%`, transition: 'width .3s ease',
          }} />
        </div>
      )}

      {/* Mini video preview once uploaded */}
      {isVideo && !uploading && (
        <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', background: '#000', position: 'relative', maxHeight: 80 }}>
          <video
            src={value}
            preload="none"
            playsInline
            muted
            style={{ width: '100%', maxHeight: 80, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22 }}>▶</span>
          </div>
          <button
            type="button"
            aria-label={removeLabel}
            title={removeLabel}
            onClick={() => {
              if (isUploaded) setDeleteRequested(value)
              else {
                onChange('')
                onDurationChange?.(null)
              }
            }}
            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
      )}
      {deleteRequested !== null && deleteRequested === value && (
        <div style={{ marginTop: 8, display: 'grid', gap: 8, fontSize: 13 }}>
          <span>{lang === 'de'
            ? 'Das Video wird nach dem Speichern endgültig gelöscht.'
            : 'La vidéo sera définitivement supprimée après l’enregistrement.'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => {
              setDeleteRequested(null)
              onChange('')
              onDurationChange?.(null)
            }}>{lang === 'de' ? 'Löschen bestätigen' : 'Confirmer la suppression'}</button>
            <button type="button" onClick={() => setDeleteRequested(null)}>
              {lang === 'de' ? 'Abbrechen' : 'Annuler'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
