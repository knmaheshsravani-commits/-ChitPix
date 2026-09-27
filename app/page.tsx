"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [tab, setTab] = useState("home")
  const [posts, setPosts] = useState<any[]>([])
  const [reels, setReels] = useState<any[]>([])
  const [text, setText] = useState("")
  const [reelUrl, setReelUrl] = useState("")

  async function load() {
    const { data: p } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
    const { data: r } = await supabase.from("reels").select("*").order("created_at", { ascending: false })
    if (p) setPosts(p)
    if (r) setReels(r)
  }
  useEffect(() => { load() }, [])

  async function addPost() {
    if (!text.trim()) return
    await supabase.from("posts").insert({ content: text, username: "You", likes: 0 })
    setText(""); load()
  }
  async function addReel() {
    if (!reelUrl.trim()) return alert("Video URL pettu bro!")
    await supabase.from("reels").insert({ video_url: reelUrl, caption: text, username: "You" })
    setReelUrl(""); setText(""); load(); setTab("reels")
  }
  async function likePost(p: any) {
    await supabase.from("posts").update({ likes: (p.likes||0)+1 }).eq("id", p.id)
    load()
  }
  async function commentPost(p: any) {
    const t = prompt("Comment pettu bro 💬:")
    if (!t) return
    const { error } = await supabase.from("comments").insert({ post_id: p.id, content: t, username: "You" })
    if (error) alert(error.message)
    else alert("Comment Added ✅")
  }
  function sharePost(p: any) {
    navigator.clipboard.writeText(p.content)
    alert("Copied! Share chey bro!")
  }

  return (
    <div className="max-w-[430px] mx-auto bg-white text-black min-h-screen pb-[70px] relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{color: "#a855f7"}}>ChitPix</h1>
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">+</div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white">
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro?" className="flex-1 p-3 rounded-xl bg-zinc-100 outline-none border" />
          <button onClick={addPost} className="bg-black text-white px-6 rounded-xl font-bold">Post</button>
        </div>
        {tab==="reels" && (
          <input value={reelUrl} onChange={e=>setReelUrl(e.target.value)} placeholder="Reel Video URL (mp4 link)" className="w-full mt-2 p-3 rounded-xl bg-zinc-100 outline-none border" />
        )}
        {tab==="reels" && <button onClick={addReel} className="w-full mt-2 bg-purple-600 text-white py-2 rounded-xl">Add Reel</button>}
      </div>

      {/* Content */}
      <div className="p-4">
        {tab==="home" && posts.map(p=>(
          <div key={p.id} className="border-b py-4">
            <div className="font-bold text-sm">@{p.username}</div>
            <div className="my-2">{p.content}</div>
            <div className="flex gap-5 text-[15px] mt-2">
              <button onClick={()=>likePost(p)}>❤️ {p.likes||0}</button>
              <button onClick={()=>commentPost(p)}>💬 Comment</button>
              <button onClick={()=>sharePost(p)}>↗️ Share</button>
            </div>
          </div>
        ))}
        {tab==="reels" && reels.map(r=>(
          <div key={r.id} className="border rounded-2xl mb-4 overflow-hidden bg-black">
            <video src={r.video_url} controls className="w-full" />
            <div className="p-3 bg-white text-black">{r.caption}</div>
          </div>
        ))}
        {tab==="search" && <p className="text-center text-zinc-500 mt-20">🔍 Search - Coming Soon!</p>}
        {tab==="profile" && <p className="text-center text-zinc-500 mt-20">👤 Profile - @knmahesh30<br/>{posts.length} Posts | {reels.length} Reels</p>}
      </div>

      {/* BOTTOM NAV - Icons fix */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t flex justify-around py-3 text-xl">
        <button onClick={()=>setTab("home")} className={tab==="home"?"font-bold":"opacity-60"}>🏠<div className="text-[10px]">Home</div></button>
        <button onClick={()=>setTab("search")} className={tab==="search"?"font-bold":"opacity-60"}>🔍<div className="text-[10px]">Search</div></button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"?"font-bold":"opacity-60"}>🎬<div className="text-[10px]">Reels</div></button>
        <button onClick={()=>setTab("home")} className="opacity-60">❤️<div className="text-[10px]">Likes</div></button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"?"font-bold":"opacity-60"}>👤<div className="text-[10px]">Profile</div></button>
      </div>
    </div>
  )
}
