'use client'

import { useRef, useState, ChangeEvent } from 'react'
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
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration) }
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read duration')) }
    video.src = url
  })
}

export default function VideoUploadInput({ value, onChange, placeholder, profileId, index, inpSt, otherDurations, onDurationChange, lang }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { alert('Seuls les fichiers vidéo sont acceptés'); return }
    if (file.size > 200 * 1024 * 1024) { alert('Max 200 MB'); return }

    // Duration check — YouTube links are exempt, only applies to file uploads
    if (onDurationChange !== undefined || (otherDurations && otherDurations.length > 0)) {
      let duration = 0
      try { duration = await getVideoDuration(file) } catch { /* fail open if unreadable */ }
      const othersSum = (otherDurations || []).reduce((a, b) => a + b, 0)
      if (duration + othersSum > 900) {
        const om = Math.floor(othersSum / 60), os = Math.round(othersSum % 60)
        const tm = Math.floor(duration / 60)
        const msg = lang === 'de'
          ? `Maximale Gesamtdauer 15 Min. Aktuelle Videos: ${om} Min ${os} s. Dieses Video: ${tm} Min. Hinzufügen nicht möglich.`
          : `Durée totale max 15 min. Vidéos actuelles: ${om} min ${os} s. Cette vidéo: ${tm} min. Impossible d'ajouter.`
        alert(msg)
        e.target.value = ''
        return
      }
      onDurationChange?.(duration)
    }

    setUploading(true)
    setProgress(0)
    e.target.value = ''

    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4'
    const path = `${profileId}/video_${index}.${ext}`

    // Supabase JS doesn't expose upload progress natively — fake it smoothly
    let fakeP = 0
    const fakeInterval = setInterval(() => {
      fakeP = Math.min(fakeP + Math.random() * 12, 88)
      setProgress(Math.round(fakeP))
    }, 300)

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(path, file, { upsert: true, contentType: file.type })

    clearInterval(fakeInterval)

    if (error) {
      alert('Erreur upload: ' + error.message)
      onDurationChange?.(null)
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(100)
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(data.path)
    onChange(urlData.publicUrl + '?t=' + Date.now())
    setTimeout(() => { setUploading(false); setProgress(0) }, 600)
  }

  const isVideo = value && !value.includes('youtube') && !value.includes('youtu.be')

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{ ...inpSt, flex: 1 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Choisir depuis la galerie"
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
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4, lineHeight: 1.4 }}>
        {lang === 'de'
          ? 'Video-Upload: max. 15 Min. insgesamt. YouTube-Link: unbegrenzt.'
          : 'Vidéo importée : 15 min max au total. Lien YouTube : illimité.'}
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
            muted
            style={{ width: '100%', maxHeight: 80, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22 }}>▶</span>
          </div>
          <button
            type="button"
            onClick={() => { onChange(''); onDurationChange?.(null) }}
            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
