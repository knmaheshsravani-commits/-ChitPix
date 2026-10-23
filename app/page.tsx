"use client"
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Stories from './components/Stories'
import PostCard from './components/PostCard'
import BottomNav from './components/BottomNav'
import CommentAZ from './components/CommentAZ'
import ShareAZ from './components/ShareAZ'

export default function HomePage(){
  const [posts,setPosts]=useState<any[]>([])
  const [activeTab,setActiveTab]=useState('home')
  const [showComments,setShowComments]=useState<string|null>(null)
  const [showShare,setShowShare]=useState<string|null>(null)
  const [searchQ,setSearchQ]=useState('')

  useEffect(()=>{
    fetch('/api/posts?limit=10')
      .then(r=>r.json())
      .then(d=>setPosts(d.posts||[]))
  },[])

  const filtered = posts.filter(p=> 
    p.user?.toLowerCase().includes(searchQ.toLowerCase()) || 
    p.location?.toLowerCase().includes(searchQ.toLowerCase())
  )

  return(
    <div className="bg-white w-full min-h-screen">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-[60px]">
        <Header count={posts.length} />
        
        {activeTab==='home' && (
          <>
            <Stories />
            <div className="flex flex-col">
              {filtered.map((post:any)=>(
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onComment={()=>setShowComments(post.id)}
                  onShare={()=>setShowShare(post.id)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab==='search' && (
          <div className="p-3">
            <input 
              value={searchQ} 
              onChange={e=>setSearchQ(e.target.value)} 
              placeholder="Search Mulbagal, users..." 
              className="w-full bg-black/5 rounded-full px-4 py-3 text-sm outline-none"
            />
            <div className="mt-4 grid grid-cols-3 gap-[1px]">
              {filtered.map((p:any)=>(
                <img key={p.id} src={p.imageUrl||p.image_url} className="aspect-square object-cover"/>
              ))}
            </div>
          </div>
        )}

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        {showComments && <CommentAZ postId={showComments} onClose={()=>setShowComments(null)} />}
        {showShare && <ShareAZ post={posts.find(p=>p.id===showShare)} onClose={()=>setShowShare(null)} />}
      </div>
    </div>
  )
}
