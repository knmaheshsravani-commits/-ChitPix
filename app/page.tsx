"use client"
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Stories from './components/Stories'
import PostCard from './components/PostCard'
import BottomNav from './components/BottomNav'

export default function HomePage(){
  const [posts,setPosts]=useState<any[]>([])
  const [activeTab,setActiveTab]=useState('home')
  const [searchQ,setSearchQ]=useState('')

  useEffect(()=>{
    fetch('/api/posts?limit=64')
      .then(r=>r.json())
      .then(d=>{
        console.log('POSTS DATA:', d)
        setPosts(d.posts || d.data || [])
      })
      .catch(e=>console.error(e))
  },[])

  const filtered = posts.filter((p:any)=> {
    if(!searchQ) return true
    return p.user?.toLowerCase().includes(searchQ.toLowerCase()) || p.location?.toLowerCase().includes(searchQ.toLowerCase())
  })

  return(
    <div className="bg-white w-full min-h-screen">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-[70px]">
        <Header count={posts.length} />
        
        {activeTab==='home' && (
          <>
            <Stories />
            <div className="flex flex-col">
              {filtered.length===0 && posts.length===0 && (
                <div className="p-10 text-center text-sm text-black/50">Loading 64 posts...</div>
              )}
              {filtered.map((post:any, idx:number)=>(
                <PostCard key={post.id || idx} post={post} />
              ))}
            </div>
          </>
        )}

        {activeTab==='search' && (
          <div className="p-3">
            <input 
              value={searchQ} 
              onChange={e=>setSearchQ(e.target.value)} 
              placeholder="Search users, places..." 
              className="w-full bg-black/5 rounded-full px-4 py-3 text-sm outline-none"
            />
            <div className="mt-4 grid grid-cols-3 gap-[1px]">
              {filtered.map((p:any,i:number)=>(
                <img key={p.id || i} src={p.imageUrl || p.image_url || p.url || 'https://picsum.photos/300/300?random='+i} className="aspect-square object-cover bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}
