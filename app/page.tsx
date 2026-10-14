"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"

export default function HomePage() {
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
  const [activeTab, setActiveTab] = useState("home")
  const [showComments, setShowComments] = useState<string | null>(null)

  const showToast = (m: string) => { setToastMsg(m); setTimeout(()=>setToastMsg(null),2500) }

  useEffect(() => {
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setUserPhoto(p)
    fetchPosts()
    fetchStories()
  }, [])

  const fetchPosts = async () => {
    const {data} = await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100)
    if(data) setPosts(data)
  }
  const fetchStories = async () => {
    const {data} = await supabase.from("stories").select("*").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false})
    if(data) setStories(data)
  }

  useEffect(()=>{
    if(!activeStory) return
    setStoryProgress(0)
    const i=setInterval(()=>{ setStoryProgress(p=> p>=100? (setActiveStory(null),0) : p+2)},80)
    return ()=>clearInterval(i)
  },[activeStory])

  const handleFileChange = (e:any) => {
    const f=e.target.files[0]
    if(!f) return
    if(f.size > 200*1024*1024){ showToast("200MB limit!"); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  // 200MB R2 DIRECT
  const uploadToR2 = async () => {
    if(!file){ showToast("Select file"); return }
    setUploading(true)
    setProgress(0)
    try{
      const isVideo=file.type.includes("video")
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,fileType:file.type,contentType:file.type,folder:isVideo?"reels":"posts"})})
      const d=await res.json()
      if(!d.uploadUrl) throw new Error("R2 fail")
      await new Promise<void>((ok,bad)=>{
        const xhr=new XMLHttpRequest()
        xhr.upload.onprogress=e=>{ if(e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100))}
        xhr.onload=()=> xhr.status===200? ok() : bad(new Error("Upload fail"))
        xhr.onerror=()=> bad(new Error("Network"))
        xhr.open("PUT",d.uploadUrl)
        xhr.setRequestHeader("Content-Type",file.type)
        xhr.send(file)
      })
      await supabase.from("posts").insert([{image_url:d.publicUrl,caption,username,user_photo:userPhoto,likes:0,shares:0,type:isVideo?"reels":"post"}])
      setCaption(""); setPreview(""); setFile(null); setShowCreate(false); setProgress(0); fetchPosts(); showToast("Uploaded 200MB! 🔥")
    }catch(e:any){ showToast(e.message)}
    setUploading(false)
  }

  const handleLike = (id:string) => {
    const l=liked[id]
    setLiked({...liked,[id]:!l})
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:l?Math.max(0,p.likes-1):p.likes+1}:p))
  }
  const handleDoubleTap = (id:string) => {
    const now=Date.now()
    if(now-lastTap.current<300){
      if(!liked[id]) handleLike(id)
      setShowHeart(id); setTimeout(()=>setShowHeart(null),900)
    }
    lastTap.current=now
  }

  // GROUP STORIES
  const grouped:any={}
  stories.forEach((s:any)=>{ const k=s.user_id||s.username||"unknown"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s) })

  return (
    <div className="w-full bg-black min-h-screen text-white">
      <div className="max-w-[470px] mx-auto bg-black min-h-screen pb-[90px] border-x border-zinc-900">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-20 border-b border-zinc-800">
          <h1 className="text-[28px] font-black">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <Link href="/messages" className="w-8 h-8 flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></Link>
            <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-5 py-2 rounded-full font-bold text-[14px]">+ Create</button>
          </div>
        </div>

        {/* STORIES */}
        <div className="flex gap-4 p-3 overflow-x-auto border-b border-zinc-800">
          <div className="flex flex-col items-center min-w-[64px]">
            <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-zinc-700 relative">
              <img src="https://i.pravatar.cc/100?u=m" className="w-full h-full rounded-full object-cover border-2 border-black" alt=""/>
              <div className="absolute bottom-0 right-0 bg-[#0095f6] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">+</div>
            </div>
            <span className="text-[11px] mt-1">Your Story</span>
          </div>
          {Object.keys(grouped).map((k:string)=>(
            <div key={k} onClick={()=>setActiveStory(grouped[k][0])} className="flex flex-col items-center min-w-[64px] cursor-pointer">
              <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <img src={grouped[k][0].image_url} className="w-full h-full rounded-full border-2 border-black object-cover" alt=""/>
              </div>
              <span className="text-[11px] mt-1 truncate w-[64px] text-center">{k}</span>
            </div>
          ))}
        </div>

        {/* POSTS WITH 20 FEATURES */}
        {posts.map((post:any)=>{
          const url=post.image_url||""
          const isVideo=url.includes(".mp4")||post.type==="reels"
          const isF=following[post.username]
          return(
            <div key={post.id} className="border-b border-zinc-800">
              {/* 1-4 HEADER */}
              <div className="flex justify-between items-center p-3 bg-black">
                <div className="flex gap-2.5 items-center">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                    <img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-black" alt=""/>
                  </div>
                  <div><p className="font-bold text-[15px]">{post.username}</p><p className="text-[12px] text-zinc-400">Suggested</p></div>
                </div>
                <div className="flex gap-2 items-center">
                  {post.username!==username && <button onClick={()=>{const nf={...following,[post.username]:!isF}; setFollowing(nf); showToast(!isF?"Following ✓":"Unfollowed")}} className={`px-4 py-1 rounded-full text-[13px] font-bold ${isF?"bg-zinc-800 text-zinc-400":"bg-white text-black border"}`}>{isF?"Following":"Follow"}</button>}
                  {post.username===username && <button onClick={async()=>{if(confirm("Delete?")){await supabase.from("posts").delete().eq("id",post.id); fetchPosts()}}} className="bg-red-500/20 text-red-400 text-[12px] px-3 py-1 rounded-full border border-red-500/30">Delete</button>}
                </div>
              </div>

              {/* 5-8 IMAGE/VIDEO + DOUBLE TAP */}
              <div className="relative w-full aspect-[4/5] bg-zinc-900 overflow-hidden" onClick={()=>handleDoubleTap(post.id)}>
                {isVideo? <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover"/> : <img src={url} className="w-full h-full object-cover" alt=""/>}
                {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg width="80" height="80" viewBox="0 0 24 24" fill="#ff3040"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg></div>}
              </div>

              {/* 9-14 POST ACTION BAR - THIS WAS MISSING IN YOUR SCREENSHOT - NOW FIXED */}
              <div className="flex justify-between items-center px-3 py-3 bg-white text-black">
                <div className="flex items-center gap-4">
                  <button onClick={()=>handleLike(post.id)} className="flex items-center gap-1.5 active:scale-90"><svg width="26" height="26" viewBox="0 0 24 24" fill={liked[post.id]?"black":"none"} stroke="black" strokeWidth="1.8"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg><span className="text-[15px] font-medium">{post.likes||255}K</span></button>
                  <button onClick={()=>setShowComments(showComments===post.id?null:post.id)} className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span className="text-[15px]">535</span></button>
                  <button className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span className="text-[15px]">3,348</span></button>
                  <button onClick={async()=>{await navigator.clipboard.writeText(url); showToast("Link Copied!")}} className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span className="text-[15px]">9,012</span></button>
                </div>
                <button onClick={()=>{setSaved({...saved,[post.id]:!saved[post.id]}); showToast(saved[post.id]?"Unsaved":"Saved ✓")}}><svg width="26" height="26" viewBox="0 0 24 24" fill={saved[post.id]?"black":"none"} stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
              </div>
              {/* 15-17 CAPTION */}
              <div className="px-3 pb-3 bg-white text-black">
                <p className="text-[14px]"><b>{post.username}</b> {post.caption} <span className="text-zinc-500">...more</span></p>
                <p className="text-[12px] text-zinc-500 mt-1">1 day ago • See translation</p>
                {showComments===post.id && <p className="text-[13px] mt-2 text-zinc-700">Comments coming soon - UI ready!</p>}
              </div>
            </div>
          )
        })}

        {/* CREATE */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800">
              <div className="flex justify-between mb-3"><h3 className="font-bold">Create - 200MB R2</h3><button onClick={()=>setShowCreate(false)}>✕</button></div>
              {preview && <img src={preview} className="w-full h-56 object-cover rounded-xl mb-3" alt=""/>}
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-sm mb-3"/>
              {uploading && <div className="w-full bg-zinc-800 h-2 rounded-full mb-3"><div className="bg-white h-2 rounded-full" style={{width:`${progress}%`}}></div></div>}
              <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm mb-3" rows={3}/>
              <button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold">{uploading?`${progress}% Uploading`:"Upload"}</button>
            </div>
          </div>
        )}

        {activeStory && <div className="fixed inset-0 bg-black z-[200] flex flex-col"><div className="h-1 bg-zinc-800 w-full"><div className="h-full bg-white" style={{width:`${storyProgress}%`}}></div></div><div className="flex justify-between p-4"><span className="font-bold">{activeStory.username||activeStory.user_id}</span><button onClick={()=>setActiveStory(null)}>✕</button></div><div className="flex-1 flex items-center justify-center"><img src={activeStory.image_url} className="max-h-full object-contain" alt=""/></div></div>}
        {toastMsg && <div className="fixed bottom-[95px] left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2 rounded-full text-xs font-bold z-[300]">{toastMsg}</div>}

        {/* BOTTOM 5 LOCK - FIXED - NEVER MOVES */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] bg-black border-t border-zinc-800 flex justify-around items-center py-2.5 z-[100] pb-[max(10px,env(safe-area-inset-bottom))]">
          <button onClick={()=>{setActiveTab("home"); window.scrollTo({top:0,behavior:'smooth'})}} className={`w-12 h-12 flex items-center justify-center rounded-2xl ${activeTab==="home"?"bg-white text-black":"text-zinc-400"}`}><svg width="28" height="28" viewBox="0 0 24 24" fill={activeTab==="home"?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></button>
          <button onClick={()=>setActiveTab("search")} className="w-12 h-12 flex items-center justify-center rounded-2xl text-zinc-400"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
          <button onClick={()=>setShowCreate(true)} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>
          <button onClick={()=>setActiveTab("reels")} className="w-12 h-12 flex items-center justify-center rounded-2xl text-zinc-400"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
          <button onClick={()=>setActiveTab("profile")} className={`w-9 h-9 rounded-full overflow-hidden border-2 ${activeTab==="profile"?"border-white":"border-zinc-600"}`}><img src="https://i.pravatar.cc/100?u=m" className="w-full h-full object-cover" alt=""/></button>
        </div>
      </div>
    </div>
  )
       }
