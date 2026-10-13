'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

let activeVideo: any = null

export default function PostCard({ post }: any) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [isMuted, setIsMuted] = useState(true)
  const [filter, setFilter] = useState("normal")
  const videoRef = useRef<any>(null)

  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [saveCount, setSaveCount] = useState(0)

  useEffect(() => {
    try {
      if (localStorage.getItem('chitpix_admin') === 'true') setIsAdmin(true)
    } catch {}
    const load = async () => {
      try {
        const { count: l } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id)
        const { count: c } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id)
        const { count: s } = await supabase.from("saves").select("*", { count: "exact", head: true }).eq("post_id", post.id)
        setLikeCount(l || 0); setCommentCount(c || 0); setSaveCount(s || 0)
        const myName = localStorage.getItem("chitpix_username")
        if (myName) {
          const { data: myLike } = await supabase.from("likes").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
          if (myLike) setLiked(true)
          const { data: mySave } = await supabase.from("saves").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
          if (mySave) setSaved(true)
          const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: false })
          if (comms) setComments(comms)
        }
      } catch (e) { console.log(e) }
    }
    load()
  }, [post.id])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (activeVideo && activeVideo !== video) {
            try { activeVideo.pause(); activeVideo.muted = true } catch {}
          }
          document.querySelectorAll('video').forEach((v: any) => {
            if (v !== video) { v.pause(); v.muted = true }
          })
          activeVideo = video
          video.muted = true
          setIsMuted(true)
          video.play().catch(() => {})
        } else {
          video.pause()
          video.muted = true
          setIsMuted(true)
        }
      })
    }, { threshold: 0.7 })
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const handleDelete = async () => {
    if (!confirm('Delete?')) return
    const res = await fetch('/api/admin/delete-post', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) })
    if (res.ok) { alert('Deleted!'); window.location.reload() }
  }

  const handleLike = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    try {
      if (liked) { setLiked(false); setLikeCount(v => Math.max(0, v - 1)); await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName) }
      else { setLiked(true); setLikeCount(v => v + 1); await supabase.from("likes").insert({ post_id: post.id, username: myName }) }
    } catch {}
  }

  const handleSave = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    try {
      if (saved) { setSaved(false); setSaveCount(v => Math.max(0, v - 1)); await supabase.from("saves").delete().eq("post_id", post.id).eq("username", myName) }
      else { setSaved(true); setSaveCount(v => v + 1); await supabase.from("saves").insert({ post_id: post.id, username: myName }) }
    } catch {}
  }

  const handleCommentPost = async () => {
    if (!commentText.trim()) return
    const myName = localStorage.getItem("chitpix_username") || "guest"
    try {
      await supabase.from("comments").insert({ post_id: post.id, username: myName, comment: commentText, text: commentText })
      setComments([{ username: myName, comment: commentText }, ...comments])
      setCommentCount(v => v + 1)
      setCommentText("")
    } catch {}
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    if (v.muted) {
      document.querySelectorAll('video').forEach((o: any) => { if (o !== v) { o.muted = true; o.pause() } })
      v.muted = false; setIsMuted(false); activeVideo = v; v.play().catch(() => {})
    } else { v.muted = true; setIsMuted(true) }
  }

  const rawUrl = post.image_url || post.image || post.video_url || post.video || post.url || ""
  const imageUrl = rawUrl
  const isVideo = post.isVideo || post.video_url || post.video || post.type === 'reels' || imageUrl?.toLowerCase().includes('.mp4') || imageUrl?.toLowerCase().includes('r2.dev')

  const username = post.username || post.profiles?.username || 'Knmahesh'
  const avatar = post.user_avatar || post.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post.caption || ''
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (!imageUrl) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', margin: '0 auto 16px', maxWidth: '470px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px' }}>
        <img src={avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="av" />
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{username}</div>
        {isAdmin && <button onClick={handleDelete} style={{ marginLeft: 'auto', background: '#ff3040', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px' }}>Delete</button>}
      </div>

      {isVideo ? (
        <div style={{ position: 'relative', background: '#000' }}>
          <video ref={videoRef} src={imageUrl} loop muted playsInline preload="metadata" crossOrigin="anonymous" onDoubleClick={handleLike} onClick={toggleMute} style={{ width: '100%', aspectRatio: '9/16', maxHeight: '600px', objectFit: 'cover', display: 'block', filter: filter === 'bw' ? 'grayscale(1)' : filter === 'sepia' ? 'sepia(1)' : 'none' }} />
          <button onClick={toggleMute} style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '18px' }}>{isMuted ? '🔇' : '🔊'}</button>
          <div style={{ position: 'absolute', bottom: '12px', left: '10px', display: 'flex', gap: '6px' }}>
            <button onClick={() => setFilter('normal')} style={{ background: filter === 'normal' ? '#fff' : 'rgba(0,0,0,0.5)', color: filter === 'normal' ? '#000' : '#fff', border: 'none', borderRadius: '12px', padding: '4px 10px', fontSize: '10px' }}>Normal</button>
            <button onClick={() => setFilter('bw')} style={{ background: filter === 'bw' ? '#fff' : 'rgba(0,0,0,0.5)', color: filter === 'bw' ? '#000' : '#fff', border: 'none', borderRadius: '12px', padding: '4px 10px', fontSize: '10px' }}>B&W</button>
            <button onClick={() => setFilter('sepia')} style={{ background: filter === 'sepia' ? '#fff' : 'rgba(0,0,0,0.5)', color: filter === 'sepia' ? '#000' : '#fff', border: 'none', borderRadius: '12px', padding: '4px 10px', fontSize: '10px' }}>Sepia</button>
          </div>
        </div>
      ) : (
        <img src={imageUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} alt="post" />
      )}

      <div style={{ padding: '10px 12px', display: 'flex', gap: '18px', alignItems: 'center' }}>
        <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none' }}><span style={{ fontSize: '22px' }}>{liked ? '❤️' : '🤍'}</span><span style={{ fontSize: '14px', fontWeight: 600 }}>{likeCount}</span></button>
        <button onClick={() => setShowComments(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none' }}><span style={{ fontSize: '22px' }}>💬</span><span style={{ fontSize: '14px', fontWeight: 600 }}>{commentCount}</span></button>
        <button onClick={() => setShowShare(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none' }}><span style={{ fontSize: '22px' }}>✈️</span><span style={{ fontSize: '14px', fontWeight: 600 }}>{shareCount}</span></button>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', marginLeft: 'auto' }}><span style={{ fontSize: '22px' }}>{saved ? '🔖' : '📑'}</span><span style={{ fontSize: '14px', fontWeight: 600 }}>{saveCount}</span></button>
      </div>

      {caption && <div style={{ padding: '0 12px 12px', fontSize: '14px' }}><b>{username}</b> {caption}</div>}

      {showComments && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}><b>Comments {commentCount}</b><button onClick={() => setShowComments(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '28px', height: '28px' }}>✕</button></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {comments.length === 0 ? <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>Be first to comment!</p> : comments.map((c: any, i: number) => (<div key={i} style={{ marginBottom: '8px' }}><b>{c.username}</b> {c.comment || c.text}</div>))}
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', background: '#fff' }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." style={{ flex: 1, background: '#f0f0f0', border: 'none', borderRadius: '20px', padding: '10px 14px', outline: 'none' }} />
              <button onClick={handleCommentPost} style={{ color: '#0095f6', fontWeight: 700, border: 'none', background: 'none' }}>Post</button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowShare(false)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', padding: '16px 16px 30px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 12px' }}></div>
            <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Share Reel</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank'); setShowShare(false) }} style={{ border: 'none', background: 'none', textAlign: 'center' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>W</div><div style={{ fontSize: '12px', marginTop: '6px' }}>WhatsApp</div></button>
              <button onClick={async () => { await navigator.clipboard.writeText(imageUrl); alert('Copied!'); setShowShare(false) }} style={{ border: 'none', background: 'none', textAlign: 'center' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div><div style={{ fontSize: '12px', marginTop: '6px' }}>Copy</div></button>
              <button onClick={() => { const a = document.createElement('a'); a.href = imageUrl; a.download = 'reel.mp4'; a.click(); setShowShare(false) }} style={{ border: 'none', background: 'none', textAlign: 'center' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>⬇️</div><div style={{ fontSize: '12px', marginTop: '6px' }}>Save R2</div></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
      }
