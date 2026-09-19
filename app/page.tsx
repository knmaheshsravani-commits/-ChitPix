"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ChitPix(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [user,setUser]=useState<any>(null)
  const [email,setEmail]=useState("")
  const [pass,setPass]=useState("")
  const [caption,setCaption]=useState("")
  const [file,setFile]=useState<File|null>(null)
  const [liked,setLiked]=useState<Set<string>>(new Set())
  const [story,setStory]=useState<string|null>(null)

  useEffect(()=>{supabase.auth.getUser().then(d=>{setUser(d.data.user); getPosts()})},[])
  async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data) setPosts(data)}
  async function login(){const {error}=await supabase.auth.signInWithPassword({email,password:pass}); if(error) alert(error.message); else{const {data}=await supabase.auth.getUser(); setUser(data.user); getPosts()}}
  async function logout(){await supabase.auth.signOut(); setUser(null)}
  async function signup(){const {error}=await supabase.auth.signUp({email,password:pass}); if(error) alert(error.message); else alert("Email check chey bro!")}
  function likePost(id:string){ const n=new Set(liked); liked.has(id)?n.delete(id):n.add(id); setLiked(n)}
  async function postNow(){
    if(!file) return alert("Photo select chey!");
    const name=Date.now()+"-"+file.name
    const {error}=await supabase.storage.from("posts").upload(name,file)
    if(error) return alert(error.message)
    const {data}=supabase.storage.from("posts").getPublicUrl(name)
    await supabase.from("posts").insert({image:data.publicUrl,caption,user_id:user.id,username:user.email.split("@")[0]})
    setCaption(""); setFile(null); setTab("home"); getPosts()
  }

  if(!user) return(
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[350px] border border-zinc-800 p-8 text-center">
        <h1 className="text-4xl font-serif mb-6">ChitPix 📸</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 bg-zinc-900 border border-zinc-700 text-sm"/>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full p-2 mb-4 bg-zinc-900 border border-zinc-700 text-sm"/>
        <button onClick={login} className="w-full bg-blue-500 py-1.5 rounded text-sm font-semibold mb-2">Log in</button>
        <button onClick={signup} className="w-full border border-zinc-700 py-1.5 rounded text-sm">Sign up</button>
      </div>
    </div>
  )

  return(
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 bg-black border-b border-zinc-800 flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-serif">ChitPix 📸</h1>
        <div className="flex gap-3"><button onClick={()=>setTab("create")} className="w-8 h-8 bg-orange-500 rounded-full font-bold">+</button><button onClick={logout} className="text-xs bg-zinc-800 px-3 py-1 rounded-full">Logout</button></div>
      </div>

      <div className="max-w-[470px] mx-auto pb-20">
        {/* STORY BAR - INSTA STYLE */}
        {tab==="home"&&(
          <div className="flex gap-4 p-3 overflow-x-auto border-b border-zinc-800">
            <div className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl">+</div><span className="text-[10px] mt-1">Your Story</span></div>
            {posts.map((p:any)=>
              <div key={"s"+p.id} onClick={()=>setStory(p.image)} className="flex flex-col items-center min-w-[60px] cursor-pointer">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"><img src={p.image} className="w-full h-full rounded-full object-cover border-2 border-black"/></div>
                <span className="text-[10px] mt-1 truncate w-[60px] text-center">{p.username||"mahesh"}</span>
              </div>
            )}
          </div>
        )}

        {tab==="home"&&posts.map((p:any)=>
          <div key={p.id} className="border-b border-zinc-800 pb-3">
            <div className="flex justify-between items-center p-3"><div className="flex items-center gap-2"><img src={p.image} className="w-8 h-8 rounded-full object-cover"/><span className="text-sm font-semibold">{p.username||"mahesh123"}</span></div><span className="text-xs">•••</span></div>
            <div className="w-full aspect-square bg-zinc-900"><img src={p.image} className="w-full h-full object-cover"/></div>
            <div className="flex gap-4 px-3 pt-3 text-xl"><span onClick={()=>likePost(p.id)}>{liked.has(p.id)?"❤️":"🤍"}</span><span>💬</span><span>📤</span></div>
            <div className="px-3 pt-2 text-sm"><span className="font-bold">{23 + (liked.has(p.id)?1:0)} likes</span><div><span className="font-bold mr-2">{p.username||"mahesh123"}</span>{p.caption}</div></div>
          </div>
        )}

        {/* REELS PAGE - FULL SCREEN SWIPE */}
        {tab==="reels"&&(
          <div className="h-[calc(100vh-110px)] overflow-y-scroll snap-y snap-mandatory bg-black">
            {posts.map((p:any)=>
              <div key={p.id} className="h-[calc(100vh-110px)] snap-start relative bg-black">
                <img src={p.image} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10"></div>
                <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-between items-end">
                  <div><p className="font-bold text-[15px]">@{p.username||"mahesh123"}</p><p className="text-sm mt-1">{p.caption}</p><p className="text-xs mt-2 opacity-70">🎵 Original Audio - ChitPix</p></div>
                  <div className="flex flex-col gap-5 items-center"><span className="text-2xl">❤️</span><span className="text-2xl">💬</span><span className="text-2xl">📤</span><img src={p.image} className="w-8 h-8 rounded-full border-2 border-white"/></div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="search"&&<div className="p-4"><input placeholder="Search ChitPix..." className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg"/></div>}
        {tab==="profile"&&<div className="p-6 text-center"><img src={posts[0]?.image} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"/><p className="font-bold">{user.email}</p><p className="text-sm text-zinc-400">{posts.length} posts</p><div className="grid grid-cols-3 gap-1 mt-6">{posts.map((p:any)=><img key={p.id} src={p.image} className="aspect-square object-cover"/>)}</div></div>}
        {tab==="create"&&<div className="p-6"><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-4 w-full text-sm"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded mb-3"/><button onClick={postNow} className="w-full bg-white text-black py-2 rounded font-bold">Share to ChitPix</button></div>}
      </div>

      {story&&<div onClick={()=>setStory(null)} className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"><img src={story} className="max-w-full max-h-full rounded-lg"/><div className="absolute top-4 right-4 text-2xl">✕</div><div className="absolute top-2 left-2 right-2 h-1 bg-zinc-700 rounded"><div className="h-full w-full bg-white rounded animate-pulse"></div></div></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-700 flex justify-around py-2.5 max-w-[470px] mx-auto z-20">
        <div onClick={()=>setTab("home")} className="flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[10px]">Home</span></div>
        <div onClick={()=>setTab("search")} className="flex flex-col items-center"><span className="text-xl">🔍</span><span className="text-[10px]">Search</span></div>
        <div onClick={()=>setTab("reels")} className="flex flex-col items-center"><span className="text-xl">🎬</span><span className="text-[10px]">Reels</span></div>
        <div onClick={()=>setTab("profile")} className="flex flex-col items-center"><span className="text-xl">👤</span><span className="text-[10px]">Profile</span></div>
      </div>
    </div>
  )
        }
