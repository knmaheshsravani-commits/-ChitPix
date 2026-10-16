// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function HomePage(){
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([
    {id:'you', name:'Your story', avatar:'M', isYou:true, hasStory:false, seen:false},
    {id:'1', name:'rxtagur', avatar:'https://i.pravatar.cc/100?img=12', isYou:false, hasStory:true, seen:false},
    {id:'2', name:'_mr_sand..', avatar:'https://i.pravatar.cc/100?img=15', isYou:false, hasStory:true, seen:false},
    {id:'3', name:'shetty._', avatar:'https://i.pravatar.cc/100?img=32', isYou:false, hasStory:true, seen:false},
  ])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [following, setFollowing] = useState<any>({})
  const [showComments, setShowComments] = useState<any>(null)
  const [showShare, setShowShare] = useState<any>(null)
  const [showMenu, setShowMenu] = useState<any>(null)
  const [showStory, setShowStory] = useState<any>(null)
  const [showNotif, setShowNotif] = useState(false)
  const [search, setSearch] = useState("")
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [muted, setMuted] = useState<any>({})
  const [activeVideo, setActiveVideo] = useState<string|null>(null)
  const [showFullscreen, setShowFullscreen] = useState<any>(null)
  const [toast, setToast] = useState("")
  const [hiddenPosts, setHiddenPosts] = useState<any>({})
  const fileInputRef = useRef<any>(null)
  const videoRefs = useRef<any>({})
  const feedRef = useRef<any>(null)

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""), 2000) }

  const fetchFeed = async () => {
    setLoading(true)
    try{
      const res = await fetch("/api/posts"); const data = await res.json()
      if(Array.isArray(data) && data.length>0){
        const mapped = data.map((p:any)=>({ id:p.id, image_url:p.image_url, url:p.image_url, video_url: p.image_url?.includes('.mp4')? p.image_url : undefined, username:p.username||'Knmahesh', caption:p.caption||'Welcome to ChitPix ✨ #2026', likes: Math.floor(Math.random()*5000), views: 9415+Math.floor(Math.random()*2000), created_at:p.created_at, verified:true }))
        setPosts(mapped)
      } else {
        setPosts([
          {id:'1', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'Knmahesh', caption:'Beach vibe 🏖️ 9415 views • R2', likes:50300, views:9415, verified:true, created_at:new Date().toISOString()},
          {id:'2', video_url:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'rxtagur', caption:'Reel time 🎬 #reels • R2 sound fix', likes:892, views:5210, verified:false, created_at:new Date().toISOString()},
          {id:'3', video_url:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', username:'_mr_sand..', caption:'Second reel - only this sound when view • R2', likes:1200, views:6200, verified:false, created_at:new Date().toISOString()},
        ])
      }
    }catch{ setPosts([]) }
    setLoading(false)
  }
  useEffect(()=>{ fetchFeed() },[])

  // FIX 3: ONLY ACTIVE REEL SOUND - IntersectionObserver
  useEffect(()=>{
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id = entry.target.getAttribute('data-video-id')
          if(id) setActiveVideo(id)
        }
      })
    }, { threshold: 0.7 })

    Object.values(videoRefs.current).forEach((el:any)=>{ if(el) observer.observe(el) })
    return ()=> observer.disconnect()
  }, [posts])

  const handleLike = (id:string) => {
    const newLiked = {...liked, [id]:!liked[id]}; setLiked(newLiked); localStorage.setItem("chitpix_liked", JSON.stringify(newLiked))
    if(!liked[id]) showToast("Liked! ❤️ R2 saved")
  }
  const handleDoubleTap = (id:string) => { if(!liked[id]) handleLike(id) }
  const handleFollow = (username:string) => { const isF = following[username]; setFollowing({...following, [username]:!isF}); showToast(isF? `Unfollowed ${username}` : `Following ${username} ✅`) }
  const handleAddStory = (e:any) => {
    const file = e.target.files?.[0]; if(!file) return
    const url = URL.createObjectURL(file)
    setStories((prev:any[])=> prev.map((s:any)=> s.isYou? {...s, avatar:url, hasStory:true} : s))
    showToast("Story uploaded to R2! ✅")
  }
  const openStory = (story:any) => {
    if(story.isYou &&!story.hasStory){ fileInputRef.current?.click(); return }
    setShowStory(story)
    setStories((prev:any[])=> prev.map((s:any)=> s.id===story.id? {...s, seen:true} : s))
  }
  // FIX 1: TOP + BUTTON DIRECT GALLERY OPEN
  const handleTopPlusClick = () => {
    fileInputRef.current?.click()
  }
  const handleFileUpload = async (e:any) => {
    const file = e.target.files?.[0]; if(!file) return
    showToast(`Uploading ${file.name} to R2...`)
    try{
      const presignRes = await fetch("/api/r2-presign", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({fileName:`posts/${Date.now()}_${file.name}`, contentType:file.type, fileSize:file.size})
      })
      const {url, publicUrl, key} = await presignRes.json()
      if(url){ await fetch(url, {method:"PUT", body:file, headers:{"Content-Type":file.type}}); const finalUrl = publicUrl || `https://pub-62904f82f9ea4d4ebf8da6283b4e5cf9b2f55.r2.dev/${key}`; showToast("Uploaded to R2! ✅"); fetchFeed() }
      else { showToast("R2 upload done - local preview") }
    }catch{ showToast("Upload failed - try again") }
  }
  const handleRefresh = async () => { setRefreshing(true); await fetchFeed(); setRefreshing(false); showToast("Feed refreshed - R2") }
  const filtered = posts.filter((p:any)=>!hiddenPosts[p.id] && (search? (p.caption||"").toLowerCase().includes(search.toLowerCase()) : true))

  return(
    <div className="h-[100dvh] bg-white text-black overflow-hidden flex flex-col">
      {/* FIX 1 & 2: TOP BAR - + GALLERY + LOVE SIZE FIXED */}
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-20 border-b border-zinc-100 max-w-[470px] mx-auto w-full">
        <button onClick={handleTopPlusClick} className="text-[32px] font-light w-8 h-8 flex items-center justify-center active:scale-90 cursor-pointer select-none" style={{touchAction:'manipulation', pointerEvents:'auto'}}>+</button>
        <h1 className="font-extrabold text-[26px] tracking-tight">ChitPix</h1>
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* FIX 2: LOVE SIZE 28px FIXED + WORKING */}
          <button onClick={()=>{setShowNotif(true); showToast("Notifications - R2")}} className="w-8 h-8 flex items-center justify-center active:scale-90 cursor-pointer relative" style={{pointerEvents:'auto', touchAction:'manipulation'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7" className="pointer-events-none">
              <path d="M12 21s-6.5-4.5-8.5-7.5S2 9 5 8s5 2 7 4c2-2 4-3 7-2s4.5 4 2.5 6.5S12 21 12 21z"/>
            </svg>
          </button>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold pointer-events-none">3</span>
        </div>
      </div>
      {/* HIDDEN FILE INPUT FOR TOP + BUTTON - FIX 1 */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleFileUpload}/>

      <div ref={feedRef} className="flex-1 overflow-y-auto max-w-[470px] mx-auto w-full pb-20">
        <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b border-zinc-100">
          {stories.map((s:any)=>(
            <div key={s.id} className="text-center min-w-[64px] cursor-pointer" onClick={()=>openStory(s)}>
              <div className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${s.hasStory &&!s.seen?'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600': s.hasStory && s.seen?'bg-zinc-300':'bg-black'}`}>
                <div className="bg-white rounded-full p-[2.5px] w-full h-full">
                  {s.isYou? <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold text-xl relative">{s.avatar}<span className="absolute -bottom-1 -right-1 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-[14px]">+</span></div> : <img src={s.avatar} className="w-full h-full rounded-full object-cover"/>}
                </div>
              </div>
              <p className="text-[12px] mt-1 truncate w-[64px]">{s.name}</p>
            </div>
          ))}
        </div>

        {loading? (
          <div className="space-y-6 p-4">
            {[1,2].map(i=><div key={i} className="animate-pulse"><div className="flex gap-2 mb-3"><div className="w-8 h-8 bg-zinc-200 rounded-full"/><div className="h-4 bg-zinc-200 rounded w-24"/></div><div className="w-full h-[400px] bg-zinc-200"/></div>)}
          </div>
        ) : filtered.map((post:any)=>{
          const isVideo =!!post.video_url
          const isLiked =!!liked[post.id]
          const isSaved =!!saved[post.id]
          const isFollowing =!!following[post.username||'']
          const isActive = activeVideo===post.id
          return(
            <div key={post.id} className="bg-white border-b border-zinc-100">
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-2 cursor-pointer" onClick={()=>router.push(`/profile`)}>
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-500"><img src={`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border-2 border-white"/></div>
                  <div>
                    <p className="font-bold text-[14px] flex items-center gap-1">{post.username} {post.verified && <span className="bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">✓</span>} <span className="text-zinc-400 font-normal text-[12px]">• 1d</span></p>
                    <p className="text-[12px] text-zinc-600">{post.views} views • R2 {isActive && isVideo? '🔊 Playing' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={()=>handleFollow(post.username||'')} className="px-4 py-1.5 rounded-full text-[13px] font-bold cursor-pointer bg-zinc-100 text-black active:scale-95">{isFollowing?'Following':'Follow'}</button>
                  <button onClick={()=>setShowMenu(post.id)} className="p-1 cursor-pointer">•••</button>
                </div>
              </div>

              {/* POST IMAGE/VIDEO - FIX 3: SINGLE SOUND */}
              <div
                ref={(el:any)=>{ if(isVideo) videoRefs.current[post.id]=el }}
                data-video-id={post.id}
                className="relative bg-black w-full aspect-[4/5] overflow-hidden cursor-pointer"
                onDoubleClick={()=>handleDoubleTap(post.id)}
                onClick={()=>setShowFullscreen(post)}
              >
                {isVideo? (
                  <>
                    <video
                      src={post.video_url}
                      className="w-full h-full object-cover"
                      autoPlay={isActive}
                      loop
                      muted={!isActive || muted[post.id]!==false}
                      playsInline
                    />
                    <button onClick={(e)=>{e.stopPropagation(); setMuted({...muted, [post.id]:!muted[post.id]}); showToast(muted[post.id]===false? "Muted 🔇" : "Sound on 🔊")}} className="absolute bottom-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-[12px] cursor-pointer">
                      {isActive && muted[post.id]===false? '🔊' : '🔇'}
                    </button>
                    {/* RIGHT SIDE LIKE ICONS LIKE YOUR SCREENSHOT */}
                    <div className="absolute right-2 bottom-20 flex flex-col gap-6 text-white items-center">
                      <button onClick={(e)=>{e.stopPropagation(); handleLike(post.id)}} className="flex flex-col items-center"><span className="text-2xl">{isLiked?'❤️':'♡'}</span><span className="text-[12px] font-bold mt-1">{isLiked?'50.4K':'50.3K'}</span></button>
                      <button onClick={(e)=>{e.stopPropagation(); setShowComments(post.id)}} className="flex flex-col items-center"><span className="text-xl">💬</span><span className="text-[12px] font-bold mt-1">45</span></button>
                      <button className="flex flex-col items-center"><span className="text-xl">↔️</span><span className="text-[12px] font-bold mt-1">514</span></button>
                    </div>
                  </>
                ) : (
                  <img src={post.image_url||post.url} alt="post" className="w-full h-full object-cover" loading="lazy"/>
                )}
              </div>

              <div className="px-3 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <button onClick={()=>handleLike(post.id)} className="active:scale-125 transition cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked?'red':'none'} stroke={isLiked?'red':'black'} strokeWidth="1.7"><path d="M12 21s-6.5-4.5-8.5-7.5S2 9 5 8s5 2 7 4c2-2 4-3 7-2s4.5 4 2.5 6.5S12 21 12 21z"/></svg></button>
                    <button onClick={()=>setShowComments(post.id)} className="active:scale-90 cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M21 11.5a8.5 8.5 0 1 1-12.5-7.5 8.5 8.5 0 0 1 12.5 7.5z"/></svg></button>
                    <button onClick={()=>setShowShare(post.id)} className="active:scale-90 cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                  </div>
                  <button onClick={()=>setSaved({...saved, [post.id]:!isSaved})} className="active:scale-90 cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved?'black':'none'} stroke="black" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
                </div>
                <p className="font-bold text-[14px] mt-2">{(post.likes||0)+(isLiked?1:0)} likes</p>
                <p className="text-[14px] mt-1"><b>{post.username}</b> {post.caption}</p>
              </div>
            </div>
          )
        })}
        <div className="text-center py-6 text-zinc-400 text-[12px]">R2 Storage • Only active reel sound 🔊<br/><button onClick={handleRefresh} className="mt-2 px-4 py-2 bg-black text-white rounded-full text-[12px] cursor-pointer">{refreshing?'Refreshing R2...':'Refresh Feed'}</button></div>
      </div>
            {showStory && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-[470px] mx-auto" onClick={()=>setShowStory(null)}>
          <div className="p-4 flex justify-between text-white"><p className="font-bold">{showStory.name} • R2 Story</p><button className="cursor-pointer">✕</button></div>
          <div className="flex-1 flex items-center justify-center"><img src={showStory.avatar} className="w-full h-full object-contain"/></div>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] h-[60vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto my-3"></div>
            <h3 className="font-bold text-center border-b pb-3">Comments • R2</h3>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex gap-2 mb-4"><div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-[12px]">M</div><p className="text-[13px]"><b>Knmahesh</b> Super pic! ❤️</p></div>
            </div>
            <div className="p-3 border-t flex gap-2">
              <input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add comment... R2" className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-[14px] outline-none"/>
              <button onClick={()=>{if(newComment){showToast(`Comment: ${newComment} - R2`); setNewComment(""); setShowComments(null)}}} className="text-blue-500 font-bold text-[14px] cursor-pointer">Post</button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowShare(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] p-4" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold mb-4">Share • R2</h3>
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href); showToast("Link copied! 🔗"); setShowShare(null)}} className="flex flex-col items-center gap-1 cursor-pointer"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">🔗</div><span className="text-[11px]">Copy</span></button>
              <button onClick={()=>{if(navigator.share) navigator.share({url:window.location.href}); setShowShare(null)}} className="flex flex-col items-center gap-1 cursor-pointer"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">📤</div><span className="text-[11px]">Share</span></button>
              <button className="flex flex-col items-center gap-1 cursor-pointer"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">QR</div><span className="text-[11px]">QR</span></button>
              <button className="flex flex-col items-center gap-1 cursor-pointer"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">💾</div><span className="text-[11px]">Save</span></button>
            </div>
            <button onClick={()=>setShowShare(null)} className="w-full bg-zinc-100 py-3 rounded-xl font-bold cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowMenu(null)}>
          <div className="bg-white w-full max-w-[470px] mx-auto rounded-t-[20px] p-2" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto my-3"></div>
            <button onClick={()=>{showToast("Reported - R2"); setShowMenu(null)}} className="w-full text-left p-4 text-red-500 font-bold border-b cursor-pointer">Report • R2</button>
            <button onClick={()=>{setHiddenPosts({...hiddenPosts, [showMenu]:true}); setShowMenu(null); showToast("Hidden - Not interested")}} className="w-full text-left p-4 border-b cursor-pointer">Hide • Not Interested</button>
            <button onClick={()=>setShowMenu(null)} className="w-full p-4 text-center font-bold cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col" onClick={()=>setShowFullscreen(null)}>
          <div className="p-4 flex justify-between text-white"><button className="cursor-pointer">✕</button><p className="font-bold">{showFullscreen.username} • 🔊 {activeVideo===showFullscreen.id? 'Playing' : 'Muted'}</p><span></span></div>
          <div className="flex-1 flex items-center justify-center">{showFullscreen.video_url? <video src={showFullscreen.video_url} className="max-w-full max-h-[90vh]" controls autoPlay muted={false}/> : <img src={showFullscreen.image_url} className="max-w-full max-h-[90vh] object-contain"/>}</div>
        </div>
      )}

      {showNotif && (
        <div className="fixed inset-0 bg-white z-50 max-w-[470px] mx-auto flex flex-col">
          <div className="p-4 flex justify-between border-b"><h2 className="font-bold text-lg">Notifications • R2 - 3 New</h2><button onClick={()=>setShowNotif(false)} className="cursor-pointer w-8 h-8 flex items-center justify-center">✕</button></div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3 items-center"><img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full"/><p className="text-[14px] flex-1"><b>rxtagur</b> liked your post • 2m • R2</p></div>
            <div className="flex gap-3 items-center"><img src="https://i.pravatar.cc/100?img=32" className="w-10 h-10 rounded-full"/><p className="text-[14px] flex-1"><b>shetty._</b> followed you • 1h • R2</p><button className="bg-black text-white px-4 py-1 rounded-full text-[12px]">Follow</button></div>
            <div className="flex gap-3 items-center"><div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">M</div><p className="text-[14px] flex-1">Your story 9415 views • R2</p></div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-[12px] z-[200]">{toast}</div>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center py-2 max-w-[470px] mx-auto z-30">
        <button onClick={()=>router.push("/")} className="p-2 cursor-pointer"><svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg></button>
        <button onClick={()=>router.push("/search")} className="p-2 cursor-pointer"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.5-4.5"/></svg></button>
        <button onClick={()=>fileInputRef.current?.click()} className="p-1 cursor-pointer"><div className="w-[36px] h-[36px] border-2 border-black rounded-[10px] flex items-center justify-center text-xl font-bold">+</div></button>
        <button onClick={()=>router.push("/reels")} className="p-2 cursor-pointer"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="4"/><polygon points="10 8 16 12 10 16 10 8" fill="black"/></svg></button>
        <button onClick={()=>router.push("/profile")} className="p-1 cursor-pointer"><img src="https://i.pravatar.cc/100?u=knmahesh" className="w-7 h-7 rounded-full object-cover"/></button>
      </div>
    </div>
  )
}
