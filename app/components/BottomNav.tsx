'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function BottomNav(){
  const path = usePathname()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e:any)=>{
    const file = e.target.files?.[0]
    if(!file) return

    if(file.size > 100*1024*1024){
      alert("Max 100MB")
      return
    }

    setUploading(true)
    try{
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", file.type.startsWith("video/")? "reels" : "posts")
      formData.append("caption", file.type.startsWith("video/")? "New Reel #chitpix" : "New Post #chitpix")

      const storedUser = typeof window!== 'undefined'? localStorage.getItem("username") : null
      formData.append("username", storedUser || "Knmahesh")

      const res = await fetch("/api/upload",{method:"POST", body:formData})
      const data = await res.json()

      if(!res.ok) throw new Error(data.error || "Upload failed")

      console.log("R2 URL:", data.image_url || data.video_url)

      if(file.type.startsWith("video/")) router.push("/reels")
      else router.push("/")

      setTimeout(()=>window.location.reload(), 500)

    }catch(err:any){
      alert("Upload failed: "+err.message)
      console.error(err)
    }
    setUploading(false)
    if(fileRef.current) fileRef.current.value=""
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 z-[100]">
      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
      <div className="max-w-[470px] mx-auto h-[50px] flex justify-around items-center px-2">
        <Link href="/" className="flex-1 flex justify-center py-2">
          {path==='/'? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><path d="M12 2.5L2 12.5h3v8h6v-6h2v6h6v-8h3L12 2.5z"/></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><path d="M12 2.5L2 12.5h3v8h6v-6h2v6h6v-8h3L12 2.5z"/></svg>
          )}
        </Link>
        <Link href="/search" className="flex-1 flex justify-center py-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={path==='/search'? "2.6" : "1.7"}><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
        </Link>
        <div className="flex-1 flex justify-center py-2">
          <button onClick={()=>fileRef.current?.click()} className="active:scale-90 transition-transform">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><rect x="2" y="2" width="20" height="20" rx="6"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
        </div>
        <Link href="/reels" className="flex-1 flex justify-center py-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill={path==='/reels'? "white" : "none"} stroke="white" strokeWidth="1.7"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill={path==='/reels'? "black" : "white"}/></svg>
        </Link>
        <Link href="/profile" className="flex-1 flex justify-center py-2">
          <div className={`w-[26px] h-[26px] rounded-full bg-white text-black flex items-center justify-center text-[12px] font-bold ${path==='/profile'? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}>M</div>
        </Link>
      </div>
      {uploading && (
        <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-[12px] font-bold shadow-lg">Uploading to R2...</div>
      )}
    </div>
  )
}
