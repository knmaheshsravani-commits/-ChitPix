"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Icons } from "./components/NewIcons"
import ShareAZ from "./components/ShareAZ"

export default function HomePage() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [following, setFollowing] = useState({})
  const [showHeart, setShowHeart] = useState(null)
  const [showShare, setShowShare] = useState(null)
  const [showComments, setShowComments] = useState(null)
  const [showDM, setShowDM] = useState(false)
  const [showNoti, setShowNoti] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(null)
  const [activeStory, setActiveStory] = useState(null)
  const [storyProg, setStoryProg] = useState(0)
  const [storySeen, setStorySeen] = useState({})
  const [storyMuted, setStoryMuted] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState({})
  const [toastMsg, setToastMsg] = useState(null)
  const lastTap = useRef(0)
  const fileRef = useRef(null)
  const storyFileRef = useRef(null)
  const feedRef = useRef(null)

  const userPhoto = "https://i.pravatar.cc/150?u=knmahesh"
  const showToast = (m) => { setToastMsg(m); setTimeout(()=>setToastMsg(null),2000) }

  useEffect(()=>{ fetchPosts(); fetchStories() }, [])

  const fetchPosts = async () => {
    const r = await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(50)
    if(r.data) setPosts(r.data)
  }
  const fetchStories = async () => {
    const r = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).order("created_at",{ascending:false}).limit(40)
    if(r.data) setStories(r.data)
  }

  // STORY VIEWER PROGRESS
  useEffect(()=>{
    if(!activeStory) return
    setStoryProg(0)
    const id = setInterval(()=>{ setStoryProg(v=>{ if(v>=100){ setActiveStory(null); return 0 } return v+1.5 }) }, 40)
    return ()=>clearInterval(id)
  },[activeStory])

  const handleStoryUpload = async (e) => {
    const f = e.target.files?.[0]
    if(!f) return
    showToast("Uploading story to R2...")
    try{
      const res = await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder:"stories"})})
      const d = await res.json()
      await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f})
      const expires = new Date(Date.now()+24*60*60*1000).toISOString()
      await supabase.from("stories").insert([{image_url:d.publicUrl,username:"knmahesh",user_id:"knmahesh",user_photo:userPhoto,expires_at:expires,caption:"My story"}])
      fetchStories()
      showToast("Story added R2 🔥")
    }catch{ showToast("R2 keys add chey bro") }
  }

  const handleLike = (id) => {
    const is=!!liked[id]
    const n={...liked}
    if(is) delete n[id]; else n[id]=true
    setLiked(n)
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:is?Math.max(0,(p.likes||1)-1):(p.likes||0)+1}:p))
  }
  const handleDoubleTap = (id) => {
    const now=Date.now()
    if(now-lastTap.current<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),800) }
    lastTap.current=now
  }

  // Group stories by user
  const grouped = {}
  for(const s of stories){ const k=s.user_id||s.username||"user"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s) }
  const storyUsers = Object.keys(grouped)

  return (
    <div className="w-full h-[100dvh] bg-white text-black overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-white flex flex-col relative">
        <input ref={storyFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />

        {/* HEADER - EXACT AS YOUR PHOTO */}
        <div className="h-[56px] flex justify-between items-center px-3 bg-white shrink-0">
          {/* 3. SETTINGS + */}
          <button onClick={()=>setShowSettings(true)} className="w-8 h-8 flex items-center justify-center text-[28px] font-light">+</button>
          <div className="flex items-center gap-1"><h1 className="text-[26px] font-black tracking-tight" style={{fontFamily:'cursive'}}>ChitPix</h1><span className="text-[16px] mt-1">⌄</span></div>
          <div className="flex gap-3 items-center">
            {/* 2. NOTIFICATION */}
            <button onClick={()=>setShowNoti(true)} className="relative w-8 h-8 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M12 21c-4-4.5-8-6.5-8-10a8 8 0 0 1 16 0c0 3.5-4 5.5-8 10z"/></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            {/* 1. DM */}
            <button onClick={()=>setShowDM(true)} className="relative w-8 h-8 flex items-center justify-center"><Icons.DM size={26} /></button>
          </div>
        </div>

        {/* STORIES - 10 FUTURES */}
        <div className="flex gap-3.5 px-2 py-2 overflow-x-auto shrink-0 border-b border-zinc-100">
          {/* YOUR STORY */}
          <div className="flex flex-col items-center min-w-[68px]">
            <div className="relative">
              <div className="w-[68px] h-[68px] rounded-full bg-black flex items-center justify-center"><span className="text-white font-serif text-[22px]">M</span></div>
              <button onClick={()=>storyFileRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-black border-2 border-white rounded-full flex items-center justify-center text-white text-[14px] font-bold">+</button>
            </div>
            <span className="text-[11.5px] mt-1">Your story</span>
          </div>
          {storyUsers.length? storyUsers.map((u,i)=>{
            const userStories = grouped[u]
            const isSeen =!!storySeen[u]
            return (
              <div key={u} className="flex flex-col items-center min-w-[68px]" onClick={()=>{ setActiveStory(userStories[0]); setStorySeen(s=>({...s,[u]:true})) }}>
                <div className={`w-[68px] h-[68px] rounded-full p-[2.5px] ${isSeen?"bg-zinc-300":"bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"}`}>
                  <div className="bg-white p-[2.5px] rounded-full w-full h-full"><img src={userStories[0].user_photo||`https://i.pravatar.cc/100?img=${11+i}`} className="w-full h-full rounded-full object-cover" alt="" /></div>
                </div>
                <span className="text-[11.5px] mt-1 truncate w-[68px] text-center">{u.substring(0,10)}</span>
              </div>
            )
          }) : ["rxtagur","_mr_sand...","shetty._","crick.kannada"].map((name,i)=>(
            <div key={name} className="flex flex-col items-center min-w-[68px]">
              <div className="w-[68px] h-[68px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 to-purple-600"><div className="bg-white p-[2px] rounded-full w-full h-full"><img src={`https://i.pravatar.cc/100?img=${20+i}`} className="w-full h-full rounded-full object-cover" alt="" /></div></div>
              <span className="text-[11.5px] mt-1 truncate w-[68px] text-center">{name}</span>
            </div>
          ))}
        </div>

        {/* FEED */}
        <div ref={feedRef} className="flex-1 overflow-y-auto bg-white" style={{paddingBottom:'60px'}}>
          {posts.map(post=>{
            const url=post.image_url||""
            const isVideo=url.includes(".mp4")
            return (
              <div key={post.id} className="border-b border-zinc-100">
                {/* 4. PROFILE PIC + FOLLOW */}
                <div className="flex justify-between items-center px-3 py-2.5">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-red-500"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" /></div>
                    <div className="leading-[13px]"><p className="font-bold text-[13px]">{post.username||"crick.kannada"}</p><p className="text-[11px] text-zinc-500">Suggested for you</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>{const n={...following}; n[post.username]=!n[post.username]; setFollowing(n)}} className={`px-4 py-1.5 rounded-lg font-bold text-[13px] ${following[post.username]?"bg-zinc-100 text-black border":"bg-[#efefef] text-black"}`}>{following[post.username]?"Following":"Follow"}</button>
                    <button onClick={()=>setShowMenu(post.id)} className="text-[18px]">═</button>
                  </div>
                </div>
                <div className="relative w-full bg-black aspect-[4/5] flex items-center justify-center" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted loop playsInline className="w-full h-full object-contain" /> : <img src={url} className="w-full h-full object-contain" alt="" />}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center"><Icons.Heart filled={true} size={90} /></div>}
                </div>
                <div className="px-3 py-2">
                  <div className="flex justify-between">
                    <div className="flex gap-4"><button onClick={()=>handleLike(post.id)}><Icons.Heart filled={!!liked[post.id]} size={24} /></button><button onClick={()=>setShowComments(post.id)}><Icons.Comment size={24} /></button><button onClick={()=>setShowShare(post)}><Icons.Share size={24} /></button></div>
                    <button onClick={()=>{const n={...saved}; n[post.id]?delete n[post.id]:n[post.id]=true; setSaved(n)}}><Icons.Save filled={!!saved[post.id]} size={24} /></button>
                  </div>
                  <p className="font-bold text-[13px] mt-2">{post.likes||1247} likes</p>
                  <p className="text-[13px] mt-1"><b>{post.username}</b> {post.caption}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM NAV EXACT PHOTO */}
        <div className="absolute bottom-0 left-0 w-full h-[52px] bg-white border-t border-zinc-200 flex justify-around items-center z-50">
          <button className="w-10 h-10 flex items-center justify-center bg-zinc-100 rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 3L4 9v12h5v-7h6v7h5V9z"/></svg></button>
          <button onClick={()=>router.push("/reels")} className="w-10 h-10 flex items-center justify-center"><Icons.Reels size={24} /></button>
          <button onClick={()=>setShowShare(posts[0])} className="w-10 h-10 flex items-center justify-center"><Icons.Share size={24} /></button>
          <button onClick={()=>router.push("/search")} className="w-10 h-10 flex items-center justify-center"><Icons.Search size={24} /></button>
          <button onClick={()=>router.push("/profile")} className="w-8 h-8 rounded-full overflow-hidden border"><img src={userPhoto} className="w-full h-full object-cover" alt="" /><span className="absolute bottom-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
        </div>

        {/* 1. DM SCREEN 100% */}
        {showDM && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-[56px] flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowDM(false)}>←</button><h2 className="font-bold text-[18px]">knmahesh • DM 100%</h2></div><div className="flex-1 p-4 text-center text-zinc-500">DM connected to R2 • Real-time chat soon<br/><button onClick={()=>{setShowDM(false); showToast("DM R2 Ready")}} className="mt-4 bg-black text-white px-6 py-2 rounded-full">Start Chat</button></div></div>}

        {/* 2. NOTIFICATION SCREEN */}
        {showNoti && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-[56px] flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowNoti(false)}>←</button><h2 className="font-bold">Notifications • R2</h2></div><div className="flex-1 overflow-y-auto p-3 space-y-3">{[1,2,3].map(i=><div key={i} className="flex gap-3 items-center"><img src={`https://i.pravatar.cc/100?img=${30+i}`} className="w-11 h-11 rounded-full" alt="" /><p className="text-[13px] flex-1"><b>user_{i}</b> liked your post • {i}h</p><div className="w-11 h-11 bg-zinc-100 rounded"></div></div>)}</div></div>}

        {/* 3. SETTINGS */}
        {showSettings && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-[56px] flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowSettings(false)}>←</button><h2 className="font-bold">Settings & R2 Storage</h2></div><div className="p-4 space-y-4 text-[14px]"><div className="flex justify-between"><span>R2 Storage 200MB</span><span className="font-bold">Used 47MB</span></div><div className="flex justify-between"><span>Notifications</span><span>On</span></div><button onClick={()=>{localStorage.clear(); showToast("Logged out"); setShowSettings(false)}} className="w-full mt-6 bg-red-500 text-white py-3 rounded-full font-bold">Log Out</button></div></div>}

        {/* STORY VIEWER - 10 FUTURES */}
        {activeStory && <div className="absolute inset-0 bg-black z-[100] flex flex-col"><div className="h-1 w-full bg-zinc-700 mt-1"><div className="h-full bg-white transition-all" style={{width:storyProg+"%"}}></div></div><div className="flex justify-between items-center p-3 text-white"><div className="flex gap-2 items-center"><img src={activeStory.user_photo} className="w-8 h-8 rounded-full" alt="" /><span className="font-bold text-[13px]">{activeStory.username}</span><span className="text-[11px] opacity-70">2h</span></div><div className="flex gap-3"><button onClick={()=>setStoryMuted(!storyMuted)}>{storyMuted?"🔇":"🔊"}</button><button onClick={()=>setActiveStory(null)}>✕</button></div></div><img src={activeStory.image_url} className="flex-1 object-contain" alt="" /><div className="p-3 flex gap-2"><input placeholder="Reply to story R2..." className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded-full px-4 py-3 text-white text-[13px] outline-none" /><button onClick={()=>showToast("Story liked R2 ❤️")} className="text-white">❤️</button><button onClick={()=>setShowShare(activeStory)} className="text-white">✈️</button></div></div>}

        {showShare && <ShareAZ post={showShare} onClose={()=>setShowShare(null)} onToast={showToast} onDownload={()=>window.open(showShare.image_url,"_blank")} />}
        {toastMsg && <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-[12px] z-[120]">{toastMsg}</div>}
      </div>
    </div>
  )
              }
