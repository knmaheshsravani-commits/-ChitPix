"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import BottomNav from "./components/BottomNav"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newImage, setNewImage] = useState("")
  const [caption, setCaption] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("Knmahesh")
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [stories, setStories] = useState<any[]>([])

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved){
      setPosts(JSON.parse(saved))
    } else {
      setPosts([
        {id:1, image:"https://picsum.photos/600/800?random=5", username:"memer_ipothaa", music:"Anirudh Ravicha...", caption:"ela ipov... more", likes:20700, comments:76, shares:81, saves:7432, liked:false, following:false, time:"21 hours ago", avatar:""},
        {id:2, image:"https://picsum.photos/800/600?random=10", username:"memer_ipothaa", music:"Sunset Vibes", caption:"Sunset", likes:20800, comments:76, shares:81, saves:74432, liked:true, following:false, time:"21 hours ago", avatar:""},
      ])
    }
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
    const savedStories = JSON.parse(localStorage.getItem("chitpix_stories") || "[]")
    const now = Date.now()
    const valid = savedStories.filter((s:any)=> now - s.time < 24*60*60*1000)
    localStorage.setItem("chitpix_stories", JSON.stringify(valid))
    setStories(valid)
  },[])

  const savePosts = (v:any[])=>{
    setPosts(v)
    localStorage.setItem("posts", JSON.stringify(v))
  }

  const handleLike = (i:number)=>{
    const u=[...posts]
    u[i].liked =!u[i].liked
    u[i].likes += u[i].liked? 1 : -1
    savePosts(u)
  }

  const handleFollow = (i:number)=>{
    const u=[...posts]
    u[i].following =!u[i].following
    savePosts(u)
  }

  const handleCreate = ()=>{
    if(!newImage){ alert("Photo select chey"); return }
    const newPost = {
      id: Date.now(), image: newImage, username, music:"Original audio", caption, likes:0, comments:0, shares:0, saves:0, liked:false, following:false, time:"Just now", avatar:photo
    }
    savePosts([newPost,...posts])
    const newStory = {id: Date.now(), time: Date.now()}
    const all = [...stories, newStory]
    localStorage.setItem("chitpix_stories", JSON.stringify(all))
    setStories(all)
    setNewImage(""); setCaption(""); setShowCreate(false)
  }

  const handleDelete = (i:number)=>{
    if(confirm("Delete post?")){
      const u=[...posts]
      u.splice(i,1)
      savePosts(u)
      setShowMenu(null)
    }
  }

  const hasStory = stories.length > 0

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <div className="max-w-md mx-auto bg-white pb-[140px]">

        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h1 className="font-black text-[22px]">ChitPix</h1>
          <div className="flex gap-3 items-center">
            {/* DM ICON ADDED */}
            <Link href="/messages" className="w-8 h-8 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </Link>
            <button onClick={()=>setShowCreate(true)} className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center text-xl">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden block">
              {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center font-bold">M</div>}
            </Link>
          </div>
        </div>

        <div className="flex gap-4 px-4 py-3 overflow-x-auto border-b">
          <div className="text-center min-w-[60px]">
            <div className={`w-14 h-14 rounded-full p-[2px] mx-auto ${hasStory? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-gray-200'}`}>
              <div className="bg-white w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <b>M</b>}
              </div>
            </div>
            <p className="text-[10px] mt-1">You</p>
          </div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">C</div></div><p className="text-[10px] mt-1">ChitPix</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">M</div></div><p className="text-[10px] mt-1">My Work</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">T</div></div><p className="text-[10px] mt-1">Travel</p></div>
        </div>

        {posts.map((p,i)=>(
          <div key={p.id} className="border-b relative">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">{p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt=""/> : (photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : null)}</div>
              <div className="flex-1 leading-tight">
                <p className="font-bold text-[14px]">{p.username}</p>
                <p className="text-[11px] flex items-center gap-1">♫ {p.music}</p>
              </div>
              <button onClick={()=>handleFollow(i)} className={`px-4 py-1 rounded-full text-[13px] font-bold transition ${p.following? 'bg-black text-white' : 'bg-gray-100'}`}>
                {p.following? 'Following' : 'Follow'}
              </button>
              <button onClick={()=>setShowMenu(showMenu===i? null : i)} className="w-8 h-8 flex items-center justify-center text-xl font-bold">⋮</button>
            </div>

            {showMenu===i && (
              <div className="absolute right-3 top-12 bg-white border rounded-2xl shadow-2xl z-30 w-56 overflow-hidden">
                <button onClick={()=>{handleFollow(i); setShowMenu(null)}} className="w-full text-left px-4 py-3.5 text-[14px] hover:bg-gray-50 border-b">{p.following? 'Unfollow' : 'Follow'} {p.username}</button>
                <button onClick={()=>{navigator.clipboard.writeText(p.image); alert("Link copied!"); setShowMenu(null)}} className="w-full text-left px-4 py-3.5 text-[14px] hover:bg-gray-50 border-b">🔗 Copy link</button>
                <button onClick={()=>{alert("Reported"); setShowMenu(null)}} className="w-full text-left px-4 py-3.5 text-[14px] hover:bg-gray-50 border-b text-red-500">Report</button>
                {p.username===username && <button onClick={()=>handleDelete(i)} className="w-full text-left px-4 py-3.5 text-[14px] hover:bg-gray-50 text-red-500 font-bold">Delete post</button>}
                <button onClick={()=>setShowMenu(null)} className="w-full py-3 text-[14px] bg-gray-100 font-medium">Cancel</button>
              </div>
            )}

            <div className="bg-black w-full aspect-square overflow-hidden">
              <img src={p.image} alt="" className="w-full h-full object-cover" onDoubleClick={()=>handleLike(i)} />
            </div>

            <div className="px-3 py-3">
              <div className="flex items-center gap-5">
                <button onClick={()=>handleLike(i)} className="flex items-center gap-1.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={p.liked? "#ff3040" : "none"} stroke={p.liked? "#ff3040" : "black"} strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span className="text-[14px] font-medium">{p.likes>=1000? (p.likes/1000).toFixed(1)+'K' : p.likes}</span>
                </button>

                {/* ✅ COMMENT FIX - POST PAGE KI VELTHUNDI */}
                <button onClick={()=>window.location.href=`/post/${p.id}`} className="flex items-center gap-1.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-[14px]">{p.comments}</span>
                </button>

                {/* ✅ SHARE FIX - MESSAGES KI VELTHUNDI */}
                <button onClick={()=>{
                  localStorage.setItem("chitpix_shared_post", JSON.stringify(p))
                  const updated=[...posts]
                  updated[i].shares += 1
                  savePosts(updated)
                  window.location.href="/messages"
                }} className="flex items-center gap-1.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span className="text-[14px]">{p.shares}</span>
                </button>

                <button className="ml-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <div className="mt-2">
                <p className="text-[14px]"><span className="font-bold">{p.username}</span> {p.caption}</p>
                <p className="text-[13px] text-gray-500 mt-1">{p.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl p-4">
            <div className="flex justify-between mb-3"><b>New Post</b><button onClick={()=>setShowCreate(false)}>X</button></div>
            <label className="border-2 border-dashed rounded-xl h-60 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer">
              {newImage? <img src={newImage} className="w-full h-full object-cover" alt=""/> : <span className="text-sm text-gray-500">Tap to upload</span>}
              <input type="file" accept="image/*" hidden onChange={(e:any)=>{const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=()=>setNewImage(r.result as string); r.readAsDataURL(f)}}} />
            </label>
            <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="caption..." className="w-full border p-3 rounded-lg mt-3 text-sm"/>
            <button onClick={handleCreate} className="w-full bg-black text-white py-3 rounded-lg font-bold mt-3">Share</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
              }
