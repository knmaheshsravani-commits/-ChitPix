"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ChitPix(){
  const [tab, setTab] = useState("home")
  const [posts, setPosts] = useState<any[]>([])
  const [caption, setCaption] = useState("")
  const [file, setFile] = useState<File|null>(null)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(()=>{ fetchPosts() },[])
  async function fetchPosts(){
    const { data } = await supabase.from("posts").select("*").order("created_at", {ascending:false})
    if(data) setPosts(data)
  }

  async function handlePost(){
    if(!file) return alert("File select chey bro!")
    setUploading(true)
    const fileName = `${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from("posts").upload(fileName, file)
    if(upErr){ alert(upErr.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from("posts").getPublicUrl(fileName)
    const type = file.type.startsWith("video") ? "video" : "image"
    await supabase.from("posts").insert([{ caption, image_url: urlData.publicUrl, type }])
    setCaption(""); setFile(null); setUploading(false); fetchPosts(); setTab("home")
  }

  const filtered = posts.filter(p=>p.caption?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* HEADER */}
      <div className="sticky top-0 bg-black border-b border-zinc-800 p-3 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold">ChitPix 📸</h1>
        <button onClick={()=>setTab("create")} className="text-2xl">+</button>
      </div>

      {/* CONTENT */}
      {tab==="home" && (
        <div className="max-w-md mx-auto">
          {posts.map(p=>(
            <div key={p.id} className="border-b border-zinc-800 p-3">
              <p className="font-bold mb-2">mahesh</p>
              {p.type==="video" ? <video src={p.image_url} controls className="w-full rounded" /> : <img src={p.image_url} className="w-full rounded" />}
              <p className="mt-2"><b>mahesh</b> {p.caption}</p>
              <div className="flex gap-4 mt-2 text-zinc-400"><span>❤️ Like</span><span>💬 Comment</span><span>↗️ Share</span></div>
            </div>
          ))}
          {posts.length===0 && <p className="text-center mt-10 text-zinc-500">No posts yet. First post pettu bro!</p>}
        </div>
      )}

      {tab==="search" && (
        <div className="p-4 max-w-md mx-auto">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search captions..." className="w-full p-2 rounded bg-zinc-900 border border-zinc-700"/>
          <div className="grid grid-cols-3 gap-1 mt-4">
            {filtered.map(p=> p.type==="video" ? <video key={p.id} src={p.image_url} className="h-32 object-cover"/> : <img key={p.id} src={p.image_url} className="h-32 object-cover"/>)}
          </div>
        </div>
      )}

      {tab==="reels" && (
        <div className="max-w-md mx-auto snap-y snap-mandatory h-[calc(100vh-110px)] overflow-y-scroll">
          {posts.filter(p=>p.type==="video").map(p=>(
            <div key={p.id} className="h-[calc(100vh-110px)] snap-start relative">
              <video src={p.image_url} autoPlay loop muted className="w-full h-full object-cover"/>
              <div className="absolute bottom-4 left-3"><p className="font-bold">mahesh</p><p>{p.caption}</p></div>
            </div>
          ))}
          {posts.filter(p=>p.type==="video").length===0 && <p className="text-center mt-20 text-zinc-500">No reels yet
