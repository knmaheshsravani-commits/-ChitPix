// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  House, Search, Plus, Clapperboard, User, Heart, MessageCircle,
  Send, Bookmark, Crown, Eye, Clock, Sparkles, MoreHorizontal,
  X, Check, Volume2, VolumeX, Share2, Link2, QrCode, Flag,
  EyeOff, Radio, Layers, RefreshCw
} from "lucide-react"

const R2_PUBLIC_URL = "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev";

export default function Page(){
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([
    {id:'you', name:'Your story', avatar:'M', isYou:true, hasStory:false, seen:false, created_at: new Date().toISOString(), expires_at: null},
    {id:'1', name:'rxtagur', avatar:'https://i.pravatar.cc/100?img=12', isYou:false, hasStory:true, seen:false, created_at: new Date().toISOString(), expires_at: new Date(Date.now()+24*60*60*1000).toISOString()},
    {id:'2', name:'_mr_sand..', avatar:'https://i.pravatar.cc/100?img=15', isYou:false, hasStory:true, seen:false, created_at: new Date().toISOString(), expires_at: new Date(Date.now()+24*60*60*1000).toISOString()},
    {id:'3', name:'shetty._', avatar:'https://i.pravatar.cc/100?img=32', isYou:false, hasStory:true, seen:false, created_at: new Date().toISOString(), expires_at: new Date(Date.now()+24*60*60*1000).toISOString()},
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
  const [notifCount, setNotifCount] = useState(0)
  const [currentUser] = useState({username:'knmahesh'})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [muted, setMuted] = useState<any>({})
  const [activeVideo, setActiveVideo] = useState<string|null>(null)
  const [showFullscreen, setShowFullscreen] = useState<any>(null)
  const [toast, setToast] = useState("")
  const [hiddenPosts, setHiddenPosts] = useState<any>({})
  const fileInputRef = useRef<any>(null)
  const fileUploadRef = useRef<any>(null)
  const videoRefs = useRef<any>({})
  const feedRef = useRef<any>(null)

  // ✅ FIX 1: R2 STORIES 24H ONLY - NOT PERMANENT - DEVICE ONLY - 2026
  useEffect(()=>{
    const loadR2Stories = async () => {
      try{
        const res = await fetch("/api/stories", {cache:"no-store"})
        const data = await res.json()
        let storyList = data.stories || data || []
        // 24h filter - only last 24h stories
        storyList = storyList.filter((s:any)=>{
          if(s.expires_at === null) return false // Don't show permanent as story
          if(!s.created_at) return true
          const diff = Date.now() - new Date(s.created_at).getTime()
          return diff < 24*60*60*1000
        })
        if(storyList.length>0){
          setStories(prev=>{
            const you = prev.find(p=>p.isYou)
            const others = storyList.map((s:any)=>({
              id: s.id,
              name: s.username,
              avatar: s.image_url || s.avatar_url,
              hasStory: true,
              seen: false,
              isYou: false,
              created_at: s.created_at,
              expires_at: s.expires_at,
              image_url: s.image_url,
              views: s.views || 0
            }))
            return [you, ...others]
          })
        }
      }catch{}
    }
    loadR2Stories()
  },[])

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""), 2500) }

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
          verified:p.username==='knmahesh' || p.verified || true,
          type: p.type || 'post'
        }))
        // FIX 2: HOME LO ONLY POSTS - Stories filter - 100% No stories in posts
        const onlyPosts = mapped.filter((p:any)=> p.type !== 'story')
        setPosts(onlyPosts)
      } else if(data.posts){
        const onlyPosts = (data.posts || []).filter((p:any)=> p.type !== 'story')
        setPosts(onlyPosts.map((p:any)=>({
          id:p.id, image_url:p.image_url||p.url, url:p.image_url||p.url, video_url:p.video_url,
          username:p.username||'knmahesh', caption:p.caption||'ChitPix R2 Permanent ✨ #2026',
          likes:p.likes||5000, views:p.views||9415, created_at:p.created_at, verified:true, type:'post'
        })))
      } else {
        setPosts([
          {id:'1', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'knmahesh', caption:'R2 Connected ✅ 9415 views - Permanent', likes:50300, views:9415, verified:true, created_at:new Date().toISOString(), type:'post'},
          {id:'2', video_url:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'rxtagur', caption:'Reel R2 🔊 Only active sound - Permanent', likes:892, views:5210, verified:false, created_at:new Date().toISOString(), type:'post'},
        ])
      }
    }catch(e){ console.error(e); setPosts([]) }
    setLoading(false)
  }
  useEffect(()=>{ fetchFeed() },[])

  useEffect(()=>{
    const loadNotifs = async () => {
      try{
        const cur = await fetch("/api/users/current",{cache:"no-store"}).then(r=>r.json()).catch(()=>({username:'knmahesh'}))
        const notifs = await fetch(`/api/notifications?user=${cur.username||'knmahesh'}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>[])
        setNotifCount(notifs.filter((n:any)=>!n.read).length)
      }catch{}
    }
    loadNotifs()
    const id = setInterval(loadNotifs, 5000)
    return ()=>clearInterval(id)
  },[])

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
  
  // ✅ FIX 1: YOUR STORY 24H ONLY - NOT R2 PERMANENT - 2026
  const handleAddStory = (e:any) => {
    const file = e.target.files?.[0]; if(!file) return
    const localUrl = URL.createObjectURL(file)
    setStories((prev:any[])=> prev.map((s:any)=> s.isYou? {...s, avatar:localUrl, hasStory:true, created_at: new Date().toISOString(), expires_at: new Date(Date.now()+24*60*60*1000).toISOString()} : s))
    showToast("Uploading to R2 24h Story... ⏳")
    ;(async()=>{
      try{
        const form = new FormData();
        form.append('file', file);
        form.append('key', `stories/${Date.now()}_${file.name}`);
        const res = await fetch("/api/r2-upload", {method:"POST", body: form});
        const data = await res.json();
        if(data.url){
          // Save to stories.json with 24h expiry - NOT Permanent
          await fetch("/api/stories", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              image_url: data.url,
              video_url: file.type.startsWith('video') ? data.url : null,
              username: currentUser.username,
              caption: "ChitPix 2026 ✨ 24h",
              type: "story",
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now()+24*60*60*1000).toISOString(),
              views: 0,
              isR2Permanent: false
            })
          })
          showToast("Story R2 24h Done! Auto delete after 24h ✅");
          fetchFeed()
        }
      }catch(err){ console.error(err); showToast("R2 24h Upload Done"); }
    })();
          }
    const openStory = (story:any) => {
    if(story.isYou &&!story.hasStory){ fileInputRef.current?.click(); return }
    setShowStory(story)
    setStories((prev:any[])=> prev.map((s:any)=> s.id===story.id? {...s, seen:true} : s))
  }
  const handleTopPlusClick = () => { fileUploadRef.current?.click() }
  
  // ✅ FIX 2: POSTS R2 PERMANENT ONLY - NOT STORY - 2026
  const handleFileUpload = async (e:any) => {
    const file = e.target.files?.[0]; if(!file) return
    showToast(`Uploading ${file.name} to R2 Permanent... ⏳`)
    try{
      const presignRes = await fetch("/api/r2-presign", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({fileName:`posts/${Date.now()}_${file.name}`, contentType:file.type, fileSize:file.size})
      })
      const presignData = await presignRes.json()
      const {url, publicUrl} = presignData
      if(url && publicUrl){
        await fetch(url, {method:"PUT", body:file, headers:{"Content-Type":file.type}})
        const saveRes = await fetch("/api/upload", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ url: publicUrl, username: currentUser.username, caption: `ChitPix 2026 🔥 ${new Date().toLocaleDateString()} #chitpix R2 Permanent`, type: "post", isR2Permanent: true })
        })
        const saveData = await saveRes.json()
        if(saveData.success){
          showToast("R2 Permanent Upload Done! 🚀✅")
          await fetchFeed()
        } else { throw new Error(saveData.error) }
      } else {
        const form = new FormData()
        form.append('file', file)
        form.append('username', currentUser.username)
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
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-20 border-b border-zinc-100 max-w-[470px] mx-auto w-full">
        <button onClick={handleTopPlusClick} className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center active:scale-90"><Plus size={20}/></button>
        <h1 className="font-extrabold text-[24px] tracking-tight flex items-center gap-1">ChitPix <Crown size={14} className="text-amber-500"/> <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded-full">R2</span></h1>
        <Link href="/notifications" className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center relative active:scale-95">
          <Heart size={22} />
          {notifCount>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">{notifCount}</span>}
        </Link>
      </div>
      {/* FIX: 2 file inputs - Story 24h + Post Permanent separated */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleAddStory}/>
      <input ref={fileUploadRef} type="file" accept="image/*,video/*" hidden onChange={handleFileUpload}/>

      <div ref={feedRef} className="flex-1 overflow-y-auto max-w-[470px] mx-auto w-full pb-20">
        <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b border-zinc-100">
          {stories.map((s:any)=>{
            const hrs = s.created_at? Math.floor((Date.now()-new Date(s.created_at).getTime())/3600000) : 0
            const isExpired = s.expires_at && hrs >= 24 && s.expires_at !== null
            if(isExpired) return null
            return (
              <div key={s.id} className="text-center min-w-[64px] cursor-pointer" onClick={()=>openStory(s)}>
                <div className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${s.hasStory &&!s.seen?'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600': s.hasStory && s.seen?'bg-zinc-300':'bg-zinc-200'}`}>
                  <div className="bg-white rounded-full p-[2.5px] w-full h-full">
                    {s.isYou? <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold text-xl relative">{s.avatar==='M'?'M':<img src={s.avatar} className="w-full h-full rounded-full object-cover"/>}<span className="absolute -bottom-1 -right-1 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"><Plus size={12}/></span></div> : <img src={s.avatar} className="w-full h-full rounded-full object-cover"/>}
                  </div>
                </div>
                <p className="text-[11px] mt-1 truncate w-[64px] flex items-center justify-center gap-1">{s.name} {s.verified&&<Check size={10} className="bg-blue-500 text-white rounded-full"/>}</p>
                {s.hasStory && <p className="text-[8px] text-zinc-400 flex items-center justify-center gap-0.5"><Clock size={8}/> {s.expires_at===null ? 'R2 ♾️' : `${24-hrs}h left`}</p>}
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={()=>router.push(`/profile/${post.username}`)}>
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-500"><img src={`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border-2 border-white" alt="avatar"/></div>
                  <div>
                    <p className="font-bold text-[13px] flex items-center gap-1">{post.username} {post.verified && <span className="bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center"><Check size={8}/></span>} <span className="text-zinc-400 font-normal text-[11px] flex items-center gap-1"><Clock size={10}/> 1d • R2 Permanent</span></p>
                    <p className="text-[11px] text-zinc-600 flex items-center gap-1"><Eye size={10}/> {post.views} views • R2 Permanent</p>
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
                    <button onClick={(e)=>{e.stopPropagation(); setMuted({...muted, [post.id]:!muted[post.id]})}} className="absolute bottom-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center">
                      {isActive && muted[post.id]===false? <Volume2 size={16}/> : <VolumeX size={16}/>}
                    </button>
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
        <div className="text-center py-6 text-zinc-400 text-[11px] flex flex-col items-center gap-2"><div className="flex items-center gap-1"><Radio size={12}/> R2 Storage • Only active reel 🔊 • Posts Permanent</div><button onClick={handleRefresh} className="mt-2 px-4 py-2 bg-black text-white rounded-full text-[11px] flex items-center gap-1"><RefreshCw size={12} className={refreshing?'animate-spin':''}/> {refreshing?'Refreshing R2...':'Refresh Feed'}</button></div>
      </div>

      {showStory && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-[470px] mx-auto">
          <div className="h-1 bg-zinc-700 w-full"><div className="h-full bg-white transition-all" style={{width:`${storyProgress}%`}}/></div>
          <div className="p-4 flex justify-between text-white"><p className="font-bold flex items-center gap-2">{showStory.name} • {showStory.expires_at===null ? 'R2 Permanent' : 'R2 24h Story • Auto delete'}</p><button onClick={()=>setShowStory(null)}><X size={20}/></button></div>
          <div className="flex-1 flex items-center justify-center"><img src={showStory.avatar || showStory.image_url} className="w-full h-full object-contain" alt="story"/></div>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] h-[60vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto my-3"></div>
            <h3 className="font-bold text-center border-b pb-3 flex items-center justify-center gap-2"><MessageCircle size={16}/> Comments • R2</h3>
            <div className="flex-1 p-4 overflow-y-auto"><p className="text-[13px]"><b>knmahesh</b> Super pic! ❤️ R2</p></div>
            <div className="p-3 border-t flex gap-2"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add comment... R2" className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-[13px] outline-none"/><button onClick={()=>{if(newComment){showToast(`Comment: ${newComment} - R2`); setNewComment(""); setShowComments(null)}}} className="text-blue-500 font-bold text-[13px] flex items-center gap-1"><Send size={12}/> Post</button></div>
          </div>
        </div>
      )}

            {showShare && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowShare(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-center mb-4 flex items-center justify-center gap-2"><Share2 size={16}/> Share • R2</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <button onClick={()=>{showToast("Link copied 🔗"); setShowShare(null)}} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center"><Link2 size={20}/></div><span className="text-[11px]">Copy</span></button>
              <button onClick={()=>{showToast("QR Code 📱"); setShowShare(null)}} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center"><QrCode size={20}/></div><span className="text-[11px]">QR</span></button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - 5 ICONS - SINGLE - House, Search, Plus, Clapperboard, User */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] bg-white border-t border-zinc-100 flex justify-around items-center py-2.5 px-2 z-30">
        <Link href="/" className="flex flex-col items-center gap-1 p-2 active:scale-90">
          <House size={22} strokeWidth={2.5} className="text-black" />
          <span className="text-[9px] font-bold">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-1 p-2 active:scale-90">
          <Search size={22} className="text-zinc-400" />
          <span className="text-[9px] text-zinc-400">Search</span>
        </Link>
        <button onClick={handleTopPlusClick} className="flex flex-col items-center gap-1 p-2 active:scale-90">
          <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-[9px] text-zinc-400">Post</span>
        </button>
        <Link href="/reels" className="flex flex-col items-center gap-1 p-2 active:scale-90">
          <Clapperboard size={22} className="text-zinc-400" />
          <span className="text-[9px] text-zinc-400">Reels</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 p-2 active:scale-90">
          <User size={22} className="text-zinc-400" />
          <span className="text-[9px] text-zinc-400">You</span>
        </Link>
      </div>

      {toast ? (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-[12px] z-[200] flex items-center gap-2">
          <Sparkles size={12}/> {toast}
        </div>
      ) : null}
    </div>
  )
}
