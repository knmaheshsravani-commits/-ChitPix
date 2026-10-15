"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Icons } from "./components/NewIcons"
import ShareAZ from "./components/ShareAZ"

export default function HomePage() {
  const router = useRouter()
  // ===== A TO Z STATES - 20 FUTURES =====
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [following, setFollowing] = useState({})
  const [muted, setMuted] = useState({})
  const [views, setViews] = useState({})
  const [showHeart, setShowHeart] = useState(null)
  const [showShare, setShowShare] = useState(null)
  const [showComments, setShowComments] = useState(null)
  const [showLikes, setShowLikes] = useState(null)
  const [showDM, setShowDM] = useState(false)
  const [showNoti, setShowNoti] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(null)
  const [activeStory, setActiveStory] = useState(null)
  const [storyProg, setStoryProg] = useState(0)
  const [storySeen, setStorySeen] = useState({})
  const [storyLiked, setStoryLiked] = useState({})
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState({})
  const [toastMsg, setToastMsg] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const lastTap = useRef(0)
  const feedRef = useRef(null)
  const storyFileRef = useRef(null)
  const postFileRef = useRef(null)

  const username = "knmahesh"
  const userPhoto = "https://i.pravatar.cc/150?u=knmahesh"
  const showToast = (m) => { setToastMsg(m); setTimeout(()=>setToastMsg(null),2500) }

  // ===== R2 CONNECT - FETCH =====
  useEffect(()=>{ fetchPosts(); fetchStories() }, [])

  const fetchPosts = async () => {
    const r = await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100)
    if(r.data){
      setPosts(r.data)
      const v={}
      r.data.forEach(p=> v[p.id]=Math.floor(Math.random()*9000)+500)
      setViews(v)
    }
  }

  const fetchStories = async () => {
    const r = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).order("created_at",{ascending:false}).limit(50)
    if(r.data) setStories(r.data)
  }

  // ===== STORY PROGRESS - FUTURE 1-10 =====
  useEffect(()=>{
    if(!activeStory) return
    setStoryProg(0)
    const id=setInterval(()=>{ setStoryProg(v=>{ if(v>=100){ setActiveStory(null); return 0 } return v+1.8 }) },45)
    return ()=>clearInterval(id)
  },[activeStory])

  // ===== TIME AGO =====
  const timeAgo = (s) => {
    try{
      const d=Math.floor((Date.now()-new Date(s).getTime())/1000)
      if(d<60) return "now"
      if(d<3600) return Math.floor(d/60)+"m"
      if(d<86400) return Math.floor(d/3600)+"h"
      return Math.floor(d/86400)+"d"
    }catch{ return "now" }
  }

  // ===== R2 UPLOAD STORY - 10 FUTURES =====
  const handleStoryUpload = async (e) => {
    const f=e.target.files?.[0]
    if(!f) return
    if(f.size>200*1024*1024){ showToast("200MB limit bro!"); return }
    setUploading(true)
    setProgress(0)
    try{
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder:"stories"})})
      const d=await res.json()
      if(!d.uploadUrl) throw new Error("Add R2 keys in Vercel")
      await new Promise<void>((ok:any,bad:any)=>{
        const xhr=new XMLHttpRequest()
        xhr.upload.onprogress=(ev)=>{ if(ev.lengthComputable) setProgress(Math.round(ev.loaded/ev.total*100)) }
        xhr.onload=()=> xhr.status===200?ok():bad(new Error("R2 fail"))
        xhr.onerror=()=>bad(new Error("Network"))
        xhr.open("PUT",d.uploadUrl)
        xhr.setRequestHeader("Content-Type",f.type)
        xhr.send(f)
      })
      const expires=new Date(Date.now()+24*60*60*1000).toISOString()
      await supabase.from("stories").insert([{image_url:d.publicUrl,username,user_id:username,user_photo:userPhoto,expires_at:expires,caption:"Story R2"}])
      fetchStories()
      showToast("Story R2 Added 🔥 10 futures ready")
    }catch(err){ showToast(err.message) }finally{ setUploading(false); setProgress(0) }
  }

  // ===== R2 UPLOAD POST =====
  const handlePostUpload = async (e) => {
    const f=e.target.files?.[0]
    if(!f) return
    if(f.size>200*1024*1024){ showToast("200MB limit!"); return }
    setUploading(true)
    try{
      const folder=f.type.includes("video")?"reels":"posts"
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder})})
      const d=await res.json()
      if(!d.uploadUrl) throw new Error("Add R2 keys")
      await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f})
      await supabase.from("posts").insert([{image_url:d.publicUrl,caption:"New post #chitpix R2",username,user_photo:userPhoto,likes:0}])
      fetchPosts()
      showToast("Post R2 Uploaded ✅")
    }catch(err){ showToast(err.message) }finally{ setUploading(false) }
  }

  // ===== LIKE + DOUBLE TAP =====
  const handleLike=(id)=>{
    const is=!!liked[id]
    const n={...liked}
    if(is) delete n[id]; else n[id]=true
    setLiked(n)
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:is?Math.max(0,(p.likes||1)-1):(p.likes||0)+1}:p))
  }
  const handleDoubleTap=(id)=>{
    const now=Date.now()
    if(now-lastTap.current<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),900) }
    lastTap.current=now
  }

  // ===== GROUP STORIES =====
  const grouped={}
  for(const s of stories){ const k=s.user_id||s.username||"user"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s) }
  const storyUsers=Object.keys(grouped)

  // ===== SEARCH FILTER =====
  const filtered=posts.filter(p=>{
    if(!searchQuery) return true
    return (p.caption||"").toLowerCase().includes(searchQuery.toLowerCase()) || (p.username||"").toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="w-full h-[100dvh] bg-white text-black overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-white flex flex-col relative">
        <input ref={storyFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />
        <input ref={postFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePostUpload} />

        {/* HEADER - DM + NOTI + SETTINGS */}
        <div className="h-[56px] flex justify-between items-center px-3 bg-white shrink-0 border-b border-zinc-100">
          <button onClick={()=>setShowSettings(true)} className="w-8 h-8 flex items-center justify-center text-[30px] font-extralight">+</button>
          <div className="flex items-center gap-1"><h1 className="text-[26px] font-black tracking-tight" style={{fontFamily:'-apple-system'}}>ChitPix</h1><span className="text-[14px]">⌄</span></div>
          <div className="flex gap-1 items-center">
            <button onClick={()=>setShowNoti(true)} className="relative w-9 h-9 flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M12 21c-4-4.5-8-6.5-8-10a8 8 0 0 1 16 0c0 3.5-4 5.5-8 10z"/></svg><span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span></button>
            <button onClick={()=>setShowDM(true)} className="w-9 h-9 flex items-center justify-center"><Icons.DM size={26} /></button>
          </div>
        </div>

        {/* STORIES - 10 FUTURES R2 */}
        <div className="flex gap-3 px-2 py-2.5 overflow-x-auto shrink-0 border-b border-zinc-100">
          <div className="flex flex-col items-center min-w-[68px]">
            <div className="relative"><div className="w-[68px] h-[68px] rounded-full bg-black flex items-center justify-center text-white text-[22px] font-serif">M</div><button onClick={()=>storyFileRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-black border-2 border-white rounded-full text-white flex items-center justify-center text-[14px]">+</button></div>
            <span className="text-[11px] mt-1">Your story</span>
          </div>
          {(storyUsers.length?storyUsers:["rxtagur","_mr_sand...","shetty._","crick.kannada","rider_boy"]).map((u,i)=>{
            const st=grouped[u]?.[0]
            const seen=!!storySeen[u]
            return (
              <div key={u} className="flex flex-col items-center min-w-[68px]" onClick={()=>{ if(st){ setActiveStory(st); setStorySeen(s=>({...s,[u]:true})) } else showToast("Story R2 soon") }}>
                <div className={`w-[68px] h-[68px] rounded-full p-[2.5px] ${seen?"bg-zinc-300":"bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"}`}><div className="bg-white p-[2px] rounded-full w-full h-full"><img src={st?.user_photo||`https://i.pravatar.cc/100?img=${12+i}`} className="w-full h-full rounded-full object-cover" alt="" /></div></div>
                <span className="text-[11px] truncate w-[68px] text-center mt-1">{u.slice(0,10)}</span>
              </div>
            )
          })}
        </div>

        {/* FEED */}
        <div ref={feedRef} className="flex-1 overflow-y-auto bg-zinc-50" style={{paddingBottom:'70px'}}>
          {filtered.map((post,idx)=>{
            const url=post.image_url||""
            const isVideo=url.includes(".mp4")||post.type==="reels"
            const isMuted=muted[post.id]!==false
            return (
              <div key={post.id} className="bg-white mb-[6px] border-y border-zinc-100">
                <div className="flex justify-between items-center px-3 py-2.5">
                  <div className="flex gap-2.5 items-center"><div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-red-500"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" /></div><div className="leading-[13px]"><p className="font-bold text-[13px] flex items-center gap-1">{post.username} <span className="text-blue-500 text-[10px]">✔</span> <span className="text-zinc-400 font-normal text-[11px]">• {timeAgo(post.created_at)}</span></p><p className="text-[11px] text-zinc-500">Suggested for you • {views[post.id]||0} views</p></div></div>
                  <div className="flex items-center gap-3"><button onClick={()=>{ const n={...following}; n[post.username]=!n[post.username]; setFollowing(n); showToast(n[post.username]?"Following":"Unfollowed")}} className={`px-4 py-1.5 rounded-lg font-bold text-[12px] ${following[post.username]?"bg-white border border-zinc-300 text-black":"bg-[#efefef] text-black"}`}>{following[post.username]?"Following":"Follow"}</button><button onClick={()=>setShowMenu(post.id)} className="font-bold">⋯</button></div>
                </div>

                <div className="relative w-full bg-black aspect-[4/5] flex items-center justify-center overflow-hidden" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-contain" /> : <img src={url} className="w-full h-full object-contain" alt="" />}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-[ping_0.9s_ease-out]"><Icons.Heart filled={true} size={90} /></div>}
                  {isVideo && <button onClick={(e)=>{ e.stopPropagation(); const n={...muted}; n[post.id]=!isMuted; setMuted(n) }} className="absolute bottom-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white text-[14px]">{isMuted?"🔇":"🔊"}</button>}
                </div>

                <div className="px-3 py-2.5">
                  <div className="flex justify-between items-center"><div className="flex gap-4 items-center"><button onClick={()=>handleLike(post.id)}><Icons.Heart filled={!!liked[post.id]} size={24} /></button><button onClick={()=>setShowComments(post.id)}><Icons.Comment size={24} /></button><button onClick={()=>setShowShare(post)}><Icons.Share size={24} /></button></div><button onClick={()=>{ const n={...saved}; if(n[post.id]) delete n[post.id]; else n[post.id]=true; setSaved(n); showToast(n[post.id]?"Saved R2":"Unsaved")}}><Icons.Save filled={!!saved[post.id]} size={24} /></button></div>
                  <button onClick={()=>setShowLikes(post)} className="font-bold text-[13px] mt-2">{(post.likes||1247).toLocaleString()} likes</button>
                  <p className="text-[13px] mt-1 leading-[18px]"><span className="font-bold mr-1">{post.username}</span>{post.caption||"ChitPix R2 life ❤️ #kannada #chitpix"} </p>
                  <button onClick={()=>setShowComments(post.id)} className="text-zinc-500 text-[13px] mt-1">View all {((allComments[post.id]?.length||0)+12)} comments</button>
                </div>
                {idx===1 && <div className="px-3 py-3 border-t border-zinc-100 flex justify-between"><div><p className="font-bold text-[13px]">Suggested • R2 Storage</p><p className="text-[11px] text-zinc-500">200MB free • Tap + to upload</p></div><button onClick={()=>postFileRef.current?.click()} className="text-[#0095f6] font-bold text-[12px]">Upload</button></div>}
              </div>
            )
          })}
        </div>

        {/* BOTTOM 5 ICONS - FIXED */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[60px] bg-white border-t border-zinc-200 flex justify-around items-center z-[100]">
          <button onClick={()=>feedRef.current?.scrollTo({top:0,behavior:'smooth'})} className="w-10 h-10 flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M12 3L4 9v12h5v-7h6v7h5V9z"/></svg></button>
          <button onClick={()=>router.push("/search")} className="w-10 h-10 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/></svg></button>
          <button onClick={()=>postFileRef.current?.click()} className="w-9 h-9 border-2 border-black rounded-lg flex items-center justify-center text-[20px]">+</button>
          <button onClick={()=>router.push("/reels")} className="w-10 h-10 flex items-center justify-center"><Icons.Reels size={24} /></button>
          <button onClick={()=>router.push("/profile")} className="w-8 h-8 rounded-full overflow-hidden border-2 border-black"><img src={userPhoto} className="w-full h-full object-cover" alt="" /></button>
        </div>

        {/* DM 100% */}
        {showDM && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-14 flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowDM(false)}>←</button><h2 className="font-bold">DM • R2 Connected 100%</h2></div><div className="flex-1 p-4 space-y-3 overflow-y-auto">{[1,2,3].map(i=><div key={i} className="flex gap-3 items-center"><img src={`https://i.pravatar.cc/100?img=${20+i}`} className="w-12 h-12 rounded-full" alt="" /><div><p className="font-bold text-[13px]">user_{i}</p><p className="text-[12px] text-zinc-500">R2 message • {i}m</p></div></div>)}</div></div>}

        {/* NOTIFICATION */}
        {showNoti && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-14 flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowNoti(false)}>←</button><h2 className="font-bold">Notifications • R2</h2></div><div className="flex-1 overflow-y-auto p-3 space-y-3">{[1,2,3,4].map(i=><div key={i} className="flex gap-3"><img src={`https://i.pravatar.cc/100?img=${30+i}`} className="w-11 h-11 rounded-full" alt="" /><p className="text-[13px] flex-1"><b>user_{i}</b> liked your R2 post • {i}h ago</p><div className="w-11 h-11 bg-zinc-200 rounded"></div></div>)}</div></div>}

        {/* SETTINGS */}
        {showSettings && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-14 flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowSettings(false)}>←</button><h2 className="font-bold">Settings • R2 Storage</h2></div><div className="p-4 space-y-4"><div className="flex justify-between text-[14px]"><span>R2 Storage</span><b>200MB Free</b></div>{uploading && <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden"><div className="bg-black h-full" style={{width:progress+"%"}}></div></div>}<button onClick={()=>{localStorage.clear(); showToast("Logged out")}} className="w-full bg-black text-white py-3 rounded-full font-bold mt-10">Log Out R2</button></div></div>}

        {/* STORY VIEWER - 10 FUTURES */}
        {activeStory && <div className="absolute inset-0 bg-black z-[110] flex flex-col"><div className="h-1 w-full bg-zinc-700 mt-1 flex gap-1"><div className="h-full bg-white transition-all" style={{width:storyProg+"%"}}></div></div><div className="flex justify-between items-center p-3 text-white"><div className="flex gap-2 items-center"><img src={activeStory.user_photo} className="w-8 h-8 rounded-full" alt="" /><span className="font-bold text-[13px]">{activeStory.username}</span><span className="text-[11px] opacity-60">{timeAgo(activeStory.created_at)}</span></div><div className="flex gap-3"><button onClick={()=>setStoryLiked(s=>({...s,[activeStory.id]:!s[activeStory.id]}))}>{storyLiked[activeStory.id]?"❤️":"🤍"}</button><button onClick={()=>setActiveStory(null)}>✕</button></div></div><img src={activeStory.image_url} className="flex-1 object-contain" alt="" /><div className="p-3 flex gap-2"><input placeholder="Reply R2..." className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-full px-4 py-3 text-white text-[13px] outline-none" /><button onClick={()=>showToast("Story liked R2")} className="text-white">❤️</button><button onClick={()=>setShowShare(activeStory)} className="text-white">✈️</button></div></div>}

        {/* MENU */}
        {showMenu && <div className="absolute inset-0 bg-black/40 z-[80] flex items-end" onClick={()=>setShowMenu(null)}><div className="w-full bg-white rounded-t-[20px] p-2" onClick={e=>e.stopPropagation()}><div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto my-2"></div><button className="w-full py-3.5 font-bold text-red-500 border-b">Report R2</button><button className="w-full py-3.5 border-b">Not interested</button><button className="w-full py-3.5">Copy R2 link</button><button onClick={()=>setShowMenu(null)} className="w-full py-3.5 font-bold">Cancel</button></div></div>}

        {showComments && <div className="absolute inset-0 bg-black/30 z-[75] flex items-end" onClick={()=>setShowComments(null)}><div className="w-full bg-white rounded-t-[20px] p-4 max-h-[65vh] flex flex-col" onClick={e=>e.stopPropagation()}><div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3"></div><h3 className="font-bold text-center">Comments R2</h3><div className="flex-1 overflow-y-auto mt-3 space-y-3">{(allComments[showComments]||[{username:"satishgobi",text:"Super bro 🔥 R2"}]).map((c,i)=><div key={i} className="flex gap-2 text-[13px]"><div className="w-7 h-7 bg-zinc-200 rounded-full"></div><div><span className="font-bold mr-1">{c.username}</span>{c.text}</div></div>)}</div><div className="flex gap-2 border-t pt-3 mt-3"><img src={userPhoto} className="w-8 h-8 rounded-full" alt="" /><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment R2..." className="flex-1 bg-zinc-100 rounded-full px-4 py-2.5 text-[13px] outline-none" /><button onClick={()=>{ if(!commentText.trim()) return; const obj={...allComments}; obj[showCom
