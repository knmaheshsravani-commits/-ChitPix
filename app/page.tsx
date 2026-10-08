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
    else setPosts([{id:1, image:"https://picsum.photos/600/800?random=5", username:"memer_ipothaa", music:"Anirudh Ravicha...", caption:"ela ipov... more", likes:20700, comments:76, shares:81, saves:7432, liked:false, time:"21 hours ago", avatar:""}])
    const p = localStorage.getItem("chitpix_profile_photo"); if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username"); if(n) setUsername(n)
  },[])

  const savePosts = (v:any[])=>{ setPosts(v); localStorage.setItem("posts", JSON.stringify(v)) }
  const handleLike = (i:number)=>{ const u=[...posts]; if(u[i].liked){u[i].likes-=100; u[i].liked=false}else{u[i].likes+=100; u[i].liked=true}; savePosts(u) }
  const handleCreate = ()=>{ if(!newImage) return alert("Photo select chey"); savePosts([{id:Date.now(), image:newImage, username, music:"Original audio", caption, likes:0, comments:0, shares:0, saves:0, liked:false, time:"Just now", avatar:photo},...posts]); setNewImage(""); setCaption(""); setShowCreate(false) }

  return (
    <div className="min-h-screen bg-white pb-[75px]">
      <div className="max-w-md mx-auto bg-white">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h1 className="font-black text-[22px]">ChitPix</h1>
          <div className="flex gap-3">
            <button onClick={()=>setShowCreate(true)} className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center text-xl">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden block">{photo && <img src={photo} className="w-full h-full object-cover" alt=""/>}</Link>
          </div>
        </div>

        {/* STORIES */}
        <div className="flex gap-4 px-4 py-3 overflow-x-auto border-b">
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gray-100 border flex items-center justify-center mx-auto overflow-hidden">{photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <b>U</b>}</div><p className="text-[10px] mt-1">You</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">C</div></div><p className="text-[10px] mt-1">ChitPix</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">M</div></div><p className="text-[10px] mt-1">My Work</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">T</div></div><p className="text-[10px] mt-1">Travel</p></div>
        </div>

        {posts.map((p,i)=>(
          <div key={p.id} className="border-b">
            {/* TOP - like your screenshot */}
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">{p.avatar && <img src={p.avatar} className="w-full h-full object-cover" alt=""/>}</div>
              <div className="flex-1 leading-tight">
                <p className="font-bold text-[14px]">{p.username}</p>
                <p className="text-[11px] flex items-center gap-1">♫ {p.music || "Original audio"}</p>
              </div>
              <button className="px-3 py-1 bg-gray-100 rounded-full text-[13px] font-bold">Follow</button>
              <button className="text-lg ml-1">☰</button>
            </div>

            <div className="bg-black w-full aspect-square overflow-hidden relative">
              <img src={p.image} alt="" className="w-full h-full object-cover" onDoubleClick={()=>handleLike(i)} />
              <button className="absolute bottom-3 right-3 bg-black/60 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">🔇</button>
            </div>

            {/* POST KINDA ICONS WITH COUNTS - LIKE YOUR PHOTO */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-4">
                <button onClick={()=>handleLike(i)} className="flex items-center gap-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={p.liked?"black":"none"} stroke="black" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span className="text-[14px]">{p.likes>=1000? (p.likes/1000).toFixed(1)+'K' : p.likes}</span>
                </button>
                <button className="flex items-center gap-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-[14px]">{p.comments}</span>
                </button>
                <button className="flex items-center gap-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  <span className="text-[14px]">{p.shares}</span>
                </button>
                <button className="flex items-center gap-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-[14px]">{p.saves>=1000? (p.saves/1000).toFixed(1).replace('.0','')+','+(p.saves%1000).toString().padStart(3,'0') : p.saves}</span>
                </button>
                <button className="ml-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <div className="mt-2">
                <p className="text-[14px] leading-tight"><span className="font-bold">{p.username}</span> {p.caption}</p>
                <p className="text-[13px] text-gray-500 mt-1">{p.time} • <span className="text-black font-medium">See translation</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl p-4"><div className="flex justify-between mb-3"><b>New Post</b><button onClick={()=>setShowCreate(false)}>X</button></div><label className="border-2 border-dashed rounded-xl h-60 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer">{newImage? <img src={newImage} className="w-full h-full object-cover" alt=""/> : <span className="text-sm text-gray-500">Tap to upload</span>}<input type="file" accept="image/*" hidden onChange={(e:any)=>{const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=()=>setNewImage(r.result as string); r.readAsDataURL(f)}}} /></label><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="caption..." className="w-full border p-3 rounded-lg mt-3 text-sm"/><button onClick={handleCreate} className="w-full bg-black text-white py-3 rounded-lg font-bold mt-3">Share</button></div>
        </div>
      )}

      {/* BOTTOM 5 ICONS - EXACT LIKE YOUR PHOTO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
        <div className="max-w-md mx-auto flex justify-between items-center px-2 py-2">
          {/* Home active pill */}
          <Link href="/" className="bg-gray-100 px-6 py-2 rounded-full flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="black"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10" fill="white"/></svg>
          </Link>
          <Link href="/reels" className="w-11 h-11 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="4"/><polygon points="10 8 16 12 10 16 10 8" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/" className="w-11 h-11 flex items-center justify-center relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
          <Link href="/search" className="w-11 h-11 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </Link>
          <Link href="/profile" className="w-11 h-11 flex items-center justify-center relative">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">{photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : "M"}</div>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
        </div>
      </div>

    </div>
  )
      }
