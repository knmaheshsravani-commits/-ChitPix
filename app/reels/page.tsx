"use client"
import { useState, useEffect, useRef } from "react"
import BottomNav from "../components/BottomNav"
import { useRouter } from "next/navigation"
import {
  Heart, MessageCircle, Repeat2, Send,
  Bookmark, Volume2, VolumeX, Music2,
  Plus, X, Link2, MoreHorizontal
} from "lucide-react"

export default function ReelsPage() {
  const router = useRouter()
  const [reels, setReels] = useState<any[]>([])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [followed, setFollowed] = useState<any>({})
  const [reposted, setReposted] = useState<any>({})
  const [heart, setHeart] = useState<number | null>(null)
  const [showComments, setShowComments] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [commentsList, setCommentsList] = useState<any>({})
  const [showShare, setShowShare] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [mutedMap, setMutedMap] = useState<any>({})
  const [currentUser, setCurrentUser] = useState("Knmahesh")
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRefs = useRef<any>({})

  useEffect(() => {
    fetch("/api/posts?cache=no-store", { cache: "no-store" })
     .then(r => r.json())
     .then((posts: any[]) => {
        let vids = posts.filter(p =>
          p.image_url?.includes("/reels/") ||
          p.image_url?.match(/\.(mp4|mov|webm)$/) ||
          p.type === "reels"
        )
        if (vids.length === 0) vids = posts // fallback
        setReels(vids)
      })
     .catch(() => {})
    setLiked(JSON.parse(localStorage.getItem("reels_liked") || "{}"))
    setSaved(JSON.parse(localStorage.getItem("reels_saved") || "{}"))
    setFollowed(JSON.parse(localStorage.getItem("reels_followed") || "{}"))
    setReposted(JSON.parse(localStorage.getItem("reels_reposted") || "{}"))
    setCommentsList(JSON.parse(localStorage.getItem("reels_comments") || "{}"))
    const n = localStorage.getItem("chitpix_username")
    if (n) setCurrentUser(n)
  }, [])

  const saveLS = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v))

  // 100% R2 ONLY - NO BASE64 - Full HD
  const handleReelUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) return alert("Max 100MB bro!")
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "reels")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!data.url) throw new Error("R2 upload failed")

      const newReel = {
        image_url: data.url, // Full HD R2 URL
        caption: "New Reel 2026 🔥 #chitpix",
        username: currentUser,
        type: "reels",
        likes: 0, comments: 0, reposts: 0, shares: 0, saves: 0,
        music: "Original audio"
      }
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReel)
      })
      const updated = [{ id: Date.now(), image: data.url, video: data.url, isVideo: true,...newReel },...reels]
      setReels(updated)
    } catch (err) { alert("Upload failed - Check R2 env") }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = "" }
  }

  const handleLike = (id: number, dbl = false) => {
    const isLiked =!liked[id]
    const nl = {...liked, [id]: isLiked }
    setLiked(nl); saveLS("reels_liked", nl)
    setReels(prev => prev.map(r => r.id === id? {...r, likes: isLiked? (r.likes || 0) + 1 : Math.max(0, (r.likes || 1) - 1) } : r))
    if (dbl && isLiked) { setHeart(id); setTimeout(() => setHeart(null), 900) }
  }
  const handleSave = (id: number) => {
    const ns = {...saved, [id]:!saved[id] }; setSaved(ns); saveLS("reels_saved", ns)
  }
  const handleRepost = (id: number) => {
    const nr = {...reposted, [id]:!reposted[id] }; setReposted(nr); saveLS("reels_reposted", nr)
  }
  const handleFollow = (id: number) => {
    const nf = {...followed, [id]:!followed[id] }; setFollowed(nf); saveLS("reels_followed", nf)
  }
  const handleAddComment = () => {
    if (!commentText.trim() ||!showComments) return
    const id = showComments.id
    const newComment = { text: commentText, user: currentUser, time: "Just now" }
    const updated = {...commentsList, [id]: [...(commentsList[id] || []), newComment] }
    setCommentsList(updated); saveLS("reels_comments", updated)
    setCommentText("")
  }
  const doShare = (target: string) => {
    if (!showShare) return
    localStorage.setItem("chitpix_shared_post", JSON.stringify(showShare))
    localStorage.setItem("chitpix_share_target", target)
    setShowShare(null); router.push("/messages")
  }
  const toggleSound = (id: number) => {
    const isMuted = mutedMap[id]?? true
    const newMap: any = {}; Object.keys(videoRefs.current).forEach(k => newMap[k] = true)
    newMap[id] =!isMuted; setMutedMap(newMap)
    Object.entries(videoRefs.current).forEach(([k, v]: any) => {
      if (!v) return
      if (Number(k) === id) { v.muted =!isMuted; if (isMuted) v.play().catch(() => { }) }
      else { v.muted = true; v.pause() }
    })
  }
  const handleProfileClick = (username: string) => {
    if (username.toLowerCase() === currentUser.toLowerCase() || username.toLowerCase().includes("knmahesh")) router.push("/profile")
    else router.push(`/profile?user=${username}`)
  }

  return (
    <div className="w-full h-[100dvh] bg-black relative overflow-hidden">
      {/* TOP 2026 HEADER */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <label className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center cursor-pointer active:scale-90 transition shadow-xl">
          <Plus size={20} strokeWidth={2.5} />
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleReelUpload} />
        </label>
        <span className="ml-3 font-bold text-[17px] text-white tracking-tight">Reels</span>
        {uploading && <span className="ml-3 text-[11px] text-white bg-blue-600 px-2 py-1 rounded-full animate-pulse">Uploading Full HD...</span>}
      </div>

      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel: any) => {
          const vidSrc = reel.video || reel.image || reel.image_url
          const isVideo = reel.isVideo || vidSrc?.includes(".mp4") || vidSrc?.includes("/reels/")
          return (
            <div key={reel.id} className="w-full h-[100dvh] snap-start relative bg-black flex justify-center">
              <div className="relative w-full max-w-[440px] h-full bg-black flex items-center justify-center overflow-hidden" onDoubleClick={() => handleLike(reel.id, true)}>

                {isVideo? (
                  <video
                    ref={(el: any) => videoRefs.current[reel.id] = el}
                    src={vidSrc}
                    className="w-full h-full object-cover"
                    autoPlay loop muted={mutedMap[reel.id]?? true} playsInline
                    onClick={() => toggleSound(reel.id)}
                  />
                ) : (
                  <img src={vidSrc} alt="" className="w-full h-full object-cover" draggable={false} />
                )}

                {/* SOUND 2026 ICON */}
                {isVideo && (
                  <button onClick={() => toggleSound(reel.id)} className="absolute top-20 left-4 z-20 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                    {(mutedMap[reel.id]?? true)? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
                    <span className="text-white text-[11px] font-semibold">{(mutedMap[reel.id]?? true)? "Tap for sound" : "Sound on"}</span>
                  </button>
                )}

                {/* HEART 2026 ANIMATION */}
                {heart === reel.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Heart size={88} className="text-white fill-white animate-[ping_0.9s_ease]" />
                  </div>
                )}

                {/* RIGHT ACTIONS - 2026 NEW ICONS */}
                <div className="absolute right-2.5 bottom-28 flex flex-col items-center gap-5 z-20">
                  <button onClick={() => handleLike(reel.id)} className="flex flex-col items-center active:scale-85 transition">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Heart size={26} strokeWidth={1.8} className={`${liked[reel.id]? "fill-[#ff3040] text-[#ff3040]" : "text-white"}`} />
                    </div>
                    <span className="text-[12px] font-semibold text-white mt-1.5">{reel.likes || 0}</span>
                  </button>

                  <button onClick={() => setShowComments(reel)} className="flex flex-col items-center active:scale-85 transition">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <MessageCircle size={26} strokeWidth={1.8} className="text-white" />
                    </div>
                    <span className="text-[12px] font-semibold text-white mt-1.5">{reel.comments || 0}</span>
                  </button>

                  <button onClick={() => handleRepost(reel.id)} className="flex flex-col items-center active:scale-85 transition">
                    <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border border-white/10 ${reposted[reel.id]? "bg-white" : "bg-white/10"}`}>
                      <Repeat2 size={26} strokeWidth={1.8} className={reposted[reel.id]? "text-black" : "text-white"} />
                    </div>
                    <span className="text-[12px] font-semibold text-white mt-1.5">{reel.reposts || ""}</span>
                  </button>

                  <button onClick={() => setShowShare(reel)} className="flex flex-col items-center active:scale-85 transition">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Send size={24} strokeWidth={1.8} className="text-white" />
                    </div>
                    <span className="text-[12px] font-semibold text-white mt-1.5">{reel.shares || 0}</span>
                  </button>

                  <button onClick={() => handleSave(reel.id)} className="flex flex-col items-center active:scale-85 transition">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Bookmark size={24} strokeWidth={1.8} className={`${saved[reel.id]? "fill-white text-white" : "text-white"}`} />
                    </div>
                  </button>

                  <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-violet-500 to-fuchsia-500 border border-white/20 mt-1 shadow-lg"></div>
                </div>

                {/* BOTTOM INFO - 2026 */}
                <div className="absolute left-3 bottom-[88px] right-[70px] z-10">
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => handleProfileClick(reel.username)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[12px] text-black active:scale-90">M</button>
                    <button onClick={() => handleProfileClick(reel.username)} className="font-bold text-[14px] text-white truncate">{reel.username}</button>
                    <button onClick={() => handleFollow(reel.id)} className={`px-3.5 py-1 rounded-full text-[12px] font-bold border transition ${followed[reel.id]? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/60'}`}>{followed[reel.id]? 'Following' : 'Follow'}</button>
                  </div>
                  <p className="text-[13px] text-white mt-2 line-clamp-2 leading-4">{reel.caption || reel.image_url}</p>
                  <div className="flex items-center gap-2 mt-2 text-white/90">
                    <Music2 size={13} />
                    <p className="text-[11px]">{reel.music || "Original audio"} • {reel.username}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* COMMENTS - 2026 BOTTOM SHEET */}
      {showComments && (
        <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end" onClick={() => setShowComments(null)}>
          <div className="bg-[#121212] w-full max-w-[440px] mx-auto rounded-t-[24px] h-[75%] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3"></div>
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <p className="font-bold text-white">Comments</p>
              <button onClick={() => setShowComments(null)} className="bg-white/10 p-2 rounded-full"><X size={16} className="text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-4 pb-[120px]">
              {(commentsList[showComments.id] || []).length === 0 && <p className="text-center text-white/40 text-[13px] mt-10">No comments yet. Be first!</p>}
              {(commentsList[showComments.id] || []).map((c: any, i: number) => (
                <div key={i} className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-[11px] font-bold">M</div><div><p className="text-[13px] text-white"><b>{c.user}</b> {c.text}</p><p className="text-[11px] text-white/40">{c.time}</p></div></div>
              ))}
            </div>
            <div className="absolute bottom-[75px] left-0 right-0 border-t border-white/10 p-3 flex gap-2 items-center bg-[#121212]">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-[13px] text-white outline-none" onKeyDown={e => { if (e.key === 'Enter') handleAddComment() }} autoFocus />
              <button onClick={handleAddComment} className="text-blue-400 font-bold text-[14px] px-2">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE - 2026 */}
      {showShare && (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowShare(null)}>
          <div className="bg-[#121212] w-full max-w-[440px] rounded-t-[24px] p-5 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5"></div>
            <p className="font-bold text-center text-white mb-5">Share</p>
            <button onClick={() => { navigator.clipboard.writeText("https://chitpix.com/reels/" + showShare.id); setShowShare(null) }} className="w-full flex items-center gap-3 bg-white/10 py-3.5 px-4 rounded-2xl font-medium text-[14px] text-white mb-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center"><Link2 size={18} className="text-black" /></div> Copy Link
            </button>
            <button onClick={() => setShowShare(null)} className="w-full bg-white text-black py-3.5 rounded-2xl font-bold text-[14px]">Close</button>
          </div>
        </div>
      )}

      <BottomNav />
      <style jsx>{`.snap-y{scrollbar-width:none}.snap-y::-webkit-scrollbar{display:none}`}</style>
    </div>
  )
      }
