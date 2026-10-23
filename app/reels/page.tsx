"use client"
import { useState, useEffect } from "react"

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/posts', { cache: 'no-store' })
        if (!res.ok) { setPosts([]); return }
        const data = await res.json().catch(() => [])
        const list = Array.isArray(data) ? data : (data?.posts || data?.data || [])
        setPosts(Array.isArray(list) ? list : [])
      } catch {
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div style={{minHeight:'100vh',background:'black',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading ChitPix...</div>
  }

  if (posts.length === 0) {
    return (
      <div style={{minHeight:'100vh',background:'black',color:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <p style={{fontSize:40}}>📸</p>
        <p style={{marginTop:10,fontWeight:'bold'}}>No Reels Yet - 0 posts</p>
        <p style={{fontSize:12,color:'#888',marginTop:5}}>R2 LIVE • Upload first reel bro</p>
        <a href="/" style={{marginTop:15,padding:'8px 16px',background:'white',color:'black',borderRadius:20,textDecoration:'none'}}>Go Home</a>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'black',color:'white',padding:10}}>
      <h1 style={{textAlign:'center',padding:10}}>Reels • {posts.length} • R2 LIVE ✅</h1>
      {posts.map((post:any, i:number) => {
        const url = post?.image_url || post?.url || post?.video_url || ''
        const isVid = url.toLowerCase().includes('.mp4') || post?.type==='reel'
        return (
          <div key={post?.id || i} style={{marginBottom:20,background:'#111',padding:10,borderRadius:10}}>
            <p style={{fontSize:12}}>@{post?.username || 'user'} • {post?.views || '0 views'}</p>
            {isVid ? (
              <video src={url} style={{width:'100%',marginTop:10,borderRadius:10}} controls muted loop playsInline />
            ) : (
              <img src={url} alt="" style={{width:'100%',marginTop:10,borderRadius:10}} />
            )}
            <p style={{marginTop:8,fontSize:13}}>{post?.caption || 'ChitPix Reel'}</p>
          </div>
        )
      })}
    </div>
  )
}
