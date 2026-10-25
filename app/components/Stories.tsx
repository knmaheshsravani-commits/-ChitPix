// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"

const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p:any){
  let url = p.image_url || p.url || p.image || p.publicUrl || p.key || ""
  if(!url) return ""
  if(url.startsWith("http") && url.includes("r2.dev")) return url
  const file = url.split("/").pop() || ""
  if(url.includes("stories/") || p.type === "story") return `${R2_PUBLIC.replace(/\/$/, '')}/stories/${file}`
  return `${R2_PUBLIC.replace(/\/$/, '')}/posts/${file}`
}

export default function StoriesBar({ onSelectUser, onAdd }: any){
  const [stories, setStories] = useState<any[]>([])
  const [seen, setSeen] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await fetch("/api/stories?limit=100", {cache:"no-store"})
        const data = await res.json()
        const raw = data.stories || data || []
        const grouped:any = {}
        raw.forEach((s:any)=>{
          const u = s.username || s.user || "user"
          if(!grouped[u]) grouped[u] = {username:u, avatar:s.avatar||`https://i.pravatar.cc/100?u=${u}`, stories:[], verified:s.verified||false, isCloseFriend:s.isCloseFriend||false}
          grouped[u].stories.push({...s, image:fixR2Url(s), image_url:fixR2Url(s)})
        })
        setStories(Object.values(grouped))
      }catch(e){ setStories([]) }
    }
    load()
    fetch("/api/story_views", {cache:"no-store"}).then(r=>r.json()).then(d=>setSeen(d.views||{})).catch(()=>{})
  },[])

  const handleAddClick = () => {
    if(onAdd){ onAdd() } else { fileRef.current?.click() }
  }

  const handleFile = async (e:any) => {
    const file = e.target.files?.[0]
    if(!file) return
    setUploading(true)
    try{
      // 1. Get presigned url from your R2 API
      const presignRes = await fetch("/api/r2-presign", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ fileName: `stories/${Date.now()}-${file.name}`, contentType: file.type })
      })
      const { uploadUrl, publicUrl } = await presignRes.json()
      
      // 2. Upload to R2
      await fetch(uploadUrl, { method:"PUT", body: file, headers: {"Content-Type": file.type} })
      
      // 3. Save to DB
      await fetch("/api/stories", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ image_url: publicUrl, image: publicUrl })
      })
      window.location.reload()
    }catch(err){ alert("Story upload failed!") }
    setUploading(false)
  }

  return (
    <div className="w-full bg-white border-b border-zinc-100 py-3 px-2 flex gap-3 overflow-x-auto scrollbar-hide select-none">
      <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleFile} />
      
      {/* 15. Add Story R2 Upload - FIXED - No Google Search */}
      <div onClick={handleAddClick} onTouchStart={(e)=>e.preventDefault()} className="flex flex-col items-center min-w-[66px] cursor-pointer touch-manipulation select-none">
        <div className="w-[66px] h-[66px] rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-2xl">
          {uploading ? "⏳" : "＋"}
        </div>
        <p className="text-[11px] mt-1 select-none">Your Story</p>
        <p className="text-[9px] text-zinc-400 select-none">R2 HD</p>
      </div>

      {stories.map((user:any, i:number)=>{
        const isSeen = seen[user.username]
        const ringClass = user.isCloseFriend ? "p-[2.5px] bg-green-500" : isSeen ? "p-[2.5px] bg-zinc-200" : "p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
        return (
          <div key={i} onClick={()=>onSelectUser(user, i)} className="flex flex-col items-center min-w-[66px] cursor-pointer select-none">
            <div className={`rounded-full ${ringClass}`}>
              <div className="bg-white p-[2px] rounded-full">
                <img src={user.avatar} alt="" className="w-[60px] h-[60px] rounded-full object-cover" />
              </div>
            </div>
            <p className="text-[11px] mt-1 max-w-[66px] truncate flex items-center gap-1 select-none">
              {user.username} {user.verified && "👑"}
            </p>
            <p className="text-[8px] text-zinc-400 select-none">{user.stories.length} • R2</p>
          </div>
        )
      })}
    </div>
  )
}
