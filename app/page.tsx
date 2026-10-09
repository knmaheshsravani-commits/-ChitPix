"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import BottomNav from "./components/BottomNav"
import PostCard from "./components/PostCard"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState("")
  const [fileData, setFileData] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    if (data) setPosts(data)
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFileData(reader.result as string)
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadToR2 = async () => {
    if (!fileData) return alert("Photo select chey bro!")
    setUploading(true)
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: fileData,
          folder: "posts"
        })
      })
      const { url } = await res.json()

      const { error } = await supabase.from("posts").insert([{
        image_url: url,
        caption: caption,
        username: "knmahesh",
        likes: 0
      }])

      if (error) throw error

      alert("Upload Success bro! 🔥")
      setCaption("")
      setPreview("")
      setFileData("")
      setShowCreate(false)
      fetchPosts()
    } catch (err: any) {
      alert("Error: " + err.message)
    }
    setUploading(false)
  }

  return (
    <div className="w-full bg-black min-h-screen text-white">
      <div className="max-w-md mx-auto bg-black pb-[70px] min-h-screen">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-zinc-800">
          <h1 className="text-xl font-bold tracking-wider">ChitPix</h1>
          <button onClick={() => setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm">+ Create</button>
        </div>

        <div className="flex gap-4 p-3 overflow-x-auto border-b border-zinc-800">
          {["Your Story", "mahesh", "sravani", "chitpix"].map((s, i) => (
            <div key={i} className="flex flex-col items-center min-w-[60px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">{s[0].toUpperCase()}</div>
              </div>
              <span className="text-[11px] mt-1">{s}</span>
            </div>
          ))}
        </div>

        <div className="bg-black">
          {posts.length === 0 && <p className="text-center p-10 text-zinc-500">No posts yet - Create one!</p>}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">New Post</h2>
                <button onClick={() => setShowCreate(false)} className="text-xl">✕</button>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="mb-3 text-sm" />
              {preview && <img src={preview} className="w-full h-64 object-cover rounded-xl mb-3" alt="preview" />}
              <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption..." className="w-full bg-zinc-800 rounded-xl p-3 text-sm outline-none min-h-[80px] mb-3" />
              <button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black font-bold py-3 rounded-full disabled:opacity-50">
                {uploading? "Uploading to R2..." : "Share to ChitPix 🔥"}
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
