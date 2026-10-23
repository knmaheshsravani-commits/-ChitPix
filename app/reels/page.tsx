"use client"
import { useState, useEffect, useRef, useCallback } from 'react'

export default function ReelsPage(){
  const [reels,setReels]=useState<any[]>([])
  const [page,setPage]=useState(1)
  const [currentIdx,setCurrentIdx]=useState(0)
  const [liked,setLiked]=useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const [show,setShow]=useState(false)
  
  useEffect(()=>setShow(true),[])

  const loadReels = useCallback(async (p:number)=>{
    try{
      const res = await fetch(`/api/reels?page=${p}&limit=20`)
      const data = await res.json()
      setReels(prev => p===1 ? data.reels : [...prev, ...data.reels])
    }catch(e){ console.error(e) }
  },[])

  useEffect(()=>{ loadReels(1) },[loadReels])

  // Infinite scroll - load more when near end
  useEffect(()=>{
    if(currentIdx >= reels.length - 5){
      const next = page+1
      setPage(next)
      loadReels(next)
    }
  },[currentIdx, reels.length, page, loadReels])

  // Handle swipe
  const handleScroll = ()=>{
    if(!containerRef.current) return
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight)
    if(idx!==currentIdx) setCurrentIdx(idx)
  }

  const toggleLike = (id:number)=>{
    setLiked(prev=>{
      const next = new Set(prev)
      if(next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if(!show) return <div className="w-full h-screen bg-black"/>

  if(reels.length===0) return <div className="w-full h-screen bg-black text-white flex items-center justify-center">Loading 10 Lakh Reels...</div>

  return (
    <div className="w-full h-[100svh] bg-black overflow-hidden">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{scrollbarWidth:'none'}}
      >
        {reels.map((reel, idx)=>(
          <div key={reel.id} className="w-full h-[100svh] snap-start relative bg-black flex items-center justify-center">
            <img src={reel.imageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
            {/* <video src={reel.videoUrl} className="w-full h-full object-cover absolute inset-0" loop muted playsInline autoPlay={idx===currentIdx} /> */}
            
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-60% to-black/70 pointer-events-none"/>

            {/* Top */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
              <a href="/" className="text-white text-[16px]">← Home</a>
              <div className="text-white font-black">ChitPix Reels • {reels.length.toLocaleString()}/10Lakh+</div>
              <div className="w-[60px]"/>
            </div>

            {/* Right actions */}
            <div className="absolute right-3 bottom-[120px] flex flex-col gap-7 items-center z-10">
              <button onClick={()=>toggleLike(reel.id)} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-[24px] ${liked.has(reel.id)?'scale-110':''} transition`}>
                  {liked.has(reel.id) ? '❤️' : '🤍'}
                </div>
                <span className="text-white text-xs mt-1 font-semibold">{(reel.likes + (liked.has(reel.id)?1:0)).toLocaleString()}</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-[20px]">💬</div>
                <span className="text-white text-xs mt-1">{reel.comments}</span>
              </button>
              <button onClick={()=>{ if(navigator.share) navigator.share({title:'ChitPix', text:reel.caption, url:location.href}) }} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-[20px]">↗️</div>
                <span className="text-white text-xs mt-1">{reel.shares}</span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img src={reel.userAvatar} alt="" className="w-full h-full object-cover"/>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute left-0 right-[70px] bottom-0 p-4 pb-[30px] z-10">
              <div className="text-white font-bold text-[16px]">@{reel.user} • {reel.location}</div>
              <div className="text-white text-[14px] mt-1 leading-[18px]">{reel.caption}</div>
              <div className="text-white/60 text-[12px] mt-2">Reel #{reel.id.toLocaleString()} • Swipe up for next • 10 Lakh+ loaded</div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
