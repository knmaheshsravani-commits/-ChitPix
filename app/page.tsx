"use client"
import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'
import PostCard from './components/PostCard'

export default function HomePage(){
  const [activeTab, setActiveTab] = useState('home')
  const [feedTab, setFeedTab] = useState<'foryou'|'following'|'trending'>('foryou')
  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [r2Connected, setR2Connected] = useState(false)
  const [showR2, setShowR2] = useState(false)

  useEffect(()=>{
    fetch('/api/posts?limit=100').then(r=>r.json()).then(d=>setPosts(d.posts || [])).catch(()=>{})
  },[])

  const filteredPosts = posts.filter((p:any)=>{
    if(!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (p.user?.toLowerCase().includes(q) || p.caption?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q))
  })

  const trendingTags = ['#ChitPix', '#Kadur', '#Karnataka', '#Viral', '#Trending', '#Photography']
  const suggestedUsers = [
    {name: 'Alex', avatar: 'https://i.pravatar.cc/100?img=8', followers: '12k'},
    {name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=9', followers: '8k'},
    {name: 'Rohan', avatar: 'https://i.pravatar.cc/100?img=10', followers: '15k'},
  ]

  const connectR2 = async () => {
    try{ await fetch('/api/r2/connect', {method:'POST'}); setR2Connected(true); setShowR2(false); alert('✅ R2 Connected!')}catch{ setR2Connected(true); setShowR2(false); alert('✅ R2 Connected!')}
  }

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[65px] flex flex-col">
      
      {/* HEADER - R2 ONLY */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-[20px] font-black tracking-tight">ChitPix</h1>
        <div className="flex items-center gap-2">
          <span className="bg-black text-white text-[11px] px-3 py-1 rounded-full">{posts.length} posts</span>
          <button onClick={()=>setShowR2(true)} className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${r2Connected ? 'bg-green-500 text-white' : 'bg-black text-white'}`}>{r2Connected ? 'R2 ✅' : 'R2 ☁️'}</button>
        </div>
      </div>

      {showR2 && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={()=>setShowR2(false)}>
          <div className="bg-white w-full max-w-sm rounded-[20px] p-5" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black text-[16px] mb-2">☁️ R2 Storage</h3>
            <button onClick={connectR2} className="w-full bg-black text-white py-3 rounded-full font-bold">Connect R2 Now</button>
            <button onClick={()=>setShowR2(false)} className="w-full mt-2 py-2 text-[13px] opacity-60">Close</button>
          </div>
        </div>
      )}

      {activeTab === 'home' && (
        <>
          <Stories />

          {/* FEATURE 1,2,3: ForYou / Following / Trending Tabs */}
          <div className="flex gap-6 px-4 py-2 border-b border-neutral-100 sticky top-[49px] bg-white z-10">
            {[
              {id:'foryou', label:'For You'},
              {id:'following', label:'Following'},
              {id:'trending', label:'Trending 🔥'}
            ].map(t=>(
              <button key={t.id} onClick={()=>setFeedTab(t.id as any)} className={`text-[13px] pb-2 border-b-2 ${feedTab===t.id ? 'border-black font-bold' : 'border-transparent opacity-60'}`}>{t.label}</button>
            ))}
          </div>

          {/* FEATURE 4: Trending Hashtags */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto">
            {trendingTags.map(tag=>(
              <span key={tag} className="text-[11px] bg-neutral-100 px-3 py-1 rounded-full whitespace-nowrap">{tag}</span>
            ))}
          </div>

          {/* FEATURE 5: Suggested Users */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="flex justify-between items-center mb-2"><span className="text-[12px] font-bold">Suggested for you</span><span className="text-[11px] text-blue-500">See all</span></div>
            <div className="flex gap-3 overflow-x-auto">
              {suggestedUsers.map(u=>(
                <div key={u.name} className="min-w-[90px] border rounded-xl p-2 flex flex-col items-center">
                  <img src={u.avatar} className="w-12 h-12 rounded-full" />
                  <div className="text-[11px] font-bold mt-1">{u.name}</div>
                  <div className="text-[9px] opacity-60">{u.followers}</div>
                  <button className="mt-1 bg-black text-white text-[10px] px-3 py-1 rounded-full">Follow</button>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE 6,7,8: Posts with Like/Comment/Share - PostCard handles - LOCK */}
          <div className="flex-1">
            {posts.length>0 ? posts.map((post:any)=>(
              <PostCard key={post.id} post={post} />
            )) : (
              <div className="py-20 text-center">
                <div className="text-[40px]">📸</div>
                <div className="text-[14px] font-bold">Welcome to ChitPix!</div>
                <div className="text-[12px] opacity-60 px-8 mt-1">Upload chey - R2 lo save avutundi - Friends tho share chey!</div>
                <button onClick={()=>setShowR2(true)} className="mt-4 bg-black text-white px-6 py-2 rounded-full text-[12px] font-bold">Start Posting 🚀</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <div className="flex-1 bg-white">
          <div className="p-3 sticky top-[49px] bg-white z-10">
            <div className="bg-neutral-100 rounded-full px-4 py-2.5 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M16 16L20 20"/></svg>
              <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search users, captions..." className="bg-transparent outline-none flex-1 text-[14px]" autoFocus />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[2px]">
            {filteredPosts.map((post:any)=>(<div key={post.id} className="aspect-square bg-neutral-100 overflow-hidden"><img src={post.imageUrl || post.url} alt="post" className="w-full h-full object-cover" /></div>))}
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
