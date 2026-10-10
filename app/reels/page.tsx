"use client"
import { useState, useEffect, useRef } from "react"
import BottomNav from "../components/BottomNav"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Repeat2, Send, Bookmark, Volume2, VolumeX, Music2, Plus } from "lucide-react"

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
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRefs = useRef<any>({})

  useEffect(()=>{
    // ✅ FIX - API NUNCHI R2 VIDEOS TECHUKOVATAM - LOCALSTORAGE KAADU
    fetch("/api/posts", { cache: "no-store" })
     .then(r => r.json())
     .then((posts:any[])=>{
        if(posts && posts.length>0){
           const vids = posts.filter(p=> p.image_url?.includes("reels") || p.type==="reels" || p.image_url?.endsWith(".mp4"))
           setReels(vids.length? vids : posts)
        } else {
           setReels([
            {id:1, image_url:"https://i.imgur.com/8Km9tLL.png", image:"https://i.imgur.com/8Km9tLL.png", username:"Knmahesh", caption:"My M logo design 🔥 Knmahesh", music:"Knmahesh • Original audio", likes:1, comments:0, reposts:0, shares:4, saves:0},
           ])
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

  const saveLS = (k:string,v:any)=>localStorage.setItem(k, JSON.stringify(v))

  // ✅ 100% NEW UPLOAD - NO BASE64 - DIRECT R2 - 100MB FULL HD
  const handleReelUpload = async (e:any) => {
    const file = e.target.files?.[0]
    if(!file) return
    if(file.size > 100*1024*1024) return alert("Max 100MB Bro!")
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "reels")
      const res = await fetch("/api/upload", { method:"POST", body:fd })
      const data = await res.json()
      if(!data.url) throw new Error("R2 Upload Failed")

      await fetch("/api/posts", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          image_url: data.url,
          caption: "New Reel 🔥 #chitpix",
          username: currentUser,
          type: "reels"
        })
      })
      location.reload()
    } catch(err){ alert("Upload Error - /api/upload check chey") }
    finally { setUploading(false); if(fileRef.current) fileRef.current.value="" }
  }

  const handleLike = (id:number, double=false)=>{
    const isLiked =!liked[id]
    const nl = {...liked, [id]:isLiked}
    setLiked(nl); saveLS("reels_liked", nl)
    setReels(prev=> prev.map(r=>r.id===id?{...r, likes: isLiked? (r.likes||0)+1 : Math.max(0,(r.likes||1)-1)}:r))
    if(double && isLiked){ setHeart(id); setTimeout(()=>setHeart(null), 900) }
  }
  const handleSave = (id:number)=>{ const ns={...saved,[id]:!saved[id]}; setSaved(ns); saveLS("reels_saved", ns) }
  const handleRepost = (id:number)=>{ const nr={...reposted,[id]:!reposted[id]}; setReposted(nr); saveLS("reels_reposted", nr) }
  const handleFollow = (id:number)=>{ const nf={...followed,[id]:!followed[id]}; setFollowed(nf); saveLS("reels_followed", nf) }

  const handleAddComment = ()=>{
    if(!commentText.trim() ||!showComments) return
    const id = showComments.id
    const newComment = {text:commentText, user:currentUser, time:"Just now"}
    const updated = {...commentsList, [id]:[...(commentsList[id]||[]), newComment]}
    setCommentsList(updated); saveLS("reels_comments", updated)
    setCommentText("")
  }
  const doShare = (target:string)=>{
    if(!showShare) return
    localStorage.setItem("chitpix_shared_post", JSON.stringify(showShare))
    localStorage.setItem("chitpix_share_target", target)
    setShowShare(null)
    window.location.href="/messages"
  }
  const toggleSound = (id:number)=>{
    const isCurrentlyMuted = mutedMap[id]?? true
    const newMap:any = {}
    Object.keys(videoRefs.current).forEach(k=>{ newMap[k] = true })
    newMap[id] =!isCurrentlyMuted
    setMutedMap(newMap)
    Object.keys(videoRefs.current).forEach(k=>{
      const v = videoRefs.current[k]
      if(!v) return
      if(Number(k) === id){ v.muted =!isCurrentlyMuted; if(isCurrentlyMuted) v.play().catch(()=>{}) }
      else { v.muted = true; v.pause() }
    })
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
        {uploading && <span className="ml-3 text-[11px] bg-blue-600 text-white px-2.5 py-1 rounded-full animate-pulse font-bold">Uploading Full HD...</span>}
      </div>

      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel:any)=>{
          const vidSrc = reel.video || reel.image || reel.image_url
          const isVideo = reel.isVideo || vidSrc?.includes(".mp4") || vidSrc?.includes("reels")
          return (
          <div key={reel.id} className="w-full h-[100dvh] snap-start relative bg-black flex justify-center">
            <div className="relative w-full max-w-[440px] h-full flex items-center justify-center overflow-hidden" onDoubleClick={()=>handleLike(reel.id,true)}>
              {isVideo? <video ref={(el:any)=>videoRefs.current[reel.id]=el} src={vidSrc} className="w-full h-full object-cover" autoPlay loop muted={mutedMap[reel.id]?? true} playsInline onClick={()=>toggleSound(reel.id)} />
               : <img src={vidSrc} alt="" className="w-full h-full object-contain bg-black" /> }
              {isVideo && <button onClick={()=>toggleSound(reel.id)} className="absolute top-20 left-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2"><span className="text-white">{(mutedMap[reel.id]?? true)? <VolumeX size={14}/> : <Volume2 size={14}/>}</span><span className="text-white text-[11px] font-semibold">{(mutedMap[reel.id]?? true)? "Tap for sound" : "Sound on"}</span></button>}
              {heart===reel.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><Heart size={88} className="text-white fill-white animate-bounce" /></div>}
              <div className="absolute right-2.5 bottom-28 flex flex-col items-center gap-5 z-20">
                <button onClick={()=>handleLike(reel.id)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Heart size={26} className={`${liked[reel.id]? "fill-[#ff3040] text-[#ff3040]" : "text-white"}`} /></div><span className="text-[12px] font-bold text-white mt-1">{reel.likes||0}</span></button>
                <button onClick={()=>setShowComments(reel)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><MessageCircle size={26} className="text-white" /></div><span className="text-[12px] font-bold text-white mt-1">{reel.comments||0}</span></button>
                <button onClick={()=>handleRepost(reel.id)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Repeat2 size={26} className={`${reposted[reel.id]? "text-green-400" : "text-white"}`} /></div></button>
                <button onClick={()=>setShowShare(reel)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Send size={24} className="text-white" /></div><span className="text-[12px] font-bold text-white mt-1">{reel.shares||0}</span></button>
                <button onClick={()=>handleSave(reel.id)} className="flex flex-col items-center active:scale-85"><div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><Bookmark size={24} className={`${saved[reel.id]? "fill-white text-white" : "text-white"}`} /></div></button>
              </div>
              <div className="absolute left-3 bottom-[88px] right-[70px] z-10">
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleProfileClick(reel.username)} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-[12px]">M</button>
                  <button onClick={()=>handleProfileClick(reel.username)} className="font-bold text-[14px] text-white">{reel.username}</button>
                  <button onClick={()=>handleFollow(reel.id)} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${followed[reel.id]? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/60'}`}>{followed[reel.id]? 'Following' : 'Follow'}</button>
                </div>
                <p className="text-[13px] text-white mt-2 line-clamp-2">{reel.caption}</p>
                <div className="flex items-center gap-1.5 mt-2 text-white/80"><Music2 size={12} /><p className="text-[11px]">{reel.music || "Original audio"}</p></div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {showComments && (
        <div className="absolute inset-0 z-[100] bg-black/30 flex items-end" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[440px] mx-auto rounded-t-[18px] h-[85%] flex flex-col relative" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3"></div>
            <p className="font-bold text-center mt-3">Comments</p>
            <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-3 pb-[120px]">
              {(commentsList[showComments.id]||[]).map((c:any,i:number)=><div key={i} className="flex gap-2"><div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">M</div><div><p className="text-[13px]"><b>{c.user}</b> {c.text}</p><p className="text-[11px] text-gray-500">{c.time}</p></div></div>)}
            </div>
            <div className="absolute bottom-[75px] left-0 right-0 border-t p-3 flex gap-2 bg-white">
              <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] outline-none" onKeyDown={e=>{if(e.key==='Enter') handleAddComment()}} />
              <button onClick={handleAddComment} className="text-blue-500 font-bold text-[14px] px-2">Post</button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="absolute inset-0 z-[60] bg-black/40 flex items-end justify-center" onClick={()=>setShowShare(null)}>
          <div className="bg-white w-full max-w-[440px] rounded-t-[20px] p-4 pb-8" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-center mb-4">Share</p>
            <button onClick={()=>{ navigator.clipboard.writeText("https://chitpix.com/reels/"+showShare.id); setShowShare(null) }} className="w-full flex items-center gap-3 bg-gray-100 py-3.5 px-4 rounded-xl font-medium">🔗 Copy Link</button>
          </div>
        </div>
      )}

      <BottomNav />
      <style jsx>{`.snap-y::-webkit-scrollbar{display:none}`}</style>
    </div>
  )
      }
