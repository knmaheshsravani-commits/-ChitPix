"use client"
import { useState } from 'react'

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da628304e5e65.r2.dev"

async function uploadToR2(file: File, folder: string) {
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
  const res = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileType: file.type }),
  })
  if (!res.ok) throw new Error("presign failed")
  const { url } = await res.json()
  await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
  return `${R2_PUBLIC_URL}/${fileName}`
}

// ChitPix Custom New Icons
const IHome = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5L2 12.5V21h7v-6h6v6h7v-8.5L12 2.5z"/></svg>
const ISearch = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M16 16l4 4"/></svg>
const IAdd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
const IHeart = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20s-6-4-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5-6 9-6 9z"/></svg>
const IUser = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>

export default function HomePage() {
  const [up, setUp] = useState(false)
  const [url, setUrl] = useState('')

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUp(true)
    try {
      const uploaded = await uploadToR2(file, 'posts')
      setUrl(uploaded)
      await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploaded, caption: 'New Pix' })
      })
    } catch (err) { console.error(err) }
    setUp(false)
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white max-w-[430px] mx-auto pb-28">
      <header className="sticky top-0 z-20 bg-[#080b14]/80 backdrop-blur-xl p-4 flex justify-between border-b border-blue-500/10">
        <h1 className="text-[26px] font-black">Chit<span className="text-blue-500">Pix</span></h1>
        <span className="text-xs text-white/50">R2 Connected</span>
      </header>

      <div className="p-4">
        {up && <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-400">Uploading to R2...</div>}
        {url && <img src={url} className="mt-3 rounded-2xl w-full" alt="uploaded" />}
        <div className="mt-6 grid grid-cols-3 gap-2 opacity-30">
          <div className="h-24 bg-white/10 rounded-xl"></div>
          <div className="h-24 bg-white/10 rounded-xl"></div>
          <div className="h-24 bg-white/10 rounded-xl"></div>
        </div>
      </div>

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-[64px] bg-[#121725]/90 backdrop-blur-2xl rounded-full border border-blue-500/20 flex items-center justify-around">
        <button className="text-blue-500"><IHome/></button>
        <button className="text-white/40"><ISearch/></button>
        <label className="w-[48px] h-[48px] bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#3b82f6] cursor-pointer">
          <IAdd/>
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </label>
        <button className="text-white/40"><IHeart/></button>
        <button className="text-white/40"><IUser/></button>
      </nav>
    </div>
  )
}
