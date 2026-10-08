"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import BottomNav from "../components/BottomNav"

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [followed, setFollowed] = useState<any>({})
  const [showHeart, setShowHeart] = useState<number | null>(null)
  const [showComments, setShowComments] = useState<number | null>(null)
  const videoRefs = useRef<any>({})

  useEffect(()=>{
    const savedPosts = localStorage.getItem("posts")
    let posts = savedPosts? JSON.parse(savedPosts) : []
    if(posts.length===0){
      posts = [
        {id:1, image:"https://picsum.photos/600/800?random=1", username:"zepto_rider_", caption:"Single boy s life 😔❤️", music:"Sunaad Gowtham • Original", likes:5222, comments:48, reposts:40, shares:263, saves:131, avatar:""},
        {id:2, image:"https://picsum.photos/600/800?random=2", username:"Knmahesh", caption:"My M logo design 🔥", music:"Knmahesh • Original audio", likes:1240, comments:12, reposts:5, shares:30, saves:20, avatar:""},
        {id:3, image:"https://picsum.photos/600/800?random=3", username:"chitpix_official", caption:"ChitPix edits coming soon", music:"ChitPix • Trending", likes:8900, comments:120, reposts:80, shares:400, saves:300, avatar:""},
      ]
    }
    setReels(posts)
  },[])

  const handleLike = (id:number, double=false)=>{
    const isLiked =!liked[id]
    setLiked((p:any)=>({...p, [id]:isLiked}))
    setReels(prev=>prev.map(r=> r.id===id? {...r, likes: isLiked? r.likes+1 : r.likes-1} : r))
    if(double && isLiked){
      setShowHeart(id)
      setTimeout(()=>setShowHeart(null), 900)
    }
  }

  const handleSave = (id:number)=>{
    setSaved((p:any)=>({...p, [id]:!p[id]}))
    setReels(prev=>prev.map(r=> r.id===id? {...r, saves: saved[id]? r.saves-1 : r.saves+1} : r))
  }

  const handleFollow = (id:number)=>{
    setFollowed((p:any)=>({...p, [id]:!p[id]}))
  }

  return (
    <div className="w-full h-[100dvh] bg-black relative overflow-hidden">
      {/* TOP BAR - Reels v Friends */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-3 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <button className="text-white text-[22px]">+</button>
        <div className="flex items-center gap-2">
          <h1 className="text-white font-bold text-[18px]">Reels</h1>
          <span className="text-white text-[14px]">⌄</span>
        </div>
        <h1 className="text-white/60 font-medium text-[18px] ml-4">Friends</h1>
        <div className="ml-auto flex gap-1">
          <div className="w-6 h-6 rounded-full bg-white/30"></div>
          <div className="w-6 h-6 rounded-full bg-white/20 -ml-2"></div>
        </div>
      </div>

      {/* REELS FEED */}
      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {reels.map((reel)=>(
          <div key={reel.id} className="w-full h-[100dvh] snap-start relative bg-black flex justify-center overflow-hidden">
            {/* VIDEO / IMAGE FULL SCREEN */}
            <div className="relative w-full max-w-[420px] h-full bg-black" onDoubleClick={()=>handleLike(reel.id, true)}>
              <img src={reel.image} alt="" className="w-full h-full object-cover" />

              {/* Tap heart animation */}
              {showHeart===reel.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[90px] animate-[ping_0.9s_ease]">❤️</span>
                </div>
              )}

              {/* BOTTOM GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none"></div>

              {/* RIGHT SIDE 5 ICONS - EXACT INSTA */}
              <div className="absolute right-2 bottom-28 flex flex-col items-center gap-5 z-10">
                {/* 1. LIKE */}
                <button onClick={()=>handleLike(reel.id)} className="flex flex-col items-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={liked[reel.id]? "#ff3040" : "none"} stroke="white" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span className="text-white text-[12px] font-semibold mt-1">{reel.likes >=1000? (reel.likes/1000).toFixed(1)+'K' : reel.likes}</span>
                </button>

                {/* 2. COMMENT */}
                <button onClick={()=>setShowComments(reel.id)} className="flex flex-col items-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-white text-[12px] font-semibold mt-1">{reel.comments}</span>
                </button>

                {/* 3. REPOST */}
                <button onClick={()=>alert("Reposted!")} className="flex flex-col items-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  <span className="text-white text-[12px] font-semibold mt-1">{reel.reposts}</span>
                </button>

                {/* 4. DM SHARE */}
                <button onClick={()=>{
                  localStorage.setItem("chitpix_shared_post", JSON.stringify(reel))
                  window.location.href="/messages"
                }} className="flex flex-col items-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-white text-[12px] font-semibold mt-1">{reel.shares}</span>
                </button>

                {/* 5. SAVE */}
                <button onClick={()=>handleSave(reel.id)} className="flex flex-col items-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[reel.id]? "white" : "none"} stroke="white" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-white text-[12px] font-semibold mt-1">{reel.saves}</span>
                </button>

                {/* MUSIC ICON SMALL */}
                <div className="w-8 h-8 rounded-[6px] bg-white overflow-hidden border-2 border-white mt-1">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-yellow-400"></div>
                </div>
              </div>

              {/* BOTTOM LEFT - PROFILE + FOLLOW */}
              <div className="absolute left-3 bottom-24 right-16 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-white">
                    <div className="w-full h-full flex items-center justify-center font-bold text-[12px]">{reel.username[0].toUpperCase()}</div>
                  </div>
                  <p className="text-white font-bold text-[14px] truncate max-w-[120px]">{reel.username}...</p>
                  <button onClick={()=>handleFollow(reel.id)} className={`ml-2 px-3 py-[3px] rounded-full text-[12px] font-bold border ${followed[reel.id]? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'}`}>
                    {followed[reel.id]? 'Following' : 'Follow'}
                  </button>
                </div>
                <p className="text-white/90 text-[13px] mt-1 flex items-center gap-1">
                  <span className="text-[10px]">↗</span> {reel.music}
                </p>
                <p className="text-white text-[14px] mt-2 leading-[18px]">
                  {reel.caption} <span className="text-white/60">...</span>
                </p>
                {/* Text overlay like your screenshot */}
                {reel.id===1 && (
                  <div className="absolute -top-32 left-0 right-0 text-center">
                    <p className="text-[#00ff00] font-black text-[24px] leading-6" style={{textShadow:'2px 2px 0 #000'}}>15 hrs duty<br/>Duty to return room<br/>Time 12:30 AM</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMMENT SHEET */}
      {showComments && (
        <div className="absolute inset-0 z-40 flex items-end bg-black/40" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[420px] mx-auto rounded-t-[16px] h-[60%] p-4" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-center">Comments</p>
            <div className="mt-4 text-center text-gray-500">Comments for reel {showComments} - Go to <Link href={`/post/${showComments}`} className="text-blue-500">Post page</Link></div>
            <button onClick={()=>setShowComments(null)} className="absolute top-4 right-4">✕</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10">
        <div className="max-w-[420px] mx-auto flex justify-around items-center py-2">
          <Link href="/" className="p-2"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></Link>
          <div className="bg-white/20 p-2 rounded-full"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white"><path d="M8 5.14v14l11-7-11-7z"/></svg></div>
          <Link href="/messages" className="p-2 relative"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></Link>
          <Link href="/search" className="p-2"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></Link>
          <Link href="/profile" className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-[10px]">M</Link>
        </div>
      </div>

      <style jsx>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none; scrollbar-width:none}`}</style>
    </div>
  )
                      }
