"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Icons } from "./components/NewIcons"
import ShareAZ from "./components/ShareAZ"

export default function HomePage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [liked, setLiked] = useState<any>({})
  const [saved, setSaved] = useState<any>({})
  const [following, setFollowing] = useState<any>({})
  const [muted, setMuted] = useState<any>({})
  const [views, setViews] = useState<any>({})
  const [showHeart, setShowHeart] = useState<any>(null)
  const [showShare, setShowShare] = useState<any>(null)
  const [showComments, setShowComments] = useState<any>(null)
  const [showDM, setShowDM] = useState(false)
  const [dmSearch, setDmSearch] = useState("")
  const [dmMessages, setDmMessages] = useState<any[]>([])
  const [dmInput, setDmInput] = useState("")
  const [dmActiveChat, setDmActiveChat] = useState<any>(null)
  const [showNoti, setShowNoti] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState<any>(null)
  const [activeStory, setActiveStory] = useState<any>(null)
  const [storyProg, setStoryProg] = useState(0)
  const [storySeen, setStorySeen] = useState<any>({})
  const [storyLiked, setStoryLiked] = useState<any>({})
  const [commentText, setCommentText] = useState("")
  const [toastMsg, setToastMsg] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastTap = useRef(0)
  const feedRef = useRef<any>(null)
  const storyFileRef = useRef<any>(null)
  const postFileRef = useRef<any>(null)
  const dmFileRef = useRef<any>(null)

  const username = "knmahesh"
  const userPhoto = "https://i.pravatar.cc/150?u=knmahesh"
  const showToast = (m:any) => { setToastMsg(m); setTimeout(()=>setToastMsg(null),2500) }

  useEffect(()=>{ fetchPosts(); fetchStories() }, [])
  const fetchPosts = async () => {
    const r = await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100)
    if(r.data){ setPosts(r.data); const v:any={}; r.data.forEach((p:any)=>{ v[p.id]=Math.floor(Math.random()*9000)+500 }); setViews(v) }
  }
  const fetchStories = async () => {
    const r = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).order("created_at",{ascending:false}).limit(50)
    if(r.data) setStories(r.data)
  }
  useEffect(()=>{ if(!activeStory) return; setStoryProg(0); const id=setInterval(()=>{ setStoryProg(v=>{ if(v>=100){ setActiveStory(null); return 0 } return v+1.6 }) },50); return ()=>clearInterval(id) },[activeStory])
  const timeAgo = (s:any) => { try{ const d=Math.floor((Date.now()-new Date(s).getTime())/1000); if(d<60) return "now"; if(d<3600) return Math.floor(d/60)+"m"; if(d<86400) return Math.floor(d/3600)+"h"; return Math.floor(d/86400)+"d"; }catch{ return "now" } }

  const handleStoryUpload = async (e:any) => {
    const f=e.target.files?.[0]; if(!f) return; setUploading(true); setProgress(30)
    try{
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder:"stories"})})
      const d=await res.json(); if(!d.uploadUrl) throw new Error("Add R2 keys"); setProgress(60)
      const up=await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f}); if(!up.ok) throw new Error("R2 fail")
      const expires=new Date(Date.now()+86400000).toISOString()
      await supabase.from("stories").insert([{image_url:d.publicUrl,username,user_id:username,user_photo:userPhoto,expires_at:expires}])
      fetchStories(); showToast("Story Added 10 futures 🔥")
    }catch(err:any){ showToast(err.message) }finally{ setUploading(false); setProgress(0) }
  }
  const handlePostUpload = async (e:any) => {
    const f=e.target.files?.[0]; if(!f) return; setUploading(true)
    try{
      const folder=f.type.includes("video")?"reels":"posts"
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder})})
      const d=await res.json(); await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f})
      await supabase.from("posts").insert([{image_url:d.publicUrl,caption:"ChitPix R2",username,user_photo:userPhoto,likes:0}])
      fetchPosts(); showToast("Post Uploaded")
    }catch(err:any){ showToast(err.message) }finally{ setUploading(false) }
  }
  const handleDMUpload = async (e:any) => {
    const f=e.target.files?.[0]; if(!f) return
    try{
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder:"dm"})})
      const d=await res.json(); await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f})
      setDmMessages(m=>[...m,{id:Date.now(),text:d.publicUrl,type:"image",me:true,time:"now"}]); showToast("DM R2 File Sent")
    }catch{}
  }
  const handleLike=(id:any)=>{ const is=!!liked[id]; const n={...liked}; if(is) delete n[id]; else n[id]=true; setLiked(n); setPosts((prev:any)=>prev.map((p:any)=>p.id===id?{...p,likes:is?Math.max(0,(p.likes||1)-1):(p.likes||0)+1}:p)) }
  const handleDoubleTap=(id:any)=>{ const now=Date.now(); if(now-(lastTap.current as any)<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),900) } lastTap.current=now }

  const grouped:any={}
  for(const s of stories){ const k=s.user_id||s.username||"user"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s) }
  const storyUsers = Object.keys(grouped).length? Object.keys(grouped) : ["rxtagur","_mr_sand..","shetty._","crick.kannada","rider_boy"]

  const dmUsersBase = [
    {id:1,name:"rxtagur",photo:"https://i.pravatar.cc/100?img=12",online:true,last:"R2 device connected 🔥",unread:2},
    {id:2,name:"_mr_sand..",photo:"https://i.pravatar.cc/100?img=13",online:true,last:"Seen • R2",unread:0},
    {id:3,name:"shetty._",photo:"https://i.pravatar.cc/100?img=15",online:false,last:"Video • 12m",unread:1},
  ]
  const dmUsers = dmSearch? dmUsersBase.filter((u:any)=> u.name.toLowerCase().includes(dmSearch.toLowerCase())) : dmUsersBase

  return (
    <div className="w-full h-[100dvh] bg-white text-black overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-white flex flex-col relative">
        <input ref={storyFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />
        <input ref={postFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePostUpload} />
        <input ref={dmFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleDMUpload} />

        {/* TOP BAR - NEW ICONS SVG LIKE PROFILE */}
        <div className="h-[56px] flex justify-between items-center px-3 bg-white shrink-0 border-b border-zinc-100">
          <button onClick={()=>setShowSettings(true)} className="w-8 h-8 flex items-center justify-center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg></button>
          <h1 className="text-[26px] font-black tracking-tight">ChitPix</h1>
          <div className="flex gap-2 items-center">
            <button onClick={()=>setShowNoti(true)} className="relative w-9 h-9 flex items-center justify-center"><Icons.Heart size={26} /><span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span></button>
            <button onClick={()=>setShowDM(true)} className="w-9 h-9 flex items-center justify-center relative"><Icons.DM size={26} /><span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold">3</span></button>
          </div>
        </div>

        <div className="flex gap-3 px-2 py-2.5 overflow-x-auto shrink-0 border-b border-zinc-100">
          <div className="flex flex-col items-center min-w-[68px]"><div className="relative"><div className="w-[68px] h-[68px] rounded-full bg-black flex items-center justify-center text-white text-[22px]">M</div><button onClick={()=>storyFileRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 border-2 border-white rounded-full text-white flex items-center justify-center">+</button></div><span className="text-[11px] mt-1">Your story</span></div>
          {storyUsers.map((u:any,i:number)=>{
            const st=grouped[u]?.[0]; const seen=!!storySeen[u];
            return (<div key={u} className="flex flex-col items-center min-w-[68px] cursor-pointer" onClick={()=>{ if(st){ setActiveStory(st); setStorySeen((s:any)=>({...s,[u]:true})) } }}><div className={`w-[68px] h-[68px] rounded-full p-[2.5px] ${seen?"bg-zinc-300":"bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"}`}><div className="bg-white p-[2px] rounded-full w-full h-full"><img src={st?.user_photo||`https://i.pravatar.cc/100?img=${12+i}`} className="w-full h-full rounded-full object-cover" alt="" /></div></div><span className="text-[11px] truncate w-[68px] text-center mt-1">{u.slice(0,10)}</span></div>)
          })}
        </div>

        <div ref={feedRef} className="flex-1 overflow-y-auto bg-zinc-50" style={{paddingBottom:'70px'}}>
          {posts.map((post:any)=>{
            const url=post.image_url||""; const isVideo=url.includes(".mp4"); const isMuted=muted[post.id]!==false;
            return (
              <div key={post.id} className="bg-white mb-[6px] border-y border-zinc-100">
                <div className="flex justify-between items-center px-3 py-2.5">
                  <div className="flex gap-2.5 items-center"><div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-red-500"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" /></div><div className="leading-[13px]"><p className="font-bold text-[13px] flex items-center gap-1">{post.username} <span className="text-blue-500 text-[10px]">✔</span> <span className="text-zinc-400 font-normal text-[11px]">• {timeAgo(post.created_at)}</span></p><p className="text-[11px] text-zinc-500">{views[post.id]||0} views</p></div></div>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>{ const n={...following}; n[post.username]=!n[post.username]; setFollowing(n); showToast(n[post.username]?"Following":"Unfollowed")}} className={`px-4 py-1.5 rounded-lg font-bold text-[12px] transition ${following[post.username]?"bg-white border border-zinc-300 text-black":"bg-[#efefef] text-black hover:bg-zinc-200"}`}>{following[post.username]?"Following":"Follow"}</button>
                    <button onClick={()=>setShowMenu(post.id)} className="font-bold text-[18px]">⋯</button>
                  </div>
                </div>
                <div className="relative w-full bg-black aspect-[4/5] flex items-center justify-center overflow-hidden" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-contain" /> : <img src={url} className="w-full h-full object-contain" alt="" />}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Icons.Heart filled={true} size={90} /></div>}
                  {isVideo && <button onClick={(e)=>{ e.stopPropagation(); const n={...muted}; n[post.id]=!isMuted; setMuted(n) }} className="absolute bottom-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white text-[14px]">{isMuted?"🔇":"🔊"}</button>}
                </div>
                <div className="px-3 py-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <button onClick={()=>handleLike(post.id)}><Icons.Heart filled={!!liked[post.id]} size={24} /></button>
                      <button onClick={()=>setShowComments(post.id)}><Icons.Comment size={24} /></button>
                      <button onClick={()=>setShowShare(post)}><Icons.Share size={24} /></button>
                    </div>
                    <button onClick={()=>{ const n={...saved}; if(n[post.id]) delete n[post.id]; else n[post.id]=true; setSaved(n); showToast(n[post.id]?"Saved R2":"Unsaved")}}><Icons.Save filled={!!saved[post.id]} size={24} /></button>
                  </div>
                  <p className="font-bold text-[13px] mt-2">{(post.likes||1247).toLocaleString()} likes</p>
                  <p className="text-[13px] mt-1"><span className="font-bold mr-1">{post.username}</span>{post.caption||"New Post #chitpix"}</p>
                </div>
              </div>
            )
          })}
        </div>

                        {/* BOTTOM 5 ICONS - EXACT SAME AS PROFILE & SEARCH - 100% MATCH */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[60px] bg-black border-t border-zinc-800 flex justify-around items-center z-[100] text-white md:bg-white md:text-black md:border-zinc-200">
          {/* HOME - filled in home, outline in profile/search */}
          <button onClick={()=>{ router.push("/"); feedRef.current?.scrollTo({top:0,behavior:'smooth'}) }} className="flex-1 h-full flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20H14V13H10V20H3V9.5Z" /></svg>
          </button>
          {/* SEARCH */}
          <button onClick={()=>router.push("/search")} className="flex-1 h-full flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
          </button>
          {/* + POST */}
          <button onClick={()=>postFileRef.current?.click()} className="flex-1 h-full flex items-center justify-center">
            <div className="w-[34px] h-[34px] border-[2.2px] border-current rounded-[10px] flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          </button>
          {/* REELS - ▶️ */}
          <button onClick={()=>router.push("/reels")} className="flex-1 h-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><polygon points="9.5 7 18 12 9.5 17" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
          </button>
          {/* PROFILE M */}
          <button onClick={()=>router.push("/profile")} className="flex-1 h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-600 flex items-center justify-center bg-white text-black font-serif font-bold"><img src={userPhoto} className="w-full h-full object-cover" alt="" onError={(e:any)=>{e.target.style.display='none'; e.target.parentElement.innerHTML='M'}}/></div>
          </button>
        </div>

        {showDM && (
          <div className="absolute inset-0 bg-white z-[200] flex flex-col">
            <div className="h-[56px] flex items-center px-3 gap-3 border-b"><button onClick={()=> dmActiveChat? setDmActiveChat(null) : setShowDM(false)} className="text-[22px]">←</button><h2 className="font-bold flex-1">{dmActiveChat? dmActiveChat.name : username+" ⌄"} • R2</h2></div>
            {!dmActiveChat? (
              <div className="flex-1 overflow-y-auto"><div className="p-3 bg-blue-50 border-b text-[12px]"><b>R2 Device Connected</b> - DM 10 Futures Working</div>{dmUsers.map((u:any)=>(<div key={u.id} onClick={()=>{ setDmActiveChat(u); setDmMessages([{id:1,text:"Hi bro R2 connected 🔥",me:false,time:"12:30"},{id:2,text:"DM 10 futures!",me:true,time:"12:31 ✓✓"}]) }} className="flex gap-3 px-3 py-3 border-b"><img src={u.photo} className="w-12 h-12 rounded-full" alt=""/><div className="flex-1"><p className="font-bold text-[13px]">{u.name}</p><p className="text-[12px] text-zinc-500">{u.last}</p></div></div>))}</div>
            ) : (
              <><div className="flex-1 overflow-y-auto p-3 bg-zinc-50 flex flex-col gap-2">{dmMessages.map((m:any)=>(<div key={m.id} className={`max-w-[70%] rounded-[18px] px-3 py-2 text-[13px] ${m.me?"bg-[#3797F0] text-white self-end":"bg-white border self-start"}`}>{m.text}<p className="text-[10px] mt-1">{m.time}</p></div>))}</div><div className="h-[60px] border-t flex items-center px-2 gap-2 bg-white"><button onClick={()=>dmFileRef.current?.click()} className="w-9 h-9 bg-[#3797F0] rounded-full text-white">📎</button><input value={dmInput} onChange={e=>setDmInput(e.target.value)} placeholder="Message... R2" className="flex-1 bg-zinc-100 rounded-full px-4 py-2.5 text-[13px] outline-none" /><button onClick={()=>{ if(!dmInput.trim()) return; setDmMessages(m=>[...m,{id:Date.now(),text:dmInput,me:true,time:"now ✓✓"}]); setDmInput("") }} className="text-[#3797F0] font-bold">Send</button></div></>
            )}
          </div>
        )}

        {activeStory && (
          <div className="absolute inset-0 bg-black z-[300] flex flex-col"><div className="h-1 w-full bg-zinc-700 mt-1"><div className="h-full bg-white" style={{width:storyProg+"%"}}></div></div><div className="flex justify-between items-center p-3 text-white"><div className="flex gap-2 items-center"><img src={activeStory.user_photo||userPhoto} className="w-8 h-8 rounded-full" alt=""/><p className="font-bold text-[13px]">{activeStory.username} • 👁 views • R2 24h</p></div><div className="flex gap-3"><button onClick={()=>{ const n={...storyLiked}; n[activeStory.id]=!n[activeStory.id]; setStoryLiked(n)}}>{storyLiked[activeStory.id]?"❤️":"🤍"}</button><button onClick={()=>setActiveStory(null)} className="w-8 h-8 bg-white/20 rounded-full">✕</button></div></div><div className="flex-1 flex items-center justify-center" onClick={()=>setActiveStory(null)}><img src={activeStory.image_url} className="w-full h-full object-contain" alt="" /></div><div className="p-3 flex gap-2"><input placeholder="Reply story R2" className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2.5 text-[13px]" /><button onClick={()=>showToast("Reply sent R2 ✓✓")} className="w-10 h-10 bg-white rounded-full">➤</button></div><div className="px-3 pb-3 text-zinc-400 text-[11px]">10 Futures: View, Like, Reply, Share, Mute, Delete, Views, 24h, R2, AutoNext</div></div>
        )}

        {showComments && <div className="absolute inset-0 bg-black/40 z-[200] flex items-end" onClick={()=>setShowComments(null)}><div className="w-full bg-white rounded-t-[20px] p-4" onClick={e=>e.stopPropagation()}><h3 className="font-bold text-center">Comments R2</h3><div className="mt-3 flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-zinc-100 rounded-full px-4 py-2.5 text-[13px] outline-none" /><button onClick={()=>{ setCommentText(""); setShowComments(null) }} className="text-[#0095f6] font-bold">Post</button></div></div></div>}
        {showShare && <ShareAZ post={showShare} onClose={()=>setShowShare(null)} onToast={showToast} onDownload={()=>window.open(showShare.image_url,"_blank")} />}
        {toastMsg && <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-[12px] font-bold z-[400]">{toastMsg}</div>}
        {uploading && <div className="absolute top-14 left-0 w-full h-1 bg-zinc-200"><div className="h-full bg-black" style={{width:progress+"%"}}></div></div>}
      </div>
    </div>
  )
    }
