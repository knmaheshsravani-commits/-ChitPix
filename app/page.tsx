"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ChitPix(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [caption,setCaption]=useState("")
  const [file,setFile]=useState<File|null>(null)
  const [uploading,setUploading]=useState(false)

  useEffect(()=>{ getPosts() },[])
  async function getPosts(){
    const {data} = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(data) setPosts(data)
  }
  async function postNow(){
    if(!file) return alert("File select chey!")
    setUploading(true)
    const name = Date.now()+"-"+file.name
    const {error} = await supabase.storage.from("posts").upload(name, file)
    if(error){ alert(error.message); setUploading(false); return }
    const {data} = supabase.storage.from("posts").getPublicUrl(name)
    await supabase.from("posts").insert([{caption, image_url: data.publicUrl}])
    setCaption(""); setFile(null); setUploading(false); getPosts(); setTab("home")
  }

  return(
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 bg-black border-b border-zinc-800 p-3 flex justify-between">
        <b>ChitPix 📸</b>
        <button onClick={()=>setTab("create")} className="bg-orange-500 px-3 rounded">+</button>
      </div>

      {tab==="home" && <div className="max-w-md mx-auto">{posts.map((p:any)=><div key={p.id} className="border-b border-zinc-800"><img src={p.image_url} className="w-full"/><div className="p-3"><p><b>You</b> {p.caption}</p></div></div>)}</div>}

      {tab==="search" && <div className="p-4 max-w-md mx-auto"><input placeholder="Search..." className="w-full p-2 rounded bg-zinc-900"/><p className="mt-10 text-center text-zinc-500">Search - Next step lo users vastaru</p></div>}

      {tab==="reels" && <div className="p-4 max-w-md mx-auto"><p className="font-bold">Reels (Video)</p>{posts.filter((p:any)=>p.image_url.includes(".mp4")).map((p:any)=><video key={p.id} src={p.image_url} controls className="w-full mt-3 rounded"/>)}<p className="mt-4 text-zinc-500">Video upload chey - Reels lo kanipistundi</p></div>}

      {tab==="profile" && <div className="p-4 max-w-md mx-auto text-center"><div className="w-20 h-20 bg-zinc-700 rounded-full mx-auto"></div><h2 className="mt-2 font-bold">Mahesh - Bijapur</h2><p className="text-sm text-zinc-500">{posts.length} Posts</p><div className="grid grid-cols-3 gap-1 mt-4">{posts.map((p:any)=><img key={p.id} src={p.image_url} className="h-24 object-cover"/>)}</div></div>}

      {tab==="create" && <div className="p-4 max-w-md mx-auto"><input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full bg-zinc-900 p-2 rounded"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-zinc-900 p-2 rounded mt-3"/><button onClick={postNow} className="w-full bg-white text-black p-2 rounded mt-4 font-bold">{uploading?"Uploading...":"Post"}</button></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around py-3">
        <button onClick={()=>setTab("home")} className={tab==="home"?"text-white":"text-zinc-500"}>🏠<br/><span className="text-[10px]">Home</span></button>
        <button onClick={()=>setTab("search")} className={tab==="search"?"text-white":"text-zinc-500"}>🔍<br/><span className="text-[10px]">Search</span></button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"?"text-white":"text-zinc-500"}>🎬<br/><span className="text-[10px]">Reels</span></button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"?"text-white":"text-zinc-500"}>👤<br/><span className="text-[10px]">Profile</span></button>
      </div>
    </div>
  )
}
