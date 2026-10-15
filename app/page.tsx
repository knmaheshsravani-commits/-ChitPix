"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Icons } from "./components/NewIcons"
import ShareAZ from "./components/ShareAZ"

export default function HomePage() {
  const router = useRouter()
  // CORE
  const [posts, setPosts] = useState([])
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState("")
  const [file, setFile] = useState(null)
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [showHeart, setShowHeart] = useState(null)
  const [username] = useState("knmahesh")
  const [userPhoto] = useState("https://i.pravatar.cc/150?u=knmahesh")
  const lastTap = useRef(0)
  const [stories, setStories] = useState([])
  const [following, setFollowing] = useState({})
  const [toastMsg, setToastMsg] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showComments, setShowComments] = useState(null)
  const [showShare, setShowShare] = useState(null)
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [views, setViews] = useState({})
  const feedRef = useRef(null)
  const topGalleryRef = useRef(null)

  const showToast = (m) => { setToastMsg(m); setTimeout(()=>setToastMsg(null), 2500) }

  useEffect(()=>{ fetchPosts(); fetchStories() }, [])

  // 1. FETCH POSTS R2
  const fetchPosts = async () => {
    const r = await supabase.from("posts").select("*").order("created_at", {ascending:false}).limit(100)
    if(r.data){
      setPosts(r.data)
      const v = {}
      r.data.forEach(p=>{ v[p.id] = Math.floor(Math.random()*9000)+500 }) // 14. VIEWS
      setViews(v)
    }
  }
  // 9. STORIES R2
  const fetchStories = async () => {
    const r = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).limit(30)
    if(r.data) setStories(r.data)
  }

  // 16. PREVIEW
  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if(!f) return
    if(f.size > 200*1024*1024){ showToast("200MB limit!"); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setShowCreate(true)
  }

  // 10. TIME AGO
  const timeAgo = (s) => {
    try{
      const diff = Math.floor((Date.now()-new Date(s).getTime())/1000)
      if(diff<60) return "now"
      if(diff<3600) return Math.floor(diff/60)+"m"
      if(diff<86400) return Math.floor(diff/3600)+"h"
      return Math.floor(diff/86400)+"d"
    }catch{ return "now" }
  }

  // 1. R2 UPLOAD + 17. PROGRESS BAR
  const uploadToR2 = async () => {
    if(!file) return
    setUploading(true)
    try{
      const folder = file.type.includes("video")?"reels":"posts"
      const res = await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,fileType:file.type,contentType:file.type,folder})})
      const d = await res.json()
      if(!d.uploadUrl) throw new Error("Add R2 keys in Vercel")
       await new Promise<void>((ok: any, bad: any)=>{
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e)=>{ if(e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)) }
        xhr.onload = ()=> xhr.status===200? ok() : bad(new Error("R2 fail"))
        xhr.onerror = ()=> bad(new Error("Network"))
        xhr.open("PUT", d.uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })
      await supabase.from("posts").insert([{image_url:d.publicUrl,caption:caption||"New R2 #chitpix",username,user_photo:userPhoto,likes:0}])
      setCaption(""); setPreview(""); setFile(null); setShowCreate(false)
      fetchPosts()
      showToast("R2 Uploaded 🔥") // 11. TOAST
    }catch(e){ showToast(e.message) }finally{ setUploading(false); setProgress(0) }
  }

  // 2. DOUBLE TAP + 3. LIKE COUNTER
  const handleLike = (id) => {
    const is =!!liked[id]
    const n = {...liked}
    if(is) delete n[id]; else n[id]=true
    setLiked(n)
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:is?Math.max(0,(p.likes||1)-1):(p.likes||0)+1}:p))
  }
  const handleDoubleTap = (id) => {
    const now = Date.now()
    if(now-lastTap.current<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),900) }
    lastTap.current = now
  }

  // 12. DOWNLOAD
  const handleDownload = (post) => { window.open(post.image_url,"_blank"); showToast("Opened R2") }

  // 6. COMMENT
  const handleAddComment = () => {
    if(!commentText.trim()||!showComments) return
    const obj = {...allComments}
    obj[showComments] = [...(obj[showComments]||[]),{id:Date.now(),username,text:commentText}]
    setAllComments(obj)
    setCommentText("")
    showToast("Comment added")
  }

  // 8. SEARCH FILTER
  const filteredPosts = posts.filter(p=>{
    if(!searchQuery) return true
    return (p.caption||"").toLowerCase().includes(searchQuery.toLowerCase()) || (p.username||"").toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="w-full h-[100dvh] bg-black text-white overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-black border-x border-zinc-900 flex flex-col relative">
        <input ref={topGalleryRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

        {/* HEADER */}
        <div className="h-[56px] flex justify-between items-center px-4 bg-black border-b border-zinc-800 shrink-0">
          <h1 className="text-[26px] font-black">ChitPix • R2</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>topGalleryRef.current?.click()} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><Icons.DM size={20} /></button>
            <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[12px]">+ R2 200MB</button>
          </div>
        </div>

        {/* 8. SEARCH */}
        <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search R2 posts..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-[13px] outline-none" />
        </div>

        {/* FEED - 19. SCROLL TOP */}
        <div ref={feedRef} className="flex-1 overflow-y-auto bg-black" style={{paddingBottom:'70px'}}>
          {/* 15. REFRESH */}
          <div className="px-3 py-2 flex justify-between sticky top-0 bg-black/90 backdrop-blur z-10">
            <span className="text-[11px] text-zinc-400">{filteredPosts.length} posts • R2</span>
            <button onClick={()=>{fetchPosts(); showToast("Refreshed")}} className="text-[11px] bg-zinc-900 px-3 py-1 rounded-full">Refresh</button>
          </div>

          {filteredPosts.map(post=>{
            const url = post.image_url||""
            const isVideo = url.includes(".mp4")
            return (
              <div key={post.id} className="border-b border-zinc-800 bg-black">
                <div className="flex justify-between items-center px-3 py-2.5">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600"><img src={post.user_photo||"https://i.pravatar.cc/100?u="+post.username} className="w-full h-full rounded-full border-2 border-black object-cover" alt="" /></div>
                    <p className="font-bold text-[13px]">{post.username} <span className="text-[11px] text-zinc-500 font-normal">{timeAgo(post.created_at)} • {views[post.id]||0} views</span></p>
                  </div>
                  {/* 7. FOLLOW */}
                  <button onClick={()=>{const n={...following}; n[post.username]=!n[post.username]; setFollowing(n); showToast(n[post.username]?"Following":"Unfollowed")}} className={`text-[12px] font-bold px-3.5 py-1 rounded-full ${following[post.username]?"bg-zinc-800 text-zinc-400":"bg-white text-black"}`}>{following[post.username]?"Following":"Follow"}</button>
                </div>

                {/* 2. DOUBLE TAP */}
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
                    <div className="flex gap-3">
                      <button onClick={()=>handleDownload(post)}><Icons.Save filled={false} size={20} /></button>
                      {/* 4. SAVE */}
                      <button onClick={()=>{const n={...saved}; if(n[post.id]) delete n[post.id]; else n[post.id]=true; setSaved(n); showToast(n[post.id]?"Saved R2":"Unsaved")}}><Icons.Save filled={!!saved[post.id]} size={22} /></button>
                    </div>
                  </div>
                  {/* 20. CAPTION HASHTAG */}
                  <div className="px-3 pb-3"><p className="text-[13px]"><b>{post.username}</b> {post.caption} #chitpix #R2</p></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 18. BOTTOM NAV 2026 */}
        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-black border-t border-zinc-800 flex justify-around items-center z-50">
          <button onClick={()=>feedRef.current?.scrollTo({top:0,behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center"><Icons.Home active={true} size={26} /></button>
          <button onClick={()=>router.push("/search")} className="w-11 h-11 flex items-center justify-center"><Icons.Search size={26} /></button>
          <button onClick={()=>setShowCreate(true)} className="w-11 h-11 flex items-center justify-center"><Icons.Create size={26} /></button>
          <button onClick={()=>router.push("/reels")} className="w-11 h-11 flex items-center justify-center"><Icons.Reels size={26} /></button>
          <button onClick={()=>router.push("/profile")} className="w-7 h-7 rounded-full overflow-hidden border border-zinc-600"><img src={userPhoto} className="w-full h-full object-cover" alt="" /></button>
        </div>

        {/* CREATE MODAL */}
        {showCreate && <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"><div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-3"><h3 className="font-bold text-sm">R2 Upload 200MB</h3><button onClick={()=>setShowCreate(false)}>✕</button></div>{preview && (file?.type.includes("video")? <video src={preview} className="w-full h-52 object-cover rounded-xl mb-3" controls /> : <img src={preview} className="w-full h-52 object-cover rounded-xl mb-3" alt="" />)}<input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-xs mb-2 bg-zinc-800 p-3 rounded-full border border-zinc-700" />{uploading && <div className="w-full bg-zinc-800 h-2.5 rounded-full mb-3 overflow-hidden"><div className="bg-white h-full" style={{width:progress+"%"}}></div></div>}<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption #chitpix..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm mb-3" rows={2} /><button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold text-sm">{uploading? progress+"% Uploading...":"Upload to R2 200MB"}</button></div></div>}

        {/* 6. COMMENTS + 5. SHARE */}
        {showComments && <div className="absolute inset-0 bg-black/80 z-[75] flex items-end" onClick={()=>setShowComments(null)}><div className="w-full bg-zinc-900 rounded-t-[20px] p-4 max-h-[60vh] flex flex-col" onClick={e=>e.stopPropagation()}><h3 className="font-bold mb-3">Comments R2</h3><div className="flex-1 overflow-y-auto space-y-2 mb-3">{(allComments[showComments]||[]).map((c,i)=><div key={i} className="flex gap-2 text-sm"><span className="font-bold">{c.username}</span><span>{c.text}</span></div>)}</div><div className="flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-zinc-800 rounded-full px-4 py-3 text-sm outline-none" /><button onClick={handleAddComment} className="bg-white text-black px-5 rounded-full font-bold">Post</button></div></div></div>}
        {showShare && <ShareAZ post={showShare} onClose={()=>setShowShare(null)} onToast={showToast} onDownload={handleDownload} />}
        {toastMsg && <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-[11px] font-bold z-[90]">{toastMsg}</div>}
      </div>
    </div>
  )
}
