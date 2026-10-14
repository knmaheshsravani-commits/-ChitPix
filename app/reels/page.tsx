"use client"
import { useState, useEffect, useRef } from "react"

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [filter, setFilter] = useState<'all'|'reels'|'posts'>('all')
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [showComments, setShowComments] = useState<any>(null)
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [views, setViews] = useState<Record<string, number>>({})
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({})

  const getMediaUrl = (post: any) => post.image_url || post.url || post.video_url || post.publicUrl || post.image || ""
  const checkIsVideo = (post: any) => {
    const url = getMediaUrl(post)
    return url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov') || url.toLowerCase().includes('.webm') || post.type === 'reel' || post.type === 'video'
  }

  const filteredPosts = posts.filter((post) => {
    const video = checkIsVideo(post)
    if (filter === 'all') return true
    if (filter === 'reels') return video
    if (filter === 'posts') return!video
    return true
  })

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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting) {
          video.play().catch(()=>{})
          const id = video.dataset.id
          if (id) setCurrentIdx(posts.findIndex(p => p.id === id))
        } else {
          video.pause()
        }
      })
    }, { threshold: 0.7 })
    Object.values(videoRefs.current).forEach(v => v && observer.observe(v))
    return () => observer.disconnect()
  }, [posts])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') setCurrentIdx(i => Math.min(posts.length - 1, i + 1))
      if (e.key === 'ArrowUp') setCurrentIdx(i => Math.max(0, i - 1))
      if (e.key === 'm') setMuted(!muted)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [posts.length, muted])

  const handleDoubleTap = (post: any) => {
    const id = post.id
    setLiked(prev => {
      const n = new Set(prev)
      if (!n.has(id)) n.add(id)
      return n
    })
    setShowHeart(id)
    setTimeout(() => setShowHeart(null), 800)
    if (navigator.vibrate) navigator.vibrate(50)
  }

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const handleShare = async (post: any) => {
    const url = getMediaUrl(post)
    if (navigator.share) {
      try { await navigator.share({ title: post.caption || 'ChitPix', url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  const handleDownload = async (post: any) => {
    const url = getMediaUrl(post)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `chitpix-${post.id}.${url.includes('.mp4')? 'mp4' : 'jpg'}`
      a.click()
    } catch {
      window.open(url, '_blank')
    }
  }

  const parseCaption = (text: string) => {
    if (!text) return null
    const parts = text.split(/(\#\w+|\@\w+)/g)
    return parts.map((p, i) => {
      if (p.startsWith('#')) return <span key={i} className="text-cyan-400 font-bold"> {p} </span>
      if (p.startsWith('@')) return <span key={i} className="text-yellow-400 font-bold"> {p} </span>
      return <span key={i}>{p}</span>
    })
  }

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white animate-pulse">Loading ChitPix R2...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="flex justify-center pt-3 pb-2 sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-zinc-900">
        <div className="flex bg-zinc-900 rounded-full p-1">
          {(['all','reels','posts'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition ${filter === f? 'bg-white text-black' : 'text-zinc-400'}`}>{f}</button>
          ))}
        </div>
        <div className="absolute right-4 top-3 text-xs text-zinc-500">{filteredPosts.length} • R2</div>
      </div>

      <div className="max-w-[420px] mx-auto relative">
        {filteredPosts.length === 0? (
          <div className="flex flex-col items-center justify-center h-[75vh] text-zinc-500">
            <p className="text-2xl">📸</p>
            <p className="mt-2 font-bold">No {filter} found</p>
            <p className="text-xs mt-1">Upload from home - stored in R2 data/posts.json</p>
            <button onClick={()=>window.location.href='/'} className="mt-4 px-4 py-2 bg-white text-black rounded-full text-sm font-bold">Go Upload</button>
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const mediaUrl = getMediaUrl(post)
            const video = checkIsVideo(post)
            const id = post.id || idx.toString()
            const isLiked = liked.has(id)
            const isSaved = saved.has(id)
            return (
              <div key={id} className="relative w-full h-[88vh] bg-zinc-950 mb-1 flex items-center justify-center overflow-hidden border-b border-zinc-900"
                   onDoubleClick={() => handleDoubleTap(post)}
              >
                {video? (
                  <video
                    ref={el => { if (el) videoRefs.current[id] = el }}
                    data-id={id}
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted={muted}
                    loop
                    playsInline
                    preload="metadata"
                    onTimeUpdate={(e) => { const v = e.target as HTMLVideoElement; v.playbackRate = speed }}
                    onClick={(e) => { const v = e.target as HTMLVideoElement; v.paused? v.play() : v.pause() }}
                  />
                ) : (
                  <img src={mediaUrl} alt={post.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                )}
                {showHeart === id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-7xl animate-ping">❤️</div>
                  </div>
                )}
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center font-bold text-xs">{(post.username || 'C')[0].toUpperCase()}</div>
                    <span className="text-sm font-bold">@{post.username || 'knmahesh'} • {views[id] || 0} views</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setMuted(!muted)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-sm">{muted? '🔇' : '🔊'}</button>
                    <button onClick={() => { const el: any = document.documentElement; el.requestFullscreen?.() }} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-sm">⛶</button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-[60px] p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <p className="font-bold text-sm">@{post.username || 'knmaheshsravani'} • {new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
                  <p className="text-[13px] mt-1 leading-snug line-clamp-2">{parseCaption(post.caption || post.content || '')}</p>
                  <p className="text-[11px] mt-2 text-zinc-400 truncate">R2: {mediaUrl.slice(0, 50)}... • Speed: {speed}x</p>
                </div>
                <div className="absolute right-2 bottom-16 flex flex-col gap-5 items-center">
                  <button onClick={() => toggleLike(id)} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full backdrop-blur flex items-center justify-center text-xl transition ${isLiked? 'bg-red-500 scale-110' : 'bg-white/15'}`}>{isLiked? '❤️' : '🤍'}</div>
                    <span className="text-[11px] mt-1 font-bold">{isLiked? '1' : (post.likes || '255K')}</span>
                  </button>
                  <button onClick={() => setShowComments(post)} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-xl">💬</div>
                    <span className="text-[11px] mt-1 font-bold">{post.comments || '535'}</span>
                  </button>
                  <button onClick={() => handleShare(post)} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-xl">↗️</div>
                    <span className="text-[11px] mt-1">Share</span>
                  </button>
                  <button onClick={() => toggleSave(id)} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full backdrop-blur flex items-center justify-center text-xl ${isSaved? 'bg-yellow-500' : 'bg-white/15'}`}>{isSaved? '🔖' : '📑'}</div>
                  </button>
                  <button onClick={() => handleDownload(post)} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-xl">⬇️</div>
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    {[1, 1.5, 2].map(s => (
                      <button key={s} onClick={() => setSpeed(s)} className={`w-7 h-7 rounded-full text-[10px] font-bold ${speed === s? 'bg-white text-black' : 'bg-white/20'}`}>{s}x</button>
                    ))}
                  </div>
                </div>
                <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex gap-1">
                  {filteredPosts.slice(0, 8).map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === currentIdx? 'w-6 bg-white' : 'w-1 bg-white/30'}`}></div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end" onClick={() => setShowComments(null)}>
          <div className="w-full max-w-[420px] mx-auto bg-zinc-900 rounded-t-[20px] max-h-[60vh] overflow-auto p-4 border-t border-zinc-700" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold mb-3">Comments • R2 Post {showComments.id}</h3>
            <div className="space-y-3">
              <div className="flex gap-2"><div className="w-7 h-7 rounded-full bg-pink-500"></div><div className="flex-1"><p className="text-sm font-bold">user_1 <span className="font-normal text-zinc-400 ml-2">Nice! 🔥</span></p></div></div>
              <div className="flex gap-2"><div className="w-7 h-7 rounded-full bg-blue-500"></div><div className="flex-1"><p className="text-sm font-bold">knmahesh <span className="font-normal text-zinc-400 ml-2">{showComments.caption || 'Super!'}</span></p></div></div>
            </div>
            <div className="mt-4 flex gap-2">
              <input placeholder="Add comment..." className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm outline-none" />
              <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
    }
