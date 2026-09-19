"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Home, Search, Clapperboard, User, Heart, MessageCircle, Send, Plus, LogOut } from "lucide-react"

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
  const [following,setFollowing]=useState<Set<string>>(new Set())
  const [showHeart,setShowHeart]=useState<string|null>(null)

  useEffect(()=>{supabase.auth.getUser().then((d)=>{setUser(d.data.user); getPosts()})},[])

  async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data) setPosts(data)}
  async function signup(){const {error}=await supabase.auth.signUp({email,password:pass}); if(error) alert(error.message); else alert("Check email!")}
  async function login(){const {error}=await supabase.auth.signInWithPassword({email,password:pass}); if(error) alert(error.message); else {const {data}=await supabase.auth.getUser(); setUser(data.user); getPosts()}}
  async function logout(){await supabase.auth.signOut(); setUser(null)}

  function likePost(id:string){
    if(liked.has(id)){const n=new Set(liked); n.delete(id); setLiked(n)}
    else{const n=new Set(liked); n.add(id); setLiked(n); setShowHeart(id); setTimeout(()=>setShowHeart(null),800)}
  }
  function followUser(id:string){if(following.has(id)){const n=new Set(following); n.delete(id); setFollowing(n)} else {const n=new Set(following); n.add(id); setFollowing(n)}}
  function sharePost(url:string){if(navigator.share) navigator.share({title:"ChitPix",url}); else {navigator.clipboard.writeText(url); alert("Link copied!")}}
  async function postNow(){
    if(!file) return alert("File select chey bro!");
    const fileName=Date.now()+"-"+file.name;
    const {error}=await supabase.storage.from("posts").upload(fileName,file);
    if(error) return alert(error.message);
    const {data}=supabase.storage.from("posts").getPublicUrl(fileName);
    await supabase.from("posts").insert({image:data.publicUrl, caption, user_id:user.id, username:user.email?.split("@")[0]});
    setCaption(""); setFile(null); setTab("home"); getPosts();
  }

  if(!user) return(
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[350px] border border-zinc-800 p-8 text-center">
        <h1 className="text-4xl font-serif mb-6">ChitPix</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 bg-zinc-900 border border-zinc-700 text-sm"/>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full p-2 mb-4 bg-zinc-900 border border-zinc-700 text-sm"/>
        <button onClick={login} className="w-full bg-blue-500 py-1.5 rounded text-sm font-semibold mb-2">Log in</button>
        <button onClick={signup} className="w-full border border-zinc-700 py-1.5 rounded text-sm">Sign up</button>
      </div>
    </div>
  )

  return(
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black border-b border-zinc-800 flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-serif tracking-tight">ChitPix</h1>
        <div className="flex gap-4"><Plus onClick={()=>setTab("create")} className="w-5 h-5 cursor-pointer"/><LogOut onClick={logout} className="w-5 h-5 cursor-pointer"/></div>
      </div>

      <div className="max-w-[470px] mx-auto">
        {tab==="home"&&<div>
          {posts.map((p:any)=>
            <div key={p.id} className="border-b border-zinc-800 pb-3">
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-zinc-700"></div><span className="text-sm font-semibold">{p.username||"mahesh123"}</span></div>
                <button onClick={()=>followUser(p.id)} className={`text-xs font-bold px-3 py-1 rounded-full ${following.has(p.id)?"bg-zinc-800 text-white":"bg-white text-black"}`}>{following.has(p.id)?"Following":"Follow"}</button>
              </div>
              <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden" onDoubleClick={()=>likePost(p.id)}>
                <img src={p.image||p.image_url} className="w-full h-full object-cover"/>
                {showHeart===p.id&&<div className="absolute inset-0 flex items-center justify-center text-7xl animate-pulse">❤️</div>}
              </div>
              <div className="flex gap-4 px-3 pt-3">
                <Heart onClick={()=>likePost(p.id)} className={`w-6 h-6 cursor-pointer ${liked.has(p.id)?"fill-red-500 text-red-500":""}`}/>
                <MessageCircle className="w-6 h-6"/><Send onClick={()=>sharePost(p.image)} className="w-6 h-6"/>
              </div>
              <div className="px-3 pt-2 text-sm"><span className="font-bold">{p.likes? p.likes + (liked.has(p.id)?1:0) : (liked.has(p.id)?19:18)} likes</span><div><span className="font-bold mr-2">{p.username||"mahesh123"}</span>{p.caption||"Live like a wolf"}</div></div>
            </div>
          )}
        </div>}

        {tab==="search"&&<div className="p-4"><input placeholder="Search..." className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg"/></div>}
        {tab==="reels"&&<div className="p-2 grid gap-2">{posts.map((p:any)=><div key={p.id} className="aspect-[9/16] bg-zinc-900 rounded-lg overflow-hidden"><img src={p.image} className="w-full h-full object-cover"/></div>)}</div>}
        {tab==="profile"&&<div className="p-6 text-center"><div className="w-20 h-20 bg-zinc-700 rounded-full mx-auto mb-3"></div><p className="font-bold">{user.email}</p><p className="text-sm text-zinc-400">{posts.length} posts</p></div>}
        {tab==="create"&&<div className="p-6"><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-3 w-full text-sm"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a caption..." className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded mb-3"/><button onClick={postNow} className="w-full bg-white text-black py-2 rounded font-bold">Share</button></div>}
      </div>

      {/* Bottom Nav - No Gap */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around py-3 z-20 max-w-[470px] mx-auto">
        <Home onClick={()=>setTab("home")} className={`w-6 h-6 cursor-pointer ${tab==="home"?"text-white":"text-zinc-500"}`}/>
        <Search onClick={()=>setTab("search")} className={`w-6 h-6 cursor-pointer ${tab==="search"?"text-white":"text-zinc-500"}`}/>
        <Clapperboard onClick={()=>setTab("reels")} className={`w-6 h-6 cursor-pointer ${tab==="reels"?"text-white":"text-zinc-500"}`}/>
        <User onClick={()=>setTab("profile")} className={`w-6 h-6 cursor-pointer ${tab==="profile"?"text-white":"text-zinc-500"}`}/>
      </div>
    </div>
  )
              }
