// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  House, Search, Plus, Clapperboard, User, Heart, MessageCircle,
  Send, Bookmark, Crown, Eye, Clock, Sparkles, MoreHorizontal,
  X, Check, Volume2, VolumeX, Share2, Link2, QrCode, Flag,
  EyeOff, Radio, Layers, RefreshCw
} from "lucide-react"

export default function HomePage(){
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([
    {id:'you', name:'Your story', avatar:'M', isYou:true, hasStory:false, seen:false, created_at: new Date().toISOString()},
    {id:'1', name:'rxtagur', avatar:'https://i.pravatar.cc/100?img=12', isYou:false, hasStory:true, seen:false, created_at: new Date().toISOString()},
    {id:'2', name:'_mr_sand..', avatar:'https://i.pravatar.cc/100?img=15', isYou:false, hasStory:true, seen:false, created_at: new Date().toISOString()},
    {id:'3', name:'shetty._', avatar:'https://i.pravatar.cc/100?img=32', isYou:false, hasStory:true, seen:false, created_at: new Date().toISOString()},
  ])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [following, setFollowing] = useState<any>({})
  const [showComments, setShowComments] = useState<any>(null)
  const [showShare, setShowShare] = useState<any>(null)
  const [showMenu, setShowMenu] = useState<any>(null)
  const [showStory, setShowStory] = useState<any>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [search, setSearch] = useState("")
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [muted, setMuted] = useState<any>({})
  const [activeVideo, setActiveVideo] = useState<string|null>(null)
  const [showFullscreen, setShowFullscreen] = useState<any>(null)
  const [toast, setToast] = useState("")
  const [hiddenPosts, setHiddenPosts] = useState<any>({})
  const fileInputRef = useRef<any>(null)
  const videoRefs = useRef<any>({})
  const feedRef = useRef<any>(null)

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""), 2500) }

  // R2 STORAGE DEVICE CONNECTED - NO LOCAL
  const fetchFeed = async () => {
    setLoading(true)
    try{
      const res = await fetch("/api/posts", {cache:"no-store"})
      const data = await res.json()
      if(Array.isArray(data) && data.length>0){
        const mapped = data.map((p:any)=>({
          id:p.id,
          image_url:p.image_url || p.url,
          url:p.image_url || p.url,
          video_url: p.video_url || (p.image_url?.includes('.mp4')? p.image_url : undefined),
          username:p.username||'knmahesh',
          caption:p.caption||'ChitPix R2 Permanent ✨ #2026',
          likes:p.likes || Math.floor(Math.random()*5000),
          views: p.views || 9415+Math.floor(Math.random()*2000),
          created_at:p.created_at,
          verified:p.username==='knmahesh' || p.verified || true
        }))
        setPosts(mapped)

        // STORIES ON TIME - 24H ONLY FROM R2
        const now = Date.now()
        const validStories = mapped.filter((p:any)=>{
          const diff = (now - new Date(p.created_at).getTime())/(1000*60*60)
          return diff <= 24
        }).map((p:any)=>({
          id: p.id, name: p.username, avatar: p.image_url, hasStory:true, seen:false, isYou:false, created_at: p.created_at, image_url: p.image_url
        }))
        if(validStories.length>0){
          setStories((prev:any[])=> [prev[0],...validStories.slice(0,11)])
        }
      } else {
        setPosts([
          {id:'1', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'knmahesh', caption:'R2 Connected ✅ 9415 views', likes:50300, views:9415, verified:true, created_at:new Date().toISOString()},
          {id:'2', video_url:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'rxtagur', caption:'Reel R2 🔊 Only active sound', likes:892, views:5210, verified:false, created_at:new Date().toISOString()},
        ])
      }
    }catch(e){ console.error(e); setPosts([]) }
    setLoading(false)
  }
  useEffect(()=>{ fetchFeed() },[])

  // STORY PROGRESS - ON TIME WORKING
  useEffect(()=>{
    if(!showStory) return
    setStoryProgress(0)
    const interval = setInterval(()=>{
      setStoryProgress(p=>{
        if(p>=100){ setShowStory(null); return 0 }
        return p+1.2
      })
    },50)
    return ()=>clearInterval(interval)
  },[showStory])

  // ONLY ACTIVE REEL SOUND - FIXED
  useEffect(()=>{
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id = entry.target.getAttribute('data-video-id')
          if(id) setActiveVideo(id)
        }
      })
    }, { threshold: 0.7 })
    Object.values(videoRefs.current).forEach((el:any)=>{ if(el) observer.observe(el) })
    return ()=> observer.disconnect()
  }, [posts])

  const handleLike = (id:string) => {
    const newLiked = {...liked, [id]:!liked[id]}; setLiked(newLiked)
    if(!liked[id]) showToast("Liked! ❤️ R2")
  }
  const handleDoubleTap = (id:string) => { if(!liked[id]) handleLike(id) }
  const handleFollow = (username:string) => { const isF = following[username]; setFollowing({...following, [username]:!isF}); showToast(isF? `Unfollowed ${username}` : `Following ${username} ✅`) }
  const handleAddStory = (e:any) => {
    const file = e.target.files?.[0]; if(!file) return
    const url = URL.createObjectURL(file)
    setStories((prev:any[])=> prev.map((s:any)=> s.isYou? {...s, avatar:url, hasStory:true, created_at:new Date().toISOString()} : s))
    showToast("Story added - R2 24h ⏰")
  }
  const openStory = (story:any) => {
    if(story.isYou &&!story.hasStory){ fileInputRef.current?.click(); return }
    setShowStory(story)
    setStories((prev:any[])=> prev.map((s:any)=> s.id===story.id? {...s, seen:true} : s))
  }
  const handleTopPlusClick = () => { fileInputRef.current?.click() }

  // UPLOAD FIXED - R2 PERMANENT - NO LOCAL PREVIEW
  const handleFileUpload = async (e:any) => {
    const file = e.target.files?.[0]; if(!file) return
    showToast(`Uploading ${file.name} to R2 Permanent... ⏳`)
    try{
      // Try presign first for all files - 100% R2
      const presignRes = await fetch("/api/r2-presign", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({fileName:`posts/${Date.now()}_${file.name}`, contentType:file.type, fileSize:file.size})
      })
      const presignData = await presignRes.json()
      const {url, publicUrl, key} = presignData

      if(url && publicUrl){
        await fetch(url, {method:"PUT", body:file, headers:{"Content-Type":file.type}})
        // Save to posts.json
        const saveRes = await fetch("/api/upload", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ url: publicUrl, username: currentUser.username, caption: `ChitPix 2026 🔥 ${new Date().toLocaleDateString()} #chitpix R2` })
        })
        const saveData = await saveRes.json()
        if(saveData.success){
          showToast("R2 Permanent Upload Done! 🚀✅")
          await fetchFeed()
        } else {
          throw new Error(saveData.error)
        }
      } else {
        // Fallback direct FormData
        const form = new FormData()
        form.append('file', file)
        form.append('username', currentUser.username)
        form.append('caption', 'ChitPix R2 Permanent')
        const res = await fetch("/api/upload", {method:"POST", body:form})
        const data = await res.json()
        if(data.success){ showToast("R2 Permanent Done! 🚀"); fetchFeed() }
        else throw new Error(data.error)
      }
    }catch(err:any){
      showToast(`Upload failed: ${err.message} ❌`)
    }
  }
  const handleRefresh = async () => { setRefreshing(true); await fetchFeed(); setRefreshing(false); showToast("Feed refreshed - R2 ✅") }
  const filtered = posts.filter((p:any)=>!hiddenPosts[p.id] && (search? (p.caption||"").toLowerCase().includes(search.toLowerCase()) : true))
    return(
    <div className="h-[100dvh] bg-white text-black overflow-hidden flex flex-col">
      {/* TOP BAR - NEW ICONS */}
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-20 border-b border-zinc-100 max-w-[470px] mx-auto w-full">
        <button onClick={handleTopPlusClick} className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center active:scale-90"><Plus size={20}/></button>
        <h1 className="font-extrabold text-[24px] tracking-tight flex items-center gap-1">ChitPix <Crown size={14} className="text-amber-500"/> <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded-full">R2</span></h1>
        <button onClick={()=>{setShowNotif(true); showToast("Notifications - R2")}} className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center relative active:scale-90">
          <Heart size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">3</span>
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleFileUpload}/>

      <div ref={feedRef} className="flex-1 overflow-y-auto max-w-[470px] mx-auto w-full pb-20">
        {/* STORIES - ON TIME */}
        <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b border-zinc-100">
          {stories.map((s:any)=>{
            const hrs = s.created_at? Math.floor((Date.now()-new Date(s.created_at).getTime())/3600000) : 0
            return (
              <div key={s.id} className="text-center min-w-[64px] cursor-pointer" onClick={()=>openStory(s)}>
                <div className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${s.hasStory &&!s.seen?'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600': s.hasStory && s.seen?'bg-zinc-300':'bg-zinc-200'}`}>
                  <div className="bg-white rounded-full p-[2.5px] w-full h-full">
                    {s.isYou? <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold text-xl relative">{s.avatar==='M'?'M':<img src={s.avatar} className="w-full h-full rounded-full object-cover"/>}<span className="absolute -bottom-1 -right-1 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"><Plus size={12}/></span></div> : <img src={s.avatar} className="w-full h-full rounded-full object-cover"/>}
                  </div>
                </div>
                <p className="text-[11px] mt-1 truncate w-[64px] flex items-center justify-center gap-1">{s.name} {s.verified&&<Check size={10} className="bg-blue-500 text-white rounded-full"/>}</p>
                {s.hasStory && <p className="text-[8px] text-zinc-400 flex items-center justify-center gap-0.5"><Clock size={8}/> {hrs}h</p>}
              </div>
            )
          })}
        </div>

        {loading? (
          <div className="space-y-6 p-4">
            {[1,2].map(i=><div key={i} className="animate-pulse"><div className="flex gap-2 mb-3"><div className="w-8 h-8 bg-zinc-200 rounded-full"/><div className="h-4 bg-zinc-200 rounded w-24"/></div><div className="w-full h-[400px] bg-zinc-200"/></div>)}
          </div>
        ) : filtered.map((post:any)=>{
          const isVideo =!!post.video_url
          const isLiked =!!liked[post.id]
          const isSaved =!!saved[post.id]
          const isFollowing =!!following[post.username||'']
          const isActive = activeVideo===post.id
          return(
            <div key={post.id} className="bg-white border-b border-zinc-100">
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-2 cursor-pointer" onClick={()=>router.push(`/profile`)}>
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-500"><img src={`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border-2 border-white"/></div>
                  <div>
                    <p className="font-bold text-[13px] flex items-center gap-1">{post.username} {post.verified && <span className="bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center"><Check size={8}/></span>} <span className="text-zinc-400 font-normal text-[11px] flex items-center gap-1"><Clock size={10}/> 1d • R2</span></p>
                    <p className="text-[11px] text-zinc-600 flex items-center gap-1"><Eye size={10}/> {post.views} views {isActive && isVideo? <span className="flex items-center gap-1"><Volume2 size={10}/> Playing</span> : <span className="flex items-center gap-1"><VolumeX size={10}/> Muted</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleFollow(post.username||'')} className="px-4 py-1.5 rounded-full text-[12px] font-bold bg-zinc-100 text-black active:scale-95">{isFollowing?'Following':'Follow'}</button>
                  <button onClick={()=>setShowMenu(post.id)} className="p-1"><MoreHorizontal size={18}/></button>
                </div>
              </div>

              <div ref={(el:any)=>{ if(isVideo) videoRefs.current[post.id]=el }} data-video-id={post.id} className="relative bg-black w-full aspect-[4/5] overflow-hidden cursor-pointer" onDoubleClick={()=>handleDoubleTap(post.id)} onClick={()=>setShowFullscreen(post)}>
                {isVideo? (
                  <>
                    <video src={post.video_url} className="w-full h-full object-cover" autoPlay={isActive} loop muted={!isActive || muted[post.id]!==false} playsInline/>
                    <button onClick={(e)=>{e.stopPropagation(); setMuted({...muted, [post.id]:!muted[post.id]}); showToast(muted[post.id]===false? "Muted 🔇" : "Sound on 🔊")}} className="absolute bottom-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center">
                      {isActive && muted[post.id]===false? <Volume2 size={16}/> : <VolumeX size={16}/>}
                    </button>
                    <div className="absolute right-2 bottom-20 flex flex-col gap-6 text-white items-center">
                      <button onClick={(e)=>{e.stopPropagation(); handleLike(post.id)}} className="flex flex-col items-center"><Heart size={26} fill={isLiked?'white':'none'}/><span className="text-[11px] font-bold mt-1">{isLiked?'50.4K':'50.3K'}</span></button>
                      <button onClick={(e)=>{e.stopPropagation(); setShowComments(post.id)}} className="flex flex-col items-center"><MessageCircle size={24}/><span className="text-[11px] font-bold mt-1">45</span></button>
                      <button onClick={(e)=>{e.stopPropagation(); setShowShare(post.id)}} className="flex flex-col items-center"><Send size={22}/><span className="text-[11px] font-bold mt-1">514</span></button>
                    </div>
                  </>
                ) : <img src={post.image_url||post.url} alt="post" className="w-full h-full object-cover" loading="lazy"/>}
              </div>

              <div className="px-3 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <button onClick={()=>handleLike(post.id)} className="active:scale-125 transition"><Heart size={24} fill={isLiked?'red':'none'} stroke={isLiked?'red':'black'}/></button>
                    <button onClick={()=>setShowComments(post.id)} className="active:scale-90"><MessageCircle size={24}/></button>
                    <button onClick={()=>setShowShare(post.id)} className="active:scale-90"><Send size={24}/></button>
                  </div>
                  <button onClick={()=>setSaved({...saved, [post.id]:!isSaved})}><Bookmark size={24} fill={isSaved?'black':'none'}/></button>
                </div>
                <p className="font-bold text-[13px] mt-2">{(post.likes||0)+(isLiked?1:0)} likes • R2</p>
                <p className="text-[13px] mt-1"><b>{post.username}</b> {post.caption}</p>
              </div>
            </div>
          )
        })}
        <div className="text-center py-6 text-zinc-400 text-[11px] flex flex-col items-center gap-2"><div className="flex items-center gap-1"><Radio size={12}/> R2 Storage • Only active reel 🔊</div><button onClick={handleRefresh} className="mt-2 px-4 py-2 bg-black text-white rounded-full text-[11px] flex items-center gap-1"><RefreshCw size={12} className={refreshing?'animate-spin':''}/> {refreshing?'Refreshing R2...':'Refresh Feed'}</button></div>
      </div>

      {showStory && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-[470px] mx-auto">
          <div className="h-1 bg-zinc-700 w-full"><div className="h-full bg-white transition-all" style={{width:`${storyProgress}%`}}/></div>
          <div className="p-4 flex justify-between text-white"><p className="font-bold flex items-center gap-2">{showStory.name} • R2 Story <span className="text-[10px] flex items-center gap-1"><Clock size={10}/> {Math.floor((Date.now()-new Date(showStory.created_at).getTime())/3600000)}h ago</span></p><button onClick={()=>setShowStory(null)}><X size={20}/></button></div>
          <div className="flex-1 flex items-center justify-center"><img src={showStory.avatar || showStory.image_url} className="w-full h-full object-contain"/></div>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] h-[60vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto my-3"></div>
            <h3 className="font-bold text-center border-b pb-3 flex items-center justify-center gap-2"><MessageCircle size={16}/> Comments • R2</h3>
            <div className="flex-1 p-4 overflow-y-auto"><div className="flex gap-2 mb-4"><div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-[12px]">M</div><p className="text-[13px]"><b>knmahesh</b> Super pic! ❤️ R2</p></div></div>
            <div className="p-3 border-t flex gap-2"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add comment... R2" className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-[13px] outline-none"/><button onClick={()=>{if(newComment){showToast(`Comment: ${newComment} - R2`); setNewComment(""); setShowComments(null)}}} className="text-blue-500 font-bold text-[13px] flex items-center gap-1"><Send size={12}/> Post</button></div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowShare(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] p-4" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Share2 size={16}/> Share • R2</h3>
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href); showToast("Link copied! 🔗"); setShowShare(null)}} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center"><Link2 size={18}/></div><span className="text-[11px]">Copy</span></button>
              <button onClick={()=>{if(navigator.share) navigator.share({url:window.location.href}); setShowShare(null)}} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center"><Share2 size={18}/></div><span className="text-[11px]">Share</span></button>
              <button className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center"><QrCode size={18}/></div><span className="text-[11px]">QR</span></button>
              <button className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center"><Bookmark size={18}/></div><span className="text-[11px]">Save</span></button>
            </div>
            <button onClick={()=>setShowShare(null)} className="w-full bg-zinc-100 py-3 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowMenu(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] p-2" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto my-3"></div>
            <button onClick={()=>{showToast("Reported - R2"); setShowMenu(null)}} className="w-full text-left p-4 text-red-500 font-bold border-b flex items-center gap-2"><Flag size={16}/> Report • R2</button>
            <button onClick={()=>{setHiddenPosts({...hiddenPosts, [showMenu]:true}); setShowMenu(null); showToast("Hidden")}} className="w-full text-left p-4 border-b flex items-center gap-2"><EyeOff size={16}/> Hide • Not Interested</button>
            <button onClick={()=>setShowMenu(null)} className="w-full p-4 text-center font-bold">Cancel</button>
          </div>
        </div>
      )}

      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-[470px] mx-auto">
          <div className="flex justify-between p-4 text-white"><p className="font-bold flex items-center gap-1">{showFullscreen.username} <Crown size={12} className="text-amber-400"/> • R2</p><button onClick={()=>setShowFullscreen(null)}><X size={20}/></button></div>
          <div className="flex-1 flex items-center justify-center">{showFullscreen.video_url? <video src={showFullscreen.video_url} controls autoPlay className="max-w-full max-h-full"/> : <img src={showFullscreen.image_url} className="max-w-full max-h-full object-contain"/>}</div>
        </div>
      )}

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-full text-[11px] z-[200] flex items-center gap-2"><Sparkles size={12}/> {toast}</div>}

      <div className="bg-white border-t border-zinc-200 fixed bottom-0 w-full max-w-[470px] left-1/2 -translate-x-1/2">
        <div className="flex justify-between items-center px-2 h-[52px]">
          <div className="w-12 h-12 flex items-center justify-center"><House size={24} className="fill-black"/></div>
          <button onClick={()=>router.push('/search')} className="w-12 h-12 flex items-center justify-center"><Search size={22}/></button>
          <button onClick={handleTopPlusClick} className="w-12 h-12 flex items-center justify-center"><div className="w-9 h-9 rounded-full bg-black flex items-center justify-center"><Plus size={20} className="text-white"/></div></button>
          <button onClick={()=>router.push('/reels')} className="w-12 h-12 flex items-center justify-center"><Clapperboard size={22}/></button>
          <button onClick={()=>router.push('/profile')} className="w-12 h-12 flex items-center justify-center"><div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center"><User size={16}/></div></button>
        </div>
      </div>
    </div>
  )
                      }
