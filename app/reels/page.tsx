'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

let activeVideoRef: HTMLVideoElement | null = null
export const dynamic = 'force-dynamic'
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

function ReelItem({ post, index, total }: any) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [viewCount] = useState(Math.floor(Math.random() * 1500) + 200)
  const [showHeart, setShowHeart] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  let imageUrl = rawUrl
  if (rawUrl &&!rawUrl.startsWith('http') && R2_PUBLIC_URL) {
    imageUrl = `${R2_PUBLIC_URL}/${rawUrl.replace(/^\/+/, '')}`
  }
  const lower = (imageUrl || "").toLowerCase()
  const displayIsVideo = Boolean(post?.video_url || lower.includes('.mp4') || lower.includes('.mov') || lower.includes('.webm') || post?.type === 'reels')
  const username = post?.username || post?.profiles?.username || 'knmahesh'
  const avatar = post?.user_avatar || post?.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post?.caption || 'Hii'

  useEffect(() => {
    const load = async () => {
      const { count: l } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { count: c } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: false }).limit(30)
      setLikeCount(l || 50300)
      setCommentCount(c || 45)
      if (comms) setComments(comms)
      const myName = localStorage.getItem("chitpix_username")
      if (myName) {
        const { data: myLike } = await supabase.from("likes").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
        if (myLike) setLiked(true)
      }
    }
    load()
  }, [post.id])

  useEffect(() => {
    const video = videoRef.current
    if (!video ||!displayIsVideo) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (activeVideoRef && activeVideoRef!== video) { activeVideoRef.pause() }
          activeVideoRef = video
          video.play().catch(() => {})
          setIsPaused(false)
        } else { video.pause(); setIsPaused(true) }
      })
    }, { threshold: 0.6 })
    observer.observe(video)
    return () => observer.disconnect()
  }, [displayIsVideo])

  const handleLike = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (liked) {
      setLiked(false)
      setLikeCount((v) => Math.max(0, v - 1))
      await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName)
    } else {
      setLiked(true)
      setLikeCount((v) => v + 1)
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
      await supabase.from("likes").insert({ post_id: post.id, username: myName })
    }
  }

  const handleDirectShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'ChitPix', text: caption, url: imageUrl }) } catch {}
    } else {
      await navigator.clipboard.writeText(imageUrl)
      alert("Link Copied ✅")
    }
  }

  const handleDirectDownload = async () => {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chitpix-${post.id}.${displayIsVideo? 'mp4' : 'jpg'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { window.open(imageUrl, '_blank') }
  }

  if (!imageUrl) return null

  return (
    <div style={{ background: '#000', color: '#fff', width: '100%', height: '100vh', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden' }}>
      {/* Top Progress - Insta Style */}
      <div style={{ position: 'absolute', top: '6px', left: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 20 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: '2px', borderRadius: '2px', background: i === index? '#fff' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </div>

      {/* FULL COVER - NO BLACK BARS - FIX for your 2nd photo */}
      {displayIsVideo? (
        <video ref={videoRef} src={imageUrl} loop muted playsInline preload="auto" onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) { v.play(); setIsPaused(false) } else { v.pause(); setIsPaused(true) } }} onDoubleClick={handleLike} style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} />
      ) : (
        <img src={imageUrl} onDoubleClick={handleLike} style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} alt="post" />
      )}

      {showHeart? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '90px', zIndex: 30 }}>❤️</div> : null}
      {isPaused? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶️</div> : null}

      {/* RIGHT SIDE - INSTAGRAM EXACT - Thin outline icons */}
      <div style={{ position: 'absolute', right: '10px', bottom: '120px', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center', zIndex: 20 }}>
        {/* Like */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleLike} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', lineHeight: '1' }}>{liked? '❤️' : '♡'}</button>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{likeCount > 1000? `${(likeCount/1000).toFixed(1)}K` : likeCount}</span>
        </div>
        {/* Comment */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setShowComments(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px', lineHeight: '1' }}>◯<span style={{ marginLeft: '-23px', fontSize: '18px', position: 'relative', top: '-1px' }}>💬</span></button>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{commentCount || 45}</span>
        </div>
        {/* Repost */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => alert("Reposted 🔁")} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px' }}>⇄</button>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>514</span>
        </div>
        {/* Share */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleDirectShare} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px' }}>⌲</button>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>270</span>
        </div>
        {/* Save - Direct Download */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleDirectDownload} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px' }}>♡<span style={{ fontSize: '16px', marginLeft: '-16px' }}>⎙</span></button>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>3,645</span>
        </div>
      </div>

      {/* BOTTOM LEFT - INSTAGRAM EXACT */}
      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '60px', padding: '0 14px 22px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <img onClick={() => router.push(`/profile/${username}`)} src={avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #fff' }} alt="av" />
          <span onClick={() => router.push(`/profile/${username}`)} style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.2px' }}>{username}</span>
          <button onClick={() => router.push(`/messages?user=${username}`)} style={{ background: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '5px 14px', fontSize: '13px', fontWeight: 700, marginLeft: '8px' }}>Follow</button>
        </div>
        <div style={{ fontSize: '14.5px', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {caption} Mindset locked. Eyes forward.. <span style={{ opacity: 0.7 }}>...</span>
        </div>
        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.85, display: 'flex', gap: '10px' }}>
          <span>👁️ {viewCount} views</span>
          <span style={{ opacity: 0.6 }}>• R2 Connected</span>
        </div>
      </div>

      {/* Comment Sheet */}
      {showComments? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}><b>Comments</b><button onClick={() => setShowComments(false)} style={{ border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '28px', height: '28px' }}>✕</button></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>{comments.map((c, i) => (<div key={i} style={{ marginBottom: '12px' }}><b>{c.username}</b> {c.comment || c.text}</div>))}</div>
            <div style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { const myName = localStorage.getItem("chitpix_username") || "guest"; supabase.from("comments").insert({ post_id: post.id, username: myName, comment: commentText, text: commentText }).then(() => { setComments([{ username: myName, comment: commentText, created_at: new Date().toISOString() },...comments]); setCommentText("") }) } }} placeholder="Add a comment..." style={{ flex: 1, background: '#efefef', border: 'none', borderRadius: '20px', padding: '10px 16px' }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
        const filtered = (data || []).filter((p: any) => { const url = p?.image_url || p?.image || p?.video_url || p?.video || p?.url; return Boolean(url) })
        setPosts(filtered)
      } catch { setPosts([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) {
    return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }
  if (posts.length === 0) {
    return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No reels</div>
  }
  return (
    <div style={{ background: '#000', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', maxWidth: '470px', margin: '0 auto' }}>
      {posts.map((post: any, i: number) => (
        <ReelItem key={post.id || i} post={post} index={i} total={posts.length} />
      ))}
    </div>
  )
      }
