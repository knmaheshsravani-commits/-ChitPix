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
    if(saved) setPosts(JSON.parse(saved))
    else setPosts([
      {id:1, image:"https://picsum.photos/600/800?random=5", username:"memer_ipothaa", music:"Anirudh Ravicha...", caption:"ela ipov... more", likes:20700, comments:76, shares:81, saves:7432, liked:false, time:"21 hours ago", avatar:""},
      {id:2, image:"https://picsum.photos/800/600?random=10", username:"memer_ipothaa", music:"Sunset Vibes", caption:"Sunset 🌅", likes:20800, comments:76, shares:81, saves:74432, liked:true, time:"21 hours ago", avatar:""},
    ])
    const p = localStorage.getItem("chitpix_profile_photo"); if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username"); if(n) setUsername(n)
  },[])

  const savePosts = (v:any[])=>{ setPosts(v); localStorage.setItem("posts", JSON.stringify(v)) }
  const handleLike = (i:number)=>{ const u=[...posts]; u[i].liked=!u[i].liked; u[i].likes+= u[i].liked?1:-1; savePosts(u) }
  const handleCreate = ()=>{ if(!newImage) return alert("Photo select chey"); savePosts([{id:Date.now(), image:newImage, username, music:"Original audio", caption, likes:0, comments:0, shares:0, saves:0, liked:false, time:"Just now", avatar:photo},...posts]); setNewImage(""); setCaption(""); setShowCreate(false) }

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
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gray-100 border flex items-center justify-center mx-auto overflow-hidden">{photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <b>U</b>}</div><p className="text-[10px] mt-1">You</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">C</div></div><p className="text-[10px] mt-1">ChitPix</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">M</div></div><p className="text-[10px] mt-1">My Work</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold">T
