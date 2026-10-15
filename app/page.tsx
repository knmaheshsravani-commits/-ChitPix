"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../lib/supabase"
import { Icons } from "./components/NewIcons"

export default function HomePage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [username, setUsername] = useState("knmahesh")
  const [userPhoto, setUserPhoto] = useState("")
  const lastTap = useRef(0)
  const [stories, setStories] = useState<any[]>([])
  const [activeStory, setActiveStory] = useState<any>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [following, setFollowing] = useState<any>({})
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showComments, setShowComments] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  // 20 NEW GUNS REFS
  const topGalleryRef = useRef<HTMLInputElement>(null)
  const [views, setViews] = useState<Record<string, number>>({})
  const [searchStory, setSearchStory] = useState("")
  const [showShare, setShowShare] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState<Record<string, any[]>>({})
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  const showToast = (m:string)=>{setToastMsg(m); setTimeout(()=>setToastMsg(null),2500)}

  useEffect(()=>{
    const n=localStorage.getItem("chitpix_username"); if(n) setUsername(n)
    const p=localStorage.getItem("chitpix_profile_photo"); if(p) setUserPhoto(p)
    const l=localStorage.getItem("chitpix_liked"); if(l) setLiked(JSON.parse(l))
    const s=localStorage.getItem("chitpix_saved"); if(s) setSaved(JSON.parse(s))
    fetchPosts(); fetchStories()
  },[])

  const fetchPosts=async()=>{
    const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100)
    if(data){ setPosts(data); const v:any={}; data.forEach((p:any)=> v[p.id]=Math.floor(Math.random()*5000)+100); setViews(v) }
  }
  const fetchStories=async()=>{const {data}=await supabase.from("stories").select("*").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}); if(data) setStories(data)}

  useEffect(()=>{if(!activeStory) return; setStoryProgress(0); const i=setInterval(()=>{setStoryProgress(v=>v>=100?(setActiveStory(null),0):v+2)},70); return()=>clearInterval(i)},[activeStory])

  useEffect(()=>{ localStorage.setItem("chitpix_liked", JSON.stringify(liked)) },[liked])
  useEffect(()=>{ localStorage.setItem("chitpix_saved", JSON.stringify(saved)) },[saved])

  const handleFileChange=(e:any)=>{
    const f=e.target.files[0]; if(!f) return
    if(f.size>200*1024*1024){showToast("200MB limit bro!"); return}
    setFile(f); setPreview(URL.createObjectURL(f)); setShowCreate(true)
  }

  // TIME AGO GUN
  const timeAgo = (dateStr:string)=>{ const d=new Date(dateStr); const diff=Math.floor((Date.now()-d.getTime())/1000); if(diff<60) return "now"; if(diff<3600) return Math.floor(diff/60)+"m"; if(diff<86400) return Math.floor(diff/3600)+"h"; return Math.floor(diff/86400)+"d" }

  // R2 200MB REELS + POSTS - OLD SAME NO CUT + NEW GUN
  const uploadToR2=async()=>{
    if(!file){showToast("Select file"); return}
    setUploading(true); setProgress(0)
    try{
      const isVideo=file.type.includes("video")
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,fileType:file.type,contentType:file.type,folder:isVideo?"reels":"posts"})})
      const d=await res.json()
      if(!d.uploadUrl) throw new Error("R2 presign failed - Check env")
      await new Promise<void>((ok,bad)=>{
        const xhr=new XMLHttpRequest()
        xhr.upload.onprogress=e=>{if(e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100))}
        xhr.onload=()=>xhr.status===200?ok():bad(new Error("R2 fail"))
        xhr.onerror=()=>bad(new Error("Network"))
        xhr.open("PUT",d.uploadUrl)
        xhr.setRequestHeader("Content-Type",file.type)
        xhr.send(file)
      })
      await supabase.from("posts").insert([{image_url:d.publicUrl,caption,username,user_photo:userPhoto,likes:0,shares:0,type:isVideo?"reels":"post"}])
      // SAVE TO API TOO - NEW GUN
      await fetch("/api/posts",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({image_url:d.publicUrl, caption, username, type:isVideo?"reels":"post"})}).catch(()=>{})
      setCaption(""); setPreview(""); setFile(null); setShowCreate(false); fetchPosts(); showToast("200MB Uploaded! 🔥 R2 Connected")
    }catch(e:any){showToast(e.message)}
    setUploading(false); setProgress(0)
  }

  const handleLike=(id:string)=>{
    const l=liked[id]
    setLiked({...liked,[id]:!l})
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:l?Math.max(0,p.likes-1):p.likes+1}:p))
    fetch('/api/likes',{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify({post_id:id})}).catch(()=>{})
    if(!l && navigator.vibrate) navigator.vibrate(40)
  }
  const handleDoubleTap=(id:string)=>{
    const now=Date.now()
    if(now-lastTap.current<300){
      if(!liked[id]) handleLike(id)
      setShowHeart(id); setTimeout(()=>setShowHeart(null),900)
    }
    lastTap.current=now
  }

  // DOWNLOAD PROXY - NEW GUN - NO RED PAGE
  const handleDownload = async (post:any)=>{
    const url=post.image_url
    if(!url) return
    setIsDownloading(post.id)
    showToast("Saving to gallery...")
    try{
      const res=await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=chitpix-${post.id}.jpg`)
      const blob=await res.blob()
      const a=document.createElement("a")
      a.href=URL.createObjectURL(blob)
      a.download=`chitpix-${post.id}.${url.includes(".mp4")?"mp4":"jpg"}`
      document.body.appendChild(a); a.click(); a.remove()
      showToast("Saved ✅")
    }catch{ await navigator.clipboard.writeText(url); showToast("Link Copied ✈️") }
    finally{ setIsDownloading(null) }
  }

  const handleAddComment = ()=>{
    if(!commentText.trim()||!showComments) return
    const newC={id:Date.now().toString(), username, text:commentText, created_at:new Date().toISOString()}
    setAllComments(prev=>({...prev, [showComments]: [...(prev[showComments]||[]), newC]}))
    setCommentText(""); showToast("Comment posted 💬")
    fetch('/api/comments',{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify({post_id:showComments, content:newC.text, username})}).catch(()=>{})
  }

  const grouped:any={}
  stories.forEach((s:any)=>{const k=s.user_id||s.username||"unknown"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s)})
  const filteredStoriesKeys = Object.keys(grouped).filter(k=> searchStory? k.toLowerCase().includes(searchStory.toLowerCase()) : true)

  return (
    <div className="w-full h-[100dvh] bg-black text-white overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-black border-x border-zinc-900 flex flex-col relative">
        <input ref={topGalleryRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange}/>

        {/* HEADER FIXED + DM GALLERY GUN #1 */}
        <div className="h-[56px] flex justify-between items-center px-4 bg-black border-b border-zinc-800 shrink-0">
          <h1 className="text-[26px] font-black tracking-tight">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>topGalleryRef.current?.click()} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90"><Icons.DM/></button>
            <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[12px] active:scale-95">+ Create 200MB</button>
          </div>
        </div>

        {/* STORIES FIXED + SEARCH GUN */}
        <div className="h-[92px] flex flex-col gap-1 border-b border-zinc-800 shrink-0 bg-black">
          <div className="flex gap-3.5 px-3 items-center overflow-x-auto scrollbar-hide flex-1">
            <div className="flex flex-col items-center min-w-[56px] cursor-pointer" onClick={()=>topGalleryRef.current?.click()}>
              <div className="w-[56px] h-[56px] rounded-full bg-zinc-800 p-[2px] border-2 border-zinc-700 border-dashed"><img src={userPhoto||"https://i.pravatar.cc/100?u=m"} className="w-full h-full rounded-full object-cover border-2 border-black" alt=""/></div>
              <span className="text-[10px] mt-1">Your Story</span>
            </div>
            {filteredStoriesKeys.map(k=>(
              <div key={k} onClick={()=>setActiveStory(grouped[k][0])} className="flex flex-col items-center min-w-[56px] cursor-pointer">
                <div className="w-[56px] h-[56px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"><img src={grouped[k][0].image_url} className="w-full h-full rounded-full border-2 border-black object-cover" alt=""/></div>
                <span className="text-[10px] mt-1 truncate w-[56px] text-center">{k}</span>
              </div>
            ))}
            <div className="min-w-[56px] flex flex-col items-center opacity-50"><div className="w-[56px] h-[56px] rounded-full bg-zinc-900 flex items-center justify-center text-[10px]">+12</div><span className="text-[10px] mt-1">More</span></div>
          </div>
        </div>

        {/* SCROLLABLE FEED - FIXED SCROLL */}
        <div ref={feedRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-black" style={{paddingBottom:'65px'}}>
          <div className="px-3 py-2 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur z-10 border-b border-zinc-900">
            <span className="text-[11px] text-zinc-400">{posts.length} posts • R2 Connected ✅</span>
            <button onClick={()=>{fetchPosts(); showToast("Refreshed 🔄")}} className="text-[11px] bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">Refresh</button>
          </div>
          {posts.map((post:any)=>{
            const url=post.image_url||"";
            const isVideo=post.type==="reels"||url.includes(".mp4")
            const isF=following[post.username]
            return(
              <div key={post.id} className="border-b border-zinc-800 bg-black w-full">
                <div className="flex justify-between items-center px-3 py-2.5 bg-black">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-black" alt=""/></div>
                    <div><p className="font-bold text-[13px] flex items-center gap-1">{post.username} <span className="w-1 h-1 bg-zinc-600 rounded-full"/> <span className="text-[11px] text-zinc-500 font-normal">{timeAgo(post.created_at)} • {views[post.id]||0} views</span></p><p className="text-[11px] text-zinc-400">Suggested • {post.likes||0} likes • R2</p></div>
                  </div>
                  {post.username===username? (
                    <button onClick={async()=>{if(confirm("Delete?")){await supabase.from("posts").delete().eq("id",post.id); fetchPosts()}}} className="text-[11px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">Delete</button>
                  ) : (
                    <button onClick={()=>{setFollowing({...following,[post.username]:!isF}); showToast(!isF?"Following ✅":"Unfollowed")}} className={`text-[12px] font-bold px-3.5 py-1 rounded-full active:scale-90 ${isF?"bg-zinc-800 text-zinc-400":"bg-white text-black"}`}>{isF?"Following":"Follow"}</button>
                  )}
                </div>

                <div className="relative w-full aspect-[4/5] bg-zinc-900" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover"/> : <img src={url} className="w-full h-full object-cover" alt=""/>}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="animate-[ping_0.8s_ease-out]"><Icons.Heart filled={true} size={80}/></div></div>}
                  {isDownloading===post.id && <div className="absolute top-3 right-3 bg-white/20 backdrop-blur px-2 py-1 rounded-full text-[10px] animate-pulse">Saving...</div>}
                </div>

                {/* ACTION BAR - 5 ICONS NEW THREADS STYLE - SAME SIZE 22px */}
                <div className="bg-white text-black">
                  <div className="flex justify-between items-center px-3 py-2.5">
                    <div className="flex items-center gap-4">
                      <button onClick={()=>handleLike(post.id)} className="flex items-center gap-1 active:scale-90"><Icons.Heart filled={!!liked[post.id]} size={22}/><span className="text-[13px] ml-1">{post.likes||0}</span></button>
                      <button onClick={()=>setShowComments(post.id)} className="flex items-center gap-1 active:scale-90"><Icons.Comment size={22}/><span className="text-[13px] ml-1">{(allComments[post.id]?.length||0)+535}</span></button>
                      <button onClick={()=>showToast("Reposted 🔁")} className="flex items-center gap-1 active:scale-90"><Icons.Repost size={22}/><span className="text-[13px] ml-1">3,348</span></button>
                      <button onClick={()=>setShowShare(post)} className="flex items-center gap-1 active:scale-90"><Icons.Share size={22}/><span className="text-[13px] ml-1">9,012</span></button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={()=>handleDownload(post)} className="active:scale-90"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                      <button onClick={()=>{setSaved({...saved,[post.id]:!saved[post.id]}); showToast(saved[post.id]?"Unsaved":"Saved 🔖"); fetch('/api/saves',{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify({post_id:post.id})}).catch(()=>{})}} className="active:scale-90"><Icons.Save filled={!!saved[post.id]} size={22}/></button>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[13px] leading-[18px]"><b>{post.username}</b> {post.caption? post.caption.split(/(#\w+|@\w+)/g).map((p:string,i:number)=> p.startsWith("#")? <span key={i} className="text-zinc-600 font-bold"> {p} </span> : p.startsWith("@")? <span key={i} className="text-blue-600 font-bold"> {p} </span> : p) : "Green thread"} <span className="text-zinc-500">...more</span></p>
                    <button onClick={()=>setShowComments(post.id)} className="text-[12px] text-zinc-500 mt-1">View {535+(allComments[post.id]?.length||0)} comments</button>
                    <p className="text-[11px] text-zinc-500 mt-1">{timeAgo(post.created_at)} • See translation • {views[post.id]||0} views</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM 5 - SAME SIZE 22px - WORKING - LOCKED - NEW ICONS */}
        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-black border-t border-zinc-800 flex justify-around items-center z-50">
          <button onClick={()=>feedRef.current?.scrollTo({top:0,behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center"><Icons.Home active={true}/></button>
          <button onClick={()=>{showToast("Search coming"); router.push("/search")}} className="w-11 h-11 flex items-center justify-center text-zinc-500"><Icons.Search/></button>
          <button onClick={()=>setShowCreate(true)} className="w-11 h-11 flex items-center justify-center text-zinc-500"><Icons.Create/></button>
          <button onClick={()=>{showToast("Reels"); router.push("/reels")}} className="w-11 h-11 flex items-center justify-center text-zinc-500"><Icons.Reels/></button>
          <button onClick={()=>router.push("/profile")} className="w-7 h-7 rounded-full overflow-hidden border border-zinc-600"><img src={userPhoto||"https://i.pravatar.cc/100?u=m"} className="w-full h-full object-cover" alt=""/></button>
        </div>

        {showCreate && <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"><div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-3"><h3 className="font-bold text-sm">Create 200MB • Reels + R2</h3><button onClick={()=>setShowCreate(false)}>✕</button></div>{preview && (file?.type.includes("video")? <video src={preview} className="w-full h-48 object-cover rounded-xl mb-3" controls/> : <img src={preview} className="w-full h-48 object-cover rounded-xl mb-3" alt=""/>)}<input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-xs mb-2 bg-zinc-800 p-2 rounded-full"/><p className="text-[10px] text-zinc-500 mb-2">{file?`${(file.size/1024/1024).toFixed(1)}MB - ${file.type.includes("video")?"REEL OK":"POST OK"} - R2`:"Select Image/Video 200MB R2"} {progress>0&&`${progress}%`}</p>{uploading && <div className="w-full bg-zinc-800 h-2 rounded-full mb-3"><div className="bg-white h-full transition-all" style={{width:`${progress}%`}}></div></div>}<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption #chitpix @user..." className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-sm mb-3" rows={2}/><button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold text-sm active:scale-95">{uploading?`${progress}% Uploading R2...`:"Upload to R2 200MB ✅"}</button></div></div>}
        {activeStory && <div className="absolute inset-0 bg-black z-[70] flex flex-col"><div className="h-1 bg-zinc-800 w-full"><div className="h-full bg-white transition-all" style={{width:`${storyProgress}%`}}></div></div><div className="flex justify-between p-4"><span className="font-bold text-sm">{activeStory.username||activeStory.user_id}</span><button onClick={()=>setActiveStory(null)}>✕</button></div><div className="flex-1 flex items-center justify-center"><img src={activeStory.image_url} className="max-h-full object-contain" alt=""/></div></div>}
        {showComments && <div className="absolute inset-0 bg-black/80 z-[75] flex items-end" onClick={()=>setShowComments(null)}><div className="w-full bg-zinc-900 rounded-t-[20px] p-4 max-h-[60vh] flex flex-col" onClick={e=>e.stopPropagation()}><div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3"/><h3 className="font-bold mb-3">Comments • {535+(allComments[showComments]?.length||0)}</h3><div className="flex-1 overflow-y-auto space-y-2 mb-3">{(allComments[showComments]||[]).map((c:any,i:number)=><div key={i} className="flex gap-2 text-sm"><span className="font-bold">{c.username}</span><span>{c.text}</span></div>)}</div><div className="flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddComment()} placeholder="Add comment..." className="flex-1 bg-zinc-800 rounded-full px-4 py-3 t
