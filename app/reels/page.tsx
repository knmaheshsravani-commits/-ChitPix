"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [followed, setFollowed] = useState<any>({})
  const [heart, setHeart] = useState<number | null>(null)

  useEffect(()=>{
    const savedPosts = localStorage.getItem("posts")
    let posts = savedPosts? JSON.parse(savedPosts) : []
    if(posts.length===0){
      posts = [
        {id:1, image:"https://i.imgur.com/8Km9tLL.png", username:"Knmahesh", caption:"Knmahesh... My M logo 🔥", music:"Original audio", likes:4, comments:2, reposts:2, shares:4, saves:0},
        {id:2, image:"https://picsum.photos/600/800?random=10", username:"Knmahesh", caption:"ChitPix edit", music:"Original audio", likes:120, comments:10, reposts:5, shares:20, saves:15},
      ]
    }
    setReels(posts)
  },[])

  const like = (id:number, double=false)=>{
    const newLiked =!liked[id]
    setLiked((p:any)=>({...p, [id]:newLiked}))
    if(double && newLiked){
      setHeart(id)
      setTimeout(()=>setHeart(null), 800)
    }
  }

  return (
    <div className="w-full h-[100dvh] bg-white relative overflow-hidden">
      {/* TOP */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/20 to-transparent">
        <span className="text-black text-[22px] font-light">+</span>
        <span className="bg-blue-200 px-2 py-0.5 font-bold text-[17px]">Reels</span>
        <span className="text-[16px]">⌄</span>
        <span className="text-black/50 ml-4 text-[17px]">Friends</span>
        <div className="ml-auto w-8 h-8 rounded-full bg-gray-200"></div>
      </div>

      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {reels.map((reel)=>(
          <div key={reel.id} className="w-full h-[100dvh] snap-start relative bg-white flex items-center justify-center">
            {/* FULL SCREEN M LOGO */}
            <div className="relative w-full h-full bg-white flex items-center justify-center" onDoubleClick={()=>like(reel.id, true)}>
              <img src={reel.image} alt="" className="w-full h-full object-contain" />

              {heart===reel.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[90px] animate-ping">❤️</span>
                </div>
              )}

              {/* RIGHT 5 ICONS - WITH SHADOW FOR WHITE BG */}
              <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
                <button onClick={()=>like(reel.id)} className="flex flex-col items-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={liked[reel.id]? "#ff3040" : "none"} stroke={liked[reel.id]? "#ff3040" : "black"} strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span className="text-black text-[12px] font-bold mt-1">{reel.likes || ''}</span>
                </button>

                <Link href={`/post/${reel.id}`} className="flex flex-col items-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-black text-[12px] font-bold mt-1">{reel.comments || ''}</span>
                </Link>

                <button className="flex flex-col items-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  <span className="text-black text-[12px] font-bold mt-1"></span>
                </button>

                <button onClick={()=>{
                  localStorage.setItem("chitpix_shared_post", JSON.stringify(reel))
                  window.location.href="/messages"
                }} className="flex flex-col items-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-black text-[13px] font-bold mt-1">{reel.shares || 4}</span>
                </button>

                <button onClick={()=>setSaved((p:any)=>({...p, [reel.id]:!p[reel.id]}))} className="flex flex-col items-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[reel.id]? "black" : "none"} stroke="black" strokeWidth="1.6"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-black text-[13px] font-bold mt-1">{reel.saves?? 0}</span>
                </button>

                <div className="w-7 h-7 rounded-[6px] bg-gradient-to-br from-pink-500 to-yellow-400 border border-black/10 mt-2"></div>
              </div>

              {/* BOTTOM LEFT - EXACT LIKE YOUR SCREENSHOT */}
              <div className="absolute left-3 bottom-20 right-16">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border flex items-center justify-center font-bold text-[14px]">K</div>
                  <span className="font-bold text-[14px] text-black">Knmahesh...</span>
                  <button onClick={()=>setFollowed((p:any)=>({...p, [reel.id]:!p[reel.id]}))} className={`ml-2 px-4 py-1 rounded-full border border-black text-[13px] font-bold ${followed[reel.id]? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {followed[reel.id]? 'Following' : 'Follow'}
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1 text-black text-[13px]">
                  <span className="text-[12px]">↗</span> {reel.music}
                </div>
                <p className="text-black text-[14px] mt-1">{reel.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2 max-w-md mx-auto">
          <Link href="/" className="p-2">🏠</Link>
          <div className="p-2 bg-black rounded-full text-white">▶️</div>
          <Link href="/messages" className="p-2">✈️</Link>
          <Link href="/search" className="p-2">🔍</Link>
          <Link href="/profile" className="p-2 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px]">M</Link>
        </div>
      </div>
    </div>
  )
}
