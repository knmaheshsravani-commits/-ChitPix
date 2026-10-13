'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

let activeVideoRef: HTMLVideoElement | null = null

const Icons = {
  heart: (f: boolean) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={f? "#ff3040" : "none"} stroke={f? "#ff3040" : "white"} strokeWidth="1.8"><path d="M12 21s-6.5-4.35-8.5-7.5A5 5 0 0 1 12 7a5 5 0 0 1 8.5 6.5C18.5 16.65 12 21 12 21z" /></svg>
  ),
  comment: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  share: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bookmark: (f: boolean) => (<svg width="26" height="26" viewBox="0 0 24 24" fill={f? "white" : "none"} stroke="white" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>),
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
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

  if (loading) return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading 2026 Reels...</div>
  if (!posts.length) return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Reels Yet</div>

  return (
    <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', background: '#000' }}>
      {posts.map((post, idx) => (
        <ReelCard key={post.id || idx} post={post} idx={idx} onActive={setActiveIndex} />
      ))}
    </div>
  )
}

function ReelCard({ post, idx, onActive }: any) {
  const imageUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  const isVideo = !!(post?.video_url || post?.video || imageUrl.includes('.mp4'))
  const username = post?.username || 'Knmahesh'
  const avatar = post?.user_avatar || `https://i.pravatar.cc/100?u=${username}`
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showHeart, setShowHeart] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showShare, setShowShare] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current; if (!v) return
    const obs = new IntersectionObserver((e) => {
      e.forEach((en) => {
        if (en.isIntersecting) {
          onActive(idx)
          if (activeVideoRef && activeVideoRef!== v) activeVideoRef.pause()
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
    setShowHeart(true); setTimeout(()=>setShowHeart(false), 800)
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (liked) { setLiked(false); setLikeCount(c=>c-1); await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName) }
    else { setLiked(true); setLikeCount(c=>c+1); await supabase.from("likes").insert({ post_id: post.id, username: myName }) }
  }

  if (!imageUrl) return null

  return (
    <div style={{ height: '100vh', scrollSnapAlign: 'start', position: 'relative', background: '#000', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      {isVideo? <video ref={videoRef} src={imageUrl} loop muted={isMuted} playsInline preload="metadata" onClick={()=>setIsMuted(!isMuted)} onDoubleClick={handleLike} style={{ height: '100%', width: '100%', maxWidth: '430px', objectFit: 'cover' }} /> : <img src={imageUrl} onDoubleClick={handleLike} style={{ height: '100%', width: '100%', maxWidth: '430px', objectFit: 'cover' }} alt="" />}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.2)' }}><div style={{ height: '100%', width: `${progress}%`, background: '#fff' }} /></div>
      <div style={{ position: 'absolute', top: '14px', left: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', borderRadius: '999px', padding: '4px 10px 4px 4px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={avatar} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{username}</span>
      </div>
      <div style={{ position: 'absolute', right: '12px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
        <button onClick={handleLike} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.heart(liked)}</button>
        <button onClick={()=>{}} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.comment}</button>
        <button onClick={()=>setShowShare(true)} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.share}</button>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>{Icons.eye} {likeCount || '2.1k'}</div>
      </div>
      {showHeart && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '80px' }}>❤️</div>}
      {showShare && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={()=>setShowShare(false)}>
          <div style={{ background: '#1c1c1e', width: '100%', maxWidth: '430px', borderRadius: '24px 24px 0 0', padding: '20px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <button onClick={()=>{ navigator.clipboard.writeText(imageUrl); alert('Copied ✅'); setShowShare(false) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#fff' }}><div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div><span style={{ fontSize: '11px' }}>Copy</span></button>
              <button onClick={()=>{ window.open(`https://wa.me/?text=${encodeURIComponent(imageUrl)}`, '_blank'); setShowShare(false) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#fff' }}><div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>W</div><span style={{ fontSize: '11px' }}>WhatsApp</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
                   }
