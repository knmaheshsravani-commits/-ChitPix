// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"

export default function StoryViewer({ users, startIndex, onClose }: any){
  const [userIdx, setUserIdx] = useState(startIndex||0)
  const [storyIdx, setStoryIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [liked, setLiked] = useState<any>({})
  const [showSeenList, setShowSeenList] = useState(false)
  const [pollVoted, setPollVoted] = useState<any>({})
  const timerRef = useRef<any>(null)

  const currentUser = users[userIdx]
  const currentStory = currentUser?.stories[storyIdx]

  useEffect(()=>{
    if(!currentStory || paused) return
    setProgress(0)
    const start = Date.now()
    const duration = 3000
    timerRef.current = setInterval(()=>{
      const elapsed = Date.now() - start
      const p = Math.min((elapsed/duration)*100, 100)
      setProgress(p)
      if(p>=100){
        clearInterval(timerRef.current)
        handleNext()
      }
    }, 30)
    try{
      fetch("/api/story_views", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username:currentUser.username, storyId:currentStory.id})})
    }catch{}
    return ()=> clearInterval(timerRef.current)
  },[userIdx, storyIdx, paused, currentStory])

  const handleNext = ()=>{
    if(storyIdx < currentUser.stories.length -1){
      setStoryIdx(storyIdx+1)
    } else {
      if(userIdx < users.length -1){ setUserIdx(userIdx+1); setStoryIdx(0) }
      else onClose()
    }
  }
  const handlePrev = ()=>{
    if(storyIdx>0) setStoryIdx(storyIdx-1)
    else if(userIdx>0){ setUserIdx(userIdx-1); setStoryIdx(users[userIdx-1].stories.length-1) }
  }

  if(!currentStory) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col max-w-[480px] mx-auto">
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {currentUser.stories.map((_:any,i:number)=>(
          <div key={i} className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{width: i<storyIdx ? "100%" : i===storyIdx ? `${progress}%` : "0%"}} />
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-0 right-0 z-20 flex justify-between items-center px-3 pt-6">
        <div className="flex items-center gap-2">
          <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="" />
          <div>
            <p className="text-white text-[13px] font-bold">{currentUser.username} {currentUser.verified ? "👑" : ""}</p>
            <p className="text-white/70 text-[10px]">📍 Kadur • ₹{currentStory.price||350} • R2 HD</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={onClose} className="text-white text-[22px]">✕</button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-900"
        onTouchStart={()=>setPaused(true)}
        onTouchEnd={()=>setPaused(false)}
        onMouseDown={()=>setPaused(true)}
        onMouseUp={()=>setPaused(false)}
        onDoubleClick={()=>{ setLiked({...liked,[currentStory.id]:true}); setPaused(false) }}
      >
        <img src={currentStory.image} alt="" className="max-w-full max-h-full object-contain" />
        <div className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={handlePrev}></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 z-10" onClick={handleNext}></div>
        <div className="absolute top-[28%] left-4 bg-black/70 text-white px-2 py-1 rounded-full text-[11px]">₹{currentStory.price||350} ✨</div>
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white rounded-xl p-2 w-[80%]">
          <p className="text-[12px] font-bold text-center">Maggam or Aari?</p>
          <div className="flex gap-2 mt-2">
            {["Maggam","Aari"].map((opt:any)=>(
              <button key={opt} onClick={()=>setPollVoted({...pollVoted,[currentStory.id]:opt})} className={`flex-1 py-1.5 rounded-full text-[11px] border ${pollVoted[currentStory.id]===opt ? "bg-black text-white" : "bg-zinc-100"}`}>{opt} {pollVoted[currentStory.id]===opt ? "✓" : ""}</button>
            ))}
          </div>
        </div>
        {liked[currentStory.id] && <div className="absolute text-[80px] animate-pulse">❤️</div>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <input placeholder={`Reply to ${currentUser.username}...`} className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-[13px] text-white placeholder:text-white/50 outline-none" onKeyDown={(e:any)=>{ if(e.key==='Enter'){ e.target.value=""; } }} />
          <a href={`https://wa.me/916363373372?text=Hi! Story ID ${currentStory.id} price?`} target="_blank" className="bg-green-500 text-white px-4 py-2.5 rounded-full text-[12px] font-bold">WA</a>
          <button onClick={()=>setShowSeenList(!showSeenList)} className="text-white/80 text-[12px]">👁️ {currentStory.views||128}</button>
        </div>
        <div className="flex gap-2 mt-2 justify-center">
          <button onClick={()=>{
            const link = document.createElement('a')
            link.href = currentStory.image
            link.download = `r2-story-${currentStory.id}.jpg`
            link.click()
          }} className="text-white/70 text-[10px] border border-white/20 rounded-full px-3 py-1">⬇️ Download R2</button>
          <button onClick={async ()=>{
            try{ await navigator.clipboard.writeText(currentStory.image) }catch{}
          }} className="text-white/70 text-[10px] border border-white/20 rounded-full px-3 py-1">↗️ Share</button>
          <button onClick={async ()=>{
            try{
              await fetch("/api/posts",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({image_url:currentStory.image, caption:currentStory.caption})})
              alert("Converted to Post R2!")
            }catch{}
          }} className="text-white/70 text-[10px] border border-white/20 rounded-full px-3 py-1">📌 To Post</button>
        </div>
      </div>

      {showSeenList && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-30 p-4 max-h-[50%] overflow-y-auto">
          <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3"></div>
          <p className="font-bold text-[14px]">Seen by 128 • R2 Views</p>
          <button onClick={()=>setShowSeenList(false)} className="w-full bg-black text-white py-2 rounded-full mt-3 text-[12px]">Close</button>
        </div>
      )}
    </div>
  )
}
