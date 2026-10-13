'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

let activeVideoRef: HTMLVideoElement | null = null
export const dynamic = 'force-dynamic'
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

function ReelItem({ post, index, total, onReload }: any) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [viewCount] = useState(Math.floor(Math.random() * 2000) + 100)
  const [showHeart, setShowHeart] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  let imageUrl = rawUrl
  if (rawUrl &&!rawUrl.startsWith('http') && R2_PUBLIC_URL) {
    imageUrl = `${R2_PUBLIC_URL}/${rawUrl.replace(/^\/+/, '')}`
  }
  const lower = (imageUrl || "").toLowerCase()
  const displayIsVideo = Boolean(post?.video_url || lower.includes('.mp4') || lower.includes('.mov') || lower.includes('.webm'))
  const username = post?.username || post?.profiles?.username || 'knmahesh'
  const avatar = post?.user_avatar || post?.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post?.caption || 'Hii'

  useEffect(() => {
    const load = async () => {
      const { count: l } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { count: c } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id)
      const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: false }).limit(20)
      setLikeCount(l || 0)
      setCommentCount(c || 0)
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
          if (activeVideoRef && activeVideoRef!== video) activeVideoRef.pause()
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
      setLiked(false); setLikeCount((v) => Math.max(0, v - 1))
      await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName)
    } else {
      setLiked(true); setLikeCount((v) => v + 1); setShowHeart(true); setTimeout(() => setShowHeart(false), 800)
      await supabase.from("likes").insert({ post_id: post.id, username: myName })
    }
  }

  const handleShare = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'ChitPix', url: imageUrl }) } catch {} }
    else { await navigator.clipboard.writeText(imageUrl); alert("Link Copied ✅") }
  }

  const handleSave = async () => {
    const a = document.createElement('a'); a.href = imageUrl; a.target = '_blank'; a.download = `chitpix-${post.id}.${displayIsVideo? 'mp4' : 'jpg'}`; document.body.appendChild(a); a.click(); a.remove()
  }

  if (!imageUrl) return null

  return (
    <div style={{ background: '#000', color: '#fff', width: '100%', height: '100vh', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '6px', left: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 20 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: '2.5px', borderRadius: '2px', background: i === index? '#fff' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </div>

      {displayIsVideo? (
        <video ref={videoRef} src={imageUrl} loop muted playsInline preload="auto" onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) { v.play(); setIsPaused(false) } else { v.pause(); setIsPaused(true) } }} onDoubleClick={handleLike} style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} />
      ) : (
        <img src={imageUrl} onDoubleClick={handleLike} style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} alt="post" />
      )}

      {showHeart? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '90px', zIndex: 30 }}>❤️</div> : null}
      {isPaused? <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶️</div> : null}

      <div style={{ position: 'absolute', right: '10px', bottom: '130px', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={handleLike} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '30px' }}>{liked? '❤️' : '♡'}</button>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{likeCount > 1000? `${(likeCount/1000).toFixed(1)}K` : likeCount || '50.3K'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => setShowComments(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px' }}>💬</button>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{commentCount || 45}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px' }}>⇄</button>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>514</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px' }}>✈️</button>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>270</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '26px' }}>🔖</button>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>3,645</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: '60px', padding: '0 14px 24px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <img onClick={() => router.push(`/profile/${username}`)} src={avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #fff' }} alt="av" />
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{username}</span>
          <button style={{ background: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '5px 14px', fontSize: '13px', fontWeight: 700, marginLeft: '8px' }}>Follow</button>
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.3' }}>{caption}</div>
        <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>👁️ {viewCount} views • R2 Connected</div>
      </div>

      {showComments? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}><b>Comments</b><button onClick={() => setShowComments(false)} style={{ border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '28px', height: '28px' }}>✕</button></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>{comments.map((c, i) => (<div key={i} style={{ marginBottom: '12px' }}><b>{c.username}</b> {c.comment || c.text}</div>))}</div>
            <div style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { const myName = localStorage.getItem("chitpix_username") || "guest"; supabase.from("comments").insert({ post_id: post.id, username: myName, comment: commentText, text: commentText }).then(() => { setComments([{ username: myName, comment: commentText },...comments]); setCommentText("") }) } }} placeholder="Add a comment..." style={{ flex: 1, background: '#efefef', border: 'none', borderRadius: '20px', padding: '10px 16px' }} />
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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const loadPosts = async () => {
    try {
      // ✅ OLD REELS FIX - NO TYPE FILTER, ALL POSTS WITH URL
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(200)
      if (error) throw error
      const filtered = (data || []).filter((p: any) => {
        const url = p?.image_url || p?.image || p?.video_url || p?.video || p?.url
        return Boolean(url)
      })
      console.log("Loaded reels:", filtered.length, "total:", data?.length)
      setPosts(filtered)
    } catch (e) {
      console.log(e)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPosts() }, [])

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const myName = localStorage.getItem("chitpix_username") || "knmahesh"
      const fileName = `${Date.now()}-${file.name}`
      // Upload to Supabase storage
      const { data: upData, error: upError } = await supabase.storage.from('posts').upload(fileName, file)
      if (upError) throw upError
      const { data: pub } = supabase.storage.from('posts').getPublicUrl(fileName)
      const publicUrl = pub?.publicUrl || ""
      const { error: insertError } = await supabase.from('posts').insert({
        username: myName,
        image_url: publicUrl,
        video_url: file.type.startsWith('video')? publicUrl : null,
        caption: 'Hi Mindset locked. Eyes forward..',
        url: publicUrl
      })
      if (insertError) throw insertError
      alert("Reel Uploaded ✅")
      loadPosts()
    } catch (err: any) {
      alert("Upload failed: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Reels... 🔄</div>
  }

  return (
    <div style={{ background: '#000', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', maxWidth: '470px', margin: '0 auto', position: 'relative' }}>
      {/* ✅ UPLOAD BUTTON - TOP LEFT + BOTTOM CENTER */}
      <div style={{ position: 'fixed', top: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '20px', padding: '8px 18px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {uploading? '⏳ Uploading...' : '➕ Upload Reel'}
        </button>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px' }}>✕</button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleUpload} style={{ display: 'none' }} />

      {/* Floating + Button Bottom */}
      <button onClick={() => fileInputRef.current?.click()} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#fff', color: '#000', border: 'none', borderRadius: '50%', width: '56px', height: '56px', fontSize: '32px', fontWeight: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>

      {posts.length === 0? (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '50px' }}>🎬</div>
          <p>No reels yet</p>
          <button onClick={() => fileInputRef.current?.click()} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700 }}>Upload First Reel</button>
        </div>
      ) : (
        posts.map((post: any, i: number) => (
          <ReelItem key={post.id || i} post={post} index={i} total={posts.length} onReload={loadPosts} />
        ))
      )}
    </div>
  )
          }
