"use client"
import { useEffect, useState, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import { useRouter } from 'next/navigation'

export default function ReelsPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<Record<string,boolean>>({})
  const [saved, setSaved] = useState<Record<string,boolean>>({})
  const [muted, setMuted] = useState(true)
  const [showHeart, setShowHeart] = useState<number | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [captionExpand, setCaptionExpand] = useState<Record<string,boolean>>({})
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({})
  const router = useRouter()

  // 1. FETCH R2 REELS
  useEffect(()=>{
    fetch('/api/reels?limit=50').then(r=>r.json()).then(d=>{
      let reels = d.reels || d.posts || []
      if(reels.length===0){
        fetch('/api/posts?limit=50').then(r=>r.json()).then(dd=>{
          reels = (dd.posts||[]).filter((p:any)=>p.videoUrl||p.video_url||p.url?.includes('.mp4')).slice(0,20)
          if(reels.length===0) reels = (dd.posts||[]).slice(0,10)
          setPosts(reels)
        })
      } else setPosts(reels)
    })
  },[])

  // 2. SCROLL + AUTOPLAY
  const handleScroll = ()=>{
    if(!containerRef.current) return
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight)
    setCurrentIndex(idx)
    Object.values(videoRefs.current).forEach((v,i)=>{
      if(i===idx) { v.play().catch(()=>{}); setIsPlaying(true) } else v.pause()
    })
  }

  // 3. DOUBLE TAP LIKE + ANIMATION
  const handleDoubleTap = (id:string, idx:number)=>{
    setLiked(p=>({...p,[id]:true}))
    setShowHeart(idx)
    setTimeout(()=>setShowHeart(null),800)
  }

  // 4. LIKE API
  const toggleLike = (id:string)=>{
    setLiked(p=>({...p,[id]:!p[id]}))
    fetch('/api/like',{method:'POST',body:JSON.stringify({postId:id})}).catch(()=>{})
  }

  // 5. PROGRESS UPDATE
  const onTimeUpdate = (idx:number)=>{
    const v = videoRefs.current[idx]
    if(v && idx===currentIndex) setProgress((v.currentTime / v.duration)*100)
  }

  // 6. SEEK
  const handleSeek = (e:any)=>{
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x/rect.width
    const v = videoRefs.current[currentIndex]
    if(v) { v.currentTime = pct * v.duration; setProgress(pct*100) }
  }

  // 7. SHARE
  const shareReel = (url:string)=>{
    if(navigator.share) navigator.share({url}).catch(()=>{})
    else { navigator.clipboard.writeText(url); alert('Link copied!') }
  }

  if(posts.length===0) return <div className="max-w-[480px] mx-auto h-screen bg-black text-white flex items-center justify-center"><p>Loading R2 reels...</p></div>

  return (
    <div className="max-w-[480px] mx-auto relative h-screen bg-black overflow-hidden">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <h1 className="text-white font-bold text-[18px] tracking-wide">Reels</h1>
        <div className="flex gap-3">
          <button onClick={()=>router.push('/create-reel')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">+</button>
          <button onClick={()=>router.push('/')} className="text-white">✕</button>
        </div>
      </div>

      {/* REELS FEED */}
      <div ref={containerRef} onScroll={handleScroll} className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {posts.map((post:any, idx:number)=>{
          const videoSrc = post.videoUrl || post.video_url || post.url || post.imageUrl
          const isVideo = videoSrc?.toLowerCase().includes('.mp4') || post.type==='reel'
          
          return (
            <div key={post.id||idx} className="relative h-screen w-full snap-start bg-black" onDoubleClick={()=>handleDoubleTap(post.id, idx)}>
              
              {isVideo ? (
                <video 
                  ref={el=>{ if(el) videoRefs.current[idx]=el }}
                  src={videoSrc}
                  autoPlay={idx===0}
                  loop
                  muted={muted}
                  playsInline
                  onTimeUpdate={()=>onTimeUpdate(idx)}
                  onClick={()=>{ const v=videoRefs.current[idx]; if(v.paused){ v.play(); setIsPlaying(true)} else { v.pause(); setIsPlaying(false)} }}
                  className="w-full h-full object-contain bg-black"
                  // @ts-ignore
                  onContextMenu={(e)=>e.preventDefault()}
                />
              ) : (
                <img src={videoSrc} alt="reel" className="w-full h-full object-contain bg-black" />
              )}

              {/* DOUBLE TAP HEART ANIMATION */}
              {showHeart===idx && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="#ff3040" className="animate-ping-slow"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
              )}

              {/* PAUSE ICON */}
              {!isPlaying && currentIndex===idx && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

              {/* LEFT INFO - 8 FEATURES */}
              <div className="absolute bottom-[90px] left-3 right-[70px] z-10">
                <div className="flex items-center gap-2 mb-2">
                  <img src={post.userAvatar||`https://i.pravatar.cc/100?u=${post.user}`} className="w-8 h-8 rounded-full border border-white" alt=""/>
                  <span className="text-white font-semibold text-[14px]">{post.user||'knmahesh'}</span>
                  <button className="ml-2 border border-white text-white text-[11px] px-3 py-0.5 rounded-full">Follow</button>
                  <span className="ml-2 text-white/60 text-[10px]">• HD</span>
                </div>
                <p className="text-white text-[13px] leading-tight" onClick={()=>setCaptionExpand(p=>({...p,[post.id]:!p[post.id]}))}>
                  {captionExpand[post.id] ? (post.caption||'Welcome to ChitPix 🔥 #chitpix #viral') : (post.caption||'Welcome to ChitPix 🔥 #chitpix #viral').slice(0,80)}
                  {!captionExpand[post.id] && (post.caption||'').length>80 && <span className="opacity-60">...more</span>}
                </p>
                <p className="text-white/70 text-[11px] mt-1 flex items-center gap-1">♫ Original audio • {post.user||'knmahesh'} • {post.views||'12.5K'} views</p>
              </div>

              {/* RIGHT ACTIONS - 12 FEATURES */}
              <div className="absolute bottom-[90px] right-2 flex flex-col items-center gap-5 z-10">
                <button onClick={()=>toggleLike(post.id)} className="flex flex-col items-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={liked[post.id]?'#ff3040':'none'} stroke="white" strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <span className="text-white text-[11px] mt-1 font-bold">{(post.likes||76)+(liked[post.id]?1:0)}</span>
                </button>
                <button onClick={()=>setShowComments(true)} className="flex flex-col items-center">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-white text-[11px] mt-1">342</span>
                </button>
                <button onClick={()=>setShowShare(true)} className="flex flex-col items-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-white text-[11px] mt-1">Share</span>
                </button>
                <button onClick={()=>setSaved(p=>({...p,[post.id]:!p[post.id]}))} className="flex flex-col items-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[post.id]?'white':'none'} stroke="white" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button onClick={()=>setMuted(!muted)} className="flex flex-col items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">{muted?<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>:<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></>}</svg>
                </button>
                <div className="w-8 h-8 rounded-md border-2 border-white overflow-hidden animate-spin-slow"><img src={post.imageUrl||videoSrc} className="w-full h-full object-cover" alt=""/></div>
              </div>

              {/* PROGRESS BAR - SEEKABLE */}
              <div className="absolute bottom-[68px] left-0 right-0 h-1 bg-white/20 z-20 cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-white transition-all" style={{width:`${progress}%`}} />
              </div>

              {/* TOP PROGRESS INDICATOR */}
              <div className="absolute top-[55px] left-0 right-0 flex gap-1 px-2 z-10">
                {posts.map((_:any,i:number)=><div key={i} className={`h-[2px] flex-1 rounded-full ${i===currentIndex?'bg-white':'bg-white/30'}`} />)}
              </div>
            </div>
          )
        })}
      </div>

      {/* COMMENTS DRAWER */}
      {showComments && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={()=>setShowComments(false)}>
          <div className="bg-white rounded-t-[20px] h-[60%] p-4" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-3" />
            <h3 className="font-bold mb-3">Comments (342)</h3>
            <div className="space-y-3 overflow-y-auto h-[80%]">
              <p className="text-sm"><b>user1</b> 🔥🔥 ChitPix is fire!</p>
              <p className="text-sm"><b>knmahesh</b> Thanks bro!</p>
            </div>
          </div>
        </div>
      )}

      {/* SHARE SHEET */}
      {showShare && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={()=>setShowShare(false)}>
          <div className="bg-white rounded-t-[20px] p-5" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold mb-4">Share reel</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <button onClick={()=>shareReel(posts[currentIndex]?.videoUrl)} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">W</div><span className="text-[11px]">WhatsApp</span></button>
              <button onClick={()=>shareReel(posts[currentIndex]?.videoUrl)} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white">🔗</div><span className="text-[11px]">Copy</span></button>
              <button className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">↓</div><span className="text-[11px]">Download</span></button>
              <button className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">!</div><span className="text-[11px]">Report</span></button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="reels" setActiveTab={()=>{}} />
      <style>{`@keyframes ping-slow{0%{transform:scale(0.5);opacity:1}100%{transform:scale(1.5);opacity:0}} .animate-ping-slow{animation:ping-slow 0.8s cubic-bezier(0,0,0.2,1)} .animate-spin-slow{animation:spin 3s linear infinite} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
                }
