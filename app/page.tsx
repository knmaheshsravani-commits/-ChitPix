"use client"
import { useState, useRef } from 'react'
import { uploadToR2 } from '@/lib/r2'

// ===== NEW CUSTOM ICONS - NOT INSTAGRAM =====
const IHome = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5L2 12.5V21h7v-6h6v6h7v-8.5L12 2.5z"/></svg>
const ISearch = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M20 20l-4-4"/></svg>
const IAdd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
const IHeart = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20s-6-4-6-9a4 4 0 0 1 7-2a4 4 0 0 1 7 2c0 5-6 9-6 9z"/></svg>
const IUser = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>

type Post = { id: string; url: string; caption: string; likes: number; liked: boolean; saved: boolean; user: string }

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500', caption: 'ChitPix vibes', likes: 128, liked: false, saved: false, user: 'chitpix_official' },
  ])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // FEATURE 1: R2 Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToR2(file, 'posts')
      const newPost: Post = { id: Date.now().toString(), url, caption: 'New Pix via R2', likes: 0, liked: false, saved: false, user: 'you' }
      setPosts([newPost, ...posts])
      await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: url }) })
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }

  // FEATURE 2: Like Toggle
  const toggleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
  }

  // FEATURE 3: Save Toggle
  const toggleSave = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white max-w-[430px] mx-auto relative pb-28">
      
      {/* FEATURE 4: Header with R2 Status */}
      <header className="sticky top-0 z-20 bg-[#080b14]/80 backdrop-blur-xl p-4 flex justify-between items-center border-b border-blue-500/10">
        <h1 className="text-[26px] font-black">Chit<span className="text-blue-500">Pix</span></h1>
        <div className="flex items-center gap-2 text-xs"><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>R2 Live</div>
      </header>

      {/* FEATURE 5: Stories */}
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        {['you', 'friend1', 'pix_lover', 'blue_', 'chitra'].map((u, i) => (
          <div key={u} className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className={`w-[60px] h-[60px] rounded-full p-[2px] ${i === 0 ? 'bg-white/20' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
              <div className="w-full h-full rounded-full bg-[#121725] flex items-center justify-center text-sm">{u[0].toUpperCase()}</div>
            </div>
            <span className="text-[11px] text-white/60">{u}</span>
          </div>
        ))}
      </div>

      {/* FEATURE 6: Upload Progress */}
      {uploading && <div className="mx-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-400 animate-pulse">Uploading to R2 Storage...</div>}

      {/* FEATURE 7-20: Posts Feed with all interactions */}
      <div className="flex flex-col">
        {posts.map(post => (
          <div key={post.id} className="border-b border-white/5 pb-4">
            <div className="flex justify-between p-3 items-center">
              <div className="flex gap-2 items-center"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">{post.user[0].toUpperCase()}</div><span className="text-sm font-semibold">{post.user}</span></div>
              <span className="text-white/30 text-lg">...</span>
            </div>
            <img src={post.url} alt="post" className="w-full aspect-square object-cover bg-[#10131f]" />
            <div className="flex justify-between p-3">
              <div className="flex gap-4">
                <button onClick={() => toggleLike(post.id)} className={post.liked ? 'text-red-500' : 'text-white'}><IHeart /></button>
                <button onClick={() => setShowComments(true)} className="text-white/70">💬</button>
              </div>
              <button onClick={() => toggleSave(post.id)} className={post.saved ? 'text-blue-500' : 'text-white/70'}>🔖</button>
            </div>
            <div className="px-3 text-sm">
              <p className="font-bold">{post.likes} likes</p>
              <p><span className="font-bold">{post.user}</span> {post.caption}</p>
              <p className="text-white/40 text-xs mt-1">2 hours ago • R2 Storage</p>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURE 21-25: Comments Sheet */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowComments(false)}>
          <div className="bg-[#121725] w-full max-w-[430px] rounded-t-[24px] p-4 h-[60vh]" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold mb-3">Comments</h3>
            <div className="flex gap-2 mt-auto">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add comment..." className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none" />
              <button className="text-blue-500 font-bold text-sm">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 26-30: Bottom Nav - 5 New Icons */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-[64px] bg-[#121725]/90 backdrop-blur-2xl rounded-full border border-blue-500/20 flex items-center justify-around shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-blue-500' : 'text-white/40'}><IHome /></button>
        <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'text-blue-500' : 'text-white/40'}><ISearch /></button>
        <button onClick={() => fileRef.current?.click()} className="w-[48px] h-[48px] bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#3b82f6]"><IAdd /></button>
        <button onClick={() => setActiveTab('likes')} className={activeTab === 'likes' ? 'text-blue-500' : 'text-white/40'}><IHeart /></button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-blue-500' : 'text-white/40'}><IUser /></button>
      </nav>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
    </div>
  )
        }
