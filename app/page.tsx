"use client"
import { useState, useEffect, useRef } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'
import PostCard from './components/PostCard'

const R2_PUBLIC = "https://pub-62904f82f9ea4d4ebf8da6283b4e5cf9b2f55.r2.dev"

function fixR2Url(p:any){
  let url = p.image_url || p.url || p.image || p.r2Url || p.src || ""
  // If already public r2.dev url -> use it
  if(url.includes("pub-") && url.includes("r2.dev")) return url
  
  // If it's like posts/xxx.jpg or just filename
  const file = url.split("/").pop() || p.id || p.filename || ""
  if(file){
    // If url already has posts/ prefix in key
    const key = p.key || p.image_key || ""
    if(key && key.includes("posts/")) return `${R2_PUBLIC}/${key}`
    return `${R2_PUBLIC}/posts/${file}`
  }
  return url
}

export default function HomePage(){
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('home')
  const [showNotif, setShowNotif] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const galleryRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    fetch('/api/posts?limit=100', {cache:"no-store"})
      .then(r=>r.json())
      .then(d=>{
        const raw = d.posts || d || []
        const fixed = raw.map((p:any)=>({
          ...p,
          image_url: fixR2Url(p),
          image: fixR2Url(p),
          url: fixR2Url(p)
        }))
        setPosts(fixed)
      }).catch(()=>{})
  },[])

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[65px] flex flex-col">
      
      <div className="sticky top-0 z-20 bg-white px-3 py-2.5 flex justify-between items-center border-b border-zinc-100">
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
        </div>
      </div>

      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e)=>{alert('📸 Gallery: '+e.target.files?.[0]?.name)}} />

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

      <div className="flex-1 bg-white">
        {posts.map((post:any)=>(
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length===0 && (
          <div className="p-10 text-center text-zinc-400 text-[13px]">Loading R2 posts... If empty, check /api/posts</div>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
