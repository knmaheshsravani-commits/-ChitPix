"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ReelsPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [photo, setPhoto] = useState("")
  const [liked, setLiked] = useState<any>({})
  const pathname = usePathname()

  useEffect(()=>{
    const s = localStorage.getItem("posts")
    if(s) setPosts(JSON.parse(s))
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
  },[])

  return (
    <div className="w-full bg-black flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 text-white shrink-0">
        <h1 className="font-bold text-lg">Reels</h1>
        <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center font-bold text-black">
          {photo? <img src={photo} alt="" className="w-full h-full object-cover" /> : "M"}
        </Link>
      </div>

      {/* Reels Feed */}
      <div className="flex-1 overflow-y-auto">
        {posts.length>0? posts.map((p:any,i:number)=>(
          <div key={i} className="relative bg-black flex items-center justify-center border-b border-zinc-800" style={{minHeight:"85vh"}}>
            <img src={p.image} alt="" className="w-full object-contain max-h-[70vh]" />
            <div className="absolute right-3 bottom-10 flex flex-col gap-5">
              <button onClick={()=>setLiked({...liked,[i]:!liked[i]})} className="text-white text-center">
                <div className="text-2xl">{liked[i]?"❤️":"🤍"}</div>
                <div className="text-xs">{p.likes||0}</div>
              </button>
              <div className="text-white text-center"><div className="text-2xl">💬</div></div>
              <div className="text-white text-center"><div className="text-2xl">✈️</div></div>
            </div>
            <div className="absolute left-3 bottom-10 text-white">
              <p className="font-bold text-sm">@{p.username}</p>
              <p className="text-sm">{p.caption}</p>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-white">
            <p className="text-5xl">🎬</p>
            <p className="mt-3 font-bold">No Reels Yet</p>
            <Link href="/" className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold text-sm">Go Home</Link>
          </div>
        )}
      </div>

      {/* 2026 NEW 5G BOTTOM NAV */}
      <div className="bg-white border-t shrink-0">
        <div className="max-w-md mx-auto flex justify-between items-center px-4 h-[52px]">
          <Link href="/" className="w-12 h-12 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
          </Link>
          <Link href="/search" className="w-12 h-12 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>
          </Link>
          <Link href="/" className="w-12 h-12 flex items-center justify-center">
            <div className="w-[26px] h-[26px] rounded-lg border-[1.7px] border-black flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </Link>
          <Link href="/reels" className="w-12 h-12 flex items-center justify-center">
            <div className="bg-black rounded-lg px-3 py-1.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="black"/></svg>
            </div>
          </Link>
          <Link href="/profile" className="w-12 h-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <div className="bg-white rounded-full p-[2px] w-full h-full"><div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">{photo? <img src={photo} alt="" className="w-full h-full object-cover" /> : <span className="text-[11px] font-bold">M</span>}</div></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
