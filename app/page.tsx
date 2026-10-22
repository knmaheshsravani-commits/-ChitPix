// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, MessageCircle, Send, Bookmark, Plus, Crown, MoreHorizontal, X } from "lucide-react"
import { supabase } from "../lib/supabase"

function BottomNav({ active, avatar }: any) {
  const isActive = (n: string) => active === n
  return (
    <div className="fixed bottom-[18px] left-1/2 -translate-x-1/2 z-[100] w-full max-w-[360px] px-4">
      <div className="bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-zinc-200 flex justify-around items-center h-[56px] px-2">
        <Link href="/" className="w-[52px] h-[44px] flex items-center justify-center"><div className={`w-[42px] h-[36px] flex items-center justify-center rounded-full ${isActive("home") ? "bg-[#f2f2f2]" : ""}`}><svg width="26" height="26" viewBox="0 0 24 24" fill={isActive("home") ? "black" : "none"} stroke="black" strokeWidth="1.8"><path d="M12 3L3 9v11h6v-6h6v6h6V9L12 3z" /></svg></div></Link>
        <Link href="/reels" className="w-[52px] h-[44px] flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="3" width="20" height="18" rx="3" /><path d="M10 8l6 4-6 4V8z" /></svg></Link>
        <Link href="/messages" className="w-[52px] h-[44px] flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2z" /></svg></Link>
        <Link href="/search" className="w-[52px] h-[44px] flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><line x1="17" y1="17" x2="21" y2="21" /></svg></Link>
        <Link href="/profile" className="w-[52px] h-[44px] flex items-center justify-center"><div className="w-[28px] h-[28px] rounded-full overflow-hidden border"><img src={avatar || "https://i.pravatar.cc/150?u=knmahesh"} alt="you" className="w-full h-full object-cover" /></div></Link>
      </div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([
    { id: 'you', name: 'Your story', avatar: 'M', isYou: true, hasStory: false, seen: false },
    { id: '1', name: 'rxtagur', avatar: 'https://i.pravatar.cc/100?img=12', isYou: false, hasStory: true, seen: false },
    { id: '2', name: '_mr_sand..', avatar: 'https://i.pravatar.cc/100?img=15', isYou: false, hasStory: true, seen: false },
    { id: '3', name: 'shetty._', avatar: 'https://i.pravatar.cc/100?img=32', isYou: false, hasStory: true, seen: false },
  ])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [following, setFollowing] = useState<any>({})
  const [showStory, setShowStory] = useState<any>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>({ username: 'knmahesh', photo: '' })
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState<any>({})
  const [showFullscreen, setShowFullscreen] = useState<any>(null)
  const [toast, setToast] = useState("")
  const [hiddenPosts] = useState<any>({})
  const fileInputRef = useRef<any>(null)
  const fileUploadRef = useRef<any>(null)
  const feedRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true
    const checkLogin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted && session?.user) {
          setCurrentUser({
            username: session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'user',
            photo: session.user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${session.user.email}`,
            email: session.user.email
          })
          setLoading(false)
          return
        }
      } catch {}
      try {
        const match = document.cookie.match(/chitpix_session=([^;]+)/)
        const sessionId = match?.[1]
        if (sessionId) {
          const res = await fetch(`/api/users/current?sessionId=${sessionId}`, { cache: "no-store" })
          const data = await res.json()
          if (mounted && data?.username) {
            setCurrentUser({ username: data.username, photo: data.photo, email: data.email })
            setLoading(false)
            return
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, 800))
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted && session?.user) {
          setCurrentUser({
            username: session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'user',
            photo: session.user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${session.user.email}`,
            email: session.user.email
          })
          setLoading(false)
          return
        }
      } catch {}
      if (mounted) { setLoading(false); router.replace("/login") }
    }
    checkLogin()
    return () => { mounted = false }
  }, [router])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/posts", { cache: "no-store" })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) setPosts(data)
      else if (data.posts) setPosts(data.posts)
      else setPosts([{ id: '1', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username: 'knmahesh', caption: 'R2 Connected', likes: 50300, views: 9415, verified: true, created_at: new Date().toISOString() }])
    } catch { setPosts([]) }
    setLoading(false)
  }
  useEffect(() => { fetchFeed() }, [])

  useEffect(() => {
    if (!showStory) return
    setStoryProgress(0)
    const interval = setInterval(() => {
      setStoryProgress(p => { if (p >= 100) { setShowStory(null); return 0 } return p + 1.2 })
    }, 50)
    return () => clearInterval(interval)
  }, [showStory])

  const handleLike = (id: string) => { setLiked({ ...liked, [id]: !liked[id] }) }
  const handleDoubleTap = (id: string) => { if (!liked[id]) handleLike(id) }
  const handleFollow = (username: string) => { const isF = following[username]; setFollowing({ ...following, [username]: !isF }); showToast(isF ? `Unfollowed ${username}` : `Following ${username}`) }
  const handleAddStory = (e: any) => {
    const file = e.target.files?.[0]; if (!file) return
    const localUrl = URL.createObjectURL(file)
    setStories(prev => prev.map((s: any) => s.isYou ? { ...s, avatar: localUrl, hasStory: true } : s))
    showToast("Story uploaded")
  }
  const openStory = (story: any) => {
    if (story.isYou && !story.hasStory) { fileInputRef.current?.click(); return }
    setShowStory(story)
    setStories(prev => prev.map((s: any) => s.id === story.id ? { ...s, seen: true } : s))
  }
  const handleTopPlusClick = () => { fileUploadRef.current?.click() }
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return
    showToast(`Uploading ${file.name}...`)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('username', currentUser.username)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (data.success) { showToast("Upload Done"); fetchFeed() }
    } catch { showToast("Upload failed") }
  }
  const filtered = posts.filter((p: any) => !hiddenPosts[p.id])

  return (
    <div className="h-[100dvh] bg-white text-black overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-20 border-b border-zinc-100 max-w-[470px] mx-auto w-full">
        <button onClick={handleTopPlusClick} className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center"><Plus size={20} /></button>
        <h1 className="font-extrabold text-[24px] tracking-tight flex items-center gap-1">ChitPix <Crown size={14} className="text-amber-500" /> <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded-full">R2</span></h1>
        <Link href="/notifications" className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center"><Heart size={22} /></Link>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleAddStory} />
      <input ref={fileUploadRef} type="file" accept="image/*,video/*" hidden onChange={handleFileUpload} />
      <div ref={feedRef} className="flex-1 overflow-y-auto max-w-[470px] mx-auto w-full pb-[90px]">
        <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b border-zinc-100">
          {stories.map((s: any) => (
            <div key={s.id} className="text-center min-w-[64px] cursor-pointer" onClick={() => openStory(s)}>
              <div className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${s.hasStory && !s.seen ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-zinc-200'}`}>
                <div className="bg-white rounded-full p-[2.5px] w-full h-full">
                  {s.isYou ? <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold text-xl relative">{s.avatar === 'M' ? 'M' : <img src={s.avatar} className="w-full h-full rounded-full object-cover" />}<span className="absolute -bottom-1 -right-1 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"><Plus size={12} /></span></div> : <img src={s.avatar} className="w-full h-full rounded-full object-cover" />}
                </div>
              </div>
              <p className="text-[11px] mt-1 truncate w-[64px]">{s.name}</p>
            </div>
          ))}
        </div>
        {loading ? (
          <div className="space-y-6 p-4"><div className="animate-pulse"><div className="w-full h-[400px] bg-zinc-200" /></div></div>
        ) : filtered.map((post: any) => {
          const isLiked = !!liked[post.id]
          return (
            <div key={post.id} className="bg-white border-b border-zinc-100">
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push(`/profile/${post.username}`)}>
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border-2 border-white" alt="avatar" /></div>
                  <span className="font-bold text-[14px]">{post.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleFollow(post.username || '')} className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${following[post.username] ? 'bg-black text-white' : 'bg-zinc-100 text-black'}`}>{following[post.username] ? 'Following' : 'Follow'}</button>
                  <button className="p-1"><MoreHorizontal size={18} /></button>
                </div>
              </div>
              <div className="relative bg-black w-full aspect-[4/5] overflow-hidden cursor-pointer" onDoubleClick={() => handleDoubleTap(post.id)} onClick={() => setShowFullscreen(post)}>
                {post.video_url ? <video src={post.video_url} className="w-full h-full object-cover" autoPlay loop muted={muted[post.id] !== false} playsInline /> : <img src={post.image_url || post.url} alt="post" className="w-full h-full object-cover" />}
              </div>
              <div className="px-3 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <button onClick={() => handleLike(post.id)}><Heart size={24} fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "black"} /></button>
                    <button><MessageCircle size={24} /></button>
                    <button><Send size={24} /></button>
                  </div>
                  <button onClick={() => setSaved({ ...saved, [post.id]: !isSaved })}><Bookmark size={24} fill={saved[post.id] ? "black" : "none"} /></button>
                </div>
                <div className="mt-2 font-bold text-[14px]">{post.likes || 5000} likes</div>
                <div className="text-[14px] mt-1"><span className="font-bold">{post.username}</span> {post.caption}</div>
              </div>
            </div>
          )
        })}
      </div>
      <BottomNav active="home" avatar={currentUser.photo} />
      {toast && <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-[13px] z-[200]">{toast}</div>}
      {showStory && (
        <div className="fixed inset-0 bg-black z-[150] flex flex-col">
          <div className="h-1 bg-zinc-700 w-full"><div className="h-full bg-white" style={{ width: `${storyProgress}%` }} /></div>
          <div className="flex justify-between items-center p-4 text-white">
            <div className="flex items-center gap-2"><img src={showStory.avatar} className="w-8 h-8 rounded-full" /><span className="font-bold text-sm">{showStory.name}</span></div>
            <button onClick={() => setShowStory(null)}><X size={24} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center"><img src={showStory.image_url || showStory.avatar} className="max-h-[80vh] object-contain" /></div>
        </div>
      )}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-[160] flex items-center justify-center" onClick={() => setShowFullscreen(null)}>
          <img src={showFullscreen.image_url || showFullscreen.url} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  )
      }
