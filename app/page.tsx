"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M12 20.5l-1.5-1.4C5 14.5 2 11.8 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.3-3 6-8.5 10.6L12 20.5z" /></svg>
)
const CommentIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 11-3.2-6.7A8.5 8.5 0 0121 11.5z" /><path d="M8 12h8M12 8v8" strokeWidth="0" /></svg>
const SendIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
const BookmarkIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newImage, setNewImage] = useState("")
  const [caption, setCaption] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("knmahesh")

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved) setPosts(JSON.parse(saved))
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
  },[])

  const savePosts = (np:any[])=>{ setPosts(np); localStorage.setItem("posts", JSON.stringify(np)) }

  const handleCreate = () => {
    if(!newImage) return alert("Photo select chey!")
    const newPost = { id: Date.now(), image: newImage, caption, likes: Math.floor(Math.random()*50)+10, liked: false, username, avatar: photo, time: "Now" }
    savePosts([newPost,...posts])
    setNewImage(""); setCaption(""); setShowCreate(false)
  }

  const handleLike = (i:number)=>{
    const u=[...posts]
    u[i].liked=!u[i].liked
    u[i].likes+= u[i].liked?1:-1
    savePosts(u)
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 text-black">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen border-x">
        {/* NEW HEADER */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-white/90 backdrop-blur-xl z-20 border-b">
          <h1 className="font-black text-[24px] tracking-tighter bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] bg-clip-text text-transparent">ChitPix</h1>
          <div className="flex gap-4 items-center">
            <button onClick={()=>setShowCreate(true)} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <Link href="/messages"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 01-12.8 7.4L2 22l3.1-6.2A8.5 8.5 0 0121 11.5z"/></svg></Link>
            <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-pink-500 ring-offset-1">
              {photo? <img src={photo} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-200 flex items-center justify-center">👤</div>}
            </Link>
          </div>
        </div>

        {/* STORIES - NEW DESIGN */}
        <div className="flex gap-3 p-3 overflow-x-auto scrollbar-hide border-b">
          <div className="flex flex-col items-center min-w-[64px]">
            <div className="w-[56px] h-[56px] rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden relative">
              {photo? <img src={photo} className="w-full h-full object-cover"/> : <span className="text-xl">👤</span>}
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[12px] border-2 border-white">+</div>
            </div>
            <span className="text-[11px] mt-1">Your story</span>
          </div>
          {[
            {n:'Sravani', c:'from-yellow-400 to-pink-600'},
            {n:'Travel', c:'from-green-400 to-blue-500'},
            {n:'ChitPix', c:'from-purple-400 to-pink-500'},
            {n:'Work', c:'from-orange-400 to-red-500'},
          ].map(s=>(
            <div key={s.n} className="flex flex-col items-center min-w-[64px]">
              <div className={`w-[60px] h-[60px] rounded-full bg-gradient-to-tr ${s.c} p-[2.5px]`}>
                <div className="bg-white rounded-full p-[2px] w-full h-full"><div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-lg">✨</div></div>
              </div>
              <span className="text-[11px] mt-1">{s.n}</span>
            </div>
          ))}
        </div>

        {/* FEED - NEW CARD DESIGN */}
        <div>
          {posts.length>0? posts.map((p,i)=>(
            <div key={i} className="mb-2">
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                  <div className="bg-white rounded-full w-full h-full overflow-hidden">
                    {p.avatar? <img src={p.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-100"/>}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold leading-none flex items-center gap-1">{p.username} <span className="text-blue-500 text-[12px]">✓</span></p>
                  <p className="text-[11px] text-gray-500">Dod Ballapur • {p.time}</p>
                </div>
                <button className="text-lg">⋯</button>
              </div>

              <div className="relative bg-black">
                <img src={p.image} onDoubleClick={()=>handleLike(i)} className="w-full aspect-[4/5] object-cover" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full">1/1</div>
              </div>

              <div className="px-3 pt-3 pb-2">
                <div className="flex gap-4">
                  <button onClick={()=>handleLike(i)} className={`${p.liked?'text-red-500':''} transition`}><HeartIcon filled={p.liked} /></button>
                  <button><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5A8.5 8.5 0 014 11.5 8.5 8.5 0 0112.5 3a8.5 8.5 0 018.5 8.5z"/><path d="M8 12c0 0 2 3 4 3s4-3 4-3"/></svg></button>
                  <SendIcon />
                  <button className="ml-auto"><BookmarkIcon /></button>
                </div>
                <p className="text-[14px] font-semibold mt-3">{p.likes.toLocaleString()} likes</p>
                <p className="text-[14px] mt-1"><span className="font-semibold">{p.username}</span> {p.caption || "www.chitpix.com 🚀"} </p>
                <p className="text-[13px] text-gray-500 mt-1">View all comments</p>
              </div>
            </div>
          )): (
            <div className="py-24 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-black mx-auto flex items-center justify-center text-3xl">📸</div>
              <p className="font-bold text-lg mt-4">No posts yet</p>
              <p className="text-sm text-gray-500">Share your first moment</p>
              <button onClick={()=>setShowCreate(true)} className="mt-4 bg-black text-white px-8 py-2.5 rounded-full font-semibold text-sm">Create post</button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL NEW */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-[420px] rounded-t-[24px] sm:rounded-[24px] p-6">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-[18px]">New post</h3>
            <label className="mt-4 border border-dashed border-gray-300 rounded-[16px] h-[320px] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-[#fafafa]">
              {newImage? <img src={newImage} className="w-full h-full object-cover" /> : <div className="text-center"><div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto text-xl">↑</div><p className="text-sm mt-3 font-medium">Upload photo</p><p className="text-xs text-gray-500">PNG, JPG</p></div>}
              <input type="file" accept="image/*" hidden onChange={(e)=>{const f:any=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setNewImage(r.result as string); r.readAsDataURL(f)}}} />
            </label>
            <input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Write a caption..." className="w-full bg-[#f2f2f2] p-3.5 rounded-xl mt-4 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            <button onClick={handleCreate} className="w-full bg-black text-white py-3.5 rounded-full font-bold mt-4">Share</button>
            <button onClick={()=>setShowCreate(false)} className="w-full py-3 text-sm font-medium mt-1">Cancel</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - NEW */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t flex justify-around items-center py-2.5 max-w-[480px] mx-auto z-20">
        <Link href="/"><svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M12 3l9 8v10a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1V11l9-8z"/></svg></Link>
        <Link href="/search"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg></Link>
        <button onClick={()=>setShowCreate(true)} className="w-7 h-7 border-[2px] border-black rounded-lg flex items-center justify-center"><span className="text-lg leading-none">+</span></button>
