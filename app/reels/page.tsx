"use client"
import { useState, useEffect, useRef } from "react"
import BottomNav from "../components/BottomNav"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Repeat2, Send, Bookmark, Volume2, VolumeX, Music2, Plus, Loader2, X } from "lucide-react"

export default function ReelsPage() {
  const router = useRouter()
  const [reels, setReels] = useState<any[]>([])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [followed, setFollowed] = useState<any>({})
  const [reposted, setReposted] = useState<any>({})
  const [heart, setHeart] = useState<number|null>(null)
  const [showComments, setShowComments] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [commentsList, setCommentsList] = useState<any>({})
  const [showShare, setShowShare] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [mutedMap, setMutedMap] = useState<any>({})
  const [currentUser, setCurrentUser] = useState("Knmahesh")
  const [activeId, setActiveId] = useState<number|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRefs = useRef<any>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    fetch("/api/posts", { cache: "no-store" })
.then(r => r.json())
.then((posts:any[])=>{
        if(posts && posts.length>0){
           const vids = posts.filter(p=> p.type==="reels" || p.type==="reel" || (p.image_url && (p.image_url.includes("/reels/") || /\.(mp4|mov|webm)/i.test(p.image_url.split("?")[0]))))
           // 0 NUNDI COUNT FIX
           const fixed = (vids.length? vids : posts).map((p:any)=>({...p, likes:p.likes||0, comments: (commentsList[p.id]?.length||p.comments||0), shares:p.shares||0}))
           setReels(fixed)
           if(fixed.length>0) setActiveId(fixed[0].id)
        }
      }).catch(()=>{})
    setLiked(JSON.parse(localStorage.getItem("reels_liked")||"{}"))
    setSaved(JSON.parse(localStorage.getItem("reels_saved")||"{}"))
    setFollowed(JSON.parse(localStorage.getItem("reels_followed")||"{}"))
    setReposted(JSON.parse(localStorage.getItem("reels_reposted")||"{}"))
    setCommentsList(JSON.parse(localStorage.getItem("reels_comments")||"{}"))
    const n = localStorage.getItem("chitpix_username")
    if(n) setCurrentUser(n)
  },[])

  useEffect(()=>{
    if(!containerRef.current || reels.length===0) return
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const id = Number(entry.target.getAttribute("data-id"))
        const video = videoRefs.current[id] as HTMLVideoElement
        if(!video) return
        if(entry.isIntersecting){
          setActiveId(id)
          video.muted = mutedMap[id]?? true
          video.play().catch(()=>{})
        } else video.pause()
      })
    }, { threshold: 0.7 })
    containerRef.current.querySelectorAll("[data-id]").forEach(d=> observer.observe(d))
    return ()=> observer.disconnect()
  }, [reels])

  const saveLS = (k:string,v:any)=>localStorage.setItem(k, JSON.stringify(v))

  const handleReelUpload = async (e:any) => {
    const file = e.target.files?.[0]
    if(!file) return
    if(file.size > 100*1024*1024) return alert("Max 100MB Bro!")
    setUploading(true)
    try {
      const presignRes = await fetch("/api/r2-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: `${Date.now()}_${file.name}`, contentType: file.type, fileType: file.type, folder: "reels", fileSize: file.size })
      })
      const presignData = await presignRes.json()
      const uploadUrl = presignData.uploadUrl || presignData.url
      const publicUrl = presignData.publicUrl || presignData.public

      if(!uploadUrl ||!publicUrl) throw new Error(presignData.error || "Presign failed")
      const uploadRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
      if(!uploadRes.ok) throw new Error("R2 upload failed")

      await fetch("/api/posts", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ image_url: publicUrl, video: publicUrl, video_url: publicUrl, caption: "New Reel 🔥 #chitpix", username: currentUser, type: "reels", likes:0, comments:0, shares:0 })
      })
      const posts = await fetch("/api/posts", { cache: "no-store" }).then(r=>r.json())
      const vids = posts.filter((p:any)=> p.type==="reels" || p.image_url?.includes("/reels/") || /\.(mp4|mov|webm)/i.test(p.image_url?.split("?")[0]))
      setReels(vids.length? vids : posts)
      alert("Reel Uploaded to R2! 🔥")
    } catch(err:any){ alert("Upload Error - " + err.message) }
    finally { setUploading(false); if(fileRef.current) fileRef.current.value="" }
  }

  const handleLike = (id:number, double=false)=>{
    const isLiked =!liked[id]
    const nl = {...liked, [id]:isLiked}
    setLiked(nl); saveLS("reels_liked", nl)
    setReels(prev=> prev.map(r=>r.id===id?{...r, likes: isLiked? (r.likes||0)+1 : Math.max(0,(r.likes||0)-1)}:r))
    if(double &&!liked[id]){ setHeart(id); setTimeout(()=>setHeart(null), 900) }
  }
  const handleSave = (id:number)=>{ const ns={...saved,[id]:!saved[id]}; setSaved(ns); saveLS("reels_saved", ns) }
  const handleRepost = (id:number)=>{
    const nr={...reposted,[id]:!reposted[id]}; setReposted(nr); saveLS("reels_reposted", nr)
    setReels(prev=> prev.map(r=>r.id===id?{...r, shares: nr[id]? (r.shares||0)+1 : Math.max(0,(r.shares||0)-1)}:r))
  }
  const handleFollow = (id:number)=>{ const nf={...followed,[id]:!followed[id]}; setFollowed(nf); saveLS("reels_followed", nf) }

  const handleAddComment = ()=>{
    if(!commentText.trim() ||!showComments) return
    const id = showComments.id
    const newComment = {text:commentText, user:currentUser, time:"Just now"}
    const updated = {...commentsList, [id]:[...(commentsList[id]||[]), newComment]}
    setCommentsList(updated); saveLS("reels_comments", updated)
    setReels(prev=>prev.map(r=>r.id===id?{...r, comments:(commentsList[id]?.length||0)+1}:r))
    setCommentText("")
  }

  // SHARE DIRECT - NEW
  const shareDirect = async (type:string)=>{
    if(!showShare) return
    const url = showShare.video_url || showShare.video || showShare.image_url
    if(type==='whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(`Check this reel 🔥 ${url}`)}`)
    if(type==='copy'){ await navigator.clipboard.writeText(url); alert("Link Copied! 🔗") }
    if(type==='download'){ const a=document.createElement('a'); a.href=url; a.download=`chitpix_${showShare.id}.mp4`; a.click() }
    if(type==='instagram') window.open(`https://www.instagram.com/`)
    setReels(prev=>prev.map(r=>r.id===showShare.id?{...r, shares:(r.shares||0)+1}:r))
    setShowShare(null)
  }

  const toggleSound = (id:number)=>{
    const video = videoRefs.current[id] as HTMLVideoElement
    if(!video) return
    Object.values(videoRefs.current).forEach((v:any)=>{ if(v && v!==video) v.muted = true })
    video.muted =!video.muted
    setMutedMap((prev:any)=>({...prev, [id]:video.muted}))
    if(video.paused) video.play().catch(()=>{})
  }
  const handleProfileClick = (username:string)=>{
    if(username.toLowerCase() === currentUser.toLowerCase() || username.toLowerCase().includes("knmahesh")) router.push("/profile")
    else router.push(`/profile?user=${username}`)
  }

  return (
    <div className="w-full h-[100dvh] bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <label className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center cursor-pointer active:scale-90 shadow-xl">
          <Plus size={20} strokeWidth={2.5} />
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleReelUpload} />
        </label>
        <span className="ml-3 font-bold text-[18px] text-white">Reels</span>
        {uploading && <span className="ml-3 text-[11px] bg-blue-600 text-white px-2.5 py-1 rounded-full animate-pulse font-bold flex gap-1 items-center"><Loader2 size={12} className="animate-spin"/> Uploading to R2...</span>}
      </div>

      <div ref={containerRef} className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel:any)=>{
          const vidSrc = reel.video_url || reel.video || reel.image_url || ""
          const cleanSrc = vidSrc.split("?")[0]
          const isVideo = cleanSrc.includes("/reels/") || /\.(mp4|mov|webm|m4v)$/i.test(cleanSrc) || reel.type==="reels" || reel.type==="reel" || vidSrc.includes("video")
          return (
          <div key={reel.id} data-id={reel.id} className="w-full h-[100dvh] snap-start relative bg-black flex justify-center">
            <div className="relative w-full max-w-[440px] h-full flex items-center justify-center overflow-hidden bg-black" onDoubleClick={()=>handleLike(reel.id,true)}>
              {isVideo? (
                <video ref={(el:any)=>videoRefs.current[reel.id]=el} src={vidSrc} className="w-full h-full object-cover bg-black" loop autoPlay muted={mutedMap[reel.id]?? true} playsInline preload="auto" onClick={()=>toggleSound(reel.id)} />
              ) : <img src={vidSrc} alt="" className="w-full h-full object-contain bg-black" /> }

              {isVideo && (
                <button onClick={()=>toggleSound(reel.id)} className="absolute top-20 left-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 active:scale-95">
                  <span className="text-white">{(mutedMap[reel.id]?? true)? <VolumeX size={14}/> : <Volume2 size={14}/>}</span>
                  <span className="text-white text-[11px] font-semibold">{(mutedMap[reel.id]?? true)? "Tap for sound" : "Sound on"}</span>
                </button>
              )}
              {heart===reel.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><Heart size={88} className="text-white fill-white animate-ping drop-shadow-2xl" /></div>}

              {/* RIGHT 15 FUCHERS - NEW ICONS */}
              <div className="absolute right-2.5 bottom-28 flex flex-col items-center gap-5 z-20">
                <button onClick={()=>handleLike(reel.id)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Heart size={26} className={`${liked[reel.id]? "fill-[#ff3040] text-[#ff3040]" : "text-white"}`} /></div><span className="text-[12px] font-bold text-white mt-1">{reel.likes||0}</span></button>
                <button onClick={()=>setShowComments(reel)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><MessageCircle size={26} className="text-white" /></div><span className="text-[12px] font-bold text-white mt-1">{(commentsList[reel.id]?.length || reel.comments||0)}</span></button>
                <button onClick={()=>handleRepost(reel.id)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Repeat2 size={26} className={`${reposted[reel.id]? "text-green-400" : "text-white"}`} /></div><span className="text-[12px] font-bold text-white mt-1">{reel.shares||0}</span></button>
                <button onClick={()=>setShowShare(reel)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Send size={24} className="text-white" /></div><span className="text-[12px] font-bold text-white mt-1">Share</span></button>
                <button onClick={()=>handleSave(reel.id)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Bookmark size={24} className={`${saved[reel.id]? "fill-white text-white" : "text-white"}`} /></div></button>
              </div>

              <div className="absolute left-3 bottom-[88px] right-[70px] z-10">
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleProfileClick(reel.username)} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-[12px]">M</button>
                  <button onClick={()=>handleProfileClick(reel.username)} className="font-bold text-[14px] text-white">{reel.username}</button>
                  <button onClick={()=>handleFollow(reel.id)} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${followed[reel.id]? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/60'}`}>{followed[reel.id]? 'Following' : 'Follow'}</button>
                </div>
                <p className="text-[13px] text-white mt-2 line-clamp-2">{reel.caption}</p>
                <div className="flex items-center gap-1.5 mt-2 text-white/80"><Music2 size={12} /><p className="text-[11px]">{reel.music || "Original audio • Knmahesh"} • 0 views nundi</p></div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* 6 - COMMENT BOX WORKING - FIXED */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[440px] h-[60vh] rounded-t-[18px] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="p-3 flex justify-between items-center border-b">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"/>
              <h3 className="font-bold text-[15px] mt-2">Comments {commentsList[showComments.id]?.length||0}</h3>
              <button onClick={()=>setShowComments(null)}><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {(commentsList[showComments.id]||[]).length===0? <div className="text-center text-gray-400 mt-16 text-[14px]">Be first to comment! 💬<br/>0 nundi start bro!</div> : commentsList[showComments.id].map((c:any,i:number)=><div key={i} className="flex gap-2"><div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold">{c.user[0]}</div><div><span className="font-bold text-[13px]">{c.user}</span> <span className="text-[13px]">{c.text}</span><div className="text-[11px] text-gray-400">{c.time}</div></div></div>)}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] outline-none" onKeyDown={e=>e.key==='Enter'&&handleAddComment()}/>
              <button onClick={handleAddComment} className="bg-[#0095f6] text-white px-5 py-2 rounded-full text-[13px] font-bold disabled:opacity-50" disabled={!commentText.trim()}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* 7 - SHARE DIRECT - NEW FUTURE */}
      {showShare && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={()=>setShowShare(null)}>
          <div className="bg-white w-full max-w-[440px] rounded-t-[18px] p-4" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"/>
            <h3 className="font-bold text-center mb-4">Share Reel</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <button onClick={()=>shareDirect('whatsapp')} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[20px]">W</div><span className="text-[11px]">WhatsApp</span></button>
              <button onClick={()=>shareDirect('instagram')} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">IG</div><span className="text-[11px]">Instagram</span></button>
              <button onClick={()=>shareDirect('copy')} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">🔗</div><span className="text-[11px]">Copy</span></button>
              <button onClick={()=>shareDirect('download')} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">⬇️</div><span className="text-[11px]">Save R2</span></button>
            </div>
            <button onClick={()=>setShowShare(null)} className="w-full bg-gray-100 py-3 rounded-full font-bold text-[14px]">Cancel</button>
          </div>
        </div>
      )}

      <BottomNav />
      <style jsx>{`.snap-y::-webkit-scrollbar{display:none}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  )
               }
