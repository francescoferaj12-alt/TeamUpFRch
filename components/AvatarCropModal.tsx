'use client'

import Cropper from 'react-easy-crop'
import { useState, useCallback, useRef } from 'react'
import 'react-easy-crop/react-easy-crop.css'

interface CropArea { x: number; y: number; width: number; height: number }

async function getCroppedBlob(imageSrc: string, pixelCrop: CropArea): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  // Circular clip
  ctx.beginPath()
  ctx.arc(pixelCrop.width / 2, pixelCrop.height / 2, pixelCrop.width / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/jpeg', 0.92))
}

interface Props {
  src: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
  uploading: boolean
}

export default function AvatarCropModal({ src, onConfirm, onCancel, uploading }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null)

  const onCropComplete = useCallback((_: unknown, pixels: CropArea) => {
    setCroppedArea(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    const blob = await getCroppedBlob(src, croppedArea)
    onConfirm(blob)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0' }}>
          Annuler
        </button>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#fff', letterSpacing: 1 }}>
          Modifier la photo
        </span>
        <button
          onClick={handleConfirm}
          disabled={uploading}
          style={{ background: '#e63946', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', padding: '7px 18px', borderRadius: 8, opacity: uploading ? 0.7 : 1 }}
        >
          {uploading ? '…' : 'Appliquer'}
        </button>
      </div>

      {/* Crop area */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, height: 380, borderRadius: 16, overflow: 'hidden', background: '#000' }}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: 16 },
            mediaStyle: {},
            cropAreaStyle: { border: '3px solid #e63946', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div style={{ width: '100%', maxWidth: 480, padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 16, color: 'rgba(255,255,255,.5)' }}>🔍</span>
        <input
          type="range"
          min={1} max={3} step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#e63946', cursor: 'pointer' }}
        />
        <span style={{ fontSize: 18, color: 'rgba(255,255,255,.5)' }}>🔍</span>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>
        Pince ou glisse pour recadrer
      </p>
    </div>
  )
}
