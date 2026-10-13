'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

let activeVideoRef: HTMLVideoElement | null = null

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
  const [isPosting, setIsPosting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [saveCount, setSaveCount] = useState(0)

  // R2 URL SAFE
  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.video || post?.url || ""
  const imageUrl = rawUrl || ""
  const isVideo =!!(post?.isVideo || post?.is_video || post?.video_url || post?.video || post?.type === 'reels' || imageUrl.toLowerCase().includes('.mp4') || imageUrl.toLowerCase().includes('.mov') || imageUrl.toLowerCase().includes('.webm'))
  const username = post?.username || post?.profiles?.username || 'Knmahesh'
  const avatar = post?.user_avatar || post?.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post?.caption || ''
  const filterStyle: any = { normal: 'none', clarendon: 'contrast(1.2) saturate(1.35)', moon: 'grayscale(1) brightness(1.1)', vivid: 'saturate(1.8) contrast(1.1)' }

  useEffect(() => {
    if (typeof window!== 'undefined' && localStorage.getItem('chitpix_admin') === 'true') {
      setIsAdmin(true)
    }
    const loadCounts = async () => {
      try {
        const { count: l } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id)
        const { count: c } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id)
        const { count: s } = await supabase.from("saves").select("*", { count: "exact", head: true }).eq("post_id", post.id)
        setLikeCount(l || 0)
        setCommentCount(c || 0)
        setSaveCount(s || 0)

        const myName = localStorage.getItem("chitpix_username")
        if (myName) {
          const { data: myLike } = await supabase.from("likes").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
          if (myLike) setLiked(true)
          const { data: mySave } = await supabase.from("saves").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
          if (mySave) setSaved(true)
          const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: false })
          if (comms) setComments(comms)
        }
      } catch {}
    }
    if (post?.id) loadCounts()
  }, [post?.id])

  // VIDEO - ONE SOUND ONLY + AUTO PLAY R2
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    setIsMuted(true)

    const onGlobalMute = (e: any) => {
      if (e.detail!== video) {
        video.muted = true
        video.pause()
        setIsMuted(true)
      }
    }
    window.addEventListener('CHITPIX_MUTE_OTHERS', onGlobalMute)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (activeVideoRef && activeVideoRef!== video) {
              activeVideoRef.muted = true
              activeVideoRef.pause()
            }
            document.querySelectorAll('video').forEach((v) => {
              if (v!== video) {
                (v as HTMLVideoElement).muted = true
                ;(v as HTMLVideoElement).pause()
              }
            })
            activeVideoRef = video
            video.muted = true
            setIsMuted(true)
            video.play().catch(() => {})
            window.dispatchEvent(new CustomEvent('CHITPIX_MUTE_OTHERS', { detail: video }))
          } else {
            video.pause()
            video.muted = true
            setIsMuted(true)
            if (activeVideoRef === video) activeVideoRef = null
          }
        })
      },
      { threshold: 0.75 }
    )
    observer.observe(video)
    return () => {
      window.removeEventListener('CHITPIX_MUTE_OTHERS', onGlobalMute)
      observer.disconnect()
    }
  }, [])

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/admin/delete-post', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id })
    })
    if (res.ok) { alert('Deleted! ✅'); window.location.reload() } else { alert('Failed') }
  }

  const handleLike = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (liked) { setLiked(false); setLikeCount(v => Math.max(0, v - 1)); await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName) }
    else { setLiked(true); setLikeCount(v => v + 1); await supabase.from("likes").insert({ post_id: post.id, username: myName }) }
  }

  const handleSave = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if (saved) { setSaved(false); setSaveCount(v => Math.max(0, v - 1)); await supabase.from("saves").delete().eq("post_id", post.id).eq("username", myName) }
    else { setSaved(true); setSaveCount(v => v + 1); await supabase.from("saves").insert({ post_id: post.id, username: myName }) }
  }

  const handleCommentPost = async () => {
    if (!commentText.trim() || isPosting) return
    setIsPosting(true)
    const myName = localStorage.getItem("chitpix_username") || "guest"
    const newComment = { post_id: post.id, username: myName, comment: commentText, text: commentText, created_at: new Date().toISOString() }
    const { error } = await supabase.from("comments").insert({ post_id: post.id, username: myName, comment: commentText, text: commentText })
    if (!error) {
      setComments([newComment,...comments])
      setCommentCount(v => v + 1)
      setCommentText("")
    }
    setIsPosting(false)
  }

  const handleShareClick = () => {
    setShowShare(true)
    setShareCount(v => v + 1)
  }

  const shareUrl = typeof window!== 'undefined'? `${window.location.origin}/post/${post.id}` : ''

  const doCopy = async () => {
    await navigator.clipboard.writeText(imageUrl)
    alert("Link Copied! ✅")
    setShowShare(false)
  }

  const doWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent("Check this reel 🔥 " + shareUrl + " " + imageUrl)}`, "_blank")
    setShowShare(false)
  }

  const doInstagram = () => {
    if (navigator.share) {
      navigator.share({ title: 'ChitPix Reel', text: 'Check this reel', url: imageUrl }).catch(()=>{})
    } else {
      doCopy()
    }
    setShowShare(false)
  }

  const doSaveR2 = async () => {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chitpix-${post.id}.${isVideo? 'mp4' : 'jpg'}`
      a.click()
      URL.revokeObjectURL(url)
      alert("Saved to gallery ✅")
    } catch {
      window.open(imageUrl, "_blank")
    }
    setShowShare(false)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    if (v.muted) {
      document.querySelectorAll('video').forEach((other) => {
        if (other!== v) { (other as HTMLVideoElement).muted = true; (other as HTMLVideoElement).pause() }
      })
      v.muted = false
      setIsMuted(false)
      activeVideoRef = v
      v.play().catch(() => {})
      window.dispatchEvent(new CustomEvent('CHITPIX_MUTE_OTHERS', { detail: v }))
    } else {
      v.muted = true
      setIsMuted(true)
    }
  }

  if (!imageUrl) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', margin: '0 auto 16px', maxWidth: '470px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px' }}>
        <img src={avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="av" />
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{username}</div>
        {isAdmin && <button onClick={handleDelete} style={{ marginLeft: 'auto', background: '#ff3040', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 700 }}>🗑️ Delete</button>}
      </div>

      {isVideo? (
        <div style={{ position: 'relative', background: '#000' }}>
          <video ref={videoRef} src={imageUrl} loop muted playsInline preload="metadata" crossOrigin="anonymous" onDoubleClick={handleLike} onClick={toggleMute} style={{ width: '100%', aspectRatio: '9/16', maxHeight: '600px', objectFit: 'cover', display: 'block', filter: filterStyle[filter] }} />
          <button onClick={(e) => { e.stopPropagation(); toggleMute() }} style={{ position: 'absolute', bottom: '70px', right: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', zIndex: 5 }}>{isMuted? '🔇' : '🔊'}</button>
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>🔊 Tap for sound</div>
          <div style={{ position: 'absolute', bottom: '12px', left: '10px', display: 'flex', gap: '6px' }}>
            {Object.keys(filterStyle).map(f => (<button key={f} onClick={() => setFilter(f)} style={{ background: filter === f? '#fff' : 'rgba(0,0,0,0.5)', color: filter === f? '#000' : '#fff', border: 'none', borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: 700 }}>{f}</button>))}
          </div>
        </div>
      ) : (
        <img src={imageUrl} crossOrigin="anonymous" onDoubleClick={handleLike} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', filter: filterStyle[filter] }} alt="post" />
      )}

      <div style={{ padding: '10px 12px', display: 'flex', gap: '18px', alignItems: 'center' }}>
        <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer' }}><svg width="24" height="24" viewBox="0 0 24 24" fill={liked? "red" : "none"} stroke={liked? "red" : "black"} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg><span style={{ fontSize: '14px', fontWeight: 600 }}>{likeCount}</span></button>
        <button onClick={() => setShowComments(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg><span style={{ fontSize: '14px', fontWeight: 600 }}>{commentCount}</span></button>
        <button onClick={handleShareClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span style={{ fontSize: '14px', fontWeight: 600 }}>{shareCount}</span></button>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}><svg width="24" height="24" viewBox="0 0 24 24" fill={saved? "black" : "none"} stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg><span style={{ fontSize: '14px', fontWeight: 600 }}>{saveCount}</span></button>
      </div>

      {caption && <div style={{ padding: '0 12px 12px', fontSize: '14px' }}><b style={{ marginRight: '6px' }}>{username}</b>{caption}</div>}

      {showComments && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', height: '75vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b>Comments {commentCount}</b><button onClick={() => setShowComments(false)} style={{ border: 'none', background: '#efefef', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px' }}>✕</button></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {comments.length === 0? <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}><div style={{ fontSize: '40px' }}>💬</div><p style={{ marginTop: '10px' }}>Be first to comment!</p><p style={{ fontSize: '13px' }}>0 nundi start bro!</p></div> : comments.map((c, i) => (<div key={i} style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', gap: '8px' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(c.username || 'G')[0].toUpperCase()}</div><div><b>{c.username}</b> <span style={{ marginLeft: '4px' }}>{c.comment || c.text}</span></div></div>))}
            </div>
            <div style={{ padding: '10px 12px 20px', borderTop: '1px solid #dbdbdb', display: 'flex', gap: '8px', background: '#fff' }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCommentPost() }} placeholder="Add a comment..." style={{ flex: 1, background: '#efefef', border: 'none', borderRadius: '20px', padding: '12px 16px', fontSize: '14px', outline: 'none' }} />
              <button onClick={handleCommentPost} disabled={isPosting ||!commentText.trim()} style={{ color: commentText.trim()? '#0095f6' : '#b2dffc', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>{isPosting? '...' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowShare(false)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', padding: '20px 16px 30px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#dbdbdb', borderRadius: '2px', margin: '0 auto 16px' }}></div>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 700 }}>Share Reel</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px' }}>
              <button onClick={doWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '22px' }}>W</div><span style={{ fontSize: '12px' }}>WhatsApp</span>
              </button>
              <button onClick={doInstagram} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>IG</div><span style={{ fontSize: '12px' }}>Instagram</span>
              </button>
              <button onClick={doCopy} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🔗</div><span style={{ fontSize: '12px' }}>Copy</span>
              </button>
              <button onClick={doSaveR2} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⬇️</div><span style={{ fontSize: '12px' }}>Save R2</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
                            }
