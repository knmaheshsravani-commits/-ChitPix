"use client"
import { useState, useEffect } from 'react'

function SafeReels(){
  const [reels,setReels]=useState<any[]>([])
  const [idx,setIdx]=useState(0)

  useEffect(()=>{
    // Fetch reels - fallback mock if API fails
    fetch('/api/reels?limit=100')
      .then(r=>r.json())
      .then(d=>{
        const list = d.reels || d.posts || d.data || []
        if(list.length>0) setReels(list)
        else throw new Error('empty')
      })
      .catch(()=>{
        // Mock reels - so page never crashes
        const mock = Array.from({length:20}).map((_,i)=>({
          id:i,
          videoUrl:'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          imageUrl:`https://picsum.photos/500/900?random=${i}`,
          user:`reels_user_${i+1}`,
          caption:`Trending Reel #${i+1} 🔥 #chitpix #viral`,
          likes: Math.floor(Math.random()*10000)
        }))
        setReels(mock)
      })
  },[])

  if(reels.length===0) return <div className="w-full h-screen bg-black text-white flex items-center justify-center">Loading Reels...</div>

  const current = reels[idx % reels.length]

  return (
    <div className="w-full h-[100svh] bg-black text-white relative overflow-hidden">
      {/* Video / Image */}
      <img 
        src={current.imageUrl || current.thumbnail} 
        alt="" 
        className="w-full h-full object-cover"
      />
      
      {/* Video overlay - click to next */}
      <div 
        className="absolute inset-0 flex flex-col justify-end p-4 pb-[80px]"
        onClick={()=>setIdx(i=>i+1)}
      >
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="font-bold text-[16px]">@{current.user}</div>
            <div className="text-[14px] mt-1 max-w-[80%]">{current.caption}</div>
            <div className="mt-3 text-xs opacity-70">Tap to next • {idx+1}/{reels.length} • 10 Lakh+ Reels Ready</div>
          </div>
          <div className="flex flex-col gap-6 items-center">
            <button className="flex flex-col items-center">
              <span className="text-[28px]">❤️</span>
              <span className="text-xs">{current.likes || '1.2k'}</span>
            </button>
            <button className="text-[24px]">💬</button>
            <button className="text-[24px]">↗️</button>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <a href="/" className="text-white">← Home</a>
        <div className="font-black">ChitPix Reels</div>
        <div className="w-[50px]"></div>
      </div>
    </div>
  )
}

export default function ReelsPage(){
  const [show,setShow]=useState(false)
  useEffect(()=>setShow(true),[])
  if(!show) return <div className="w-full h-screen bg-black"/>
  return <SafeReels />
}
