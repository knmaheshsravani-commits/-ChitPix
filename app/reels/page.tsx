'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

let activeVideoRef: HTMLVideoElement | null = null
export const dynamic = 'force-dynamic'

// R2 PUBLIC URL - .env.local lo pettu: NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

function ReelItem({ post }: any) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [isMuted, setIsMuted] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  let imageUrl = rawUrl
  if (rawUrl && !rawUrl.startsWith('http') && R2_PUBLIC_URL) {
    imageUrl = `${R2_PUBLIC_URL}/${rawUrl.replace(/^\/+/, '')}`
  }
  const isVideo = true
  const username = post?.username || post?.profiles?.username || 'Knmahesh'
  const avatar = post?.user_avatar || post?.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post?.caption || ''

  useEffect(() => {
    const load = async () => {
      const { count: l } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { count: c } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: false })
      setLikeCount(l || 0); setCommentCount(c || 0); if (comms) setComments(comms)
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
    if (!video) return
    video.muted = true
    const onMute = (e: any) => { if (e.detail !== video) { video.muted = true; video.pause(); setIsMuted(true) } }
    window.addEventListener('CHITPIX_MUTE_OTHERS', onMute)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (activeVideoRef && activeVideoRef !== video) { activeVideoRef.muted = true; activeVideoRef.pause() }
          document.querySelectorAll('video').forEach(v => { if (v !== video) (v as HTMLVideoElement).pause() })
          activeVideoRef = video; video.muted = true; setIsMuted(true)
          video.play().catch(() => {})
          window.dispatchEvent(new CustomEvent('CHITPIX_MUTE_OTHERS', { detail: video }))
        } else { video.pause(); if (activeVideoRef === video) activeVideoRef = null }
      })
    }, { threshold: 0.75 })
    observer.observe(video)
    return () => { window.removeEventListener('CHITPIX_MUTE_OTHERS', onMute); observer.disconnect() }
  }, [])

  const handleLike = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (liked) { setLiked(false); setLikeCount(v => Math.max(0, v - 1)); await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName) }
    else { setLiked(true); setLikeCount(v => v + 1); await supabase.from("likes").insert({ post_id: post.id, username: myName }) }
  }

  const handleCommentPost = async () => {
    if (!commentText.trim() || isPosting) return
    setIsPosting(true)
    const myName = localStorage.getItem("chitpix_username") || "guest"
    const { error } = await supabase.from("comments").insert({ post_id: post.id, username: myName, comment: commentText, text: commentText })
    if (!error) { setComments([{ username: myName, comment: commentText, created_at: new Date().toISOString() }, ...comments]); setCommentCount(v => v + 1); setCommentText("") }
    setIsPosting(false)
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/reels` : ''
  const doWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent("Check this reel 🔥 " + shareUrl + " " + imageUrl)}`, "_blank"); setShowShare(false) }
  const doCopy = async () => { await navigator.clipboard.writeText(imageUrl); alert("Link Copied ✅"); setShowShare(false) }
  const doSaveR2 = async () => { const a = document.createElement('a'); a.href = imageUrl; a.download = `chitpix-${post.id}.mp4`; a.target = '_blank'; document.body.appendChild(a); a.click(); a.remove(); setShowShare(false) }

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return
    if (v.muted) {
      document.querySelectorAll('video').forEach(o => { if (o !== v) (o as HTMLVideoElement).muted = true })
      v.muted = false; setIsMuted(false); activeVideoRef = v; v.play().catch(() => {})
      window.dispatchEvent(new CustomEvent('CHITPIX_MUTE_OTHERS', { detail: v }))
    } else { v.muted = true; setIsMuted(true) }
  }

  if (!imageUrl) return null

  return (
    <div style={{ background: '#000', color: '#fff', width: '100%', height: '100vh', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden' }}>
      <video ref={videoRef} src={imageUrl} loop muted playsInline preload="metadata" crossOrigin="anonymous" onClick={toggleMute} onDoubleClick={handleLike} style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} />
      <button onClick={toggleMute} style={{ position: 'absolute', bottom: '120px', right: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: '42px', height: '42px', fontSize: '20px' }}>{isMuted ? '🔇' : '🔊'}</button>
      
      <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '70px', padding: '0 12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}><img src={avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff' }} alt="av" /><b>{username}</b><span style={{ background: '#fff', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Follow</span></div>
        <div style={{ fontSize: '14px', marginBottom: '6px' }}>{caption}</div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>🌐 R2 Connected: {imageUrl.includes('r2') ? '✅ Cloudflare R2' : 'Supabase'}</div>
      </div>

      <div style={{ position: 'absolute', right: '8px', bottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>{liked ? '❤️' : '🤍'}</div><span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{likeCount}</span></button>
        <button onClick={() => setShowComments(true)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>💬</div><span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{commentCount}</span></button>
        <button onClick={() => setShowShare(true)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>↗️</div><span style={{ color: '#fff', fontSize: '12px' }}>Share</span></button>
        <button onClick={doSaveR2} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⬇️</div><span style={{ color: '#fff', fontSize: '10px' }}>R2 Save</span></button>
      </div>

      {showComments && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-between' }}><b>Comments {commentCount}</b><button onClick={() => setShowComments(false)} style={{ border: 'none', background: '#efefef', borderRadius: '50%', width: '28px', height: '28px' }}>✕</button></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>{comments.map((c, i) => (<div key={i} style={{ marginBottom: '12px', fontSize: '14px' }}><b>{c.username}</b> {c.comment || c.text}</div>))}</div>
            <div style={{ padding: '10px 12px 20px', borderTop: '1px solid #dbdbdb', display: 'flex', gap: '8px' }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCommentPost() }} placeholder="Add a comment..." style={{ flex: 1, background: '#efefef', border: 'none', borderRadius: '20px', padding: '12px 16px', outline: 'none' }} />
              <button onClick={handleCommentPost} disabled={!commentText.trim()} style={{ color: commentText.trim() ? '#0095f6' : '#b2dffc', fontWeight: 700, border: 'none', background: 'none' }}>{isPosting ? '...' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}
      {showShare && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowShare(false)}>
          <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', padding: '20px 16px 30px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Share Reel • R2 ✅</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <button onClick={doWhatsApp} style={{ border: 'none', background: 'none', textAlign: 'center' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>W</div>WhatsApp</button>
              <button onClick={doCopy} style={{ border: 'none', background: 'none' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>🔗</div>Copy</button>
              <button onClick={doSaveR2} style={{ border: 'none', background: 'none' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>⬇️</div>Save R2</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
        if (error) throw error
        // ✅ BUILD FAIL FIX - undefined check + R2 support
        const filtered = (data || []).filter((p: any) => {
          if (!p) return false
          const url = p?.image_url || p?.image || p?.video_url || p?.video || p?.url || ''
          if (!url) return false
          const lower = url.toLowerCase()
          const isVideo = p?.isVideo || p?.type === 'reels' || lower.includes('.mp4') || lower.includes('.mov') || lower.includes('.webm') || url.includes('r2.dev') || url.includes('r2.cloudflarestorage') || url.includes('cloudflare')
          return isVideo
        })
        setPosts(filtered)
      } catch (e) { console.log(e); setPosts([]) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading R2 Reels... 🔄</div>
  if (posts.length === 0) return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><div style={{ fontSize: '40px' }}>🎬</div><p>No reels - Upload R2 video first!</p></div>

  return (
    <div style={{ background: '#000', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', maxWidth: '470px', margin: '0 auto' }}>
      {posts.map((post: any) => {
        // ✅ ULTRA SAFE - idhe nee error fix
        if (!post) return null
        const url = post?.image_url || post?.image || post?.video_url || post?.video || post?.url
        if (!url) return null
        return <ReelItem key={post?.id || Math.random()} post={post} />
      })}
    </div>
  )
        }
