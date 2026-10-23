"use client"
import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'
import PostCard from './components/PostCard'

export default function HomePage(){
  const [activeTab, setActiveTab] = useState('home')
  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(()=>{
    fetch('/api/posts?limit=100').then(r=>r.json()).then(d=>setPosts(d.posts || [])).catch(()=>{})
  },[])

  const filteredPosts = posts.filter((p:any)=>{
    if(!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (p.user?.toLowerCase().includes(q) || p.caption?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q))
  })

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[65px] flex flex-col">
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-[20px] font-black tracking-tight">ChitPix</h1>
        <div className="flex items-center gap-2">
          <span className="bg-black text-white text-[11px] px-3 py-1 rounded-full">{posts.length} posts</span>
        </div>
      </div>

      {activeTab === 'home' && (
        <>
          <Stories />
          <div className="flex-1">
            {posts.map((post:any)=>(
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <div className="flex-1 bg-white">
          <div className="p-3 sticky top-[49px] bg-white z-10">
            <div className="bg-neutral-100 rounded-full px-4 py-2.5 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M16 16L20 20"/></svg>
              <input 
                value={searchQuery}
                onChange={(e)=>setSearchQuery(e.target.value)}
                placeholder="Search users, captions..."
                className="bg-transparent outline-none flex-1 text-[14px]"
                autoFocus
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[2px]">
            {filteredPosts.map((post:any)=>(
              <div key={post.id} className="aspect-square bg-neutral-100 overflow-hidden">
                <img src={post.imageUrl || post.url} alt="post" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {filteredPosts.length===0 && (
            <div className="text-center py-20 text-neutral-500 text-[14px]">No results for "{searchQuery}"</div>
          )}
        </div>
      )}

      {/* BOTTOM NAV - ALWAYS VISIBLE */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
