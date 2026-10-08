"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
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

  useEffect(()=>{
    const p = localStorage.getItem("posts")
    let posts = p? JSON.parse(p) : []
    if(posts.length===0){
      posts=[
        {id:1, image:"https://i.imgur.com/8Km9tLL.png", username:"Knmahesh", caption:"My M logo design 🔥 Knmahesh", music:"Knmahesh • Original audio", likes:1, comments:2, reposts:0, shares:4, saves:0},
        {id:2, image:"https://picsum.photos/600/800?random=5", username:"zepto_rider_", caption:"Single boy life 😔❤️ 15 hrs duty", music:"Original audio", likes:5222, comments:48, reposts:40, shares:263, saves:131},
      ]
    }
    // ensure all fields
    posts = posts.map((r:any)=>({likes:1, comments:0, reposts:0, shares:4, saves:0, music:"Original audio",...r}))
    setReels(posts)
    setLiked(JSON.parse(localStorage.getItem("reels_liked")||"{}"))
    setSaved(JSON.parse(localStorage.getItem("reels_saved")||"{}"))
    setFollowed(JSON.parse(localStorage.getItem("reels_followed")||"{}"))
    setReposted(JSON.parse(localStorage.getItem("reels_reposted")||"{}"))
    setCommentsList(JSON.parse(localStorage.getItem("reels_comments")||"{}"))
  },[])

  const saveLS = (k:string,v:any)=>localStorage.setItem(k, JSON.stringify(v))

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

  return (
    <div className="w-full h-[100dvh] bg-white relative overflow-hidden">
      {/* TOP - Reels */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 py-3 bg-white/80 backdrop-blur">
        <span className="text-[22px]">+</span>
        <span className="ml-2 font-bold text-[18px]">Reels</span><span className="ml-1 text-[12px]">▼</span>
        <span className="ml-5 text-black/40 font-medium">Friends</span>
        <div className="ml-auto w-7 h-7 rounded-full bg-gray-100 border"></div>
      </div>

      {/* FEED */}
      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel:any)=>(
          <div key={reel.id} className="w-full h-[100dvh] snap-start relative bg-white flex justify-center">
            <div className="relative w-full max-w-[440px] h-full bg-white flex items-center justify-center overflow-hidden" onDoubleClick={()=>handleLike(reel.id,true)}>
              <img src={reel.image} alt="" className="w-full h-full object-contain" draggable={false} />

              {heart===reel.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-[90px] animate-bounce">❤️</span>
                </div>
              )}

              {/* RIGHT 5 ICONS - NEW DESIGN - 100% WORKING */}
              <div className="absolute right-2 bottom-28 flex flex-col items-center gap-6 z-20">

                {/* 1. LIKE */}
                <button onClick={()=>handleLike(reel.id)} className="flex flex-col items-center active:scale-90 transition">
                  <div className="w-7 h-7">
                    <svg viewBox="0 0 24 24" fill={liked[reel.id]? "#ff3040" : "none"} stroke={liked[reel.id]? "#ff3040" : "black"} strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span className="text-[12px] font-bold text-black mt-1">{reel.likes}</span>
                </button>

                {/* 2. COMMENT */}
                <button onClick={()=>setShowComments(reel)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-[12px] font-bold text-black mt-1">{reel.comments}</span>
                </button>

                {/* 3. REPOST - NEW ICON */}
                <button onClick={()=>handleRepost(reel.id)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={reposted[reel.id]? "black" : "none"} stroke="black" strokeWidth="1.7"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  <span className="text-[12px] font-bold text-black mt-1">{reel.reposts>0? reel.reposts : ""}</span>
                </button>

                {/* 4. SHARE DM - WORKING */}
                <button onClick={()=>{
                  localStorage.setItem("chitpix_shared_post", JSON.stringify(reel))
                  const updated=[...reels]
                  const idx=updated.findIndex((r:any)=>r.id===reel.id)
                  if(idx>-1){ updated[idx].shares+=1; setReels(updated) }
                  window.location.href="/messages"
                }} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-[12px] font-bold text-black mt-1">{reel.shares}</span>
                </button>

                {/* 5. SAVE */}
                <button onClick={()=>handleSave(reel.id)} className="flex flex-col items-center active:scale-90 transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[reel.id]? "black" : "none"} stroke="black" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-[12px] font-bold text-black mt-1">{reel.saves>0? reel.saves : "0"}</span>
                </button>

                <div className="w-7 h-7 rounded-[6px] bg-gradient-to-br from-pink-500 to-orange-400 border border-black/10 shadow-sm mt-1"></div>
              </div>

              {/* BOTTOM LEFT */}
              <div className="absolute left-3 bottom-[88px] right-16 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[13px] border">K</div>
                  <span className="font-bold text-[14px] text-black truncate">Knmahesh...</span>
                  <button onClick={()=>handleFollow(reel.id)} className={`px-4 py-1 rounded-full text-[12px] font-bold border transition ${followed[reel.id]? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}>
                    {followed[reel.id]? 'Following' : 'Follow'}
                  </button>
                </div>
                <p className="text-[12px] text-black/80 mt-1 flex items-center gap-1">♫ {reel.music}</p>
                <p className="text-[13px] text-black mt-1 truncate">{reel.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMMENTS SHEET - 100% WORKING */}
      {showComments && (
        <div className="absolute inset-0 z-50 bg-black/30 flex items-end" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[440px] mx-auto rounded-t-[18px] h-[65%] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3"></div>
            <p className="font-bold text-center mt-3 text-[15px]">Comments</p>
            <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-3">
              {(commentsList[showComments.id]||[]).length===0 && <p className="text-center text-gray-400 text-[13px] mt-10">No comments yet. Be first!</p>}
              {(commentsList[showComments.id]||[]).map((c:any,i:number)=>(
                <div key={i} className="flex gap-2"><div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">M</div><div><p className="text-[13px]"><b>{c.user}</b> {c.text}</p><p className="text-[11px] text-gray-500">{c.time}</p></div></div>
              ))}
            </div>
            <div className="border-t p-3 flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px]">M</div>
              <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[13px] outline-none" onKeyDown={e=>{if(e.key==='Enter') handleAddComment()}} />
              <button onClick={handleAddComment} className="text-blue-500 font-bold text-[14px]">Post</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <style jsx>{`.snap-y{scrollbar-width:none}.snap-y::-webkit-scrollbar{display:none}`}</style>
    </div>
  )
                                                                                                                                                                                                                       }
