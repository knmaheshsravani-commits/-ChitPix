"use client"
import { useState, useEffect, useRef } from "react"

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'reels' | 'posts'>('all')
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState(true)
  const [showComments, setShowComments] = useState<any>(null)
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [views, setViews] = useState<Record<string, number>>({})
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState<Record<string, any[]>>({})
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  const videoRefs = useRef<Record<string, HTMLVideoElement>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const getMediaUrl = (post: any) => {
    return post?.image_url || post?.url || post?.video_url || post?.publicUrl || post?.image || post?.media_url || ""
  }

  const checkIsVideo = (post: any) => {
    try {
      const url = (getMediaUrl(post) || "").toLowerCase().split('?')[0].trim()
      if (!url) return false
      return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || post?.type === 'video' || post?.is_video || post?.type === 'reel'
    } catch { return false }
  }

  const filteredPosts = posts.filter((post) => {
    const video = checkIsVideo(post)
    if (filter === 'all') return true
    if (filter === 'reels') return video
    if (filter === 'posts') return !video
    return true
  })

  useEffect(() => {
    try {
      Object.values(videoRefs.current).forEach(v => { if (v) v.muted = muted })
    } catch {}
  }, [muted])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/posts', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
        if (!res.ok) throw new Error('Fetch failed')
        const data = await res.json()
        const list = Array.isArray(data)? data : data.posts || data.data || []
        const sorted = [...list].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        setPosts(sorted)
        const v: any = {}
        sorted.forEach((p: any) => v[p.id] = Math.floor(Math.random() * 5000) + 100)
        setViews(v)
        try {
          const saveRes = await fetch('/api/saves', { cache: 'no-store' })
          if (saveRes.ok) {
            const saveData = await saveRes.json()
            const saveList = Array.isArray(saveData)? saveData : saveData.saves || saveData.data || []
            setSaved(new Set(saveList.map((s: any) => s.post_id || s.id)))
          }
        } catch {}
        try {
          const likeRes = await fetch('/api/likes')
          if (likeRes.ok) {
            const likeData = await likeRes.json()
            const likeList = Array.isArray(likeData)? likeData : likeData.likes || []
            setLiked(new Set(likeList.map((l: any) => l.post_id || l.id)))
          }
        } catch {}
      } catch (e) {
        console.error("R2 FETCH ERROR", e)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!posts.length) return
    try {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          try {
            if (entry.isIntersecting) {
              video.muted = muted
              video.play().catch(() => {})
              const id = (video.dataset as any)?.id
              if (id) {
                const idx = filteredPosts.findIndex(p => p.id === id)
                if (idx >= 0) setCurrentIdx(idx)
              }
            } else {
              video.pause()
            }
          } catch {}
        })
      }, { threshold: 0.6 })
      Object.values(videoRefs.current).forEach(v => v && observer.observe(v))
      return () => observer.disconnect()
    } catch { return }
  }, [posts.length, muted])

  const handleDoubleTap = (post: any) => {
    const id = post.id
    setLiked(prev => { const n = new Set(prev); if (!n.has(id)) n.add(id); return n })
    setShowHeart(id)
    setTimeout(() => setShowHeart(null), 800)
    if (navigator.vibrate) navigator.vibrate(50)
    fetch('/api/likes', { method: 'POST', body: JSON.stringify({ post_id: id }), headers: { 'Content-Type': 'application/json' } }).catch(() => {})
  }

  const toggleLike = async (id: string) => {
    const wasLiked = liked.has(id)
    setLiked(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
    try {
      if (!wasLiked) { await fetch('/api/likes', { method: 'POST', body: JSON.stringify({ post_id: id }), headers: { 'Content-Type': 'application/json' } }) }
      else { await fetch(`/api/likes?post_id=${id}`, { method: 'DELETE' }) }
    } catch {}
  }

  const toggleSave = async (id: string) => {
    const wasSaved = saved.has(id)
    setSaved(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
    if (!wasSaved && navigator.vibrate) navigator.vibrate(30)
    try {
      if (!wasSaved) { await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ post_id: id }), headers: { 'Content-Type': 'application/json' } }) }
      else { await fetch(`/api/saves?post_id=${id}`, { method: 'DELETE' }) }
    } catch (e) { console.log(e) }
    }
    const handleAddComment = async () => {
    if (!commentText.trim() || !showComments) return
    const postId = showComments.id
    const newComment = { id: Date.now().toString(), username: 'knmahesh', text: commentText.trim(), content: commentText.trim(), created_at: new Date().toISOString() }
    setAllComments(prev => ({ ...prev, [postId]: [...(prev[postId] || [{ username: 'user_1', text: 'Nice! 🔥', id: '1' }]), newComment], }))
    const textToSend = commentText.trim()
    setCommentText("")
    try { await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, content: textToSend, text: textToSend, username: 'knmahesh' }), }) } catch {}
  }

  const handleShare = async (post: any) => {
    const url = getMediaUrl(post)
    if (navigator.share) { try { await navigator.share({ title: post.caption || 'ChitPix', url }) } catch {} }
    else { await navigator.clipboard.writeText(url); alert('Link copied!') }
  }

  const handleDownload = async (post: any) => {
    const url = getMediaUrl(post)
    if (!url) return
    const fileName = `chitpix-${post.id}.${checkIsVideo(post)? 'mp4' : 'jpg'}`
    setIsDownloading(post.id)
    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=${fileName}`)
      if (!res.ok) throw new Error('proxy failed')
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = blobUrl; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(blobUrl)
    } catch {
      const a = document.createElement('a'); a.href = url; a.download = fileName; a.target = '_blank'; document.body.appendChild(a); a.click(); a.remove()
    } finally { setIsDownloading(null) }
  }

  const parseCaption = (text: string) => {
    if (!text) return null
    try {
      const parts = text.split(/(\#\w+|\@\w+)/g)
      return parts.map((p, i) => {
        if (p.startsWith('#')) return <span key={i} className="text-cyan-400 font-bold"> {p} </span>
        if (p.startsWith('@')) return <span key={i} className="text-yellow-400 font-bold"> {p} </span>
        return <span key={i}>{p}</span>
      })
    } catch { return text }
  }

  if (loading) { return <div className="min-h-screen bg-black flex items-center justify-center text-white animate-pulse">Loading ChitPix...</div> }

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      <div className="flex justify-center pt-3 pb-2 sticky top-0 z-30 bg-black border-b border-zinc-900 shrink-0">
        <div className="flex bg-zinc-900 rounded-full p-1">
          {(['all', 'reels', 'posts'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition ${filter === f? 'bg-white text-black' : 'text-zinc-400'}`}>{f}</button>
          ))}
        </div>
        <div className="absolute right-4 top-3 text-xs text-zinc-500">{filteredPosts.length} • R2</div>
      </div>

      <div ref={containerRef} className="flex-1 w-full max-w-[420px] mx-auto overflow-y-scroll snap-y snap-mandatory scrollbar-hide touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' } as any}>
        {filteredPosts.length === 0? (
          <div className="flex flex-col items-center justify-center h-[75vh] text-zinc-500">
            <p className="text-3xl">📸</p><p className="mt-2 font-bold">No {filter} found</p>
            <p className="text-xs mt-1 text-center px-6">{filter === 'reels'? 'Reels lo only.mp4 videos vastayi' : filter === 'posts'? 'Photos kosam ikkada vasthayi' : 'Upload chey bro'}</p>
            <button onClick={() => setFilter('all')} className="mt-4 px-5 py-2 bg-white text-black rounded-full text-sm font-bold">Show All</button>
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const mediaUrl = getMediaUrl(post)
            const video = checkIsVideo(post)
            const id = post.id || idx.toString()
            const isLiked = liked.has(id)
            const isSaved = saved.has(id)
            const downloading = isDownloading === id
            const isPermanent = post?.views && typeof post.views === 'string' && post.views.includes('Permanent')
            const isFromStory = !!post?.fromStory
            return (
              <div key={id} className="relative w-full h-[calc(100dvh-56px)] bg-black flex items-center justify-center overflow-hidden snap-start snap-always shrink-0 border-b border-zinc-900" onDoubleClick={() => handleDoubleTap(post)}>
                {video? (
                  <video ref={el => { if (el) videoRefs.current[id] = el }} data-id={id} src={mediaUrl} className="w-full h-full object-cover" muted={muted} loop playsInline preload="metadata" autoPlay onClick={(e) => { const v = e.target as HTMLVideoElement; try { v.paused? v.play() : v.pause() } catch {} }} />
                ) : (
                  <img src={mediaUrl} alt={post.caption || ""} className="w-full h-full object-contain bg-black" loading="lazy" />
                )}
                {showHeart === id && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-7xl animate-[ping_0.8s_ease-out]">❤️</div></div>)}
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center font-bold text-xs">{(post.username || 'K')[0]?.toUpperCase()}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold flex items-center gap-1">@{post.username || 'knmahesh'} {isFromStory && <span className="text-[10px] bg-purple-600 px-1.5 py-0.5 rounded-full">From Story</span>}</span>
                      <span className="text-[10px] text-zinc-300">{isPermanent ? '♾️ R2 Permanent' : `${views[id] || 0} views`} {isFromStory ? '• To Reel ✅' : ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-2"><button onClick={() => setMuted(!muted)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-sm">{muted? '🔇' : '🔊'}</button></div>
                </div>
                <div className="absolute bottom-0 left-0 right-[68px] p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <p className="font-bold text-[14px]">@{post.username || 'knmahesh'} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</p>
                  <p className="text-[13px] mt-1 leading-snug line-clamp-2">{parseCaption(post.caption || post.content || 'New Reel 🔥 #chitpix')}</p>
                </div>
                <div className="absolute right-3 bottom-20 flex flex-col gap-4 items-center">
                  <button onClick={() => toggleLike(id)} className="flex flex-col items-center gap-1"><div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur border transition-all ${isLiked? 'bg-red-500/20 border-red-500' : 'bg-zinc-800/80 border-zinc-700'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked? "#ff3040" : "none"} stroke={isLiked? "#ff3040" : "white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div><span className="text-[11px] font-bold">255K</span></button>
                  <button onClick={() => setShowComments(post)} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div><span className="text-[11px] font-bold">{(allComments[id]?.length || 0) + 535}</span></button>
                  <button onClick={() => handleShare(post)} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></div><span className="text-[11px]">Share</span></button>
                  <button onClick={() => toggleSave(id)} className="flex flex-col items-center gap-1"><div className={`w-12 h-12 rounded-full backdrop-blur border flex items-center justify-center transition-all ${isSaved? 'bg-yellow-500 border-yellow-500 scale-110' : 'bg-zinc-800/80 border-zinc-700'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved? "white" : "none"} stroke={isSaved? "black" : "white"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div></button>
                  <button onClick={() => handleDownload(post)} disabled={!!downloading} className="flex flex-col items-center gap-1"><div className={`w-12 h-12 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 flex items-center justify-center ${downloading? 'animate-pulse' : ''}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div></button>
                </div>
                <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex gap-1">{filteredPosts.slice(0, 8).map((_, i) => (<div key={i} className={`h-1 rounded-full transition-all ${i === currentIdx? 'w-6 bg-white' : 'w-1 bg-white/30'}`}></div>))}</div>
              </div>
            )
          })
        )}
      </div>

      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end" onClick={() => setShowComments(null)}>
          <div className="w-full max-w-[420px] mx-auto bg-zinc-900 rounded-t-[20px] max-h-[70vh] flex flex-col p-4 border-t border-zinc-700" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4 shrink-0"></div>
            <h3 className="font-bold mb-3">Comments • {(allComments[showComments.id]?.length || 0) + 1}</h3>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[120px] max-h-[40vh]">
              <div className="flex gap-2"><div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold">U</div><div className="flex-1"><p className="text-sm font-bold">user_1 <span className="font-normal text-zinc-400 ml-2">Nice! 🔥</span></p></div></div>
              {(allComments[showComments.id] || []).map((c: any, i: number) => (
                <div key={c.id || i} className="flex gap-2 animate-in fade-in"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-pink-500 flex items-center justify-center text-xs font-bold">{(c.username || 'U')[0]?.toUpperCase()}</div><div className="flex-1"><p className="text-sm font-bold">{c.username || 'user'} <span className="font-normal text-zinc-300 ml-2">{c.text || c.content}</span></p><p className="text-[11px] text-zinc-500">just now • ❤️</p></div></div>
              ))}
            </div>
            <div className="flex gap-2 shrink-0 pt-3 border-t border-zinc-800 bg-zinc-900 sticky bottom-0">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }} placeholder="Add comment..." autoFocus className="flex-1 bg-zinc-800 rounded-full px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-white text-white placeholder:text-zinc-500" />
              <button onClick={handleAddComment} disabled={!commentText.trim()} className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold disabled:opacity-30 disabled:bg-zinc-600 transition-all active:scale-95">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
                      }
