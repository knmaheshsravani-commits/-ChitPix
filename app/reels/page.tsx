"use client"
import { useState, useEffect, useRef } from "react"
import BottomNav from "../components/BottomNav"

export default function ReelsPage() {
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
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    const p = localStorage.getItem("posts")
    let posts = p? JSON.parse(p) : []
    if(posts.length===0){
      posts=[
        {id:1, image:"https://i.imgur.com/8Km9tLL.png", username:"Knmahesh", caption:"My M logo design 🔥 Knmahesh", music:"Knmahesh • Original audio", likes:1, comments:0, reposts:0, shares:4, saves:0},
        {id:2, image:"https://picsum.photos/600/800?random=5", username:"zepto_rider_", caption:"Single boy life 😔❤️ 15 hrs duty", music:"Original audio", likes:5222, comments:48, reposts:40, shares:263, saves:131},
      ]
    }
    posts = posts.map((r:any)=>({likes:1, comments:0, reposts:0, shares:4, saves:0, music:"Original audio",...r}))
    setReels(posts)
    setLiked(JSON.parse(localStorage.getItem("reels_liked")||"{}"))
    setSaved(JSON.parse(localStorage.getItem("reels_saved")||"{}"))
    setFollowed(JSON.parse(localStorage.getItem("reels_followed")||"{}"))
    setReposted(JSON.parse(localStorage.getItem("reels_reposted")||"{}"))
    setCommentsList(JSON.parse(localStorage.getItem("reels_comments")||"{}"))
  },[])

  const saveLS = (k:string,v:any)=>localStorage.setItem(k, JSON.stringify(v))

  // NEW - Reels Upload Logic
  const handleReelUpload = async (e:any) => {
    const file = e.target.files?.[0]
    if(!file) return
    setUploading(true)
    try {
      // Upload to R2
      const formData = new FormData()
      formData.append("file", file)
      let uploadedUrl = ""
      try {
        const res = await fetch("/api/upload", { method:"POST", body:formData })
        const data = await res.json()
        uploadedUrl = data.url || data.secure_url || ""
      } catch {}

      if(!uploadedUrl) {
        uploadedUrl = URL.createObjectURL(file)
      }

      const newReel = {
        id: Date.now(),
        image: uploadedUrl,
        video: file.type.startsWith("video/")? uploadedUrl : null,
        isVideo: file.type.startsWith("video/"),
        username:"Knmahesh",
        caption: file.type.startsWith("video/")? "New Reel 🔥 #chitpix" : "New post 🔥",
        music:"Knmahesh • Original audio",
        likes:0, comments:0, reposts:0, shares:0, saves:0
      }

      const updated = [newReel,...reels]
      setReels(updated)

      // Save to posts too for feed sync
      const allPosts = JSON.parse(localStorage.getItem("posts")||"[]")
      localStorage.setItem("posts", JSON.stringify([newReel,...allPosts]))

    } catch(err) {
      alert("Upload failed bro - try again!")
    }
    setUploading(false)
    if(fileRef.current) fileRef.current.value = ""
  }

  const handleLike = (id:number, double=false)=>{
    const isLiked =!liked[id]
    const nl = {...liked, [id]:isLiked}
    setLiked(nl); saveLS("reels_liked", nl)
    setReels(prev=>prev.map(r=>r.id===id?{...r, likes: isLiked? r.likes+1 : Math.max(0,r.likes-1)}:r))
    if(double && isLiked){ setHeart(id); setTimeout(()=>setHeart(null), 900) }
  }
  const handleSave = (id:number)=>{
    const ns = {...saved, [id]:!saved[id]}
    setSaved(ns); saveLS("reels_saved", ns)
    setReels(prev=>prev.map(r=>r.id===id?{...r, saves: ns[id]? r.saves+1 : Math.max(0,r.saves-1)}:r))
  }
  const handleRepost = (id:number)=>{
    const nr = {...reposted, [id]:!reposted[id]}
    setReposted(nr); saveLS("reels_reposted", nr)
    setReels(prev=>prev.map(r=>r.id===id?{...r, reposts: nr[id]? r.reposts+1 : Math.max(0,r.reposts-1)}:r))
  }
  const handleFollow = (id:number)=>{
    const nf={...followed, [id]:!followed[id]}
    setFollowed(nf); saveLS("reels_followed", nf)
  }
  const handleAddComment = ()=>{
    if(!commentText.trim() ||!showComments) return
    const id = showComments.id
    const newComment = {text:commentText, user:"Knmahesh", time:"Just now"}
    const updated = {...commentsList, [id]:[...(commentsList[id]||[]), newComment]}
    setCommentsList(updated); saveLS("reels_comments", updated)
    setReels(prev=>prev.map(r=>r.id===id?{...r, comments:r.comments+1}:r))
    setCommentText("")
  }

  const doShare = (target:string)=>{
    if(!showShare) return
    const updated = reels.map((r:any)=> r.id===showShare.id? {...r, shares:r.shares+1} : r)
    setReels(updated)
    localStorage.setItem("chitpix_shared_post", JSON.stringify(showShare))
    localStorage.setItem("chitpix_share_target", target)
    setShowShare(null)
    window.location.href="/messages"
  }

  return (
    <div className="w-full h-[100dvh] bg-white relative overflow-hidden">
      {/* HEADER WITH + BUTTON - NEW */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 py-3 bg-white/80 backdrop-blur">
        <label className="text-[26px] cursor-pointer active:scale-90 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white">
          +
          <input ref={fileRef} type="file" accept="video/*,image/*" className="hidden" onChange={handleReelUpload} />
        </label>
        <span className="ml-2 font-bold text-[18px]">Reels</span><span className="ml-1 text-[12px]">▼</span>
        <span className="ml-5 text-black/40 font-medium">Friends</span>
        {uploading && <span className="ml-3 text-[12px] text-blue-500 animate-pulse font-bold">Uploading...</span>}
        <div className="ml-auto w-7 h-7 rounded-full bg-gray-100 border"></div>
      </div>

      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel:any)=>(
          <div key={reel.id} className="w-full h-[100dvh] snap-start relative bg-black flex justify-center">
            <div className="relative w-full max-w-[440px] h-full bg-black flex items-center justify-center overflow-hidden" onDoubleClick={()=>handleLike(reel.id,true)}>

              {reel.isVideo || reel.video? (
                <video src={reel.video || reel.image} className="w-full h-full object-contain" autoPlay loop muted playsInline />
              ) : (
                <img src={reel.image} alt="" className="w-full h-full object-contain bg-white" draggable={false} />
              )}

              {heart===reel.id && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><span className="text-[90px] animate-[bounce_0.9s]">❤️</span></div>)}

              <div className="absolute right-2 bottom-28 flex flex-col items-center gap-6 z-20">
                <button onClick={()=>handleLike(reel.id)} className="flex flex-col items-center active:scale-90 transition">
                  <div className="w-7 h-7"><svg viewBox="0 0 24 24" fill={liked[reel.id]? "#ff3040" : "none"} stroke={liked[reel.id]? "#ff3040" : "white"} strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
                  <span className="text-[12px] font-bold text-white mt-1">{reel.likes}</span>
                </button>
                <button onClick={()=>setShowComments(reel)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-[12px] font-bold text-white mt-1">{reel.comments}</span>
                </button>
                <button onClick={()=>handleRepost(reel.id)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={reposted[reel.id]? "white" : "none"} stroke="white" strokeWidth="1.7"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  <span className="text-[12px] font-bold text-white mt-1">{reel.reposts>0? reel.reposts : ""}</span>
                </button>
                <button onClick={()=>setShowShare(reel)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-[12px] font-bold text-white mt-1">{reel.shares}</span>
                </button>
                <button onClick={()=>handleSave(reel.id)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[reel.id]? "white" : "none"} stroke="white" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-[12px] font-bold text-white mt-1">{reel.saves>0? reel.saves : "0"}</span>
                </button>
                <div className="w-7 h-7 rounded-[6px] bg-gradient-to-br from-pink-500 to-orange-400 border border-white/20 shadow-sm mt-1"></div>
              </div>

              <div className="absolute left-3 bottom-[88px] right-16 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[13px] border">K</div>
                  <span className="font-bold text-[14px] text-white truncate">Knmahesh...</span>
                  <button onClick={()=>handleFollow(reel.id)} className={`px-4 py-1 rounded-full text-[12px] font-bold border transition ${followed[reel.id]? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'}`}>{followed[reel.id]? 'Following' : 'Follow'}</button>
                </div>
                <p className="text-[12px] text-white/80 mt-1">♫ {reel.music}</p>
                <p className="text-[13px] text-white mt-1 truncate">{reel.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showComments && (
  <div className="absolute inset-0 z-[70] bg-black/30 flex items-end" onClick={()=>setShowComments(null)}>
    <div className="bg-white w-full max-w-[440px] mx-auto rounded-t-[18px] h-[85%] flex flex-col relative" onClick={e=>e.stopPropagation()}>
      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3"></div>
      <p className="font-bold text-center mt-3 text-[15px]">Comments</p>

      <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-3 pb-[90px]">
        {(commentsList[showComments.id]||[]).length===0 && <p className="text-center text-gray-400 text-[13px] mt-10">No comments yet. Be first! ❤️</p>}
        {(commentsList[showComments.id]||[]).map((c:any,i:number)=>(
          <div key={i} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">M</div>
            <div><p className="text-[13px]"><b>{c.user}</b> {c.text}</p><p className="text-[11px] text-gray-500">{c.time}</p></div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t p-3 flex gap-2 items-center bg-white">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">M</div>
        <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] outline-none border focus:border-black" onKeyDown={e=>{if(e.key==='Enter') handleAddComment()}} autoFocus />
        <button onClick={handleAddComment} className="text-blue-500 font-bold text-[14px] px-2">Post</button>
      </div>

    </div>
  </div>
)}

      {showShare && (
        <div className="absolute inset-0 z-[60] bg-black/40 flex items-end justify-center" onClick={()=>setShowShare(null)}>
          <div className="bg-white w-full max-w-[440px] rounded-t-[20px] p-4 pb-8 animate-[slideUp_0.25s]" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-center text-[16px] mb-4">Share</p>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                {name:"ChitPix Team", letter:"C"},
                {name:"K N Mahesh", letter:"K"},
                {name:"Best Friend", letter:"B"},
                {name:"Mom", letter:"M"},
              ].map((u:any,i:number)=>(
                <div key={i} onClick={()=>doShare(u.name)} className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95">
                  <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-[18px]">{u.letter}</div>
                  <p className="text-[11px] text-center truncate w-14">{u.name.split(" ")[0]}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <button onClick={()=>{ navigator.clipboard.writeText("https://chitpix.com/reels/"+showShare.id); setShowShare(null); alert("Link copied! 🔗")}} className="w-full flex items-center gap-3 bg-gray-100 py-3.5 px-4 rounded-xl font-medium text-[14px]">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">🔗</div> Copy Link
              </button>
              <button onClick={()=>setShowShare(null)} className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-[14px]">Close</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <style jsx>{`.snap-y{scrollbar-width:none}.snap-y::-webkit-scrollbar{display:none} @keyframes slideUp{from{transform:translateY(100%)} to{transform:translateY(0)}}`}</style>
    </div>
  )
                                            }
