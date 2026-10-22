// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  House, Search, Plus, Clapperboard, User, Heart, MessageCircle,
  Send, Bookmark, Crown, Eye, Clock, Sparkles, MoreHorizontal,
  X, Check, Volume2, VolumeX, Share2, Link2, QrCode, Flag,
  EyeOff, Radio, Layers, RefreshCW
} from "lucide-react"
import { createClient } from "../lib/supabase/client"

const R2_PUBLIC_URL = "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev";

function BottomNav({ active, avatar: propAvatar }: any) {
  const [avatar, setAvatar] = useState(propAvatar || "")
  useEffect(()=>{ if(propAvatar) setAvatar(propAvatar) },[propAvatar])
  const isActive = (n:string) => active===n
  return (
    <div className="fixed bottom-[18px] left-1/2 -translate-x-1/2 z-[100] w-full max-w-[360px] px-4">
      <div className="bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-zinc-200 flex justify-around items-center h-[56px] px-2">
        <Link href="/" className="w-[52px] h-[44px] flex items-center justify-center"><div className={`w-[42px] h-[36px] flex items-center justify-center rounded-full ${isActive("home")?"bg-[#f2f2f2]":""}`}><svg width="26" height="26" viewBox="0 0 24 24" fill={isActive("home")?"black":"none"} stroke="black" strokeWidth="1.8"><path d="M12 3L3 9v11h6v-6h6v6h6V9L12 3z"/></svg></div></Link>
        <Link href="/reels" className="w-[52px] h-[44px] flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="3" width="20" height="18" rx="3"/><path d="M10 8l6 4-6 4V8z"/></svg></Link>
        <Link href="/messages" className="w-[52px] h-[44px] flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg></Link>
        <Link href="/search" className="w-[52px] h-[44px] flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><line x1="17" y1="17" x2="21" y2="21"/></svg></Link>
        <Link href="/profile" className="w-[52px] h-[44px] flex items-center justify-center"><div className="w-[28px] h-[28px] rounded-full overflow-hidden border"><img src={avatar || propAvatar || "https://i.pravatar.cc/150?u=knmahesh"} alt="you" className="w-full h-full object-cover"/></div></Link>
      </div>
    </div>
  )
}

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
  const [currentUser, setCurrentUser] = useState<any>({username:'knmahesh', photo:''})
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
  const supabase = createClient()

  useEffect(()=>{
    let mounted = true
    const checkLogin = async ()=>{
      try{
        const { data: { session } } = await supabase.auth.getSession()
        if(mounted && session?.user){
          setCurrentUser({
            username: session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'user',
            photo: session.user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${session.user.email}`,
            email: session.user.email
          })
          setLoading(false)
          return
        }
      }catch{}
      try{
        const match = document.cookie.match(/chitpix_session=([^;]+)/)
        const sessionId = match?.[1]
        if(sessionId){
          const res = await fetch(`/api/users/current?sessionId=${sessionId}`, {cache:"no-store"})
          const data = await res.json()
          if(mounted && data?.username){
            setCurrentUser({username: data.username, photo: data.photo || `https://i.pravatar.cc/150?u=${data.username}`, email: data.email})
            setLoading(false)
            return
          }
        }
      }catch{}
      for(let i=0; i<2; i++){
        await new Promise(r=>setTimeout(r, 800))
        try{
          const { data: { session } } = await supabase.auth.getSession()
          if(mounted && session?.user){
            setCurrentUser({
              username: session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'user',
              photo: session.user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${session.user.email}`,
              email: session.user.email
            })
            setLoading(false)
            return
          }
        }catch{}
      }
      if(mounted){ setLoading(false); router.replace("/login") }
    }
    checkLogin()
    return ()=>{ mounted = false }
  },[router, supabase])

  useEffect(()=>{
    const loadR2Stories = async () => {
      try{
        const res = await fetch("/api/stories", {cache:"no-store"})
        const data = await res.json()
        let storyList = data.stories || data || []
        storyList = storyList.filter((s:any)=>{
          if(s.expires_at === null) return false
          if(!s.created_at) return true
          const diff = Date.now() - new Date(s.created_at).getTime()
          return diff < 24*60*60*1000
        })
        if(storyList.length>0){
          setStories(prev=>{
            const you = prev.find(p=>p.isYou)
            const others = storyList.map((s:any)=>({
              id: s.id, name: s.username, avatar: s.image_url || s.avatar_url,
              hasStory: true, seen: false, isYou: false,
              created_at: s.created_at, expires_at: s.expires_at,
              image_url: s.image_url, views: s.views || 0
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
          id:p.id, image_url:p.image_url || p.url, url:p.image_url || p.url,
          video_url: p.video_url || (p.image_url?.includes('.mp4')? p.image_url : undefined),
          username:p.username||'knmahesh', caption:p.caption||'ChitPix R2 Permanent ✨ #2026',
          likes:p.likes || Math.floor(Math.random()*5000), views: p.views || 9415+Math.floor(Math.random()*2000),
          created_at:p.created_at, verified:p.username==='knmahesh' || p.verified || true, type: p.type || 'post'
        }))
        const onlyPosts = mapped.filter((p:any)=> p.type !== 'story')
        setPosts(onlyPosts)
      } else if(data.posts){
        const onlyPosts = (data.posts || []).filter((p:any)=> p.type !== 'story')
        setPosts(onlyPosts.map((p:any)=>({ id:p.id, image_url:p.image_url||p.url, url:p.image_url||p.url, video_url:p.video_url, username:p.username||'knmahesh', caption:p.caption||'ChitPix R2 Permanent ✨ #2026', likes:p.likes||5000, views:p.views||9415, created_at:p.created_at, verified:true, type:'post' })))
      } else {
        setPosts([
          {id:'1', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'knmahesh', caption:'R2 Connected ✅ Permanent', likes:50300, views:9415, verified:true, created_at:new Date().toISOString(), type:'post'},
        ])
      }
    }catch(e){ console.error(e); setPosts([]) }
    setLoading(false)
  }
  useEffect(()=>{ fetchFeed() },[])
  useEffect(()=>{
    const loadNotifs = async () => {
      try{
        const cur = await fetch(`/api/users/current?sessionId=${document.cookie.match(/chitpix_session=([^;]+)/)?.[1]}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({username:'knmahesh'}))
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
    if(!liked[id]) showToast("Liked! ❤️")
  }
  const handleDoubleTap = (id:string) => { if(!liked[id]) handleLike(id) }
  const handleFollow = (username:string) => { const isF = following[username]; setFollowing({...following, [username]:!isF}); showToast(isF? `Unfollowed ${username}` : `Following ${username} ✅`) }
  
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
          await fetch("/api/stories", {
            method: "POST", headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              image_url: data.url, video_url: file.type.startsWith('video') ? data.url : null,
              username: currentUser.username, caption: "ChitPix 2026 ✨ 24h",
              type: "story", created_at: new Date().toISOString(),
              expires_at: new Date(Date.now()+24*60*60*1000).toISOString(), views: 0
            })
          })
          showToast("Story R2 24h Done! ✅");
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
          body: JSON.stringify({ url: publicUrl, username: currentUser.username, caption: `ChitPix 2026 🔥 #chitpix R2 Permanent`, type: "post", isR2Permanent: true })
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
    const filtered = posts.filter((p:any)=>!hiddenPosts[p.id])

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
      <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleAddStory}/>
      <input ref={fileUploadRef} type="file" accept="image/*,video/*" hidden onChange={handleFileUpload}/>

      <div ref={feedRef} className="flex-1 overflow-y-auto max-w-[470px] mx-auto w-full pb-[90px]">
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
                <p className="text-[11px] mt-1 truncate w-[64px]">{s.name}</p>
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
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={()=>router.push(`/profile/${post.username}`)}>
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600">
                    <img src={`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border-2 border-white" alt="avatar"/>
                  </div>
                  <span className="font-bold text-[14px]">{post.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleFollow(post.username||'')} className={`px-4 py-1.5 rounded-full text-[12px] font-bold active:scale-95 ${isFollowing?'bg-black text-white':'bg-zinc-100 text-black'}`}>{isFollowing?'Following':'Follow'}</button>
                  <button onClick={()=>setShowMenu(post.id)} className="p-1"><MoreHorizontal size={18}/></button>
                </div>
              </div>
              <div ref={(el:any)=>{ if(isVideo) videoRefs.current[post.id]=el }} data-video-id={post.id} className="relative bg-black w-full aspect-[4/5] overflow-hidden cursor-pointer" onDoubleClick={()=>handleDoubleTap(post.id)} onClick={()=>setShowFullscreen(post)}>
                {isVideo? (
                  <>
                    <video src={post.video_url} className="w-full h-full object-cover" autoPlay={isActive} loop muted={!isActive || muted[post.id]!==false} playsInline/>
                    <button onClick={(e)=>{e.stopPropagation(); setMuted({...muted, [post.id]:!muted[post.id]})}} className="absolute bottom-3 rig
                    
