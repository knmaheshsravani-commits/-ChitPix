"use client"
import { useState, useEffect, useRef } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'
import PostCard from './components/PostCard'

export default function HomePage(){
  const [activeTab, setActiveTab] = useState('home')
  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [r2Connected, setR2Connected] = useState(false)
  const [showR2, setShowR2] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const galleryRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    fetch('/api/posts?limit=100').then(r=>r.json()).then(d=>setPosts(d.posts || [])).catch(()=>{})
  },[])

  const filteredPosts = posts.filter((p:any)=>{
    if(!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (p.user?.toLowerCase().includes(q) || p.caption?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q))
  })

  const connectR2 = async () => {
    try{ await fetch('/api/r2/connect', {method:'POST'}); setR2Connected(true); setShowR2(false)}catch{ setR2Connected(true); setShowR2(false)}
  }

  const handleGalleryOpen = (e:any) => {
    const file = e.target.files?.[0]
    if(!file) return
    alert('📸 Selected: ' + file.name + '\nR2 ki upload chestunna...')
    const form = new FormData()
    form.append('file', file)
    fetch('/api/r2/upload', {method:'POST', body: form}).then(()=>alert('✅ Uploaded to R2!')).catch(()=>{})
  }

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[65px] flex flex-col">
      
      {/* HEADER - FIXED - CHITPIX LEFT + ICONS RIGHT */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-3 py-2.5 flex justify-between items-center">
        {/* LEFT - ChitPix NAME - ALWAYS VISIBLE */}
        <h1 className="text-[22px] font-black tracking-tight shrink-0">ChitPix</h1>
        
        {/* RIGHT - ALL BUTTONS */}
        <div className="flex items-center gap-1.5">
          <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-full font-bold">{posts.length}</span>
          
          <button onClick={()=>galleryRef.current?.click()} className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[14px]" title="Direct Gallery">+</button>
          
          <button onClick={()=>setShowNotif(true)} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 6 5 6 10H0c0-5 6-3 6-10"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button onClick={()=>alert('DM Open!')} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
          </button>

          <button onClick={()=>setShowSettings(true)} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
          </button>

          <button onClick={()=>setShowR2(true)} className={`text-[9px] px-2 py-1 rounded-full font-bold ${r2Connected ? 'bg-green-500 text-white' : 'bg-neutral-100'}`}>{r2Connected ? 'R2 ✅' : 'R2 ☁️'}</button>
        </div>
      </div>

      {/* DIRECT GALLERY INPUT - HIDDEN */}
      <input ref={galleryRef} type="file" accept="image/*,video/*" hidden onChange={handleGalleryOpen} />

      {/* NOTIFICATION SHEET */}
      {showNotif && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={()=>setShowNotif(false)}>
          <div className="bg-white h-[60%] mt-auto rounded-t-[20px] p-4" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="font-black">🔔 Notifications</h3><button onClick={()=>setShowNotif(false)} className="w-8 h-8 bg-neutral-100 rounded-full">✕</button></div>
            <div className="space-y-3">
              <div className="flex gap-3 items-center"><img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full" /><div className="text-[13px]"><b>Priya</b> liked your post ❤️<br/><span className="text-[11px] opacity-60">2m ago</span></div></div>
              <div className="flex gap-3 items-center"><img src="https://i.pravatar.cc/100?img=6" className="w-10 h-10 rounded-full" /><div className="text-[13px]"><b>Alex</b> started following you<br/><span className="text-[11px] opacity-60">1h ago</span></div></div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS SHEET */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={()=>setShowSettings(false)}>
          <div className="bg-white h-[70%] mt-auto rounded-t-[20px] p-4" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="font-black">⚙️ Settings</h3><button onClick={()=>setShowSettings(false)} className="w-8 h-8 bg-neutral-100 rounded-full">✕</button></div>
            <div className="space-y-2">
              <button className="w-full text-left py-3 px-3 bg-neutral-100 rounded-xl text-[14px]">👤 Edit Profile</button>
              <button className="w-full text-left py-3 px-3 bg-neutral-100 rounded-xl text-[14px]">🔒 Privacy</button>
              <button className="w-full text-left py-3 px-3 bg-neutral-100 rounded-xl text-[14px]">☁️ R2 Storage: {r2Connected ? 'Connected ✅' : 'Not Connected'}</button>
              <button className="w-full text-left py-3 px-3 bg-red-50 text-red-600 rounded-xl text-[14px]">🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

      {showR2 && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={()=>setShowR2(false)}>
          <div className="bg-white w-full max-w-sm rounded-[20px] p-5" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black text-[16px] mb-2">☁️ R2 Storage</h3>
            <button onClick={connectR2} className="w-full bg-black text-white py-3 rounded-full font-bold">Connect R2 Now</button>
          </div>
        </div>
      )}

      {activeTab === 'home' && (
        <>
          <Stories />
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-neutral-100">
            {['#ChitPix','#Kadur','#Karnataka','#Viral'].map(tag=><span key={tag} className="text-[11px] bg-neutral-100 px-3 py-1 rounded-full">{tag}</span>)}
          </div>
          <div className="flex-1">
            {posts.map((post:any)=>(<PostCard key={post.id} post={post} />))}
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <div className="flex-1 bg-white">
          <div className="p-3"><div className="bg-neutral-100 rounded-full px-4 py-2.5 flex gap-2"><input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent outline-none flex-1 text-[14px]" /></div></div>
          <div className="grid grid-cols-3 gap-[2px]">{filteredPosts.map((p:any)=>(<div key={p.id} className="aspect-square bg-neutral-100"><img src={p.imageUrl||p.url} className="w-full h-full object-cover" /></div>))}</div>
        </div>
      )}

      {/* BOTTOM NAV - LOCK */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
                                                                          }
