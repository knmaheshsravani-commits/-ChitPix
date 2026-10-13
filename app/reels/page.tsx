'use client'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

let activeVideoRef: HTMLVideoElement | null = null

// 2026 MODERN SVG ICONS
const Icons = {
  heart: (filled: boolean) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled? "#ff3040" : "none"} stroke={filled? "#ff3040" : "white"} strokeWidth="1.8"><path d="M12 21s-6.5-4.35-8.5-7.5A5 5 0 0 1 12 7a5 5 0 0 1 8.5 6.5C18.5 16.65 12 21 12 21z" /></svg>
  ),
  comment: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  share: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bookmark: (filled: boolean) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled? "white" : "none"} stroke="white" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
  ),
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  mute: (muted: boolean) => muted? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
  ),
}

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/upload', { cache: 'no-store' })
        const data = await res.json()
        let list = data.posts || data || []
        list = list.filter((p: any) => p && (p.image_url || p.image || p.video_url || p.video || p.url))
        setPosts(list)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading 2026 Reels...</div>
  if (!posts.length) return <div className="h-screen bg-black text-white flex items-center justify-center">No Reels</div>

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {posts.map((post, idx) => (
        <ReelCard key={post.id || idx} post={post} idx={idx} id={`reel-${idx}`} onActive={setActiveIndex} isActive={activeIndex === idx} />
      ))}
    </div>
  )
}

function ReelCard({ post, idx, id, onActive, isActive }: any) {
  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  const imageUrl = rawUrl
  const isVideo =!!(post?.video_url || post?.video || imageUrl?.includes('.mp4'))
  const username = post?.username || 'Knmahesh'
  const avatar = post?.user_avatar || `https://i.pravatar.cc/100?u=${username}`
  const caption = post?.caption || '2026 vibe ✨ #chitpix #viral'

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showHeart, setShowHeart] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current; if (!v) return
    const obs = new IntersectionObserver((e) => {
      e.forEach((en) => {
        if (en.isIntersecting) {
          onActive(idx)
          if (activeVideoRef && activeVideoRef!== v) { activeVideoRef.pause() }
          activeVideoRef = v; v.play().catch(()=>{})
        } else v.pause()
      })
    }, { threshold: 0.7 })
    obs.observe(v)
    const t = () => setProgress((v.currentTime / (v.duration || 1)) * 100)
    v.addEventListener('timeupdate', t)
    return () => { obs.disconnect(); v.removeEventListener('timeupdate', t) }
  }, [])

  const handleLike = async () => {
    setShowHeart(true); setTimeout(()=>setShowHeart(false), 900)
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (liked) { setLiked(false); setLikeCount(c=>c-1); await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName) }
    else { setLiked(true); setLikeCount(c=>c+1); await supabase.from("likes").insert({ post_id: post.id, username: myName }) }
  }

  return (
    <div id={id} className="h-screen snap-start relative flex justify-center bg-black overflow-hidden">
      {/* VIDEO */}
      {isVideo? <video ref={videoRef} src={imageUrl} loop muted={isMuted} playsInline preload="metadata" onClick={()=>setIsMuted(!isMuted)} onDoubleClick={handleLike} className="h-full w-full max-w-[430px] object-cover"/> : <img src={imageUrl} onDoubleClick={handleLike} className="h-full w-full max-w-[430px] object-cover"/>}

      {/* TOP GRADIENT */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* PROGRESS */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/20"><div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} /></div>

      {/* HEADER - 2026 GLASS */}
      <div className="absolute top-4 left-3 right-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xl rounded-full pl-1 pr-3 py-1 border border-white/10">
          <img src={avatar} className="w-8 h-8 rounded-full" alt=""/>
          <span className="text-white text-[13px] font-semibold">{username}</span>
          <button className="ml-2 bg-white text-black text-[11px] font-bold px-3 py-1 rounded-full">Follow</button>
        </div>
        <button onClick={()=>setIsMuted(!isMuted)} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          {Icons.mute(isMuted)}
        </button>
      </div>

      {/* RIGHT ACTIONS - 2026 STYLE */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-10">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className="w-[48px] h-[48px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center group-active:scale-90 transition">{Icons.heart(liked)}</div>
          <span className="text-white text-[12px] font-semibold">{likeCount || '12.5k'}</span>
        </button>
        <button onClick={()=>setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="w-[48px] h-[48px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">{Icons.comment}</div>
          <span className="text-white text-[12px]">342</span>
        </button>
        <button onClick={()=>setShowShare(true)} className="flex flex-col items-center gap-1">
          <div className="w-[48px] h-[48px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">{Icons.share}</div>
          <span className="text-white text-[12px]">Share</span>
        </button>
        <button onClick={()=>setSaved(!saved)} className="w-[48px] h-[48px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          {Icons.bookmark(saved)}
        </button>
        <div className="flex items-center gap-1 text-white/70 text-[11px] mt-1">{Icons.eye} 45.2k</div>
      </div>

      {/* CAPTION */}
      <div className="absolute bottom-6 left-4 right-20 z-10">
        <p className="text-white text-[14px] leading-[18px] line-clamp-2">{caption}</p>
        <p className="text-white/60 text-[12px] mt-2">♪ Original audio • ChitPix 2026</p>
      </div>

      {/* HEART BURST */}
      {showHeart && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[90px] animate-[pop_0.9s_ease] pointer-events-none">❤️</div>}

      {/* COMMENT SHEET */}
      {showComments && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-end justify-center" onClick={()=>setShowComments(false)}>
          <div className="bg-[#121212] w-full max-w-[470px] rounded-t-[24px] h-[65vh] flex flex-col border-t border-white/10" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4"/>
            <div className="px-4 pb-3 text-white font-semibold text-center border-b border-white/10">2,341 comments</div>
            <div className="flex-1 p-4 text-white/50 text-sm flex items-center justify-center">Comments UI - Connect to Supabase 💬</div>
          </div>
        </div>
      )}

      {/* SHARE SHEET - 2026 */}
      {showShare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-end justify-center" onClick={()=>setShowShare(false)}>
          <div className="bg-[#1c1c1e] w-full max-w-[470px] rounded-t-[28px] p-6 pb-10 border-t border-white/10" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6"/>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'WhatsApp', color: '#25D366', icon: 'W' },
                { name: 'Copy', color: '#2c2c2e', icon: '🔗' },
                { name: 'Save', color: '#2c2c2e', icon: '⬇️' },
                { name: 'Report', color: '#ff3b30', icon: '!' },
              ].map((s)=>(
                <button key={s.name} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-[18px] flex items-center justify-center text-white font-bold" style={{ background: s.color }}>{s.icon}</div>
                  <span className="text-white text-[11px]">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pop{0%{transform:translate(-50%,-50%) scale(0)}50%{transform:translate(-50%,-50%) scale(1.3)}100%{transform:translate(-50%,-50%) scale(1)}}`}</style>
    </div>
  )
      }
