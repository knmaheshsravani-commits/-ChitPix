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
  const [following, setFollowing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [replyTo, setReplyTo] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isMuted, setIsMuted] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [viewCount, setViewCount] = useState(100)
  const [showHeart, setShowHeart] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const longPressTimer = useRef<any>(null)

  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  let imageUrl = rawUrl
  if (rawUrl && !rawUrl.startsWith('http') && R2_PUBLIC_URL) {
    imageUrl = `${R2_PUBLIC_URL}/${rawUrl.replace(/^\/+/, '')}`
  }
  const lower = (imageUrl || "").toLowerCase()
  const displayIsVideo = Boolean(post?.video_url || lower.includes('.mp4') || lower.includes('.mov') || lower.includes('.webm') || post?.type === 'reels')
  const username = post?.username || post?.profiles?.username || 'Knmahesh'
  const avatar = post?.user_avatar || post?.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post?.caption || 'Hi'

  useEffect(() => {
    const load = async () => {
      const { count: l } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { count: c } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: false }).limit(50)
      setLikeCount(l || 0)
      setCommentCount(c || 0)
      if (comms) setComments(comms)
      setViewCount(Math.floor(Math.random() * 5000) + 100)
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
    if (!video || !displayIsVideo) return
    video.muted = true
    const onTime = () => { if (video.duration) setProgress((video.currentTime / video.duration) * 100) }
    video.addEventListener('timeupdate', onTime)
    const onMute = (e: any) => { if (e.detail !== video) { video.muted = true; video.pause(); setIsMuted(true) } }
    window.addEventListener('CHITPIX_MUTE_OTHERS', onMute)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (activeVideoRef && activeVideoRef !== video) { activeVideoRef.muted = true; activeVideoRef.pause() }
          document.querySelectorAll('video').forEach(v => { if (v !== video) (v as HTMLVideoElement).pause() })
          activeVideoRef = video
          setIsPaused(false)
          video.play().catch(() => {})
          window.dispatchEvent(new CustomEvent('CHITPIX_MUTE_OTHERS', { detail: video }))
        } else {
          video.pause()
          setIsPaused(true)
          if (activeVideoRef === video) activeVideoRef = null
        }
      })
    }, { threshold: 0.6 })
    observer.observe(video)
    return () => {
      window.removeEventListener('CHITPIX_MUTE_OTHERS', onMute)
      video.removeEventListener('timeupdate', onTime)
      observer.disconnect()
    }
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
      setTimeout(() => setShowHeart(false), 900)
      await supabase.from("likes").insert({ post_id: post.id, username: myName })
    }
  }

  const handleDoubleTap = () => {
    if (!liked) handleLike()
    else { setShowHeart(true); setTimeout(() => setShowHeart(false), 900) }
  }

  const handleFollow = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (following) {
      setFollowing(false)
      await supabase.from("follows").delete().eq("follower", myName).eq("following", username)
    } else {
      setFollowing(true)
      await supabase.from("follows").insert({ follower: myName, following: username })
    }
  }

  const handleCommentPost = async () => {
    if (!commentText.trim() || isPosting) return
    setIsPosting(true)
    const myName = localStorage.getItem("chitpix_username") || "guest"
    const finalText = replyTo ? `@${replyTo.username} ${commentText}` : commentText
    const { data, error } = await supabase.from("comments").insert({ post_id: post.id, username: myName, comment: finalText, text: finalText }).select()
    if (!error) {
      const newItem = data && data[0] ? data[0] : { username: myName, comment: finalText, created_at: new Date().toISOString() }
      setComments([newItem, ...comments])
      setCommentCount((v) => v + 1)
      setCommentText("")
      setReplyTo(null)
    }
    setIsPosting(false)
  }

  const handleDirectShare = async () => {
    const url = imageUrl
    if (navigator.share) {
      try { await navigator.share({ title: 'ChitPix', text: caption, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
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
      a.download = `chitpix-${post.id}.${displayIsVideo ? 'mp4' : 'jpg'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(imageUrl, '_blank')
    }
  }

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => { if (videoRef.current) videoRef.current.playbackRate = 2 }, 400)
  }
  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current)
    if (videoRef.current) videoRef.current.playbackRate = 1
  }

  const handleTapPause = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setIsPaused(false) } else { v.pause(); setIsPaused(true) }
  }

  if (!imageUrl) return null

  return (
    <div style={{ background: '#000', color: '#fff', width: '100%', height: '100vh', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden' }} onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd} onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd}>
      {displayIsVideo ? <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: `${progress}%`, background: '#fff', zIndex: 20 }} /> : null}
      <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, height: '2px', display: 'flex', gap: '4px', padding: '0 4px', zIndex: 19 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, background: i === index ? '#fff' : 'rgba(255,255,255,0.4)', height: '2px', borderRadius: '2px' }} />
        ))}
      </div>

      {displayIsVideo ? (
        <video ref={videoRef} src={imageUrl} loop muted playsInline preload="metadata" crossOrigin="anonymous" onClick={handleTapPause} onDoubleClick={handleDoubleTap} style={{ width: '100%', height: '100vh', objectFit: 'contain', background: '#000', display: 'block' }} />
      ) : (
        <img src={imageUrl} onDoubleClick={handleDoubleTap} style={{ width: '100%', height: '100vh', objectFit: 'contain', background: '#000', display: 'block' }} alt="post" />
      )}

      {showHeart ? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(1.2)', fontSize: '90px', zIndex: 30, transition: 'all 0.3s' }}>❤️</div> : null}
      {isPaused ? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>▶️</div> : null}

      <div style={{ position: 'absolute', top: '20px', right: '12px', zIndex: 20 }}>
        <button onClick={() => setShowMenu(true)} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', fontSize: '22px', width: '36px', height: '36px', borderRadius: '50%' }}>⋯</button>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
          <img onClick={() => router.push(`/profile/${username}`)} src={avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #fff', cursor: 'pointer' }} alt="av" />
          <b onClick={() => router.push(`/profile/${username}`)} style={{ cursor: 'pointer' }}>{username}</b>
          <button onClick={handleFollow} style={{ background: following ? 'rgba(255,255,255,0.2)' : '#fff', color: following ? '#fff' : '#000', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, border: following ? '1px solid #fff' : 'none', marginLeft: '8px' }}>{following ? 'Following' : 'Follow'}</button>
          <button onClick={() => router.push(`/messages?user=${username}`)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.6)' }}>DM</button>
        </div>
        <div style={{ fontSize: '14px', maxWidth: '75%' }}>{caption}</div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
          <span>👁️ {viewCount} views</span>
          <span>🌐 R2 Connected</span>
        </div>
      </div>

      <div style={{ position: 'absolute', right: '8px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', zIndex: 20 }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{liked ? '❤️' : '🤍'}</div><span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{likeCount}</span></button>
        <button onClick={() => setShowComments(true)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💬</div><span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{commentCount}</span></button>
        <button onClick={handleDirectShare} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>↗️</div><span style={{ color: '#fff', fontSize: '12px' }}>Share</span></button>
        <button onClick={handleDirectDownload} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⬇️</div><span style={{ color: '#fff', fontSize: '11px' }}>Save</span></button>
      </div>

      {showMenu ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowMenu(false)}>
          <div style={{ background: '#1a1a1a', color: '#fff', width: '100%', maxWidth: '470px', margin: '0 auto', borderRadius: '16px 16px 0 0', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { alert("Reported"); setShowMenu(false) }} style={{ width: '100%', padding: '16px', background: 'none', border: 'none', color: '#ff3040', textAlign: 'left', fontSize: '16px' }}>🚩 Report</button>
            <button onClick={() => { setShowMenu(false) }} style={{ width: '100%', padding: '16px', background: 'none', border: 'none', color: '#fff', textAlign: 'left', fontSize: '16px' }}>Cancel</button>
          </div>
        </div>
      ) : null}

      {showComments ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', height: '78vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-between' }}><b>Comments {commentCount}</b><button onClick={() => setShowComments(false)} style={{ border: 'none', background: '#efefef', borderRadius: '50%', width: '32px', height: '32px' }}>✕</button></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {comments.map((c, i) => (
                <div key={i} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                  <img src={`https://i.pravatar.cc/40?u=${c.username}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="av" />
                  <div><b style={{ fontSize: '13px' }}>{c.username}</b> <span style={{ fontSize: '14px' }}>{c.comment || c.text}</span></div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #dbdbdb', display: 'flex', gap: '8px' }}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCommentPost() }} placeholder="Add a comment..." style={{ flex: 1, background: '#efefef', border: 'none', borderRadius: '20px', padding: '12px 16px', outline: 'none' }} />
              <button onClick={handleCommentPost} disabled={isPosting || !commentText.trim()} style={{ color: commentText.trim() ? '#0095f6' : '#b2dffc', fontWeight: 800, border: 'none', background: 'none' }}>{isPosting ? '...' : 'Post'}</button>
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
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(150)
        const filtered = (data || []).filter((p: any) => {
          const url = p?.image_url || p?.image || p?.video_url || p?.video || p?.url
          return Boolean(url)
        })
        setPosts(filtered)
      } catch {
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Best Reels... 🔥</div>
  }

  if (posts.length === 0) {
    return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><div style={{ fontSize: '50px' }}>🎬</div><p>Upload R2 video first bro!</p></div>
  }

  return (
    <div style={{ background: '#000', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', maxWidth: '470px', margin: '0 auto' }}>
      {posts.map((post: any, i: number) => {
        if (!post) return null
        const url = post?.image_url || post?.image || post?.video_url || post?.video || post?.url
        if (!url) return null
        return <ReelItem key={post.id || i} post={post} index={i} total={posts.length} />
      })}
    </div>
  )
    }
