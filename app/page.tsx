"use client"
import { useState, useEffect, useRef } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'
import PostCard from './components/PostCard'

export default function HomePage(){
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('home')
  const [showNotif, setShowNotif] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const galleryRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    fetch('/api/posts?limit=100').then(r=>r.json()).then(d=>setPosts(d.posts || [])).catch(()=>{})
  },[])

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[65px] flex flex-col">
      
      {/* INSTA HEADER - + LEFT, ChitPix CENTER, Heart RIGHT */}
      <div className="sticky top-0 z-20 bg-white px-3 py-2.5 flex justify-between items-center">
        <button onClick={()=>galleryRef.current?.click()} className="w-8 h-8 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        
        <div className="flex items-center gap-1">
          <h1 className="text-[22px] font-black tracking-tight">ChitPix</h1>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={()=>setShowNotif(true)} className="relative">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20.8 7.2A5.5 5.5 0 0 0 12 3a5.5 5.5 0 0 0-8.8 4.2c0 5.5 8.8 9.8 8.8 9.8s8.8-4.3 8.8-9.8z"/></svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button onClick={()=>alert('DM Open')} className="relative hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
          </button>
        </div>
      </div>

      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e)=>{alert('📸 Gallery: '+e.target.files?.[0]?.name)}} />

      {/* NOTIFICATION - DM + Name */}
      {showNotif && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={()=>setShowNotif(false)}>
          <div className="bg-white h-full w-full max-w-[480px] mx-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-3 border-b flex justify-between"><h3 className="font-bold">Notifications</h3><button onClick={()=>setShowNotif(false)}>✕</button></div>
            <div className="p-3 space-y-3">
              <div className="flex gap-2"><img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full"/><div className="text-[13px]"><b>priya_kadur</b> liked your post • 2m<br/><span className="text-blue-500 text-[12px]">DM: Hi bro! ❤️</span></div></div>
              <div className="flex gap-2"><img src="https://i.pravatar.cc/100?img=13" className="w-10 h-10 rounded-full"/><div className="text-[13px]"><b>abhicharli</b> started following you • 1h</div><button className="ml-auto bg-black text-white px-4 py-1 rounded-full text-[12px]">Follow</button></div>
            </div>
          </div>
        </div>
      )}

      <Stories />

      {/* POSTS - INSTA STYLE WITH FOLLOW BUTTON */}
      <div className="flex-1 bg-white">
        {posts.map((post:any)=>(<PostCard key={post.id} post={post} />))}
        {posts.length===0 && (
          <>
            {/* DEMO POST - INSTA SCREENSHOT LAGA */}
            <div className="border-b border-neutral-100">
              <div className="px-3 py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <img src="https://i.pravatar.cc/100?img=15" className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="text-[13px] font-bold leading-none">gd_edit_zz</div>
                    <div className="text-[11px] flex items-center gap-1 mt-0.5"><span>♫</span> Anirudh Ravicha...</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="border border-black px-4 py-1 rounded-md text-[13px] font-bold">Follow</button>
                  <button className="text-[18px]">☰</button>
                </div>
              </div>
              <div className="w-full aspect-[4/5] bg-black"><img src="https://picsum.photos/500/600?random=1" className="w-full h-full object-cover" /></div>
            </div>
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
