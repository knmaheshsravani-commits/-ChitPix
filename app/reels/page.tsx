"use client"
import { useState, useEffect, useRef } from "react"

export default function ReelsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [filter, setFilter] = useState<'all'|'reels'|'posts'>('all')
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [showComments, setShowComments] = useState<any>(null)
  const [views, setViews] = useState<Record<string,number>>({})
  const videoRefs = useRef<Record<string,HTMLVideoElement>>({})
  
  const getUrl = (p:any) => p?.image_url || p?.url || p?.video_url || ""
  const isVideo = (p:any) => {
    try {
      const u = getUrl(p).toLowerCase()
      return u.includes('.mp4') || u.includes('.mov') || p?.type==='reel' || p?.type==='video'
    } catch { return false }
  }
  
  const filtered = posts.filter(p => {
    if(filter==='all') return true
    const v = isVideo(p)
    return filter==='reels' ? v : !v
  })

  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch('/api/posts',{cache:'no-store'})
        const d = await r.json()
        const list = Array.isArray(d)? d : d.posts || d.data || []
        setPosts(list)
        const v:any={}
        list.forEach((x:any)=> v[x.id]= Math.floor(Math.random()*2000)+100)
        setViews(v)
      }catch{ setPosts([]) } finally{ setLoading(false) }
    }
    load()
  },[])

  useEffect(()=>{
    const obs = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        const vid = e.target as HTMLVideoElement
        if(e.isIntersecting){ try{ vid.muted=muted; vid.play().catch(()=>{}) }catch{} }
        else{ try{ vid.pause() }catch{} }
      })
    },{threshold:0.5})
    Object.values(videoRefs.current).forEach(v=> v && obs.observe(v))
    return ()=> obs.disconnect()
  },[posts,muted])

  if(loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col">
      <div className="flex justify-center p-2 bg-black border-b border-zinc-900">
        <div className="flex bg-zinc-900 rounded-full p-1">
          {(['all','reels','posts'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-6 py-2 rounded-full text-sm font-bold ${filter===f?'bg-white text-black':'text-zinc-400'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full max-w-[420px] mx-auto overflow-y-scroll snap-y snap-mandatory">
        {filtered.length===0 ? (
          <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-500">
            <p>No {filter} found</p>
            <button onClick={()=>setFilter('all')} className="mt-3 px-4 py-2 bg-white text-black rounded-full">Show All</button>
          </div>
        ) : filtered.map((post:any,i:number)=>{
          const url = getUrl(post)
          const vid = isVideo(post)
          return (
            <div key={post.id||i} className="relative w-full h-[calc(100dvh-56px)] bg-black snap-start border-b border-zinc-900 flex items-center justify-center">
              {vid ? (
                <video ref={el=>{ if(el) videoRefs.current[post.id]=el }} src={url} className="w-full h-full object-cover" muted={muted} loop playsInline preload="metadata" />
              ) : (
                <img src={url} alt="" className="w-full h-full object-contain bg-black" />
              )}
              <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent flex justify-between">
                <span className="text-sm font-bold">@{post.username||'knmahesh'} • {views[post.id]||0} views {post.fromStory?'• From Story':''} {post.views?.includes?.('Permanent')?'• ♾️':''}</span>
                <button onClick={()=>setMuted(!muted)} className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">{muted?'🔇':'🔊'}</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-sm">{post.caption||post.content||'ChitPix Reel 🔥'}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
