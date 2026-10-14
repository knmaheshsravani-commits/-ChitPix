"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../lib/supabase"

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

  const showToast = (m:string)=>{setToastMsg(m); setTimeout(()=>setToastMsg(null),2500)}

  useEffect(()=>{
    const n=localStorage.getItem("chitpix_username"); if(n) setUsername(n)
    const p=localStorage.getItem("chitpix_profile_photo"); if(p) setUserPhoto(p)
    fetchPosts(); fetchStories()
  },[])

  const fetchPosts=async()=>{const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100); if(data) setPosts(data)}
  const fetchStories=async()=>{const {data}=await supabase.from("stories").select("*").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}); if(data) setStories(data)}

  useEffect(()=>{if(!activeStory) return; setStoryProgress(0); const i=setInterval(()=>{setStoryProgress(v=>v>=100?(setActiveStory(null),0):v+2)},70); return()=>clearInterval(i)},[activeStory])

  const handleFileChange=(e:any)=>{
    const f=e.target.files[0]; if(!f) return
    if(f.size>200*1024*1024){showToast("200MB limit bro!"); return}
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  // R2 200MB REELS + POSTS
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
      setCaption(""); setPreview(""); setFile(null); setShowCreate(false); fetchPosts(); showToast("200MB Uploaded! 🔥")
    }catch(e:any){showToast(e.message)}
    setUploading(false); setProgress(0)
  }

  const handleLike=(id:string)=>{
    const l=liked[id]
    setLiked({...liked,[id]:!l})
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:l?Math.max(0,p.likes-1):p.likes+1}:p))
  }
  const handleDoubleTap=(id:string)=>{
    const now=Date.now()
    if(now-lastTap.current<300){
      if(!liked[id]) handleLike(id)
      setShowHeart(id); setTimeout(()=>setShowHeart(null),900)
    }
    lastTap.current=now
  }

  const grouped:any={}
  stories.forEach((s:any)=>{const k=s.user_id||s.username||"unknown"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s)})

  return (
    <div className="w-full h-[100dvh] bg-black text-white overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-black border-x border-zinc-900 flex flex-col relative">

        {/* HEADER FIXED */}
        <div className="h-[56px] flex justify-between items-center px-4 bg-black border-b border-zinc-800 shrink-0">
          <h1 className="text-[26px] font-black">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <Link href="/messages"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></Link>
            <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[12px]">+ Create</button>
          </div>
        </div>

        {/* STORIES FIXED */}
        <div className="h-[78px] flex gap-3.5 px-3 items-center overflow-x-auto border-b border-zinc-800 shrink-0">
          <div className="flex flex-col items-center min-w-[56px]">
            <div className="w-[56px] h-[56px] rounded-full bg-zinc-800 p-[2px]"><img src={userPhoto||"https://i.pravatar.cc/100?u=m"} className="w-full h-full rounded-full object-cover border-2 border-black" alt=""/></div>
            <span className="text-[10px] mt-1">Your Story</span>
          </div>
          {Object.keys(grouped).map(k=>(
            <div key={k} onClick={()=>setActiveStory(grouped[k][0])} className="flex flex-col items-center min-w-[56px] cursor-pointer">
              <div className="w-[56px] h-[56px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"><img src={grouped[k][0].image_url} className="w-full h-full rounded-full border-2 border-black object-cover" alt=""/></div>
              <span className="text-[10px] mt-1 truncate w-[56px] text-center">{k}</span>
            </div>
          ))}
        </div>

        {/* SCROLLABLE FEED - FIXED SCROLL */}
        <div ref={feedRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-black" style={{paddingBottom:'65px'}}>
          {posts.map((post:any)=>{
            const url=post.image_url||"";
            const isVideo=post.type==="reels"||url.includes(".mp4")
            const isF=following[post.username]
            return(
              <div key={post.id} className="border-b border-zinc-800 bg-black w-full">
                <div className="flex justify-between items-center px-3 py-2.5 bg-black">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-black" alt=""/></div>
                    <div><p className="font-bold text-[13px]">{post.username}</p><p className="text-[11px] text-zinc-400">Suggested • 0 likes</p></div>
                  </div>
                  {post.username===username? (
                    <button onClick={async()=>{if(confirm("Delete?")){await supabase.from("posts").delete().eq("id",post.id); fetchPosts()}}} className="text-[11px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">Delete</button>
                  ) : (
                    <button onClick={()=>{setFollowing({...following,[post.username]:!isF}); showToast(!isF?"Following":"Unfollowed")}} className={`text-[12px] font-bold px-3.5 py-1 rounded-full ${isF?"bg-zinc-800 text-zinc-400":"bg-white text-black"}`}>{isF?"Following":"Follow"}</button>
                  )}
                </div>

                <div className="relative w-full aspect-[4/5] bg-zinc-900" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover"/> : <img src={url} className="w-full h-full object-cover" alt=""/>}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg width="80" height="80" viewBox="0 0 24 24" fill="#ff3040"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg></div>}
                </div>

                {/* ACTION BAR - 5 ICONS SAME SIZE 22px - THIS WAS MISSING */}
                <div className="bg-white text-black">
                  <div className="flex justify-between items-center px-3 py-2.5">
                    <div className="flex items-center gap-4">
                      <button onClick={()=>handleLike(post.id)} className="flex items-center gap-1"><svg width="22" height="22" viewBox="0 0 24 24" fill={liked[post.id]?"black":"none"} stroke="black" strokeWidth="1.6"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg><span className="text-[13px]">{post.likes||0}</span></button>
                      <button onClick={()=>setShowComments(showComments===post.id?null:post.id)} className="flex items-center gap-1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span className="text-[13px]">535</span></button>
                      <button className="flex items-center gap-1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span className="text-[13px]">3,348</span></button>
                      <button onClick={async()=>{await navigator.clipboard.writeText(url); showToast("Copied!")}} className="flex items-center gap-1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span className="text-[13px]">9,012</span></button>
                    </div>
                    <button onClick={()=>{setSaved({...saved,[post.id]:!saved[post.id]}); showToast(saved[post.id]?"Unsaved":"Saved")}}><svg width="22" height="22" viewBox="0 0 24 24" fill={saved[post.id]?"black":"none"} stroke="black" strokeWidth="1.6"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[13px]"><b>{post.username}</b> {post.caption||"Green thread"} <span className="text-zinc-500">...more</span></p>
                    <p className="text-[11px] text-zinc-500 mt-1">1 day ago • See translation</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM 5 - SAME SIZE 22px - WORKING - LOCKED */}
        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-black border-t border-zinc-800 flex justify-around items-center z-50">
          <button onClick={()=>feedRef.current?.scrollTo({top:0,behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></button>
          <button onClick={()=>{showToast("Search coming"); router.push("/search")}} className="w-11 h-11 flex items-center justify-center text-zinc-500"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
          <button onClick={()=>setShowCreate(true)} className="w-11 h-11 flex items-center justify-center text-zinc-500"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>
          <button onClick={()=>{showToast("Reels"); router.push("/reels")}} className="w-11 h-11 flex items-center justify-center text-zinc-500"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
          <button onClick={()=>router.push("/profile")} className="w-7 h-7 rounded-full overflow-hidden border border-zinc-600"><img src={userPhoto||"https://i.pravatar.cc/100?u=m"} className="w-full h-full object-cover" alt=""/></button>
        </div>

        {showCreate && <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"><div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-3"><h3 className="font-bold text-sm">Create 200MB • Reels</h3><button onClick={()=>setShowCreate(false)}>✕</button></div>{preview && (file?.type.includes("video")? <video src={preview} className="w-full h-48 object-cover rounded-xl mb-3" controls/> : <img src={preview} className="w-full h-48 object-cover rounded-xl mb-3" alt=""/>)}<input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-xs mb-2"/><p className="text-[10px] text-zinc-500 mb-2">{file?`${(file.size/1024/1024).toFixed(1)}MB - ${file.type.includes("video")?"REEL OK":"POST OK"}`:"Select Image/Video 200MB"} {progress>0&&`${progress}%`}</p>{uploading && <div className="w-full bg-zinc-800 h-2 rounded-full mb-3"><div className="bg-white h-full" style={{width:`${progress}%`}}></div></div>}<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-sm mb-3" rows={2}/><button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold text-sm">{uploading?`${progress}% Uploading R2...`:"Upload to R2 200MB"}</button></div></div>}
        {activeStory && <div className="absolute inset-0 bg-black z-[70] flex flex-col"><div className="h-1 bg-zinc-800 w-full"><div className="h-full bg-white" style={{width:`${storyProgress}%`}}></div></div><div className="flex justify-between p-4"><span className="font-bold text-sm">{activeStory.username||activeStory.user_id}</span><button onClick={()=>setActiveStory(null)}>✕</button></div><div className="flex-1 flex items-center justify-center"><img src={activeStory.image_url} className="max-h-full object-contain" alt=""/></div></div>}
        {toastMsg && <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-[11px] font-bold z-[80]">{toastMsg}</div>}
      </div>
    </div>
  )
                           }
