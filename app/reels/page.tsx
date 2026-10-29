"use client"
import { useEffect, useState, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import { useRouter } from 'next/navigation'
import { supabase } from "../../lib/supabase"

type Reel = {
  id: string
  videoUrl?: string
  video_url?: string
  url?: string
  imageUrl?: string
  caption?: string
  user?: string
  userAvatar?: string
  likes?: number
  comments?: number
  views?: string
  type?: string
}

export default function ReelsPage(){
  const [posts, setPosts] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [followed, setFollowed] = useState<Record<string, boolean>>({})
  const [muted, setMuted] = useState(true)
  const [showHeart, setShowHeart] = useState<number | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [captionExpand, setCaptionExpand] = useState<Record<string, boolean>>({})
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({})
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [sortBy, setSortBy] = useState<'top' | 'new'>('new')
  const [pinnedId, setPinnedId] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [comments, setComments] = useState<any[]>([
    { id: 1, user: 'user1', avatar: 'https://i.pravatar.cc/100?u=user1', text: '🔥🔥 ChitPix is fire bro!', likes: 12, time: '2h' },
    { id: 2, user: 'knmahesh', avatar: 'https://i.pravatar.cc/100?u=knmahesh', text: 'Thanks bro! R2 300MB support added 🚀', likes: 5, time: '1h' },
    { id: 3, user: 'chitpix_official', avatar: 'https://i.pravatar.cc/100?u=official', text: 'Welcome to new reels update!', likes: 23, time: '30m' },
  ])

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({})
  const longPressTimer = useRef<any>(null)
  const router = useRouter()

  // FEATURE 1: FETCH R2 REELS
  useEffect(() => {
    const savedMute = localStorage.getItem('reels_muted')
    if (savedMute) setMuted(savedMute === 'true')
    
    fetch('/api/reels?limit=50')
      .then(r => r.json())
      .then(d => {
        const reels = d.reels || d.posts || []
        if (reels.length > 0) setPosts(reels)
        else {
          fetch('/api/posts?limit=50')
            .then(r => r.json())
            .then(dd => {
              let r = dd.posts || []
              r = r.filter((p: any) => p.videoUrl || p.video_url || p.url?.includes('.mp4'))
              if (r.length === 0) r = dd.posts?.slice(0, 10) || []
              setPosts(r)
            })
        }
      })
      .catch(() => {
        setPosts([
          {
            id: '1',
            videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            caption: 'Welcome to ChitPix 🔥 First R2 Reel #chitpix #viral #trending',
            user: 'knmahesh',
            userAvatar: 'https://i.pravatar.cc/100?u=knmahesh',
            likes: 124,
            comments: 342,
            views: '12.5K',
            type: 'reel'
          }
        ])
      })
  }, [])

  // FEATURE 2: SCROLL + AUTOPLAY CURRENT ONLY
  const handleScroll = () => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const height = window.innerHeight
    const index = Math.round(scrollTop / height)
    if (index !== currentIndex) {
      setCurrentIndex(index)
      setProgress(0)
      Object.entries(videoRefs.current).forEach(([k, v]) => {
        const i = parseInt(k)
        if (i === index) {
          v.play().catch(() => {})
          setIsPlaying(true)
          // FEATURE 20: VIEW COUNT
          try {
            fetch('/api/views', { method: 'POST', body: JSON.stringify({ postId: posts[i]?.id }) }).catch(()=>{})
          } catch {}
        } else {
          v.pause()
          v.currentTime = 0
        }
      })
    }
  }

  // FEATURE 3: DOUBLE TAP LIKE + HEART ANIMATION
  const handleDoubleTap = (id: string, idx: number) => {
    if (!liked[id]) {
      setLiked(p => ({ ...p, [id]: true }))
      fetch('/api/like', { method: 'POST', body: JSON.stringify({ postId: id }) }).catch(()=>{})
    }
    setShowHeart(idx)
    setTimeout(() => setShowHeart(null), 800)
  }

  // FEATURE 6: LIKE WITH API
  const toggleLike = (id: string) => {
    setLiked(p => ({ ...p, [id]: !p[id] }))
    fetch('/api/like', { method: 'POST', body: JSON.stringify({ postId: id }) }).catch(()=>{})
  }

  // FEATURE 13: SAVE/BOOKMARK
  const toggleSave = (id: string) => {
    const newSaved = !saved[id]
    setSaved(p => ({ ...p, [id]: newSaved }))
    if (newSaved) {
      // Save to localStorage
      const savedIds = JSON.parse(localStorage.getItem('saved_reels') || '[]')
      savedIds.push(id)
      localStorage.setItem('saved_reels', JSON.stringify(savedIds))
    }
  }

  // FEATURE 14: FOLLOW
  const toggleFollow = (id: string, username: string) => {
    setFollowed(p => ({ ...p, [id]: !p[id] }))
    fetch('/api/follow', { method: 'POST', body: JSON.stringify({ username }) }).catch(()=>{})
  }

  // FEATURE 15 & 16: MUTE + MEMORY
  const toggleMute = () => {
    const newMuted = !muted
    setMuted(newMuted)
    localStorage.setItem('reels_muted', String(newMuted))
  }

  // FEATURE 17: PROGRESS UPDATE
  const onTimeUpdate = (idx: number) => {
    const v = videoRefs.current[idx]
    if (v && idx === currentIndex && v.duration) {
      setProgress((v.currentTime / v.duration) * 100)
    }
  }

  // FEATURE 18: SEEKABLE PROGRESS
  const handleSeek = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const x = clientX - rect.left
    const pct = x / rect.width
    const v = videoRefs.current[currentIndex]
    if (v && v.duration) {
      v.currentTime = pct * v.duration
      setProgress(pct * 100)
    }
  }

  // FEATURE 25: AUTO NEXT ON END
  const onEnded = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: (currentIndex + 1) * window.innerHeight,
        behavior: 'smooth'
      })
    }
  }

  // FEATURE 10,11,12: SHARE ACTIONS - DIRECT OPEN
  const doShare = (type: string) => {
    const currentReel = posts[currentIndex]
    const url = currentReel?.videoUrl || currentReel?.video_url || window.location.href
    const text = currentReel?.caption || 'Check this ChitPix reel 🔥'

    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }
    if (type === 'copy') {
      navigator.clipboard.writeText(url)
      alert('✅ Link copied!')
    }
    if (type === 'download') {
      const a = document.createElement('a')
      a.href = url
      a.download = `chitpix-reel-${currentReel?.id || Date.now()}.mp4`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    }
    setShowShare(false)
  }

  // FEATURE 8: POST COMMENT
