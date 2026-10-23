"use client"
import { useEffect, useState, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import { useRouter } from 'next/navigation'

export default function ReelsPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedReels, setLikedReels] = useState<any>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(()=>{
    fetch('/api/posts?limit=20').then(r=>r.json()).then(d=>{
      // Filter only reels or take 10
      let reels = d.posts || []
      // If you have videoUrl field, prioritize, else take first 10 as reels
      if(reels.length > 10) reels = reels.slice(0,10)
      setPosts(reels)
    })
  },[])

  const toggleLike = (id:string)=>{
    setLikedReels((prev:any)=>({...prev, [id]: !prev[id]}))
  }

  const handleScroll = () => {
    if(!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const height = window.innerHeight
    const index = Math.round(scrollTop / height)
    setCurrentIndex(index)
  }

  if(posts.length===0){
    return (
      <div className="max-w-[480px] mx-auto h-screen bg-black text-white flex items-center justify-center">
        <p>Loading reels...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto relative h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-white font-bold text-[18px]">Reels</h1>
        <button onClick={()=>router.push('/')} className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Reels Container - Vertical Snap */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{scrollbarWidth:'none'}}
      >
        {posts.map((post:any, idx:number)=>(
          <div key={post.id} className="relative h-screen w-full snap-start flex-shrink-0 bg-black">
            
            {/* Media - Image or Video */}
            {post.videoUrl ? (
              <video 
                src={post.videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={post.imageUrl || post.url} alt="reel" className="w-full h-full object-cover" />
            )}

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Left - User Info */}
            <div className="absolute bottom-[80px] left-0 right-[70px] p-3 z-10">
              <div className="flex items-center gap-2 mb-2">
                <img src={post.userAvatar || `https://i.pravatar.cc/100?u=${post.user}`} className="w-[32px] h-[32px] rounded-full border border-white" alt="user"/>
                <span className="text-white font-semibold text-[14px]">{post.user || 'knmahesh'}</span>
                <button className="ml-2 border border-white text-white text-[12px] px-3 py-0.5 rounded">Follow</button>
              </div>
              <p className="text-white text-[13px] leading-[1.3] line-clamp-2">{post.caption || 'Welcome to ChitPix 🔥'}</p>
              <p className="text-white/80 text-[12px] mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                Original audio • {post.user || 'knmahesh'}
              </p>
            </div>

            {/* Right - Action Icons - 5 icons vertical */}
            <div className="absolute bottom-[80px] right-2 flex flex-col items-center gap-6 z-10">
              
              {/* Like */}
              <button onClick={()=>toggleLike(post.id)} className="flex flex-col items-center">
                {likedReels[post.id] ? (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#ff3040" stroke="#ff3040"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                )}
                <span className="text-white text-[12px] mt-1 font-semibold">{likedReels[post.id] ? (post.likes||76)+1 : post.likes||76}</span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20.656 17.008a1.993 1.993 0 0 1-.347 1.2L18 20.5l-3.5-1.5a1.993 1.993 0 0 1-1.2-.347A9.001 9.001 0 0 1 3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9c0 2.5-1 4.8-2.344 6.008Z" opacity="0.9"/><circle cx="12" cy="12" r="1" fill="black"/><circle cx="8" cy="12" r="1" fill="black"/><circle cx="16" cy="12" r="1" fill="black"/></svg>
                <span className="text-white text-[12px] mt-1 font-semibold">{post.comments || 12}</span>
              </button>

              {/* Share / Repost */}
              <button className="flex flex-col items-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" fillOpacity="0.1"/></svg>
                <span className="text-white text-[12px] mt-1 font-semibold">19</span>
              </button>

              {/* More Options */}
              <button className="flex flex-col items-center mt-1">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="1.5"/><circle cx="19.5" cy="12" r="1.5"/><circle cx="4.5" cy="12" r="1.5"/></svg>
              </button>

              {/* User avatar small with music */}
              <div className="w-[32px] h-[32px] rounded-lg border-2 border-white overflow-hidden mt-2">
                <img src={post.imageUrl || post.url} alt="music" className="w-full h-full object-cover animate-spin-slow" />
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute top-[60px] left-0 right-0 flex gap-1 px-2 z-10">
              {posts.map((_:any, i:number)=>(
                <div key={i} className={`h-[2px] flex-1 rounded-full ${i===currentIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab="reels" setActiveTab={()=>{}} />
    </div>
  )
        }
