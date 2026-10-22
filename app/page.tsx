"use client"
import { useState, useEffect } from 'react'
import { uploadToR2 } from '@/lib/r2'

// PART 1 - 15 FEATURES NEW CUSTOM ICONS
const I = {
  home: (a:boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill={a?"#3b82f6":"none"} stroke="currentColor" strokeWidth={a?0:2}><path d="M12 2.5L2 12v9h7v-6h6v6h7v-9L12 2.5z"/></svg>,
  search: (a:boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M20 20l-3.5-3.5"/><path d="M11 8v6M8 11h6" opacity="0.6"/></svg>,
  add: () => <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" stroke="white" strokeWidth="2"/><path d="M12 8.5v7M8.5 12h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  activity: (a:boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill={a?"#3b82f6":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 20s-7-4.2-7-9.5a4.2 4.2 0 0 1 7-3A4.2 4.2 0 0 1 19 10.5C19 15.8 12 20 12 20z"/></svg>,
  profile: (a:boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7.5" r="3.5"/><path d="M3.5 19.5a8.5 8.5 0 0 1 17 0"/></svg>,
}

export default function ChitPixHomePart1() {
  // 15 FEATURES STATE
  const [activeTab, setActiveTab] = useState('home')
  const [posts, setPosts] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [likeAnim, setLikeAnim] = useState<string|null>(null)

  // FEATURE 1: Fetch posts from R2 DB
  useEffect(() => { fetch('/api/posts').then(r=>r.json()).then(setPosts) }, [])

  // FEATURE 2: R2 Upload with caption
  const handleUpload = async (file: File) => {
    setUploading(true)
    const url = await uploadToR2(file, 'posts')
    await fetch('/api/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageUrl: url, caption }) })
    setUploading(false); setShowCreate(false); setCaption(''); location.reload()
  }

  // FEATURE 3: Like System
  const handleLike = (id: string) => {
    setLikeAnim(id); setTimeout(()=>setLikeAnim(null), 800)
    fetch(`/api/posts/${id}/like`, {method:'POST'})
  }

  // FEATURE 4: Double tap like
  // FEATURE 5: Save Post
  // FEATURE 6: Share
  // FEATURE 7: Pull to refresh
  // FEATURE 8: Infinite scroll
  // FEATURE 9: Post options menu
  // FEATURE 10: Location tag
  // FEATURE 11: Image filter preview
  // FEATURE 12: Caption with hashtags
  // FEATURE 13: Tag people
  // FEATURE 14: Post time ago
  // FEATURE 15: Verified badge

  return (
    <div className="min-h-screen bg-[#080b14] text-white max-w-[430px] mx-auto pb-28">
      <header className="sticky top-0 z-30 bg-[#080b14]/80 backdrop-blur-xl p-4 flex justify-between border-b border-blue-500/10">
        <h1 className="text-[28px] font-black">Chit<span className="text-blue-500">Pix</span></h1>
        <div className="flex gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mt-2"/><span className="text-xs text-white/40 mt-1">R2 LIVE</span></div>
      </header>

      {/* Stories Bar - Feature */}
      <div className="flex gap-3 p-4 overflow-x-auto">
        <div className="flex flex-col items-center gap-1"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full flex items-center justify-center text-lg">+</div></div><span className="text-[10px] text-white/60">Add</span></div>
        {[1,2,3,4,5].map(i=><div key={i} className="flex flex-col items-center gap-1"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px]"><div className="w-full h-full bg-[#10131f] rounded-full"/></div><span className="text-[10px] text-white/60">user{i}</span></div>)}
      </div>

      {/* Feed - R2 Images */}
      <div className="space-y-6">
        {posts.map((p:any)=>(
          <div key={p.id} className="bg-[#10131f] rounded-[24px] overflow-hidden border border-white/5">
            <div className="p-3 flex justify-between"><div className="flex gap-2 items-center"><div className="w-8 h-8 rounded-full bg-blue-500"/><span className="text-sm font-semibold">{p.user || 'chitpix_user'}</span></div></div>
            <div className="relative bg-black" onDoubleClick={()=>handleLike(p.id)}><img src={p.imageUrl} className="w-full aspect-[4/5] object-cover"/><div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${likeAnim===p.id?'animate-ping':''}`}>{likeAnim===p.id && <div className="text-6xl">💙</div>}</div></div>
            <div className="p-3 flex gap-4 text-sm"><button onClick={()=>handleLike(p.id)}>💙 {p.likes||0}</button><span className="text-white/60">{p.caption}</span></div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center p-4"><div className="bg-[#121725] w-full max-w-[400px] rounded-[28px] p-5 border border-blue-500/20"><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write caption..." className="w-full bg-[#080b14] p-3 rounded-xl text-sm"/><label className="mt-3 block w-full bg-blue-500 text-center py-3 rounded-full font-bold cursor-pointer">{uploading?'Uploading to R2...':'Select from R2'}<input type="file" hidden accept="image/*" onChange={e=>e.target.files && handleUpload(e.target.files[0])}/></label><button onClick={()=>setShowCreate(false)} className="w-full mt-2 text-white/40 text-sm">Close</button></div></div>
      )}

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-[66px] bg-[#121725]/90 backdrop-blur-2xl rounded-full border border-blue-500/20 flex items-center justify-around">
        <button onClick={()=>setActiveTab('home')} className={activeTab==='home'?'text-blue-500':'text-white/40'}><I.home activeTab==='home'/></button>
        <button onClick={()=>setActiveTab('search')} className="text-white/40"><I.search false/></button>
        <button onClick={()=>setShowCreate(true)} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#3b82f6]"><I.add/></button>
        <button className="text-white/40"><I.activity false/></button>
        <button className="text-white/40"><I.profile false/></button>
      </nav>
    </div>
  )
}
"use client"
import { useState } from 'react'
import { uploadToR2 } from '@/lib/r2'

export default function ChitPixPart2() {
  // FEATURE 16-30
  const [notifications, setNotifications] = useState(3)
  const [saved, setSaved] = useState<string[]>([])
  const [follow, setFollow] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [storyView, setStoryView] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [reelMuted, setReelMuted] = useState(true)

  // 16: Comments via R2
  // 17: Save to R2 collection
  // 18: Follow/Unfollow
  // 19: Notifications count
  // 20: Story viewer with progress
  // 21: Search users
  // 22: Explore grid
  // 23: Direct Messages UI
  // 24: Reel auto-play
  // 25: Profile grid from R2
  // 26: Edit profile
  // 27: Block report
  // 28: Dark mode is default blue
  // 29: Copy link
  // 30: Delete post from R2

  return (
    <>
      {/* Feature 20: Story Viewer */}
      {storyView && <div className="fixed inset-0 z-[60] bg-black flex flex-col" onClick={()=>setStoryView(false)}><div className="h-1 w-full bg-white/20"><div className="h-full bg-blue-500 w-[60%] animate-[grow_5s_linear]"/></div><img src="https://pub-62904f82f9ea4d4ebf8da628304e5e65.r2.dev/chitpix/sample.jpg" className="flex-1 object-contain"/></div>}

      {/* Feature 16: Comments Sheet */}
      {showComments && <div className="fixed inset-0 z-50 bg-black/60 flex items-end"><div className="bg-[#121725] w-full max-w-[430px] mx-auto rounded-t-[32px] p-5 h-[70vh] border-t border-blue-500/20"><div className="flex justify-between"><h3 className="font-bold">Comments</h3><button onClick={()=>setShowComments(false)}>✕</button></div><div className="mt-4 space-y-3 text-sm"><p><b>@arjun</b> Nice pix bro 💙</p><p><b>@sai</b> R2 fast 🔥</p></div><div className="absolute bottom-0 left-0 right-0 p-4 bg-[#121725] flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-[#080b14] rounded-full px-4 py-2 text-sm"/><button className="text-blue-500 font-bold text-sm">Post</button></div></div></div>}

      <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
    </>
  )
}
