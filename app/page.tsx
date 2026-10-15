"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Icons } from "./components/NewIcons"

export default function HomePage() {
  const router = useRouter()
  // CORE
  const [posts, setPosts] = useState<any[]>([])
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [username] = useState("knmahesh")
  const [userPhoto] = useState("https://i.pravatar.cc/150?u=knmahesh")
  const lastTap = useRef(0)
  const [stories, setStories] = useState<any[]>([])
  const [activeStory, setActiveStory] = useState<any>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showComments, setShowComments] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const topGalleryRef = useRef<HTMLInputElement>(null)
  const [views, setViews] = useState<Record<string, number>>({})
  const [showShare, setShowShare] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState<Record<string, any[]>>({})
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const showToast = (m:string)=>{ setToastMsg(m); setTimeout(()=>setToastMsg(null),2500) }

  useEffect(()=>{
    fetchPosts()
    fetchStories()
    fetchLikesSaves()
  },[])

  // 1. FETCH POSTS R2
  const fetchPosts=async()=>{
    setIsRefreshing(true)
    const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100)
    if(data){
      setPosts(data)
      const v:any={}
      for(const p of data){ v[p.id]=Math.floor(Math.random()*9000)+500 }
      setViews(v)
    }
    setIsRefreshing(false)
  }
  // 2. FETCH STORIES R2
  const fetchStories=async()=>{
    const {data}=await supabase.from("stories").select("*").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}).limit(30)
    if(data) setStories(data)
  }
  // 3. LIKES SAVES R2 - NO LOCAL
  const fetchLikesSaves=async()=>{
    try{
      const likeRes=await fetch('/api/likes',{cache:'no-store'})
      if(likeRes.ok){
        const likeData=await likeRes.json()
        const list=Array.isArray(likeData)?likeData:likeData.likes||likeData.data||[]
        const map:any={}
        for(const item of list){ map[item.post_id||item.id]=true }
        setLiked(map)
      }
      const saveRes=await fetch('/api/saves',{cache:'no-store'})
      if(saveRes.ok){
        const saveData=await saveRes.json()
        const list=Array.isArray(saveData)?saveData:saveData.saves||saveData.data||[]
        const map:any={}
        for(const item of list){ map[item.post_id||item.id]=true }
        setSaved(map)
      }
    }catch{}
  }

  // 4. STORY PROGRESS
  useEffect(()=>{
    if(!activeStory) return
    setStoryProgress(0)
    const i=setInterval(()=>{ setStoryProgress(v=>{ if(v>=100){ setActiveStory(null); return 0 } return v+1.8 }) },80)
    return()=>clearInterval(i)
  },[activeStory])

  // 5. FILE SELECT 200MB
  const handleFileChange=(e:any)=>{
    const f=e.target.files?.[0]
    if(!f) return
    if(f.size>200*1024*1024){ showToast("200MB limit bro!"); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setShowCreate(true)
  }

  // 6. TIME AGO
  const timeAgo=(dateStr:string)=>{
    try{
      const d=new Date(dateStr)
      const diff=Math.floor((Date.now()-d.getTime())/1000)
      if(diff<60) return "now"
      if(diff<3600) return Math.floor(diff/60)+"m"
      if(diff<86400) return Math.floor(diff/3600)+"h"
      if(diff<86400*7) return Math.floor(diff/86400)+"d"
      return Math.floor(diff/604800)+"w"
    }catch{ return "now" }
  }

  // 7. R2 UPLOAD 200MB - FULL CONNECT
  const uploadToR2=async()=>{
    if(!file){ showToast("Select file"); return }
    setUploading(true)
    setProgress(0)
    try{
      const isVideo=file.type.includes("video")
      const folder=isVideo?"reels":"posts"
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,fileType:file.type,contentType:file.type,folder})})
      const d=await res.json()
      if(!d.uploadUrl) throw new Error("R2 ENV missing - Add R2_ACCOUNT_ID etc in Vercel")
      await new Promise<void>((ok,bad)=>{
        const xhr=new XMLHttpRequest()
        xhr.upload.onprogress=e=>{ if(e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)) }
        xhr.onload=()=>{ if(xhr.status===200) ok(); else bad(new Error("R2 fail "+xhr.status)) }
        xhr.onerror=()=>bad(new Error("Network R2"))
        xhr.open("PUT",d.uploadUrl)
        xhr.setRequestHeader("Content-Type",file.type)
        xhr.send(file)
      })
      const publicUrl=d.publicUrl
      const {error}=await supabase.from("posts").insert([{image_url:publicUrl,caption:caption||"New R2 Post #chitpix",username,user_photo:userPhoto,likes:0,shares:0,type:isVideo?"reels":"post"}])
      if(error) throw error
      setCaption(""); setPreview(""); setFile(null); setShowCreate(false)
      await fetchPosts()
      showToast("200MB R2 Uploaded! 🔥")
    }catch(e:any){ showToast(e.message) } finally{ setUploading(false); setProgress(0) }
  }

  // 8. LIKE R2 + VIBRATE
  const handleLike=async(id:string)=>{
    const isLiked=!!liked[id]
    const newLiked:any={...liked}
    if(isLiked) delete newLiked[id]; else newLiked[id]=true
    setLiked(newLiked)
    setPosts(prev=>prev.map(p=>{ if(p.id===id){ const likes=isLiked?Math.max(0,(p.likes||1)-1):(p.likes||0)+1; return {...p,likes} } return p }))
    try{ if(!isLiked) await fetch('/api/likes',{method:'POST',headers:{"Content-Type":"application/json"},body:JSON.stringify({post_id:id})}); else await fetch('/api/likes?post_id='+id,{method:'DELETE'}) }catch{}
    if(!isLiked && navigator.vibrate) navigator.vibrate(40)
  }

  // 9. DOUBLE TAP HEART
  const handleDoubleTap=(id:string)=>{
    const now=Date.now()
    if(now-lastTap.current<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),900) }
    lastTap.current=now
  }

  // 10. DOWNLOAD R2 PROXY
  const handleDownload=async(post:any)=>{
    const url=post.image_url; if(!url) return
    setIsDownloading(post.id); showToast("Downloading R2...")
    try{
      const res=await fetch("/api/download?url="+encodeURIComponent(url)+"&filename=chitpix-"+post.id+".jpg")
      if(!res.ok) throw new Error("proxy fail")
      const blob=await res.blob()
      const a=document.createElement("a")
      a.href=URL.createObjectURL(blob)
      a.download="chitpix-"+post.id+"."+(url.includes(".mp4")?"mp4":"jpg")
      document.body.appendChild(a); a.click(); a.remove()
      showToast("Saved ✅ R2")
    }catch{ window.open(url,"_blank"); showToast("Opened R2") } finally{ setIsDownloading(null) }
  }

  // 11. COMMENT R2
  const handleAddComment=()=>{
    if(!commentText.trim()||!showComments) return
    const newC={id:Date.now().toString(),username,text:commentText,created_at:new Date().toISOString()}
    setAllComments(prev=>{ const existing=prev[showComments]||[]; const obj:any={...prev}; obj[showComments]=[...existing,newC]; return obj })
    setCommentText(""); showToast("Comment R2 💬")
    fetch('/api/comments',{method:'POST',headers:{"Content-Type":"application/json"},body:JSON.stringify({post_id:showComments,content:newC.text,username})}).catch(()=>{})
  }

  // GROUPED
  const grouped:any={}
  for(const story of stories){ const s:any=story; let key="unknown"; if(s.user_id) key=s.user_id; else if(s.username) key=s.username; if(!grouped[key]) grouped[key]=[]; grouped[key].push(s) }

  // 12. SEARCH FILTER
  const filteredPosts=posts.filter(p=>{ if(!searchQuery) return true; return (p.caption||"").toLowerCase().includes(searchQuery.toLowerCase())||(p.username||"").toLowerCase().includes(searchQuery.toLowerCase()) })

  return (
    <div className="w-full h-[100dvh] bg-black text-white overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-black border-x border-zinc-900 flex flex-col relative">
        <input ref={topGalleryRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        {/* HEADER */}
        <div className="h-[56px] flex justify-between items-center px-4 bg-black border-b border-zinc-800 shrink-0">
          <h1 className="text-[26px] font-black">ChitPix • R2</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>{ const el=topGalleryRef.current; if(el) el.click() }} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><Icons.DM size={20} /></button>
            <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[12px]">+ R2 200MB</button>
          </div>
        </div>
        {/* SEARCH */}
        <div className="px-3 py-2 border-b border-zinc-800 shrink-0"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search R2 posts..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-[13px] outline-none" /></div>
        {/* STORIES */}
        <div className="h-[84px] flex gap-3.5 px-3 items-center overflow-x-auto border-b border-zinc-800 shrink-0">
          <div className="flex flex-col items-center min-w-[60px] cursor-pointer" onClick={()=>{ const el=topGalleryRef.current; if(el) el.click() }}>
            <div className="w-[56px] h-[56px] rounded-full bg-zinc-800 p-[2px]"><img src={userPhoto} className="w-full h-full rounded-full object-cover border-2 border-black" alt="" /></div>
            <span className="text-[10px] mt-1">Your Story</span>
          </div>
          {Object.keys(grouped).map((k:string)=>(
            <div key={k} onClick={()=>setActiveStory(grouped[k][0])} className="flex flex-col items-center min-w-[60px] cursor-pointer">
              <div className="w-[56px] h-[56px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"><img src={grouped[k][0].image_url} className="w-full h-full rounded-full border-2 border-black object-cover" alt="" /></div>
              <span className="text-[10px] mt-1 truncate w-[60px] text-center">{k.slice(0,10)}</span>
            </div>
          ))}
        </div>
        {/* FEED */}
        <div ref={feedRef} className="flex-1 overflow-y-auto bg-black" style={{paddingBottom:'70px'}}>
          <div className="px-3 py-2 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur z-10 border-b border-zinc-900">
            <span className="text-[11px] text-zinc-400">{filteredPosts.length} posts • R2 No Local • {isRefreshing?"Refreshing...":"Ready"}</span>
            <button onClick={()=>{fetchPosts(); showToast("R2 Refreshed")}} className="text-[11px] bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">Refresh R2</button>
          </div>
          {filteredPosts.map((post:any)=>{
            const url=post.image_url||""
            const isVideo=post.type==="reels"||url.includes(".mp4")
            const isF=!!following[post.username]
            const vCount=views[post.id]||0
            return(
              <div key={post.id} className="border-b border-zinc-800 bg-black w-full">
                <div className="flex justify-between items-center px-3 py-2.5 bg-black">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600"><img src={post.user_photo||"https://i.pravatar.cc/100?u="+post.username} className="w-full h-full rounded-full border-2 border-black" alt="" /></div>
                    <div><p className="font-bold text-[13px]">{post.username} <span className="text-[11px] text-zinc-500 font-normal">{timeAgo(post.created_at)} • R2</span></p><p className="text-[11px] text-zinc-400">{vCount.toLocaleString()} views</p></div>
                  </div>
                  <button onClick={()=>{ const nf:any={...following}; nf[post.username]=!isF; setFollowing(nf); showToast(!isF?"Following R2":"Unfollowed")}} className={`text-[12px] font-bold px-3.5 py-1 rounded-full ${isF?"bg-zinc-800 text-zinc-400":"bg-white text-black"}`}>{isF?"Following":"Follow"}</button>
                </div>
                <div className="relative w-full aspect-[4/5] bg-zinc-900" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover" /> : <img src={url} className="w-full h-full object-cover" alt="" />}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="animate-[ping_0.8s_ease-out]"><Icons.Heart filled={true} size={80} /></div></div>}
                </div>
                <div className="bg-white text-black">
                  <div className="flex justify-between items-center px-3 py-2.5">
                    <div className="flex items-center gap-4">
                      <button onClick={()=>handleLike(post.id)} className="flex items-center gap-1"><Icons.Heart filled={!!liked[post.id]} size={22} /><span className="text-[13px] ml-1 font-semibold">{post.likes||0}</span></button>
                      <button onClick={()=>setShowComments(post.id)} className="flex items-center gap-1"><Icons.Comment size={22} /><span className="text-[13px] ml-1">{(allComments[post.id]?.length||0)+535}</span></button>
                      <button onClick={()=>showToast("Reposted R2")} className="flex items-center gap-1"><Icons.Repost size={22} /><span className="text-[13px] ml-1">3.3k</span></button>
                      <button onClick={()=>setShowShare(post)} className="flex items-center gap-1"><Icons.Share size={22} /><span className="text-[13px] ml-1">9k</span></button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>handleDownload(post)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                      <button onClick={async()=>{ const ns:any={...saved}; const was=!!ns[post.id]; if(was) delete ns[post.id]; else ns[post.id]=true; setSaved(ns); showToast(was?"Unsaved R2":"Saved R2"); try{ if(!was) await fetch('/api/saves',{method:'POST',headers:{"Content-Type":"application/json"},body:JSON.stringify({post_id:post.id})}); else await fetch('/api/saves?post_id='+post.id,{method:'DELETE'}) }catch{} }}><Icons.Save filled={!!saved[post.id]} size={22} /></button>
                    </div>
                  </div>
                  <div className="px-3 pb-3"><p className="text-[13px]"><b>{post.username}</b> {post.caption||"R2 Storage"} </p><p className="text-[11px] text-zinc-500 mt-1">{timeAgo(post.created_at)} • R2 Storage • {vCount} views • No Local</p></div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-black border-t border-zinc-800 flex justify-around items-center z-50">
          <button onClick={()=>{ const el=feedRef.current; if(el) el.scrollTo({top:0,behavior:'smooth'}) }} className="w-11 h-11 flex items-center justify-center"><Icons.Home active={true} size={26} /></button>
          <button onClick={()=>router.push("/search")} className="w-11 h-11 flex items-center justify-center"><Icons.Search size={26} /></button>
          <button onClick={()=>setShowCreate(true)} className="w-11 h-11 flex items-center justify-center"><Icons.Create size={26} /></button>
          <button onClick={()=>router.push("/reels")} className="w-11 h-11 flex items-center justify-center"><Icons.Reels size={26} /></button>
          <button onClick={()=>router.push("/profile")} className="w-7 h-7 rounded-full overflow-hidden border border-zinc-600"><img src={userPhoto} className="w-full h-full object-cover" alt="" /></button>
        </div>
        {showCreate && <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"><div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-3"><h3 className="font-bold text-sm">R2 Upload 200MB - 20 Futures</h3><button onClick={()=>setShowCreate(false)}>✕</button></div>{preview && (file?.type.includes("video")? <video src={preview} className="w-full h-52 object-cover rounded-xl mb-3" controls /> : <img src={preview} className="w-full h-52 object-cover rounded-xl mb-3" alt="" />)}<input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-xs mb-2 bg-zinc-800 p-3 rounded-full border border-zinc-700" /><p className="text-[10px] text-zinc-400 mb-2">{file?((file.size/1024/1024).toFixed(1)+"MB R2"):"Select 200MB R2"} {progress>0?progress+"%":""}</p>{uploading && <div className="w-full bg-zinc-800 h-2.5 rounded-full mb-3 overflow-hidden"><div className="bg-white h-full" style={{width:progress+"%"}}></div></div>}<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption R2 #chitpix..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm mb-3" rows={2} /><button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold text-sm">{uploading?progress+"% R2 Uploading...":"Upload to R2 200MB"}</button><p className="text-[9px] text-zinc-500 mt-2 text-center">No LocalStorage • R2 Cloudflare Only</p></div></div>}
        {activeStory && <div className="absolute inset-0 bg-black z-[70] flex flex-col"><div className="h-1 bg-zinc-800 w-full"><div className="h-full bg-white" style={{width:storyProgress+"%"}}></div></div><div className="flex justify-between p-4"><span className="font-bold text-sm">{activeStory.username||activeStory.user_id} • R2</span><button onClick={()=>setActiveStory(null)}>✕</button></div><div className="flex-1 flex items-center justify-center"><img src={activeStory.image_url} className="max-h-full object-contain" alt="" /></div></div>}
        {showComments && <div className="absolute inset-0 bg-black/80 z-[75] flex items-end" onClick={()=>setShowComments(null)}><div className="w-full bg-zinc-900 rounded-t-[20px] p-4 max-h-[60vh] flex flex-col" onClick={e=>e.stopPropagation()}><div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3"></div><h3 className="font-bold mb-3">Comments R2</h3><div className="flex-1 overflow-y-auto space-y-2 mb-3">{(allComments[showComments]||[]).map((c:any,i:number)=><div key={i} className="flex gap-2 text-sm"><span className="font-bold">{c.username}</span><span>{c.text}</span></div>)}</div><div className="flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") handleAddComment() }} placeholder="Add comment R2..." className="flex-1 bg-zinc-800 rounded-full px-4 py-3 text-sm outline-none" /><button onClick={handleAddComment} className="bg-white text-black px-5 rounded-full font-bold">Post</button></div></div></div>}
        {showShare && <div className="absolute inset-0 bg-bl
