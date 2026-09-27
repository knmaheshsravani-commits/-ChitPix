"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [posts, setPosts] = useState<any[]>([])
  const [newPost, setNewPost] = useState("")

  async function loadPosts() {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
    if (data) setPosts(data)
  }

  useEffect(() => { loadPosts() }, [])

  async function addPost() {
    if (!newPost.trim()) return
    await supabase.from("posts").insert({ content: newPost, username: "@knmahesh30", likes: 0 })
    setNewPost("")
    loadPosts()
  }

  async function likePost(p: any) {
    await supabase.from("posts").update({ likes: (p.likes || 0) + 1 }).eq("id", p.id)
    loadPosts()
  }

  async function commentPost(p: any) {
    const txt = prompt("Comment pettu bro 💬:")
    if (!txt) return
    const { error } = await supabase.from("comments").insert({
      post_id: p.id,
      content: txt,
      username: "@knmahesh30"
    })
    if (error) alert(error.message)
    else alert("Comment Added ✅ - Supabase lo save ayyindi!")
  }

  function sharePost(p: any) {
    if (navigator.share) {
      navigator.share({ title: "ChitPix", text: p.content })
    } else {
      navigator.clipboard.writeText(p.content)
      alert("Copied! Share chesko bro!")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 border-b sticky top-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{color: "#a855f7"}}>ChitPix</h1>
        <button onClick={addPost} className="bg-black text-white w-8 h-8 rounded-full">+</button>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-6">
          <input value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Em undi bro?" className="flex-1 p-3 rounded-xl bg-zinc-100 outline-none border" />
          <button onClick={addPost} className="bg-black text-white px-6 rounded-xl">Post</button>
        </div>

        {posts.map((p) => (
          <div key={p.id} className="border-b py-4">
            <div className="font-bold text-sm">@{p.username || "knmahesh30"}</div>
            <div className="my-2">{p.content}</div>
            <div className="flex gap-4 text-sm">
              <button onClick={()=>likePost(p)}>❤️ {p.likes || 0}</button>
              <button onClick={()=>commentPost(p)}>💬 Comment</button>
              <button onClick={()=>sharePost(p)}>↗️ Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
