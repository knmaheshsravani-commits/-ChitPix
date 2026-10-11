"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"
import BottomNav from "./components/BottomNav"

type Post = {
  id: string
  image_url: string
  caption: string
  username: string
  likes: number
  user_photo?: string
  created_at: string
  comments?: number
  type?: string
}

type Story = {
  id: string
  user_id: string
  image_url: string
  created_at: string
  expires_at: string
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [username, setUsername] = useState("knmahesh")
  const [userPhoto, setUserPhoto] = useState("")
  const lastTap = useRef(0)

  // STORIES - KOTHA STATES BRO
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const savedName = localStorage.getItem("chitpix_username")
    const savedPhoto = localStorage.getItem("chitpix_profile_photo")
    if (savedName) setUsername(savedName)
    if (savedPhoto) setUserPhoto(savedPhoto)

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })

    fetchPosts()
    fetchStories()

    const channel = supabase
    .channel("posts_realtime_home_final")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => fetchPosts())
    .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => fetchStories())
    .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(100)
    if (!error && data) setPosts(data as any)
  }

  const fetchStories = async () => {
    const { data } = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false })
    if (data) setStories(data)
  }

  useEffect(() => {
    if (!activeStory) return
    setStoryProgress(0)
    const interval = setInterval(() => {
      setStoryProgress(p => {
        if (p >= 100) {
          setActiveStory(null)
          return 0
        }
        return p + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [activeStory])

  const handleFileChange = (e: any) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const uploadToR2 = async () => {
    if (!file) return alert("Photo/video select chey bro! 📸")
    setUploading(true)
    try {
      const isVideo = file.type.includes("video")
      const folder = isVideo? "reels" : "posts"
      const presignRes = await fetch("/api/r2-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          contentType: file.type,
          folder: folder
        }),
      })
      const presignData = await presignRes.json()
      if (!presignData.uploadUrl ||!presignData.publicUrl) {
        throw new Error(presignData.error || "R2 Presign failed - ENV check chey bro")
      }
      const r2UploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!r2UploadRes.ok) {
        throw new Error("R2 Cloud upload failed: " + r2UploadRes.status + " " + r2UploadRes.statusText)
      }
      const { error } = await supabase.from("posts").insert([
        {
          image_url: presignData.publicUrl,
          caption: caption,
          username: username,
          user_photo: userPhoto,
          likes: 0,
          type: isVideo? "reels" : "post"
        },
      ])
      if (error) throw error
      setCaption("")
      setPreview("")
      setFile(null)
      setShowCreate(false)
      fetchPosts()
      alert(isVideo? "Reel uploaded to R2! 🔥" : "Post uploaded to R2! 🔥")
    } catch (err: any) {
      console.error("Upload error:", err)
      alert("Upload Error: " + err.message)
    }
    setUploading(false)
  }

 // STORIES UPLOAD - FIXED - NO LOGIN NEEDED - R2 CONNECTED
  const handleStoryUpload = async (e: any) => {
    const f = e.target.files[0]
    if (!f) return
    try {
      const presignRes = await fetch("/api/r2-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `story_${Date.now()}_${f.name}`,
          fileType: f.type,
          contentType: f.type,
          folder: "stories"
        }),
      })
      const presignData = await presignRes.json()
      if (!presignData.uploadUrl ||!presignData.publicUrl) throw new Error("R2 Presign failed")

      const put = await fetch(presignData.uploadUrl, { method: "PUT", body: f, headers: { "Content-Type": f.type } })
      if (!put.ok) throw new Error("R2 upload fail")

      const { error } = await supabase.from("stories").insert({
        image_url: presignData.publicUrl,
        // USERNAME DYNAMIC - Yavaru pedite valla peru vastadi
      let finalUsername = username
      if (!finalUsername) {
        const { data } = await supabase.auth.getUser()
        finalUsername = data?.user?.user_metadata?.username || data?.user?.email?.split('@')[0] || "user"
      }

      const { error } = await supabase.from("stories").insert({
        image_url: presignData.publicUrl,
        username: finalUsername,
        user_id: null
      })
      if (error) throw error
      fetchStories()
      alert("Story Added! 🔥")
    } catch (err: any) {
      alert("Story Error: " + err.message)
    }
  }

  const handleLike = (id: string) => {
    const isLiked = liked[id]
    setLiked((prev) => ({...prev, [id]:!isLiked }))
    setPosts((prev) => prev.map((p) => (p.id === id? {...p, likes: isLiked? p.likes - 1 : p.likes + 1 } : p)))
  }

  const handleDoubleTap = (id: string) => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (!liked[id]) handleLike(id)
      setShowHeart(id)
      setTimeout(() => setShowHeart(null), 900)
    }
    lastTap.current = now
  }

  const handleDelete = async (id: string, postUser: string) => {
    if (postUser!== username) {
      return alert("Idi nee post kaadu bro - Nee posts ne delete cheyavachu!")
    }
    if (!confirm("Ee post delete cheyala bro? 🗑️")) return
    const { error } = await supabase.from("posts").delete().eq("id", id).eq("username", username)
    if (error) {
      alert("Delete failed: " + error.message)
      return
    }
    fetchPosts()
  }

  const isVideoUrl = (url: string) => {
    return url?.includes(".mp4") || url?.includes(".mov") || url?.includes("/reels/") || url?.includes("video")
  }

  const groupedStories = stories.reduce((acc: any, s: Story) => {
    if (!acc[s.user_id]) acc[s.user_id] = []
    acc[s.user_id].push(s)
    return acc
  }, {} as Record<string, Story[]>)

  return (
    <div className="w-full bg-black h-[100dvh] overflow-y-auto text-white scrollbar-hide">
      <div className="max-w-[470px] mx-auto bg-black pb-[90px] min-h-screen relative border-x border-zinc-900">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-zinc-800">
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: "cursive" }}>ChitPix</h1>
          <div className="flex gap-5 items-center text-[22px]">
            <button className="relative">♡<span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span></button>
            <Link href="/messages" className="relative">✉️</Link>
            <button onClick={() => setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[13px]">+ Create</button>
          </div>
        </div>

        {/* STORIES BAR - 100% WORKING R2 + 24H */}
        <div className="flex gap-4 p-3.5 overflow-x-auto border-b border-zinc-800 scrollbar-hide">
          <div className="flex flex-col items-center min-w-[64px]">
            <label className="w-[64px] h-[64px] rounded-full bg-zinc-800 p-[3px] relative cursor-pointer">
              <img src={userPhoto || "https://i.pravatar.cc/100"} className="w-full h-full rounded-full object-cover" alt="" />
              <div className="absolute bottom-0 right-0 bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-[12px] border-2 border-black">+</div>
              <input type="file" accept="image/*" hidden onChange={handleStoryUpload} />
            </label>
            <span className="text-[11px] mt-1">Your Story</span>
          </div>
          {Object.keys(groupedStories).map((uid) => (
            <div key={uid} className="flex flex-col items-center min-w-[64px] cursor-pointer" onClick={() => setActiveStory(groupedStories[uid][0])}>
              <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <img src={groupedStories[uid][0].image_url} className="w-full h-full rounded-full object-cover border-2 border-black" alt="" />
              </div>
              <span className="text-[11px] mt-1 truncate w-[64px] text-center">{uid === currentUserId? "You" : uid.slice(0,6)}</span>
            </div>
          ))}
          {stories.length === 0 && (
            <>
              {[
                { name: "mahesh_kn", img: "https://i.pravatar.cc/100?img=1" },
                { name: "sravani_m", img: "https://i.pravatar.cc/100?img=5" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center min-w-[64px] opacity-40">
                  <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-zinc-700">
                    <img src={s.img} className="w-full h-full rounded-full object-cover border-2 border-black" alt="" />
                  </div>
                  <span className="text-[11px] mt-1 truncate w-[64px] text-center">{s.name}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="bg-black">
          {posts.length === 0 && (
            <div className="text-center p-20">
              <div className="text-5xl mb-3">📸</div>
              <p className="text-zinc-500">No posts yet - Be first to post!</p>
              <button onClick={() => setShowCreate(true)} className="mt-3 bg-white text-black px-5 py-2 rounded-full font-bold text-sm">Create first post - R2 Upload</button>
            </div>
          )}
          {posts.map((post) => {
            const url = post.image_url || ""
            const video = post.type === "reels" || isVideoUrl(url)
            return (
              <div key={post.id} className="border-b border-zinc-800 pb-3 mb-1">
                <div className="flex justify-between items-center p-3">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                      <img src={post.user_photo || `https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border border-black" alt="" />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] flex items-center gap-1">{post.username} <span className="text-blue-500 text-[11px]">✓</span>{video && <span className="bg-zinc-800 text-[9px] px-1.5 py-0.5 rounded ml-1">REEL</span>}</p>
                      <p className="text-[11px] text-zinc-400">Bangalore, India • {video? "R2 Reels" : "R2 Posts"}</p>
                    </div>
                  </div>
                  {post.username === username? (
                    <button onClick={() => handleDelete(post.id, post.username)} className="text-[11px] bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full font-bold border border-red-500/30">Delete</button>
                  ) : (
                    <button className="font-bold text-[18px]">⋯</button>
                  )}
                </div>
                <div className="relative bg-zinc-900 aspect-square overflow-hidden" onClick={() => handleDoubleTap(post.id)}>
                  {video? (
                    <video src={url} className="w-full h-full object-contain bg-black" controls playsInline preload="metadata" />
                  ) : (
                    <img src={url} loading="lazy" className="w-full h-full object-cover" alt="post" onError={(e: any) => e.target.src = "https://via.placeholder.com/500?text=ChitPix+R2"} />
                  )}
                  {showHeart === post.id && <div className="absolute inset-0 flex items-center justify-center text-[90px] animate-[ping_0.9s_ease] pointer-events-none">❤️</div>}
                </div>
                <div className="flex justify-between p-3">
                  <div className="flex gap-4 text-[24px]">
                    <button onClick={() => handleLike(post.id)} className="active:scale-125 transition">{liked[post.id]? "❤️" : "♡"}</button>
                    <button onClick={() => setShowComments(showComments === post.id? null : post.id)}>💬</button>
                    <button onClick={() => { navigator.clipboard.writeText(url); alert("Link copied! 🔗") }}>↗️</button>
                  </div>
                  <button onClick={() => setSaved((p) => ({...p, [post.id]:!p[post.id] }))} className="text-[22px]">{saved[post.id]? "🔖" : "📑"}</button>
                </div>
                <div className="px-3 text-[14px] leading-5">
                  <p className="font-bold">{post.likes} likes</p>
                  <p className="mt-1"><span className="font-bold mr-1">{post.username}</span>{post.caption || "My ChitPix moment ✨ #chitpix"}</p>
                  <button onClick={() => setShowComments(showComments === post.id? null : post.id)} className="text-zinc-400 text-[13px] mt-1">View all comments</button>
                  <p className="text-zinc-500 text-[10px] uppercase mt-1 tracking-wider">{new Date(post.created_at).toLocaleString()}</p>
                </div>
                {showComments === post.id && (
                  <div className="px-3 mt-3 flex gap-2 items-center">
                    <img src={userPhoto || "https://i.pravatar.cc/100"} className="w-7 h-7 rounded-full" alt="" />
                    <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent border-b border-zinc-700 text-[13px] outline-none py-1" />
                    <button onClick={() => { setCommentText(""); setShowComments(null) }} className="text-blue-500 font-bold text-[13px]">Post</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-[380px] rounded-2xl p-4 border border-zinc-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[16px]">New Post - R2 Cloud ☁️</h2>
                <button onClick={() => setShowCreate(false)} className="text-xl w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">✕</button>
              </div>
              <label className="w-full h-[300px] border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer mb-3 overflow-hidden bg-zinc-800/50">
                {preview? (
                  file?.type.includes("video")? <video src={preview} className="w-full h-full object-contain bg-black" controls autoPlay muted /> : <img src={preview} className="w-full h-full object-cover rounded-xl" alt="preview" />
                ) : <div className="text-center"><div className="text-4xl mb-2">📸🎥</div><p className="text-zinc-400 text-sm">Click to select photo or reel</p><p className="text-zinc-600 text-[11px] mt-1">Direct to Cloudflare R2 - 100MB OK - No Vercel Limit</p></div>}
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
              </label>
              {file && <div className="text-[11px] text-zinc-400 mb-2 bg-zinc-800 p-2 rounded-lg">📁 {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.includes("video")? "🎥 Reel -> R2/reels/" : "📸 Post -> R2/posts/"} • {file.type}</div>}
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption... ✨ #ChitPix #R2" className="w-full bg-zinc-800 rounded-xl p-3 text-sm outline-none min-h-[80px] mb-3 border border-zinc-700 resize-none" />
              <button onClick={uploadToR2} disabled={uploading ||!file} className="w-full bg-white text-black font-bold py-3.5 rounded-full disabled:opacity-40 hover:bg-zinc-200 transition text-[14px]">
                {uploading? "Uploading to R2 Cloud... ☁️" : file?.type.includes("video")? "Share Reel to ChitPix 🔥" : "Share Post to ChitPix 🔥"}
              </button>
              <p className="text-center text-[10px] text-zinc-500 mt-2">Saved in Cloudflare R2 - pub-6290...r2.dev - No Grey Bug - 100% Working!</p>
            </div>
          </div>
        )}

        {/* FULL SCREEN STORY VIEW - CLICK CHESTE OPEN */}
        {activeStory && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col" onClick={() => setActiveStory(null)}>
            <div className="w-full h-1 bg-zinc-800">
              <div className="h-full bg-white transition-all" style={{ width: `${storyProgress}%` }} />
            </div>
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full" /></div>
                <span className="text-sm font-semibold">{currentUserId === activeStory.user_id? "Your Story" : activeStory.user_id.slice(0,8)}</span>
                <span className="text-xs text-zinc-400">{new Date(activeStory.created_at).toLocaleTimeString()}</span>
              </div>
              <button className="text-xl" onClick={() => setActiveStory(null)}>✕</button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-zinc-950">
              <img src={activeStory.image_url} className="max-w-full max-h-full object-contain" alt="story" />
            </div>
            <div className="p-4 text-center text-xs text-zinc-500">24h tarvata auto delete - R2 Stories ☁️</div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
      }
