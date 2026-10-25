// @ts-nocheck
"use client"
import { useState, useEffect } from "react"

const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p:any){
  let url = p.image_url || p.url || p.image || p.publicUrl || p.key || ""
  if(!url) return ""
  if(url.startsWith("http") && url.includes("r2.dev")) return url
  const file = url.split("/").pop() || ""
  if(url.includes("highlights/") || url.includes("stories/")) return `${R2_PUBLIC.replace(/\/$/, '')}/stories/${file}`
  return `${R2_PUBLIC.replace(/\/$/, '')}/posts/${file}`
}

export default function Highlights({ username="knmahesh", onSelect }: any){
  const [highlights, setHighlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await fetch(`/api/highlights?username=${username}`, {cache:"no-store"})
        const data = await res.json()
        const raw = data.highlights || data || []
        // Fallback demo if R2 empty - so profile looks Instagram like
        const final = raw.length>0 ? raw : [
          {id:1, title:"Maggam", cover:"https://i.pravatar.cc/100?img=1", stories:[{image:"https://i.pravatar.cc/400?img=1", price:350}], count:12},
          {id:2, title:"Aari", cover:"https://i.pravatar.cc/100?img=2", stories:[{image:"https://i.pravatar.cc/400?img=2", price:500}], count:8},
          {id:3, title:"350", cover:"https://i.pravatar.cc/100?img=3", stories:[{image:"https://i.pravatar.cc/400?img=3", price:350}], count:15},
          {id:4, title:"Kadur", cover:"https://i.pravatar.cc/100?img=4", stories:[{image:"https://i.pravatar.cc/400?img=4", price:800}], count:5},
        ]
        const fixed = final.map((h:any)=>({
          ...h,
          cover: h.cover_url ? fixR2Url({url:h.cover_url}) : h.cover?.startsWith("http") ? h.cover : fixR2Url(h),
          stories: (h.stories||[]).map((s:any)=>({...s, image:fixR2Url(s)}))
        }))
        setHighlights(fixed)
      }catch(e){ setHighlights([]) }
      finally{ setLoading(false) }
    }
    load()
  },[username])

  if(loading) return <div className="flex gap-3 p-3"><div className="w-[60px] h-[60px] rounded-full bg-zinc-100 animate-pulse" /></div>

  return (
    <div className="w-full bg-white py-2">
      <div className="flex gap-4 overflow-x-auto px-3 pb-2 scrollbar-hide">
        {/* 4. + New Highlight */}
        <div className="flex flex-col items-center min-w-[64px] cursor-pointer" onClick={()=>alert("Add Highlight - R2 upload coming! Use /api/highlights POST")}>
          <div className="w-[60px] h-[60px] rounded-full border border-zinc-300 flex items-center justify-center bg-zinc-50 text-[28px]">＋</div>
          <p className="text-[11px] mt-1">New</p>
          <p className="text-[8px] text-zinc-400">R2</p>
        </div>

        {highlights.map((h:any,i:number)=>(
          <div key={h.id||i} onClick={()=>onSelect && onSelect(h, i)} className="flex flex-col items-center min-w-[64px] cursor-pointer group">
            <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-zinc-200 group-hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="bg-white p-[2px] rounded-full">
                <img src={h.cover} alt={h.title} className="w-[52px] h-[52px] rounded-full object-cover" />
              </div>
            </div>
            <p className="text-[11px] mt-1 max-w-[64px] truncate font-medium">{h.title}</p>
            <p className="text-[8px] text-zinc-400">{h.count||h.stories?.length||0} • R2</p>
          </div>
        ))}
      </div>
      <div className="px-3 mt-1">
        <p className="text-[9px] text-zinc-400">20 Futures • R2 highlights.json • Tap to view • Long press edit • ₹ tag • WA</p>
      </div>
    </div>
  )
}
