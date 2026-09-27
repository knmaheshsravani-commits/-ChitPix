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
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [search, setSearch] = useState("")

  async function load() {
    const { data: p } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
    const { data: c } = await supabase.from("comments").select("*")
    if (p) setPosts(p)
    if (c) setComments(c)
  }
  useEffect(() => { load() }, [])

  async function addPost() {
    if (!text.trim()) return
    await supabase.from("posts").insert({ content: text, username: "You", likes: 0 })
    setText(""); load()
  }
  async function likePost(p: any) {
    await supabase.from("posts").update({ likes: (p.likes||0)+1 }).eq("id", p.id)
    load()
  }
  async function commentPost(p: any) {
    const t = prompt("Comment pettu bro 💬:")
    if (!t) return
    await supabase.from("comments").insert({ post_id: p.id, content: t, username: "You" })
    load()
  }
  function sharePost(p: any) {
    navigator.clipboard.writeText(p.content)
    alert("Link Copied! Share chey bro ✅")
  }

  const filtered = posts.filter(p=> p.content.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* Header - FULL WHITE */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-[22px] font-extrabold text-purple-500">ChitPix</h1>
        <button onClick={()=>{const t=prompt("Post pettu bro"); if(t){setText(t); setTimeout(addPost,100)}}} className="w-8 h-8 bg-black text-white rounded-full font-bold">+</button>
      </div>

      {/* Post Input */}
      <div className="p-4 border-b bg-white">
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro?" className="flex-1 p-3 rounded-xl bg-[#f2f2f2] outline-none text-[15px]" />
          <button onClick={addPost} className="bg-black text-white px-6 rounded-xl font-bold">Post</button>
        </div>
      </div>

      {/* TABS CONTENT */}
      <div className="pb-[80px]">
        {tab==="home" && (
          <div>
            {filtered.length===0? <p className="text-center text-zinc-400 mt-20">No posts yet bro - nuvve first post pettu!</p> :
            filtered.map(p=>(
              <div key={p.id} className="px-4 py-4 border-b border-zinc-100">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold text-xs">Y</div>
                  <div className="font-bold text-[14px]">{p.username}</div>
                  <div className="text-[11px] text-zinc-400">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div className="my-3 text-[15px] leading-6">{p.content}</div>
                <div className="flex gap-6 text-[14px] mt-2">
                  <button onClick={()=>likePost(p)} className="flex gap-1 items-center">❤️ <span className="font-bold">{p.likes||0}</span> <span className="text-zinc-500 text-xs">Likes</span></button>
                  <button onClick={()=>commentPost(p)} className="flex gap-1 items-center">💬 <span className="font-bold">{comments.filter(c=>c.post_id===p.id).length}</span> <span className="text-zinc-500 text-xs">Comments</span></button>
                  <button onClick={()=>sharePost(p)} className="flex gap-1 items-center">↗️ <span className="text-zinc-500 text-xs">Share</span></button>
                </div>
                {/* Show comments */}
                {comments.filter(c=>c.post_id===p.id).map(c=>(
                  <div key={c.id} className="mt-2 ml-2 p-2 bg-zinc-50 rounded-lg text-[13px]"><b>{c.username}:</b> {c.content}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab==="search" && (
          <div className="p-4">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts..." className="w-full p-3 rounded-xl bg-[#f2f2f2] outline-none mb-4" />
            {filtered.map(p=>(
              <div key={p.id} className="border-b py-3">{p.content} - <span className="text-xs text-zinc-400">{p.username}</span></div>
            ))}
            {filtered.length===0 && <p className="text-center text-zinc-400 mt-10">No results bro</p>}
          </div>
        )}

        {tab==="reels" && (
          <div className="p-4">
            <p className="text-center text-zinc-400 mt-20">🎬 Reels - Videos add cheddam next bro!<br/>Ippudu posts reels laga chudu</p>
            {posts.map(p=>(
              <div key={p.id} className="bg-black text-white rounded-2xl p-4 my-3">{p.content}</div>
            ))}
          </div>
        )}

        {tab==="likes" && (
          <div className="p-4">
            <h2 className="font-bold mb-4">Liked Posts ❤️</h2>
            {posts.filter(p=>p.likes>0).map(p=>(
              <div key={p.id} className="border-b py-3">❤️ {p.content} - {p.likes} likes</div>
            ))}
          </div>
        )}

        {tab==="profile" && (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-purple-500 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">M</div>
            <h2 className="font-bold text-lg mt-3">@knmahesh30</h2>
            <p className="text-zinc-500 text-sm">Mahesh - ChitPix Creator</p>
            <div className="flex justify-around mt-6 border-t border-b py-4">
              <div><div className="font-bold">{posts.length}</div><div className="text-xs text-zinc-500">Posts</div></div>
              <div><div className="font-bold">{comments.length}</div><div className="text-xs text-zinc-500">Comments</div></div>
              <div><div className="font-bold">1.2k</div><div className="text-xs text-zinc-500">Followers</div></div>
            </div>
            <button onClick={()=>alert("Edit Profile - Coming Soon!")} className="mt-6 w-full border rounded-xl py-2 font-bold">Edit Profile</button>
          </div>
        )}
      </div>

      {/* Bottom Nav - FULL WHITE */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t flex justify-around py-2 z-20">
        <button onClick={()=>setTab("home")} className={`flex flex-col items-center ${tab==="home"?"text-black":"text-zinc-400"}`}><span className="text-[60px]">🏠</span><span className="text-[20px] font-bold mt-1">Home</span></button>
        <button onClick={()=>setTab("search")} className={`flex flex-col items-center ${tab==="search"?"text-black":"text-zinc-400"}`}><span className="text-[60px]">🔍</span><span className="text-[20px] mt-1">Search</span></button>
        <button onClick={()=>setTab("reels")} className={`flex flex-col items-center ${tab==="reels"?"text-black":"text-zinc-400"}`}><span className="text-[60px]">🎬</span><span className="text-[20px] mt-1">Reels</span></button>
        <button onClick={()=>setTab("likes")} className={`flex flex-col items-center ${tab==="likes"?"text-black":"text-zinc-400"}`}><span className="text-[60px]">❤️</span><span className="text-[20px] mt-1">Likes</span></button>
        <button onClick={()=>setTab("profile")} className={`flex flex-col items-center ${tab==="profile"?"text-black":"text-zinc-400"}`}><span className="text-[60px]">👤</span><span className="text-[20px] mt-1">Profile</span></button>
      </div>
    </div>
  )
      }
