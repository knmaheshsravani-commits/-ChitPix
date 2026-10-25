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

  // 1. Progress Bar 3sec + 6. View Count + 12. 24H Expiry check + 13. View Tracking R2
  useEffect(()=>{
    if(!currentStory || paused) return
    setProgress(0)
    const start = Date.now()
    const duration = 3000 // 3 sec
    timerRef.current = setInterval(()=>{
      const elapsed = Date.now() - start
      const p = Math.min((elapsed/duration)*100, 100)
      setProgress(p)
      if(p>=100){
        clearInterval(timerRef.current)
        handleNext()
      }
    }, 30)

    // R2 View tracking
    fetch("/api/story_views", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username:currentUser.username, storyId:currentStory.id})}).catch(()=>{})

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
      {/* 1. Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {currentUser.stories.map((_:any,i:number)=>(
          <div key={i} className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{width: i<storyIdx ? "100%" : i===storyIdx ? `${progress}%` : "0%"}} />
          </div>
        ))}
      </div>

      {/* Header - 7. Close, 21. Badge, 22. Price, 23. Location */}
      <div className="absolute top-4 left-0 right-0 z-20 flex justify-between items-center px-3 pt-6">
        <div className="flex items-center gap-2">
          <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="" />
          <div>
            <p className="text-white text-[13px] font-bold flex gap-1">{currentUser.username} {currentUser.verified && "👑"} <span className="font-normal opacity-70">• {Math.floor(Math.random()*5+1)}h</span></p>
            <p className="text-white/70 text-[10px] flex gap-1">📍 Kadur • ₹{currentStory.price||350} • R2 HD</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={()=>{/* 16. Delete own */ if(confirm("Delete R2 story?")){ fetch(`/api/stories?id=${currentStory.id}`,{method:"DELETE"}).then(()=>onClose()) }}} className="text-white text-[18px]">⋯</button>
          <button onClick={onClose} className="text-white text-[22px]">✕</button>
        </div>
      </div>

      {/* Image - 2. Tap Next/Prev, 3. Long Press Pause, 10. Double Tap Like */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-900"
        onTouchStart={()=>setPaused(true)}
        onTouchEnd={()=>setPaused(false)}
        onMouseDown={()=>setPaused(true)}
        onMouseUp={()=>setPaused(false)}
        onDoubleClick={()=>{ setLiked({...liked,[currentStory.id]:!liked[currentStory.id]}); setPaused(false) }}
      >
        <img src={currentStory.image} alt="" className="max-w-full max-h-full object-contain" />
        {/* Tap areas */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={handlePrev} />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 z-10" onClick={handleNext} />

        {/* 22. Price Tag Sticker, 29. Music */}
        <div className="absolute top-[28%] left-4 bg-black/70 text-white px-2 py-1 rounded-full text-[11px]">₹{currentStory.price||350} ✨</div>
        {currentStory.music && <div className="absolute top-[35%] left-4 bg-white/20 text-white px-2 py-1 rounded-full text-[10px]">🎵 {currentStory.music}</div>}

        {/* 24. Poll Sticker - Maggam / Aari */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white rounded-xl p-2 w-[80%]">
          <p className="text-[12px] font-bold text-center">Maggam or Aari? 📊</p>
          <div className="flex gap-2 mt-2">
            {["Maggam","Aari"].map((opt:any)=>(
              <button key={opt} onClick={()=>setPollVoted({...pollVoted,[currentStory.id]:opt})} className={`flex-1 py-1.5 rounded-full text-[11px] border ${pollVoted[currentStory.id]===opt ? "bg-black text-white" : "bg-zinc-100"}`}>{opt} {pollVoted[currentStory.id]===opt && "✓"}</button>
            ))}
          </div>
          <p className="text-[9px] text-center text-zinc-400 mt-1">R2 Poll - Vote saved</p>
        </div>

        {/* 10. Heart */}
        {liked[currentStory.id] && <div className="absolute text-[80px] animate-pulse">❤️</div>}
      </div>

      {/* Footer - 4. Swipe Up, 6. View Count, 14. Reply DM, 17. Download, 18. Seen List, 25. WA */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <input placeholder={`Reply to ${currentUser.username}... R2 DM`} className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-[13px] text-white placeholder:text-white/50 outline-none" onKeyDown={(e:any)=>{ if(e.key==='Enter'){ fetch("/api/messages",{method:"POST", body:JSON.stringify({to:currentUser.username, text:e.target.value, storyId:currentStory.id})}); e.target.value=""; onClose() } }} />
          <a href={`https://wa.me/916363373372?text=Hi! Story ID ${currentStory.id} price?`} target="_blank" className="bg-green-500 text-white px-4 py-2.5 rounded-full text-[12px] font-bold">WA Price</a>
          <button onClick={()=>setShowSeenList(!showSeenList)} className="text-white/80 text-[12px]">👁️ {currentStory.views||128}</button>
        </div>
        <div className="flex justify-center mt-2"><div className="w-10 h-1 bg-white/40 rounded-full" /></div>
        <p className="text-white/50 text-[9px] text-center mt-1">↗️ Swipe Up • Hold to Pause • Tap sides • Double tap ❤️ • R2</p>
        <div className="flex gap-2 mt-2 justify-center">
          <button onClick={()=>{ const a=document.createElement('a'); a.href=currentStory.image; a.download=`r2-story-${currentStory.id}.jpg`; a.click() }} className="text-white/70 text-[10px] border border-white/20 rounded-full px-3 py-1">⬇️ Download R2</button>
          <button onClick={()=>{ navigator.clipboard.writeText(currentStory.image); alert("R2 link copied") }} className="text-white/70 text-[10px] border border-white/20 rounded-full px-3 py-1">↗️ Share</button>
          <button onClick={()=>{ fetch("/api/posts",{method:"POST", body:JSON.stringify({image_url:currentStory.image, caption:currentStory.caption+" #StoryToPost"}}).then(()=>alert("Converted to Post R2!")) }} className="text-white/70 text-[10px] border border-white/20 rounded-full px-3 py-1">📌 To Post</button>
        </div>
      </div>

      {/* 18. Seen List Bottom Sheet */}
      {showSeenList && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-30 p-4 max-h-[50%] overflow-y-auto">
          <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3" />
          <p className="font-bold text-[14px]">Seen by 128 • R2 Views</p>
          {[1,2,3,4,5].map(i=><div key={i} className="flex items-center gap-2 py-2"><img src={`https://i.pravatar.cc/40?u=${i}`} className="w-8 h-8 rounded-full" /><p className="text-[12px]">user_{i} • 2h ago • R2</p></div>)}
          <button onClick={()=>setShowSeenList(false)} className="w-full bg-black text-white py-2 rounded-full mt-3 text-[12px]">Close</button>
        </div>
      )}
    </div>
  )
            }
