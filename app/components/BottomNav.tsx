'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleShare = () => {
    fileInputRef.current?.click() // Direct camera/gallery open
  }

  return (
    <>
      <input type="file" ref={fileInputRef} accept="image/*,video/*" capture="environment" hidden onChange={(e) => {
        const file = e.target.files?.[0]
        if(file) router.push(`/create?file=${file.name}`)
      }} />
      <div className="bottom-nav">
        <button onClick={() => router.push('/')}>🏠 Home</button>
        <button onClick={() => router.push('/search')}>🔍 Search</button>
        <button onClick={handleShare}>➕ Share</button>
        <button onClick={() => router.push('/reels')}>🎬 Reels</button>
        <button onClick={() => router.push('/profile')}>👤 Profile</button>
      </div>
    </>
  )
}
