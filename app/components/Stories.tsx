// @ts-nocheck
"use client"
import { useState, useEffect } from "react"

const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p:any){
  let url = p.image_url || p.url || p.image || p.publicUrl || p.key || ""
  if(!url) return ""
  if(url.startsWith("http") && url.includes("r2.dev")) return url
  const file = url.split("/").pop() || ""
  if(url.includes("stories/")) return `${R2_PUBLIC.replace(/\/$/, '')}/stories/${file}`
  return `${R2_PUBLIC.replace(/\/$/, '')}/posts/${file}`
}

export default function StoriesBar({ onSelectUser, onAdd }: any){
  const [stories, setStories] = useState<any[]>([])
  const [seen, setSeen] = useState<any>({})

  useEffect(()=>{
    // 11. R2 HD Story, 14. View tracking state only - R2
    const load = async ()=>{
      try{
        const res = await fetch("/api/stories?limit=100", {cache:"no-store"})
        const data = await res.json()
        const raw = data.stories || data || []
        const grouped:any = {}
        raw.forEach((s:any)=>{
          const u = s.username || "user"
          if(!grouped[u]) grouped[u] = {username:u, avatar:s.avatar||`https://i.pravatar.cc/100?u=${u}`, stories:[], verified:s.verified||false, isCloseFriend:s.isCloseFriend||false}
          grouped[u].stories.push({...s, image:fixR2Url(s), image_url:fixR2Url(s)})
        })
        setStories(Object.values(grouped))
      }catch(e){ setStories([]) }
    }
    load()
    // Seen from R2 - no localStorage
    fetch("/api/story_views", {cache:"no-store"}).then(r=>r.json()).then(d=>setSeen(d.views||{})).catch(()=>{})
  },[])

  return (
    <div className="w-full bg-white border-b border-zinc-100 py-3 px-2 flex gap-3 overflow-x-auto scrollbar-hide">
      {/* 15. Add Story R2 Upload */}
      <div onClick={onAdd} className="flex flex-col items-center min-w-[66px] cursor-pointer">
        <div className="w-[66px] h-[66px] rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-2xl">＋</div>
        <p className="text-[11px] mt-1">Your Story</p>
        <p className="text-[9px] text-zinc-400">R2 HD</p>
      </div>

      {stories.map((user:any, i:number)=>{
        const isSeen = seen[user.username]
        // 5. Seen/Unseen, 21. Designer Badge, 28. Close Friend Green Ring
        const ringClass = user.isCloseFriend ? "p-[2.5px] bg-green-500" : isSeen ? "p-[2.5px] bg-zinc-200" : "p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
        return (
          <div key={i} onClick={()=>onSelectUser(user, i)} className="flex flex-col items-center min-w-[66px] cursor-pointer">
            <div className={`rounded-full ${ringClass}`}>
              <div className="bg-white p-[2px] rounded-full">
                <img src={user.avatar} alt="" className="w-[60px] h-[60px] rounded-full object-cover" />
              </div>
            </div>
            <p className="text-[11px] mt-1 max-w-[66px] truncate flex items-center gap-1">
              {user.username} {user.verified && "👑"} {user.isCloseFriend && "💚"}
            </p>
            <p className="text-[8px] text-zinc-400">{user.stories.length} • R2</p>
          </div>
        )
      })}
    </div>
  )
}
