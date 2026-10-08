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

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved){
      setPosts(JSON.parse(saved))
    } else {
      setPosts([
        {id:1, image:"https://picsum.photos/600/800?random=5", username:"memer_ipothaa", music:"Anirudh Ravicha...", caption:"ela ipov... more", likes:20700, comments:76, shares:81, saves:7432, liked:false, time:"21 hours ago", avatar:""},
        {id:2, image:"https://picsum.photos/800/600?random=10", username:"memer_ipothaa", music:"Sunset Vibes", caption:"Sunset", likes:20800, comments:76, shares:81, saves:74432, liked:true, time:"21 hours ago", avatar:""},
      ])
    }
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
  },[])

  const savePosts = (v:any[])=>{
    setPosts(v)
    localStorage.setItem("posts", JSON.stringify(v))
  }

  const handleLike = (i:number)=>{
    const u=[...posts]
    u[i].liked=!u[i].liked
    u[i].likes+= u[i].liked?1:-1
    savePosts(u)
  }

  const handleCreate = ()=>{
    if(!newImage){
      alert("Photo select chey")
      return
    }
    const newPost = {
      id: Date.now(),
      image: newImage,
      username: username,
      music: "Original audio",
      caption: caption,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      liked: false,
      time: "Just now",
      avatar: photo
    }
    savePosts([newPost,...posts])
    setNewImage("")
    setCaption("")
    setShowCreate(false)
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-md mx-auto bg-white pb-[80px]">

        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h1 className="font-black text-[22px]">ChitPix</h1>
          <div className="flex gap-3">
            <button onClick={()=>setShowCreate(true)} className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center text-xl">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden block">
              {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center font-bold">M</div>}
            </Link>
          </div>
        </div>

        <div className="flex gap-4 px-4 py-3 overflow-x-auto border-b">
          <div className="text-center min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-gray-100 border flex items-center justify-center mx-auto overflow-hidden">
              {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <b>U</b>}
            </div>
            <p className="text-[10px] mt-1">You</p>
          </div>
          <div className="text-center min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto">
              <div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">C</div>
            </div>
            <p className="text-[10px] mt-1">ChitPix</p>
          </div>
          <div className="text-center min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto">
              <div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">M</div>
            </div>
            <p className="text-[10px] mt-1">My Work</p>
          </div>
          <div className="text-center min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto">
              <div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">T</div>
            </div>
            <p className="text-[10px] mt-1">Travel</p>
          </div>
        </div>

        {posts.map((p,i)=>(
          <div key={p.id} className="border-b">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt=""/> : (photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : null)}
              </div>
              <div className="flex-1 leading-tight">
                <p className="font-bold text-[14px]">{p.username}</p>
                <p className="text-[11px] flex items-center gap-1">♫ {p.music}</p>
              </div>
              <button className="px-3 py-1 bg-gray-100 rounded-full text-[13px] font-bold">Follow</button>
              <button className="text-lg ml-1">☰</button>
            </div>
            <div className="bg-black w-full aspect-square overflow-hidden">
              <img src={p.image} alt="" className="w-full h-full object-cover" onDoubleClick={()=>handleLike(i)} />
            </div>
            <div className="px-3 py-3">
              <div className="flex items-center gap-4">
                <button onClick={()=>handleLike(i)} className="flex items-center gap-1">
                  <span>{p.liked?"❤️":"🤍"}</span>
                  <span className="text-[14px]">{p.likes}</span>
                </button>
                <span className="text-[14px]">💬 {p.comments}</span>
                <span className="text-[14px]">↗️ {p.shares}</span>
                <span className="ml-auto">🔖</span>
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
              <input type="file" accept="image/*" hidden onChange={(e:any)=>{
                const f=e.target.files[0]
                if(f){
                  const r=new FileReader()
                  r.onload=()=>setNewImage(r.result as string)
                  r.readAsDataURL(f)
                }
              }} />
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
