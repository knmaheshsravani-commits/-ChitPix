"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newImage, setNewImage] = useState("")
  const [caption, setCaption] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("Knmahesh")

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved) setPosts(JSON.parse(saved))
    else setPosts([
      {id:1, image:"https://picsum.photos/500/800?random=20", username:"Sravani", caption:"Welcome to ChitPix ✨", likes:128, liked:false, time:"2h ago", avatar:""}
    ])
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
  },[])

  const savePosts = (v:any[])=>{ setPosts(v); localStorage.setItem("posts", JSON.stringify(v)) }

  const handleLike = (i:number)=>{
    const u=[...posts]
    if(u[i].liked){ u[i].likes--; u[i].liked=false } else { u[i].likes++; u[i].liked=true }
    savePosts(u)
  }

  const handleCreate = ()=>{
    if(!newImage) return alert("Photo select chey bro")
    savePosts([{id:Date.now(), image:newImage, caption, likes:0, liked:false, username, time:"Just now", avatar:photo},...posts])
    setNewImage(""); setCaption(""); setShowCreate(false)
  }

  return (
    <div className="min-h-screen bg-white pb-[65px]">
      <div className="max-w-md mx-auto bg-white">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h1 className="font-black text-[22px] tracking-tight">ChitPix</h1>
          <div className="flex items-center gap-3">
            <button onClick={()=>setShowCreate(true)} className="w-8 h-8 bg-black rounded-full text-white text-lg flex items-center justify-center">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden block">
              {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : null}
            </Link>
          </div>
        </div>

        {/* STORIES */}
        <div className="flex gap-4 px-4 py-3 overflow-x-auto border-b">
          <div className="text-center min-w-[64px]">
            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mx-auto overflow-hidden">
              {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <span className="font-bold text-gray-500">U</span>}
            </div>
            <p className="text-[11px] mt-1">You</p>
          </div>
          {[{n:"ChitPix",l:"C"},{n:"My Work",l:"M"},{n:"Travel",l:"T"}].map(s=>(
            <div key={s.n} className="text-center min-w-[64px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] mx-auto">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold">{s.l}</div>
              </div>
              <p className="text-[11px] mt-1">{s.n}</p>
            </div>
          ))}
        </div>

        {/* POSTS */}
        {posts.map((p,i)=>(
          <div key={p.id} className="border-b border-gray-100">
            {/* post header */}
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">{p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt=""/> : null}</div>
              <div className="flex-1">
                <p className="text-[14px] font-bold leading-none">{p.username}</p>
                <p className="text-[11px] text-gray-400">{p.time}</p>
              </div>
              <button className="font-bold text-lg">⋯</button>
            </div>

            {/* post image */}
            <img src={p.image} alt="post" className="w-full object-cover bg-black" onDoubleClick={()=>handleLike(i)} />

            {/* POST KINDA ICONS - FIXED */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-4">
                <button onClick={()=>handleLike(i)}>
                  {p.liked? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#ed4956"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  )}
                </button>
                <button>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </button>
                <button>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
                <button className="ml-auto">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <p className="font-bold text-[14px] mt-3">{p.likes} likes</p>
              <p className="text-[14px] mt-1"><span className="font-bold">{p.username}</span> {p.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-4">
            <div className="flex justify-between mb-3"><h3 className="font-bold">New Post</h3><button onClick={()=>setShowCreate(false)}>X</button></div>
            <label className="border-2 border-dashed rounded-xl h-64 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer">
              {newImage? <img src={newImage} className="w-full h-full object-cover" alt=""/> : <span className="text-sm text-gray-500">Tap to upload</span>}
              <input type="file" accept="image/*" hidden onChange={(e:any)=>{const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=()=>setNewImage(r.result as string); r.readAsDataURL(f)}}} />
            </label>
            <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="caption..." className="w-full border p-3 rounded-lg mt-3 text-sm"/>
            <button onClick={handleCreate} className="w-full bg-black text-white py-3 rounded-lg font-bold mt-3">Share</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - ALL SAME SIZE 24px */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 py-3">
          <Link href="/" className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="white"/></svg>
          </Link>
          <Link href="/search" className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </Link>
          <button onClick={()=>setShowCreate(true)} className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
          <Link href="/reels" className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><polygon points="23 7 13.5 15 8.5 10 1 17.5 1 7 23 7"/><polygon points="23 7 17 7 17 13"/></svg>
          </Link>
          <Link href="/profile" className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border border-black flex items-center justify-center">
            {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : null}
          </Link>
        </div>
      </div>

    </div>
  )
              }