const postComment = async () => {
  // FEATURE 8: POST COMMENT
  const text = commentText.trim()
  const currentPost = posts[currentIndex]

  if (!text || !currentPost?.id) return

  try {
    const response = await fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  postId: currentPost.id,
  text,
  userId: (await supabase.auth.getUser()).data.user?.id,
  username: currentUsername,
}),
  })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Comment API error:", errorText)
      alert("Comment save avvaledu bro. API error check cheyyali.")
      return
    }

    const result = await response.json()

    setComments((prev: any[]) => [
      {
        id: result?.comment?.id ?? Date.now(),
        user: result?.comment?.username ?? "knmahesh",
        avatar:
          result?.comment?.user_photo ??
          "https://i.pravatar.cc/100?u=you",
        text,
        likes: 0,
        time: "now",
      },
      ...prev,
    ])

    setCommentText("")
  } catch (error) {
    console.error("Comment error:", error)
    alert("Network error bro. Malli try cheyyi.")
  }
}
  
    const toggleCommentLike = (id: number) => {
    const isLiked = commentLikes[id]
    setCommentLikes(p => ({ ...p, [id]: !isLiked }))
    setComments(prev => prev.map(c => c.id === id ? { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 } : c))
    }
  // FEATURE 26: LONG PRESS 2X SPEED
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      const v = videoRefs.current[currentIndex]
      if (v) {
        v.playbackRate = 2
        setPlaybackRate(2)
        setIsLongPressing(true)
      }
    }, 300)
  }

  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current)
    const v = videoRefs.current[currentIndex]
    if (v) {
      v.playbackRate = 1
      setPlaybackRate(1)
      setIsLongPressing(false)
    }
  }

  // FEATURE 4: PLAY/PAUSE ON TAP
  const togglePlayPause = (idx: number) => {
    const v = videoRefs.current[idx]
    if (!v) return
    if (v.paused) {
      v.play()
      setIsPlaying(true)
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }
  
      if (posts.length === 0) {
    return (
      <div className="max-w-[400px] mx-auto relative h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p className="text-sm">Loading R2 reels...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto relative h-screen bg-black overflow-hidden">
      {/* HEADER - FEATURE 29 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <h1 className="text-white font-bold text-[18px] tracking-wide">Reels</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => router.push('/create-reel')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">+</button>
          <button onClick={() => router.push('/')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">x</button>
        </div>
      </div>

      {/* REELS FEED - FEATURE 2 */}
      <div ref={containerRef} onScroll={handleScroll} className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {posts.map((post, idx) => {
          const videoSrc = post.videoUrl || post.video_url || post.url || post.imageUrl || ''
          const isVideo = videoSrc.toLowerCase().includes('.mp4') || post.type === 'reel' || !!post.videoUrl || !!post.video_url
          const isCurrent = idx === currentIndex
                    return (
            <div
              key={post.id || idx}
              className="relative h-screen w-full snap-start flex-shrink-0 bg-black select-none"
              onDoubleClick={() => handleDoubleTap(post.id, idx)}
            >
              {/* MEDIA - FEATURE 1, 4, 26 */}
              {isVideo ? (
                <video
                  ref={(el) => { if (el) videoRefs.current[idx] = el }}
                  src={videoSrc}
                  autoPlay={idx === 0}
                  loop={false}
                  muted={muted}
                  playsInline
                  preload="metadata"
                  onTimeUpdate={() => onTimeUpdate(idx)}
                  onEnded={onEnded}
                  onClick={() => togglePlayPause(idx)}
                  onTouchStart={handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}
                  onMouseDown={handleLongPressStart}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img src={videoSrc} alt="reel" className="w-full h-full object-contain bg-black" />
              )}

              {/* FEATURE 3: DOUBLE TAP HEART */}
              {showHeart === idx && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="animate-heart text-[90px] drop-shadow-2xl">❤️</div>
                </div>
              )}

              {/* FEATURE 27: PLAY/PAUSE INDICATOR */}
              {!isPlaying && isCurrent && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  </div>
                </div>
              )}

              {/* FEATURE 26: 2X SPEED BADGE */}
              {isLongPressing && isCurrent && (
                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white text-[12px] px-3 py-1 rounded-full">
                  2x Speed ⚡
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

              {/* LEFT - FEATURE 21,22,23,24,20,14,30 */}
              <div className="absolute bottom-[90px] left-3 right-[70px] z-10">
                <div className="flex items-center gap-2 mb-2.5">
                  <img
                    onClick={() => router.push(`/profile?user=${post.user}`)}
                    src={post.userAvatar || `https://i.pravatar.cc/100?u=${post.user}`}
                    className="w-8 h-8 rounded-full border border-white cursor-pointer"
                    alt="user"
                  />
                  <span onClick={() => router.push(`/profile?user=${post.user}`)} className="text-white font-semibold text-[14px] cursor-pointer hover:underline">
                    {post.user || 'knmahesh'}
                  </span>
                  <button
                    onClick={() => toggleFollow(post.id, post.user || 'knmahesh')}
                    className={`ml-2 border text-[11px] px-3 py-0.5 rounded-full font-semibold transition-all ${followed[post.id] ? 'bg-white text-black border-white' : 'border-white text-white hover:bg-white hover:text-black'}`}
                  >
                    {followed[post.id] ? 'Following' : 'Follow'}
                  </button>
                  <span className="text-white/60 text-[10px] ml-1">• HD • {post.views || '12.5K'} views</span>
                </div>

                {/* FEATURE 21: CAPTION EXPAND */}
                <p className="text-white text-[13px] leading-[1.35] cursor-pointer" onClick={() => setCaptionExpand(p => ({ ...p, [post.id]: !p[post.id] }))}>
                  {captionExpand[post.id] ? (post.caption || 'Welcome to ChitPix 🔥 First R2 Reel #chitpix #viral #trending #reels') : (post.caption || 'Welcome to ChitPix 🔥 First R2 Reel #chitpix #viral').slice(0, 85)}
                  {!captionExpand[post.id] && (post.caption?.length || 0) > 85 && <span className="text-white/60"> ...more</span>}
                </p>

                {/* FEATURE 22: HASHTAGS CLICKABLE */}
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span onClick={() => router.push('/search?q=chitpix')} className="text-[#8ec9ff] text-[12px] cursor-pointer">#chitpix</span>
                  <span onClick={() => router.push('/search?q=viral')} className="text-[#8ec9ff] text-[12px] cursor-pointer">#viral</span>
                  <span onClick={() => router.push('/search?q=trending')} className="text-[#8ec9ff] text-[12px] cursor-pointer">#trending</span>
                </div>

                {/* FEATURE 24: ORIGINAL AUDIO */}
                <button onClick={() => router.push(`/audio?user=${post.user}`)} className="text-white/80 text-[12px] mt-2 flex items-center gap-1.5 hover:text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                  Original audio • {post.user || 'knmahesh'} • Use this audio
                </button>
              </div>

              {/* RIGHT - FEATURE 6,7,9,10,11,12,13,15,28 */}
<div className="absolute bottom-[90px] right-2 flex flex-col items-center gap-5 z-10">

              {/* HIDDEN GALLERY FOR DM DIRECT OPEN */}
<input type="file" id="dmGalleryInput" accept="image/*,video/*" style={{display:'none'}} onChange={(e:any)=>{
  const file = e.target.files?.[0];
  if(file){
    setShowShare(true);
  }
}} />

                {/* LIKE */}
                <button onClick={() => toggleLike(post.id)} className="flex flex-col items-center active:scale-90 transition-transform">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill={liked[post.id] ? '#ff3040' : 'none'} stroke={liked[post.id] ? '#ff3040' : 'white'} strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </div>
                  <span className="text-white text-[11px] mt-1 font-bold">{(post.likes || 124) + (liked[post.id] ? 1 : 0)}</span>
                </button>

                {/* COMMENT - DIRECT OPEN */}
                <button onClick={() => setShowComments(true)} className="flex flex-col items-center active:scale-90 transition-transform">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                  <span className="text-white text-[11px] mt-1 font-bold">{comments.length + (post.comments || 0)}</span>
                </button>

                {/* SHARE - DIRECT OPEN */}
                <button onClick={()=>{const i=document.getElementById('dmGalleryInput') as HTMLInputElement; if(i) i.click();}} className="flex flex-col items-center active:scale-90 transition-transform">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" fillOpacity="0.1" /></svg>
                  <span className="text-white text-[11px] mt-1 font-bold">Share</span>
                </button>

                {/* SAVE */}
                <button onClick={() => toggleSave(post.id)} className="flex flex-col items-center active:scale-90 transition-transform">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[post.id] ? 'white' : 'none'} stroke="white" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                </button>

                {/* MUTE */}
                <button onClick={toggleMute} className="flex flex-col items-center active:scale-90 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    {muted ? <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></> : <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>}
                  </svg>
                </button>

                {/* MORE OPTIONS - DIRECT OPEN */}
                <button onClick={() => setShowMore(true)} className="flex flex-col items-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="1.5" /><circle cx="19.5" cy="12" r="1.5" /><circle cx="4.5" cy="12" r="1.5" /></svg>
                </button>

                {/* MUSIC AVATAR */}
                <div className="w-8 h-8 rounded-md border-2 border-white overflow-hidden mt-1">
                  <img src={post.imageUrl || post.userAvatar || `https://i.pravatar.cc/100?u=${post.user}`} className="w-full h-full object-cover animate-spin-slow" alt="music" />
                </div>
              </div>

              {/* FEATURE 17 & 18: PROGRESS BAR SEEKABLE */}
              <div className="absolute bottom-[68px] left-0 right-0 h-[3px] bg-white/20 z-20 cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-white transition-all duration-100" style={{ width: `${isCurrent ? progress : 0}%` }} />
              </div>

              {/* FEATURE 19: TOP PROGRESS DOTS */}
              <div className="absolute top-[55px] left-0 right-0 flex gap-1 px-2 z-10">
                {posts.map((_, i) => (
                  <div key={i} className={`h-[2px] flex-1 rounded-full transition-all ${i === currentIndex ? 'bg-white' : i < currentIndex ? 'bg-white/60' : 'bg-white/30'}`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

                {/* FEATURE 7 & 8: COMMENTS DRAWER - 10 FUTURES */}
    {showComments && (
      <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60" onClick={()=>setShowComments(false)}>
        <div className="bg-white rounded-t-[20px] h-[76%] flex flex-col" onClick={e=>e.stopPropagation()}>
          <div className="p-4 border-b border-neutral-100">
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-3" />
            <h3 className="font-bold text-center text-[16px] text-black">{comments.length} Comments</h3>
            {replyTo && <p className="text-[11px] text-blue-600 mt-2 text-center">Replying to {replyTo} <button onClick={()=>{setReplyTo(null); setCommentText("")}} className="ml-2 font-bold text-black">✕ Cancel</button></p>}
            {/* SORT */}
            <div className="flex gap-2 mt-3 justify-center">
              <button onClick={()=>setSortBy('top')} className={`px-4 py-1 rounded-full text-[11px] font-bold ${sortBy==='top'?'bg-black text-white':'bg-neutral-100 text-black'}`}>🔝 Top</button>
              <button onClick={()=>setSortBy('new')} className={`px-4 py-1 rounded-full text-[11px] font-bold ${sortBy==='new'?'bg-black text-white':'bg-neutral-100 text-black'}`}>✨ Newest</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
            {comments
              .sort((a:any,b:any)=>{
                if(pinnedId===a.id) return -1
                if(pinnedId===b.id) return 1
                return sortBy==='top' ? b.likes - a.likes : b.id - a.id
              })
              .map((c:any)=>(
              <div key={c.id} className={`flex gap-3 ${pinnedId===c.id?'bg-yellow-50 p-2 rounded-xl':''}`}>
                <img src={c.avatar} className="w-8 h-8 rounded-full" alt="" />
                <div className="flex-1">
                  <p className="text-[13px] text-black"><span className="font-bold">{c.user}</span> {pinnedId===c.id && <span className="ml-2 text-[9px] bg-black text-white px-2 py-0.5 rounded-full">📌 PINNED</span>} <span className="text-neutral-400 text-[11px] ml-2">{c.time}</span></p>
                  <p className="text-[13px] mt-0.5 text-black">{c.text}</p>
                  <div className="flex gap-3 mt-2 items-center flex-wrap">
                    <button onClick={()=>toggleCommentLike(c.id)} className={`text-[12px] ${commentLikes[c.id]?'text-red-500 font-bold':'text-neutral-500'}`}>{commentLikes[c.id]?'❤️':'🤍'} {c.likes}</button>
                    <button onClick={()=>{setReplyTo(c.user); setCommentText(`@${c.user} `)}} className="text-[12px] font-bold text-neutral-500">Reply</button>
                    <span className="flex gap-1">{['❤️','😂','🔥','😍'].map(em=><button key={em} onClick={()=>setCommentText(p=>p+em)} className="text-[13px]">{em}</button>)}</span>
                    <button onClick={()=>setPinnedId(pinnedId===c.id?null:c.id)} className="text-[11px]">📌</button>
                    <button onClick={()=>{navigator.clipboard.writeText(c.text); alert('Copied!')}} className="text-[11px] text-neutral-400">Copy</button>
                    <button onClick={()=>setComments(prev=>prev.filter((x:any)=>x.id!==c.id))} className="text-[11px] text-red-400">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
<div className="p-3 border-t flex gap-2 items-center bg-white shrink-0 sticky bottom-0 z-20 pb-4 mb-[75px] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
  <button onClick={()=>setShowEmojiPicker(!showEmojiPicker)} className="text-[24px] shrink-0 w-8 h-8 flex items-center justify-center">😀</button>
  <img src="https://i.pravatar.cc/100?u=you" className="w-8 h-8 rounded-full shrink-0" alt="" />
  <div className="flex-1 flex items-center gap-2 border rounded-full px-3 py-1.5 bg-neutral-50 min-w-0">
    <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=> e.key==='Enter' && postComment()} placeholder={replyTo?`Reply to ${replyTo}...`:"Add a comment..."} className="flex-1 bg-transparent outline-none text-[14px] text-black min-w-0" />
    {commentText.trim() && (
      <button onClick={postComment} className="bg-blue-600 text-white font-bold text-[13px] px-5 py-2 rounded-full shrink-0">Post</button>
    )}
  </div>
</div>
          {showEmojiPicker && <div className="p-3 grid grid-cols-8 gap-2 bg-neutral-50 border-t"><span className="text-[20px]">{['❤️','😂','🔥','😍','👏','💯','😎','🥺','🤩','🙏','😭','😅','❤️‍🔥','💀','😊','🥰'].map(e=><button key={e} onClick={()=>{setCommentText(t=>t+e); setShowEmojiPicker(false)}}>{e}</button>)}</span></div>}
        </div>
      </div>
    )}

               {/* FEATURE 9,10,11,12 + 10 NEW: SHARE SHEET - 10 FUTURES VIRAL */}
    {showShare && (
      <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60" onClick={()=>setShowShare(false)}>
        <div className="bg-white rounded-t-[20px] p-5 animate-slideUp" onClick={e=>e.stopPropagation()}>
          <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />
          <h3 className="font-bold mb-1 text-center text-[16px] text-black">Share</h3>
          <p className="text-[11px] text-center text-neutral-500 mb-4">Share & Earn ₹0.10 per view 🔥</p>
          
          {/* GRID 4x3 - 10 FUTURES */}
          <div className="grid grid-cols-4 gap-4">
            <button onClick={()=>doShare('whatsapp')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-[20px]">💬</div>
              <span className="text-[11px] font-medium text-black">WhatsApp</span>
            </button>
            <button onClick={()=>doShare('instagram')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[20px]">📸</div>
              <span className="text-[11px] font-medium text-black">Instagram</span>
            </button>
            <button onClick={()=>doShare('telegram')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-[20px]">✈️</div>
              <span className="text-[11px] font-medium text-black">Telegram</span>
            </button>
            <button onClick={()=>doShare('facebook')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-[20px]">f</div>
              <span className="text-[11px] font-medium text-black">Facebook</span>
            </button>
            <button onClick={()=>doShare('copy')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white text-[18px]">🔗</div>
              <span className="text-[11px] font-medium text-black">Copy Link</span>
            </button>
            <button onClick={()=>doShare('download')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-[18px]">⬇️</div>
              <span className="text-[11px] font-medium text-black">Download</span>
            </button>
            <button onClick={()=>doShare('qr')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-[18px]">🔳</div>
              <span className="text-[11px] font-medium text-black">QR Code</span>
            </button>
            <button onClick={()=>doShare('clip')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-[18px]">✂️</div>
              <span className="text-[11px] font-medium text-black">Clip 15s</span>
            </button>
            <button onClick={()=>doShare('chitpix')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-[18px]">👥</div>
              <span className="text-[11px] font-medium text-black">ChitPix DM</span>
            </button>
            <button onClick={()=>doShare('private')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-[18px]">👻</div>
              <span className="text-[11px] font-medium text-black">Private 24h</span>
            </button>
          </div>

          {/* EXTRA INFO */}
          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-[16px]">🎁</span>
            <p className="text-[11px] text-black font-medium">Share cheste neeku earning! Download lo watermark auto add avthundi - Free promotion!</p>
          </div>

          <button onClick={()=>doShare('native')} className="w-full mt-4 py-3.5 bg-black text-white rounded-full font-bold text-[14px]">More Options...</button>
          <button onClick={()=>setShowShare(false)} className="w-full mt-2 py-3.5 bg-neutral-100 text-black rounded-full font-bold text-[14px]">Cancel</button>
        </div>
      </div>
    )} 

      {/* FEATURE 28: MORE OPTIONS - REPORT, NOT INTERESTED */}
      {showMore && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="bg-white rounded-t-[20px] p-2 animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto my-3" />
            <button className="w-full py-4 text-center text-red-600 font-medium border-b border-neutral-100" onClick={() => { alert('✅ Reported - we will review'); setShowMore(false) }}>Report</button>
            <button className="w-full py-4 text-center border-b border-neutral-100" onClick={() => { alert('Will show less like this'); setShowMore(false) }}>Not interested</button>
            <button className="w-full py-4 text-center border-b border-neutral-100" onClick={() => { doShare('download'); setShowMore(false) }}>Save video</button>
            <button className="w-full py-4 text-center border-b border-neutral-100" onClick={() => { doShare('copy'); setShowMore(false) }}>Copy link</button>
            <button className="w-full py-4 text-center font-bold mt-2 bg-neutral-100 rounded-full" onClick={() => setShowMore(false)}>Cancel</button>
          </div>
        </div>
      )}

      <BottomNav activeTab="reels" setActiveTab={() => {}} />

      <style>{`
        @keyframes heart{0%{transform:scale(0)}20%{transform:scale(1.3)}40%{transform:scale(0.9)}60%{transform:scale(1.1)}80%{transform:scale(1)}} 
        .animate-heart{animation:heart 0.8s cubic-bezier(0.17,0.89,0.32,1.49)}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .animate-slideUp{animation:slideUp 0.3s ease-out}
        .animate-spin-slow{animation:spin 4s linear infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none; scrollbar-width:none}
      `}</style>
        </div>
  )
}
