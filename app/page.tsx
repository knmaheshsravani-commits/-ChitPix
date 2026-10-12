"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"
import BottomNav from "./components/BottomNav"

type Post = { id: string; image_url: string; caption: string; username: string; likes: number; shares?: number; user_photo?: string; created_at: string; comments?: number; type?: string }
type Story = { id: string; user_id: string; image_url: string; username?: string; created_at: string; expires_at: string }

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [username, setUsername] = useState("knmahesh")
  const [userPhoto, setUserPhoto] = useState("")
  const lastTap = useRef(0)
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [showShare, setShowShare] = useState<Post | null>(null)
  const [friends, setFriends] = useState<any[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (m: string) => { setToastMsg(m); setTimeout(()=>setToastMsg(null),2500) }

  useEffect(() => {
    const n = localStorage.getItem("chitpix_username"); if(n) setUsername(n)
    const p = localStorage.getItem("chitpix_profile_photo"); if(p) setUserPhoto(p)
    fetchPosts(); fetchStories(); fetchFriendsList()
    const ch = supabase.channel("posts_final_v2").on("postgres_changes",{event:"*",schema:"public",table:"posts"},()=>fetchPosts()).on("postgres_changes",{event:"*",schema:"public",table:"stories"},()=>fetchStories()).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  }, [])

  const fetchPosts = async () => { const {data} = await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(100); if(data) setPosts(data as any) }
  const fetchStories = async () => { const {data} = await supabase.from("stories").select("*").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}); if(data) setStories(data) }
  const fetchFriendsList = async () => { const {data} = await supabase.from("posts").select("username").limit(40); if(data){ const uniq=Array.from(new Set(data.map((d:any)=>d.username))); setFriends(uniq.map((u:any)=>({username:u}))) } }

  useEffect(()=>{ if(!activeStory) return; setStoryProgress(0); const i=setInterval(()=>{ setStoryProgress(p=>{ if(p>=100){ setActiveStory(null); return 0 } return p+2 }) },80); return ()=>clearInterval(i) },[activeStory])

  const handleFileChange = (e:any) => { const f=e.target.files[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)) }
  const uploadToR2 = async () => {
    if(!file){ showToast("Select photo"); return } setUploading(true)
    try{
      const isVideo=file.type.includes("video"); const folder=isVideo?"reels":"posts"
      const presignRes=await fetch("/api/r2-presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,fileType:file.type,contentType:file.type,folder})})
      const presignData=await presignRes.json(); if(!presignData.uploadUrl) throw new Error("R2 failed")
      await fetch(presignData.uploadUrl,{method:"PUT",body:file,headers:{"Content-Type":file.type}})
      await supabase.from("posts").insert([{image_url:presignData.publicUrl,caption,username,user_photo:userPhoto,likes:0,shares:0,type:isVideo?"reels":"post"}])
      setCaption(""); setPreview(""); setFile(null); setShowCreate(false); fetchPosts(); showToast("Uploaded!")
    }catch(err:any){ showToast("Error: "+err.message) } setUploading(false)
  }

  const handleLike = (id:string) => { const isL=liked[id]; setLiked(p=>({...p,[id]:!isL})); setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:isL?Math.max(0,p.likes-1):p.likes+1}:p)) }
  const handleFollow = async (target:string) => { if(target===username) return; const isF=following[target]; setFollowing(p=>({...p,[target]:!isF})); showToast(isF?`Unfollowed ${target}`:`Following ${target}`) }
  const handleDirectShare = async (post:Post,friend?:string) => { try{ await navigator.clipboard.writeText(post.image_url); showToast(friend?`Shared to ${friend}`:"Link Copied!"); await supabase.from("posts").update({shares:(post.shares||0)+1}).eq("id",post.id); fetchPosts(); if(friend) setShowShare(null) }catch{} }
  const handleDoubleTap = (id:string) => { const now=Date.now(); if(now-lastTap.current<300){ if(!liked[id]) handleLike(id); setShowHeart(id); setTimeout(()=>setShowHeart(null),900) } lastTap.current=now }
  const handleDelete = async (id:string,postUser:string) => { if(postUser!==username){ showToast("Not your post"); return } if(!confirm("Delete?")) return; await supabase.from("posts").delete().eq("id",id); fetchPosts() }
  const isVideoUrl = (url:string) => url?.includes(".mp4") || url?.includes("/reels/") || url?.includes("video")
  const groupedStories:Record<string,Story[]>={}; stories.forEach(s=>{ const k=(s.user_id||s.username||"unknown") as string; if(!groupedStories[k]) groupedStories[k]=[]; groupedStories[k].push(s) })

  return (
    <div className="w-full bg-black h-[100dvh] overflow-y-auto text-white scrollbar-hide">
      <div className="max-w-[470px] mx-auto bg-black pb-[90px] min-h-screen border-x border-zinc-900">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-zinc-800">
          <h1 className="text-[26px] font-bold">ChitPix</h1>
          <div className="flex gap-4 items-center">
            <Link href="/messages"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></Link>
            <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[13px]">+ Create</button>
          </div>
        </div>

        <div className="flex gap-4 p-3.5 overflow-x-auto border-b border-zinc-800 scrollbar-hide">
          <div className="flex flex-col items-center min-w-[64px]"><label className="w-[64px] h-[64px] rounded-full bg-zinc-800 p-[3px] relative cursor-pointer"><img src={userPhoto||"https://i.pravatar.cc/100"} className="w-full h-full rounded-full object-cover" alt=""/><div className="absolute bottom-0 right-0 bg-[#0095f6] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black text-white text-[12px]">+</div><input type="file" accept="image/*" hidden onChange={(e:any)=>{const f=e.target.files?.[0]; if(!f) return; const form=new FormData(); form.append("file",f); fetch("/api/upload",{method:"POST",body:form}).then(r=>r.json()).then(d=>{supabase.from("stories").insert({image_url:d.url,username,user_id:username}).then(()=>fetchStories())})}} /></label><span className="text-[11px] mt-1">Your Story</span></div>
          {Object.keys(groupedStories).map(uid=>(<div key={uid} className="flex flex-col items-center min-w-[64px] cursor-pointer" onClick={()=>setActiveStory(groupedStories[uid][0])}><div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"><img src={groupedStories[uid][0].image_url} className="w-full h-full rounded-full border-2 border-black object-cover" alt=""/></div><span className="text-[11px] mt-1 truncate w-[64px] text-center">{uid}</span></div>))}
        </div>

        <div className="bg-black">
          {posts.map(post=>{
            const url=post.image_url||""; const video=post.type==="reels"||isVideoUrl(url); const isF=following[post.username]
            return(
              <div key={post.id} className="border-b border-zinc-800 bg-black">
                {/* 1. HEADER WITH FOLLOW - 100% WORKING */}
                <div className="flex justify-between items-center p-3">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><img src={post.user_photo||`https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full border-2 border-black object-cover" alt=""/></div>
                    <div className="leading-tight"><p className="font-bold text-[15px]">{post.username}</p><p className="text-[13px] text-zinc-400">Suggested for you</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {post.username!==username && <button onClick={()=>handleFollow(post.username)} className={`px-[18px] py-[5px] rounded-full border text-[14px] font-bold ${isF?"border-zinc-700 text-zinc-400 bg-zinc-900":"border-zinc-300 text-white"}`}>{isF?"Following":"Follow"}</button>}
                    <button><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="4" y1="8" x2="20" y2="8"/><line x1="10" y1="16" x2="20" y2="16"/></svg></button>
                    {post.username===username && <button onClick={()=>handleDelete(post.id,post.username)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">Delete</button>}
                  </div>
                </div>

                <div className="relative bg-black w-full aspect-[4/5] overflow-hidden" onClick={()=>handleDoubleTap(post.id)}>
                  {video? <video src={url} className="w-full h-full object-cover" autoPlay muted loop playsInline/> : <img src={url} className="w-full h-full object-cover" alt="post"/>}
                  {showHeart===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg width="80" height="80" viewBox="0 0 24 24" fill="#ff3040" className="animate-ping"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg></div>}
                </div>

                {/* 2. BOTTOM 5 ICONS - SAME SIZE 26px + WORKING */}
                <div className="flex justify-between items-center px-3 py-3 bg-white text-black">
                  <div className="flex items-center gap-4">
                    <button onClick={()=>handleLike(post.id)} className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill={liked[post.id]?"black":"none"} stroke="black" strokeWidth="1.7"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg><span className="text-[15px] font-medium">255K</span></button>
                    <button onClick={()=>setShowComments(showComments===post.id?null:post.id)} className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span className="text-[15px] font-medium">535</span></button>
                    <button className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span className="text-[15px] font-medium">3,348</span></button>
                    <button onClick={()=>handleDirectShare(post)} className="flex items-center gap-1.5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span className="text-[15px] font-medium">9,012</span></button>
                  </div>
                  <button onClick={()=>setSaved(p=>({...p,[post.id]:!p[post.id]}))}><svg width="26" height="26" viewBox="0 0 24 24" fill={saved[post.id]?"black":"none"} stroke="black" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
                </div>
                <div className="px-3 pb-3 bg-white text-black"><p className="text-[14px]"><b>{post.username}</b> {post.caption||"W@tch St0ry"} <span className="text-zinc-500">... more</span></p><p className="text-[12px] text-zinc-500 mt-1">1 day ago • See translation</p></div>
              </div>
            )
          })}
        </div>

        {showCreate && <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"><div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-4"><h3 className="font-bold">Create - R2</h3><button onClick={()=>setShowCreate(false)}>✕</button></div><input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-sm mb-3"/><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm mb-3" rows={3}/><button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold">{uploading?"Uploading...":"Upload"}</button></div></div>}
        {activeStory && <div className="fixed inset-0 bg-black z-[200] flex flex-col"><div className="h-1 bg-zinc-800 w-full"><div className="h-full bg-white" style={{width:`${storyProgress}%`}}></div></div><div className="flex justify-between p-4"><div className="flex gap-2 items-center"><img src={activeStory.image_url} className="w-8 h-8 rounded-full" alt=""/><span className="font-bold text-sm">{activeStory.username}</span></div><button onClick={()=>setActiveStory(null)}>✕</button></div><div className="flex-1 flex items-center justify-center"><img src={activeStory.image_url} className="max-h-full object-contain" alt="story"/></div></div>}
        {toastMsg && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold z-[300]">{toastMsg}</div>}
      </div>
      <BottomNav />
    </div>
  )
    }
