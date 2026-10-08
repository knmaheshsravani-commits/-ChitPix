"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

function HeartIcon({filled}:{filled:boolean}){
  return filled? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff3040"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  )
}

export default function HomePage(){
  const [posts,setPosts]=useState<any[]>([])
  const [showCreate,setShowCreate]=useState(false)
  const [newImage,setNewImage]=useState("")
  const [caption,setCaption]=useState("")
  const [photo,setPhoto]=useState("")
  const [username,setUsername]=useState("Knmahesh")

  useEffect(()=>{
    const s=localStorage.getItem("posts")
    if(s) setPosts(JSON.parse(s))
    else setPosts([{id:1,image:"https://picsum.photos/seed/chitpix/800/800",username:"Sravani",caption:"Welcome to ChitPix ✨",likes:128,liked:false,time:"2h ago",avatar:""}])
    const p=localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n=localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
  },[])

  const save=(np:any[])=>{setPosts(np);localStorage.setItem("posts",JSON.stringify(np))}

  const createPost=()=>{
    if(!newImage) return alert("Photo select chey bro")
    const np={id:Date.now(),image:newImage,username,caption,likes:0,liked:false,time:"Just now",avatar:photo}
    save([np,...posts])
    setNewImage("");setCaption("");setShowCreate(false)
  }

  const like=(i:number)=>{
    const cp=[...posts]
    cp[i].liked=!cp[i].liked
    cp[i].likes+= cp[i].liked?1:-1
    save(cp)
  }

  return(
    <div className="min-h-screen bg-white pb-[65px]">
      <div className="max-w-[430px] mx-auto bg-white min-h-screen">

        {/* HEADER - NEW */}
        <div className="flex justify-between items-center px-4 h-[60px] border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <h1 className="font-black text-[22px] tracking-tight">ChitPix</h1>
          <div className="flex items-center gap-3">
            <button onClick={()=>setShowCreate(true)} className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
              {photo?<img src={photo} className="w-full h-full object-cover"/>:<div className="w-full h-full bg-gray-200"/>}
            </Link>
          </div>
        </div>

        {/* STORIES - NEW GRADIENT RING */}
        <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100">
          <div className="flex flex-col items-center min-w-[64px]">
            <div className="w-[62px] h-[62px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-1 ring-gray-200">
              {photo?<img src={photo} className="w-full h-full object-cover"/>:<span className="font-bold text-gray-500">U</span>}
            </div>
            <p className="text-[11px] mt-1.5">You</p>
          </div>
          {[
            {n:"ChitPix",c:"from-yellow-400 to-purple-600"},
            {n:"My Work",c:"from-yellow-400 to-purple-600"},
            {n:"Travel",c:"from-yellow-400 to-purple-600"},
            {n:"Friends",c:"from-yellow-400 to-purple-600"},
          ].map(s=>(
            <div key={s.n} className="flex flex-col items-center min-w-[64px]">
              <div className={`w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr ${s.c}`}>
                <div className="bg-white w-full h-full rounded-full flex items-center justify-center font-bold text-sm">{s.n[0]}</div>
              </div>
              <p className="text-[11px] mt-1.5">{s.n}</p>
            </div>
          ))}
        </div>

        {/* FEED */}
        {posts.map((p,i)=>(
          <div key={p.id} className="border-b border-gray-100">
            <div className="flex items-center gap-2.5 px-3 py-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {p.avatar?<img src={p.avatar} className="w-full h-full object-cover"/>:null}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold leading-none">{p.username}</span>
                <span className="text-[11px] text-gray-400 leading-none mt-1">{p.time}</span>
              </div>
              <button className="ml-auto text-[18px]">•••</button>
            </div>

            <div className="bg-gray-50">
              <img src={p.image} className="w-full aspect-[4/5] object-cover" onDoubleClick={()=>like(i)} alt="post"/>
            </div>

            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-4">
                <button onClick={()=>like(i)}><HeartIcon filled={p.liked}/></button>
                <button><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
                <button><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                <button className="ml-auto"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
              </div>
              <p className="font-bold text-[14px] mt-3">{p.likes} likes</p>
              <p className="text-[14px] leading-[18px] mt-1"><span className="font-semibold">{p.username}</span> {p.caption}</p>
            </div>
          </div>
        ))}

      </div>

      {/* CREATE MODAL - NEW */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-[430px] rounded-t-[24px] sm:rounded-[20px] p-5">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[16px]">Create new post</h3>
              <button onClick={()=>setShowCreate(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">✕</button>
            </div>
            <label className="border border-dashed border-gray-300 rounded-[16px] h-[300px] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-50">
              {newImage?<img src={newImage} className="w-full h-full object-cover"/>:<div className="text-center"><div className="text-3xl">📷</div><p className="text-sm text-gray-500 mt-2">Upload photo</p></div>}
              <input type="file" accept="image/*" hidden onChange={(e)=>{const f=(e.target as any).files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setNewImage(r.result as string); r.readAsDataURL(f)}}}/>
            </label>
            <input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Write a caption..." className="w-full mt-4 px-4 py-3 rounded-xl bg-gray-100 text-sm outline-none"/>
            <button onClick={createPost} className="w-full mt-4 bg-black text-white py-3.5 rounded-full font-semibold text-sm">Share</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - NEW ICONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="max-w-[430px] mx-auto flex justify-around items-center h-[60px] px-2">
          <Link href="/"><svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="white"/></svg></Link>
          <Link href="/search"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></Link>
          <button onClick={()=>setShowCreate(true)}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>
          <Link href="/reels"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><polygon points="23 7 13.5 15.5 8.5 10.5 1 17.5 1 7 23 7"/><path d="M1 17.5v3.5a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-3.5"/></svg></Link>
          <Link href="/profile" className="w-[26px] h-[26px] rounded-full overflow-hidden bg-gray-100 ring-1 ring-black">{photo?<img src={photo} className="w-full h-full object-cover"/>:<div className="w-full h-full bg-gray-200"/>}</Link>
        </div>
      </div>

    </div>
  )
      }
