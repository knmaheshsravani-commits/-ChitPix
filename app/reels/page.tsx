"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ReelsPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [photo, setPhoto] = useState("")
  const [liked, setLiked] = useState<{[key:number]:boolean}>({})

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved) setPosts(JSON.parse(saved))
    const p = localStorage.getItem("chitpix_profile_photo"); if(p) setPhoto(p)
  },[])

  return (
    <div className="w-full bg-black flex flex-col" style={{height:"100vh", height:"100dvh", overflow:"hidden"}}>
      <div className="flex justify-between items-center px-4 py-3 text-white shrink-0">
        <h1 className="font-bold text-lg">Reels</h1>
        <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-white text-black flex items-center justify-center font-bold">{photo? <img src={photo} className="w-full h-full object-cover"/> : "M"}</Link>
      </div>

      <div className="flex-1 overflow-y-auto snap-y snap-mandatory" style={{WebkitOverflowScrolling:"touch" as any}}>
        {posts.length>0? posts.map((p,i)=>(
          <div key={i} className="w-full h-full snap-start relative flex items-center justify-center bg-black" style={{minHeight:"100%"}}>
            <img src={p.image} className="w-full h-full object-contain max-h-[80vh]" />

            {/* Right side actions */}
            <div className="absolute right-3 bottom-20 flex flex-col gap-6 items-center">
              <button onClick={()=>setLiked({...liked, [i]:!liked[i]})} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">{liked[i]? "❤️" : "🤍"}</div>
                <span className="text-white text-xs mt-1">{(p.likes||0) + (liked[i]?1:0)}</span>
              </button>
              <button className="flex flex-col items-center"><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">💬</div><span className="text-white text-xs mt-1">0</span></button>
              <button className="flex flex-col items-center"><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✈️</div></button>
              <button className="flex flex-col items-center"><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">⋯</div></button>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden mt-2">{photo? <img src={photo} className="w-full h-full object-cover"/> : <div className="bg-white w-full h-full"/>}</div>
            </div>

            {/* Bottom info */}
            <div className="absolute left-3 bottom-20 right-16 text-white">
              <p className="font-bold text-sm">@Knmahesh</p>
              <p className="text-sm mt-1">{p.caption || "My ChitPix Reel ✨"}</p>
              <p className="text-xs mt-2 flex items-center gap-1">♫ Original audio</p>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-white">
            <p className="text-5xl">🎬</p><p className="mt-3 font-bold">No Reels Yet</p><p className="text-sm text-gray-300 mt-1">Create first reel from home</p><Link href="/" className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold text-sm">Go Home</Link>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t shrink-0">
        <div className="max-w-md mx-auto flex justify-between items-center px-2 py-2">
          <Link href="/" className="w-11 h-11 flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg></Link>
          <Link href="/reels" className="bg-gray-100 px-6 py-2 rounded-full flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="black"><rect x="2" y="2" width="20" height="20" rx="4"/><polygon points="10 8 16 12 10 16 10 8" fill="white"/></svg></Link>
          <Link href="/" className="w-11 h-11 flex items-center justify-center relative"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></Link>
          <Link href="/search" className="w-11 h-11 flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></Link>
          <Link href="/profile" className="w-11 h-11 flex items-center justify-center relative"><div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">{photo? <img src={photo} className="w-full h-full object-cover"/> : "M"}</div></Link>
        </div>
      </div>
    </div>
  )
}
