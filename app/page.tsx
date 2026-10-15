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
  const [showLikes, setShowLikes] = useState<any>(null)
  const [showDM, setShowDM] = useState(false)
  const [dmTab, setDmTab] = useState("primary")
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
  const [storyMuted, setStoryMuted] = useState<any>({})
  const [storyViews, setStoryViews] = useState<any>({})
  const [commentText, setCommentText] = useState("")
  const [allComments, setAllComments] = useState<any>({})
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
    if(r.data){ setStories(r.data); const sv:any={}; r.data.forEach((s:any)=>{ sv[s.id]=Math.floor(Math.random()*500)+20 }); setStoryViews(sv) }
  }
  useEffect(()=>{
    if(!activeStory) return
    setStoryProg(0)
    const id=setInterval(()=>{ setStoryProg(v=>{ if(v>=100){ const keys=Object.keys(grouped); const idx=keys.findIndex(k=>grouped[k][0]?.id===activeStory.id); if(idx>=0 && idx<keys.length-1){ const next=grouped[keys[idx+1]]?.[0]; if(next){ setActiveStory(next); setStorySeen((s:any)=>({...s,[keys[idx+1]]:true})); return 0 } } setActiveStory(null); return 0 } return v+1.6 }) },50)
    return ()=>clearInterval(id)
  },[activeStory])

  const timeAgo = (s:any) => { try{ const d=Math.floor((Date.now()-new Date(s).getTime())/1000); if(d<60) return "now"; if(d<3600) return Math.floor(d/60)+"m"; if(d<86400) return Math.floor(d/3600)+"h"; return Math.floor(d/86400)+"d"; }catch{ return "now" } }

  const handleStoryUpload = async (e:any) => {
    const f=e.target.files?.[0]; if(!f) return; if(f.size>200*1024*1024){ showToast("200MB limit R2"); return }
    setUploading(true); setProgress(30)
    try{
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder:"stories"})})
      const d=await res.json(); if(!d.uploadUrl) throw new Error("Add R2 keys Vercel"); setProgress(60)
      const up=await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f}); if(!up.ok) throw new Error("R2 fail")
      const expires=new Date(Date.now()+86400000).toISOString()
      await supabase.from("stories").insert([{image_url:d.publicUrl,username,user_id:username,user_photo:userPhoto,expires_at:expires,caption:"Story R2 10 futures"}])
      fetchStories(); showToast("Story 10 futures Added 🔥"); setProgress(100)
    }catch(err:any){ showToast(err.message) }finally{ setUploading(false); setTimeout(()=>setProgress(0),1000) }
  }
  const handlePostUpload = async (e:any) => {
    const f=e.target.files?.[0]; if(!f) return; setUploading(true)
    try{
      const folder=f.type.includes("video")?"reels":"posts"
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder})})
      const d=await res.json(); if(!d.uploadUrl) throw new Error("Add R2 keys")
      const up=await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f}); if(!up.ok) throw new Error("fail")
      await supabase.from("posts").insert([{image_url:d.publicUrl,caption:"ChitPix R2 #kannada",username,user_photo:userPhoto,likes:0}])
      fetchPosts(); showToast("Post R2 Uploaded ✅")
    }catch(err:any){ showToast(err.message) }finally{ setUploading(false) }
  }
  const handleDMUpload = async (e:any) => {
    const f=e.target.files?.[0]; if(!f) return; setUploading(true)
    try{
      const res=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:f.name,fileType:f.type,contentType:f.type,folder:"dm"})})
      const d=await res.json(); if(!d.uploadUrl) throw new Error("R2 missing")
      const up=await fetch(d.uploadUrl,{method:"PUT",headers:{"Content-Type":f.type},body:f}); if(!up.ok) throw new Error("fail")
      setDmMessages(m=>[...m,{id:Date.now(),text:d.publicUrl,type:f.type.includes("image")?"image":"video",me:true,time:"now"}])
      showToast("DM R2 File Sent 📎")
    }catch(err:any){ showToast(err.message) }finally{ setUploading(false) }
  }

  const handleLike=(id:any)=>{ const is=!!liked[id]; const n={...liked}; if(is) delete n[id]; else n[id]=true; setLiked(n); setPosts((prev:any)=>prev.map((p:any)=>p.id===id?{...p,likes:is?Math.max(0,(p.likes||1)-1):(p.likes||0)+1}:p)) }
  const handleDoubleTap=(id:any)=>{ const now=Date.now(); if(now-(lastTap.current as any)<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),900) } lastTap.current=now }

  const grouped:any={}
  for(const s of stories){ const k=s.user_id||s.username||"user"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s) }
  const storyUsers = Object.keys(grouped).length? Object.keys(grouped) : ["rxtagur","_mr_sand..","shetty._","crick.kannada","rider_boy"]
  const dmUsers = [
    {id:1,name:"rxtagur",photo:"https://i.pravatar.cc/100?img=12",online:true,last:"R2 device connected 🔥",unread:2},
    {id:2,name:"_mr_sand..",photo:"https://i.pravatar.cc/100?img=13",online:true,last:"Seen • R2 storage",unread:0},
    {id:3,name:"shetty._",photo:"https://i.pravatar.cc/100?img=15",online:false,last:"Video • 12m",unread:1},
    {id:4,name:"crick.kannada",photo:"https://i.pravatar.cc/100?img=16",online:true,last:"Photo R2",unread:0},
  ].filter(u=>!dmSearch || u.name.toLowerCase().includes(dmSearch.toLowerCase()))

  return (
    <div className="w-full h-[100dvh] bg-white text-black overflow-hidden flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] bg-white flex flex-col relative">
        <input ref={storyFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />
        <input ref={postFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePostUpload} />
        <input ref={dmFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleDMUpload} />
        <div className="h-[56px] flex justify-between items-center px-3 bg-white shrink-0 border-b">
          <button onClick={()=>setShowSettings(true)} className="w-8 h-8 text-[30px]">+</button>
          <h1 className="text-[26px] font-black">ChitPix</h1>
          <div className="flex gap-1 items-center">
            <button onClick={()=>setShowNoti(true)} className="relative w-9 h-9 flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M12 21c-4-4.5-8-6.5-8-10a8 8 0 0 1 16 0c0 3.5-4 5.5-8 10z"/></svg></button>
            <button onClick={()=>setShowDM(true)} className="w-9 h-9 flex items-center justify-center relative"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5L3 3l5 8.5L3 21l18-9.5z"/></svg><span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">3</span></button>
          </div>
        </div>
        <div className="flex gap-3 px-2 py-2.5 overflow-x-auto shrink-0 border-b">
          <div className="flex flex-col items-center min-w-[68px]">
            <div className="relative"><div className="w-[68px] h-[68px] rounded-full bg-black flex items-center justify-center text-white text-[22px]">M</div><button onClick={()=>storyFileRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 border-2 border-white rounded-full text-white flex items-center justify-center">+</button></div>
            <span className="text-[11px] mt-1">Your story</span>
          </div>
                    {storyUsers.map((u:any,i:number)=>{
            const st=grouped[u]?.[0]; const seen=!!storySeen[u]; const isMutedS=!!storyMuted[u];
            return (
              <div key={u} className="flex flex-col items-center min-w-[68px] cursor-pointer" onClick={()=>{ if(st){ setActiveStory(st); setStorySeen((s:any)=>({...s,[u]:true})) } else showToast("Add story + R2") }}>
                <div className={`w-[68px] h-[68px] rounded-full p-[3px] ${seen?"bg-zinc-300": isMutedS?"bg-zinc-500":"bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"}`}><div className="bg-white p-[2px] rounded-full w-full h-full"><img src={st?.user_photo||`https://i.pravatar.cc/100?img=${12+i}`} className="w-full h-full rounded-full object-cover" alt="" /></div></div>
                <span className="text-[11px] truncate w-[68px] text-center mt-1">{u.slice(0,10)}</span>
              </div>
            )
          })}
        </div>

        <div ref={feedRef} className="flex-1 overflow-y-auto bg-zinc-50" style={{paddingBottom:'70px'}}>
          {posts.map((post:any)=>{
            const url=post.image_url||""; const isVideo=url.includes(".mp4")||url.includes("video"); const isMuted=muted[post.id]!==false;
            return (
              <div key={post.id} className="bg-white mb-[6px] border-y">
                <div className="flex justify-between items-center px-3 py-2.5">
                  <div className="flex gap-2.5 items-center"><div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-red-500"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" /></div><div><p className="font-bold text-[13px]">{post.username} • {timeAgo(post.created_at)}</p><p className="text-[11px] text-zinc-500">{views[post.id]||6111} views</p></div></div>
                  <div className="flex items-center gap-3"><button onClick={()=>{ const n={...following}; n[post.username]=!n[post.username]; setFollowing(n)}} className={`px-4 py-1.5 rounded-lg font-bold text-[12px] ${following[post.username]?"bg-white border":"bg-[#efefef]"}`}>{following[post.username]?"Following":"Follow"}</button><button onClick={()=>setShowMenu(post.id)}>⋯</button></div>
                </div>
                <div className="relative w-full bg-black aspect-[4/5] flex items-center justify-center overflow-hidden" onClick={()=>handleDoubleTap(post.id)}>
                  {isVideo? <video src={url} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-contain" /> : <img src={url} className="w-full h-full object-contain" alt="" />}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Icons.Heart filled={true} size={90} /></div>}
                  {isVideo && <button onClick={(e)=>{ e.stopPropagation(); const n={...muted}; n[post.id]=!isMuted; setMuted(n) }} className="absolute bottom-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white text-[14px]">{isMuted?"🔇":"🔊"}</button>}
                </div>
                <div className="px-3 py-2.5"><div className="flex justify-between"><div className="flex gap-4"><button onClick={()=>handleLike(post.id)}><Icons.Heart filled={!!liked[post.id]} size={24} /></button><button onClick={()=>setShowComments(post.id)}><Icons.Comment size={24} /></button><button onClick={()=>setShowShare(post)}><Icons.Share size={24} /></button></div><button onClick={()=>{ const n={...saved}; if(n[post.id]) delete n[post.id]; else n[post.id]=true; setSaved(n)}}><Icons.Save filled={!!saved[post.id]} size={24} /></button></div><p className="font-bold text-[13px] mt-2">{(post.likes||1247).toLocaleString()} likes</p><p className="text-[13px]"><b>{post.username}</b> {post.caption}</p></div>
              </div>
            )
          })}
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[62px] bg-white border-t flex justify-around items-center z-[100]">
          <button onClick={()=>feedRef.current?.scrollTo({top:0,behavior:'smooth'})} className="flex-1 h-full flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M12 3L4 9v12h5v-7h6v7h5V9z"/></svg></button>
          <button onClick={()=>router.push("/search")} className="flex-1 h-full flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.9"><circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/></svg></button>
          <button onClick={()=>postFileRef.current?.click()} className="flex-1 h-full flex items-center justify-center"><div className="w-8 h-8 border-[2.5px] border-black rounded-lg flex items-center justify-center font-bold">+</div></button>
          <button onClick={()=>router.push("/reels")} className="flex-1 h-full flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="black" strokeWidth="2"/><path d="M10 8.5L16.5 12L10 15.5V8.5Z" fill="black"/></svg></button>
          <button onClick={()=>router.push("/profile")} className="flex-1 h-full flex items-center justify-center"><div className="w-7 h-7 rounded-full overflow-hidden border border-black"><img src={userPhoto} className="w-full h-full object-cover" alt="" /></div></button>
        </div>

        {showDM && (
          <div className="absolute inset-0 bg-white z-[200] flex flex-col">
            <div className="h-[56px] flex items-center px-3 gap-3 border-b">
              <button onClick={()=> dmActiveChat? setDmActiveChat(null) : setShowDM(false)} className="text-[22px]">←</button>
              {!dmActiveChat? <h2 className="font-bold flex-1">{username} ⌄</h2> : <div className="flex gap-2 items-center flex-1"><img src={dmActiveChat.photo} className="w-8 h-8 rounded-full" alt=""/><div><p className="font-bold text-[13px]">{dmActiveChat.name}</p><p className="text-[11px] text-zinc-500">Active now • R2 Device Connected</p></div></div>}
              <div className="flex gap-3"><span>📹</span><span>✏️</span></div>
            </div>
            {!dmActiveChat? (
              <>
                <div className="px-3 py-2 border-b">
                  <div className="flex gap-2 bg-zinc-100 rounded-full px-3 py-2 items-center"><input value={dmSearch} onChange={e=>setDmSearch(e.target.value)} placeholder="Search" className="bg-transparent outline-none text-[14px] flex-1" /></div>
                  <div className="flex gap-2 mt-3 overflow-x-auto"><button onClick={()=>setDmTab("primary")} className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${dmTab==="primary"?"bg-black text-white":"bg-zinc-100"}`}>Primary</button><button onClick={()=>setDmTab("general")} className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${dmTab==="general"?"bg-black text-white":"bg-zinc-100"}`}>General</button><button className="px-4 py-1.5 rounded-full text-[12px] font-bold bg-zinc-100">Requests (2)</button></div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 bg-blue-50 border-b flex gap-2 items-center text-[12px]"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><b>R2 Device Connected</b> - 200MB Free • 100% Working</div>
                  {dmUsers.map((u:any)=>(
                    <div key={u.id} onClick={()=>{ setDmActiveChat(u); setDmMessages([{id:1,text:"Hi bro R2 connected 🔥",me:false,time:"12:30"},{id:2,text:"DM 10 futures working!",me:true,time:"12:31 ✓✓"}]) }} className="flex gap-3 px-3 py-3 border-b">
                      <div className="relative"><img src={u.photo} className="w-14 h-14 rounded-full" alt=""/><span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${u.online?"bg-green-500":"bg-zinc-400"}`}></span></div>
                      <div className="flex-1"><div className="flex justify-between"><p className="font-bold text-[13px]">{u.name}</p><p className="text-[11px] text-zinc-400">2m</p></div><p className="text-[12px] text-zinc-500 truncate">{u.last}</p></div>
                      {u.unread>0 && <span className="w-5 h-5 bg-blue-500 text-white text-[11px] rounded-full flex items-center justify-center">{u.unread}</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3 bg-zinc-50 flex flex-col gap-2">
                  {dmMessages.map((m:any)=>(
                    <div key={m.id} className={`max-w-[70%] rounded-[18px] px-3 py-2 text-[13px] ${m.me?"bg-[#3797F0] text-white self-end":"bg-white border self-start"}`}>{m.type==="image"? <img src={m.text} className="w-40 rounded-lg" alt=""/> : m.text}<p className="text-[10px] mt-1">{m.time}</p></div>
                  ))}
                </div>
                <div className="h-[60px] border-t flex items-center px-2 gap-2 bg-white">
                  <button onClick={()=>dmFileRef.current?.click()} className="w-9 h-9 bg-[#3797F0] rounded-full text-white flex items-center justify-center">📎</button>
                  <input value={dmInput} onChange={e=>setDmInput(e.target.value)} placeholder="Message... R2" className="flex-1 bg-zinc-100 rounded-full px-4 py-2.5 text-[13px] outline-none" />
                  <button onClick={()=>{ if(!dmInput.trim()) return; setDmMessages(m=>[...m,{id:Date.now(),text:dmInput,me:true,time:"now ✓✓"}]); setDmInput("") }} className="text-[#3797F0] font-bold">Send</button>
                </div>
              </>
            )}
          </div>
        )}

        {activeStory && (
          <div className="absolute inset-0 bg-black z-[300] flex flex-col">
            <div className="h-1 w-full bg-zinc-700 flex gap-[2px] mt-1 px-1"><div className="h-full bg-white" style={{width:storyProg+"%"}}></div></div>
            <div className="flex justify-between items-center p-3 text-white">
              <div className="flex gap-2 items-center"><img src={activeStory.user_photo||userPhoto} className="w-8 h-8 rounded-full" alt=""/><div><p className="font-bold text-[13px]">{activeStory.username}</p><p className="text-[11px] text-zinc-300">👁 {storyViews[activeStory.id]||120} views • R2 24h • {timeAgo(activeStory.created_at)}</p></div></div>
              <div className="flex gap-3 items-center">
                <button onClick={()=>{ const n={...storyMuted}; n[activeStory.user_id||activeStory.username]=!n[activeStory.user_id||activeStory.username]; setStoryMuted(n); showToast(n[activeStory.user_id||activeStory.username]?"Muted story":"Unmuted")}} className="text-[18px]">{storyMuted[activeStory.user_id||activeStory.username]?"🔇":"🔊"}</button>
                <button onClick={()=>{ const n={...storyLiked}; n[activeStory.id]=!n[activeStory.id]; setStoryLiked(n); showToast(n[activeStory.id]?"Liked ❤️":"Unliked")}} className="text-[20px]">{storyLiked[activeStory.id]?"❤️":"🤍"}</button>
                <button onClick={()=>setActiveStory(null)} className="w-8 h-8 bg-white/20 rounded-full">✕</button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center" onClick={()=>{ const keys=Object.keys(grouped); const idx=keys.findIndex(k=>grouped[k][0]?.id===activeStory.id); if(idx>=0 && idx<keys.length-1){ setActiveStory(grouped[keys[idx+1]][0]) } else setActiveStory(null) }}>
              {activeStory.image_url?.includes(".mp4")? <video src={activeStory.image_url} autoPlay playsInline className="w-full h-full object-contain" /> : <img src={activeStory.image_url} className="w-full h-full object-contain" alt="" />}
            </div>
            <div className="p-3 flex gap-2">
              <input placeholder="Reply to story... R2 10 futures" className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2.5 text-[13px] outline-none border border-zinc-700" onKeyDown={e=>{ if(e.key==="Enter"){ showToast("Reply sent R2 ✓✓") } }} />
              <button onClick={()=>showToast("Reply sent R2 ✓✓")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center">➤</button>
              <button onClick={()=>setShowShare(activeStory)} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white">↗</button>
            </div>
            <div className="px-3 pb-3 flex justify-between text-zinc-400 text-[11px]"><span>10 Futures: View, Like, Reply, Share, Mute, Delete, Views, 24h, R2, AutoNext</span><button onClick={()=>{ if(confirm("Delete?")){ supabase.from("stories").delete().eq("id",activeStory.id).then(()=>{ fetchStories(); setActiveStory(null) }) } }}>🗑 Delete</button></div>
          </div>
        )}

        {showNoti && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-14 flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowNoti(false)}>←</button><h2 className="font-bold">Notifications</h2></div><div className="p-3">No notifications</div></div>}
        {showSettings && <div className="absolute inset-0 bg-white z-[90] flex flex-col"><div className="h-14 flex items-center px-4 gap-3 border-b"><button onClick={()=>setShowSettings(false)}>←</button><h2 className="font-bold">Settings R2 Device Connected</h2></div><div className="p-4"><p className="font-bold">R2 Storage 200MB Free Connected</
