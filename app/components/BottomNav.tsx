'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Icons } from './NewIcons'

export default function BottomNav(){
  const path = usePathname()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e:any)=>{
    const file = e.target.files?.[0]
    if(!file) return
    if(file.size > 200*1024*1024){
      alert("Max 200MB bro!")
      return
    }
    setUploading(true)
    try{
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", file.type.startsWith("video/")? "reels" : "posts")
      formData.append("caption", file.type.startsWith("video/")? "New Reel #chitpix" : "New Post #chitpix")
      const storedUser = typeof window!== 'undefined'? localStorage.getItem("username") : null
      formData.append("username", storedUser || "knmahesh")

      const res = await fetch("/api/upload",{method:"POST", body:formData})
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || "Upload failed")

      if(file.type.startsWith("video/")) router.push("/reels")
      else router.push("/")
      setTimeout(()=>window.location.reload(), 500)
    }catch(err:any){
      alert("Upload failed: "+err.message)
    }
    setUploading(false)
    if(fileRef.current) fileRef.current.value=""
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 z-[100]">
      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
      <div className="max-w-[470px] mx-auto flex justify-around items-center px-2">
        <Link href="/" className="flex-1 flex justify-center py-3"><Icons.Home active={path==="/"} /></Link>
        <Link href="/search" className="flex-1 flex justify-center py-3"><Icons.Search /></Link>
        <div className="flex-1 flex justify-center py-2">
          <button onClick={()=>fileRef.current?.click()} className="active:scale-90 transition-transform">
            {uploading? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Icons.Create/>}
          </button>
        </div>
        <Link href="/reels" className="flex-1 flex justify-center py-3"><Icons.Reels active={path==="/reels"} /></Link>
        <Link href="/profile" className="flex-1 flex justify-center py-3">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">M</div>
        </Link>
      </div>
    </div>
  )
}
