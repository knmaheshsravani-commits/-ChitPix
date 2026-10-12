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
  shares?: number
  user_photo?: string
  created_at: string
  comments?: number
  type?: string
}

type Story = {
  id: string
  user_id: string
  image_url: string
  username?: string
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
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [showShare, setShowShare] = useState<Post | null>(null)
  const [friends, setFriends] = useState<any[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (m: string) => {
    setToastMsg(m)
    setTimeout(() => setToastMsg(null), 2500)
  }

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
    fetchFriendsList()
    const channel = supabase.channel("posts_realtime_home_final").on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => fetchPosts()).on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => fetchStories()).subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(100)
    if (!error && data) setPosts(data as any)
  }

  const fetchStories = async () => {
    const { data } = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false })
    if (data) setStories(data)
  }

  const fetchFriendsList = async () => {
    const { data } = await supabase.from("posts").select("username").limit(40)
    if (data) {
      const uniq = Array.from(new Set(data.map((d: any) => d.username)))
      setFriends(uniq.map((u: any) => ({ username: u, id: u })))
    }
  }

  useEffect(() => {
    if (!activeStory) return
    setStoryProgress(0)
    const interval = setInterval(() => {
      setStoryProgress((p) => {
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
    if (!file) {
      showToast("Select photo first")
      return
    }
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
          folder: folder,
        }),
      })
      const presignData = await presignRes.json()
      if (!presignData.uploadUrl ||!presignData.publicUrl) {
        throw new Error(presignData.error || "R2 Presign failed")
      }
      const r2UploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!r2UploadRes.ok) {
        throw new Error("R2 upload failed")
      }
      const { error } = await supabase.from("posts").insert([
        {
          image_url: presignData.publicUrl,
          caption: caption,
          username: username,
          user_photo: userPhoto,
          likes: 0,
          shares: 0,
          type: isVideo? "reels" : "post",
        },
      ])
      if (error) throw error
      setCaption("")
      setPreview("")
      setFile(null)
      setShowCreate(false)
      fetchPosts()
      showToast(isVideo? "Reel uploaded to R2!" : "Post uploaded to R2!")
    } catch (err: any) {
      showToast("Error: " + err.message)
    }
    setUploading(false)
  }

  const handleStoryUpload = async (e: any) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const form = new FormData()
      form.append("file", f)
      form.append("type", "stories")
      form.append("caption", "Story")
      form.append("username", username || "Knmahesh")
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("API /api/upload missing")
      }
      if (!res.ok) throw new Error(data.error || "Upload failed")
      const finalUrl = data.url || data.post?.image_url
      if (!finalUrl) throw new Error("R2 URL missing")
      await supabase.from("stories").insert({
        image_url: finalUrl,
        username: username || "Knmahesh",
        user_id: username || "Knmahesh",
      })
      fetchStories()
      showToast("Story Added to R2!")
    } catch (err: any) {
      showToast("Story Error: " + err.message)
    }
  }

  const handleLike = (id: string) => {
    const isLiked = liked[id]
    setLiked((prev) => ({...prev, [id]:!isLiked }))
    setPosts((prev) => prev.map((p) => (p.id === id? {...p, likes: isLiked? Math.max(0, p.likes - 1) : p.likes + 1 } : p)))
    supabase.from("posts").select("likes").eq("id", id).single().then(({ data }) => {
      if (data) {
        const newCount = isLiked? Math.max(0, (data.likes || 1) - 1) : (data.likes || 0) + 1
        supabase.from("posts").update({ likes: newCount }).eq("id", id).then(() => {})
      }
    })
  }

  const handleFollow = async (targetUser: string) => {
    if (targetUser === username) return
    const isFollowing = following[targetUser]
    setFollowing((p) => ({...p, [targetUser]:!isFollowing }))
    showToast(isFollowing? `Unfollowed ${targetUser}` : `Following ${targetUser}`)
    try {
      if (!isFollowing) {
        await supabase.from("follows").insert({ follower: username, following: targetUser })
      } else {
        await supabase.from("follows").delete().eq("follower", username).eq("following", targetUser)
      }
    } catch {}
  }

  const handleDirectShare = async (post: Post, friend?: string) => {
    try {
      if (navigator.share &&!friend) {
        await navigator.share({ title: `ChitPix - ${post.username}`, text: post.caption, url: post.image_url })
      } else {
        await navigator.clipboard.writeText(post.image_url)
        showToast(friend? `Shared to ${friend}` : "R2 Link Copied!")
      }
      await supabase.from("posts").update({ shares: (post.shares || 0) + 1 }).eq("id", post.id)
      fetchPosts()
      if (friend) setShowShare(null)
    } catch {}
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
      showToast("Not your post")
      return
    }
    if (!confirm("Delete this post?")) return
    const { error } = await supabase.from("posts").delete().eq("id", id).eq("username", username)
    if (error) {
      showToast("Delete failed")
      return
    }
    fetchPosts()
  }

  const isVideoUrl = (url: string) => {
    return url?.includes(".mp4") || url?.includes(".mov") || url?.includes("/reels/") || url?.includes("video")
  }

  const groupedStories: Record<string, Story[]> = {}
  stories.forEach((s) => {
    const key = (s.user_id || s.username || "unknown") as string
    if (!groupedStories[key]) groupedStories[key] = []
    groupedStories[key].push(s)
  })

  return (
    <div className="w-full bg-black h-[100dvh] overflow-y-auto text-white scrollbar-hide">
      <div className="max-w-[470px] mx-auto bg-black pb-[90px] min-h-screen relative border-x border-zinc-900">
        {/* HEADER NEW ICONS */}
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-zinc-800">
          <h1 className="text-[26px] font-bold tracking-tight">ChitPix</h1>
          <div className="flex gap-4 items-center">
            <button className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
            </button>
            <Link href="/messages">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </Link>
            <button onClick={() => setShowCreate(true)} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[13px]">+ Create</button>
          </div>
        </div>

        <div className="flex gap-4 p-3.5 overflow-x-auto border-b border-zinc-800 scrollbar-hide">
          <div className="flex flex-col items-center min-w-[64px]">
            <label className="w-[64px] h-[64px] rounded-full bg-zinc-800 p-[3px] relative cursor-pointer">
              <img src={userPhoto || "https://i.pravatar.cc/100"} className="w-full h-full rounded-full object-cover" alt="" />
              <div className="absolute bottom-0 right-0 bg-[#0095f6] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <input type="file" accept="image/*" hidden onChange={handleStoryUpload} />
            </label>
            <span className="text-[11px] mt-1">Your Story</span>
          </div>
          {Object.keys(groupedStories).map((uid) => (
            <div key={uid} className="flex flex-col items-center min-w-[64px] cursor-pointer" onClick={() => setActiveStory(groupedStories[uid][0])}>
              <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <img src={groupedStories[uid][0].image_url} className="w-full h-full rounded-full object-cover border-2 border-black" alt="" />
              </div>
              <span className="text-[11px] mt-1 truncate w-[64px] text-center">{uid === username? "You" : uid.slice(0, 6)}</span>
            </div>
          ))}
        </div>

        <div className="bg-black">
          {posts.length === 0 && (
            <div className="text-center p-20">
              <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-3"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg></div>
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
                  <div className="flex gap-2.5 items-center cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                      <img src={post.user_photo || `https://i.pravatar.cc/100?u=${post.username}`} className="w-full h-full rounded-full object-cover border border-black" alt="" />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] flex items-center gap-1">{post.username} <svg width="12" height="12" viewBox="0 0 24 24" fill="#0095f6"><circle cx="12" cy="12" r="12"/><path d="M8 12l2.5 2.5 5-5" stroke="white" strokeWidth="2" fill="none"/></svg> {video && <span className="bg-zinc-800 text-[9px] px-1.5 py-0.5 rounded ml-1">REEL</span>}</p>
                      <p className="text-[11px] text-zinc-400">Bangalore • {following[post.username]? "Following • " : ""}R2</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {post.username!== username && (
                      <button onClick={() => handleFollow(post.username)} className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${following[post.username]? "bg-zinc-800 text-white border border-zinc-700" : "bg-white text-black"}`}>{following[post.username]? "Following" : "Follow"}</button>
                    )}
                    {post.username === username? (
                      <button onClick={() => handleDelete(post.id, post.username)} className="text-[11px] bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full font-bold border border-red-500/30">Delete</button>
                    ) : (
                      <button className="font-bold"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg></button>
                    )}
                  </div>
                </div>

                <div className="relative bg-zinc-900 aspect-square overflow-hidden" onClick={() => handleDoubleTap(post.id)}>
                  {video? (
                    <video src={url} className="w-full h-full object-contain bg-black" controls playsInline preload="metadata" />
                  ) : (
                    <img src={url} loading="lazy" className="w-full h-full object-cover" alt="post" onError={(e: any) => (e.target.src = "https://via.placeholder.com/500/111/fff?text=ChitPix+R2")} />
                  )}
                  {showHeart === post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg width="80" height="80" viewBox="0 0 24 24" fill="#ff3040" className="animate-[ping_0.9s_ease]"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg></div>}
                </div>

                <div className="flex justify-between p-3 bg-black">
                  <div className="flex gap-5 items-center">
                    <button onClick={() => handleLike(post.id)} className="active:scale-125 transition-all">
                      <svg className={`w-[26px] h-[26px] ${liked[post.id]? "fill-red-500 stroke-red-500" : "fill-none stroke-white"}`} viewBox="0 0 24 24" strokeWidth="1.8"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z" /></svg>
                    </button>
                    <button onClick={() => setShowComments(showComments === post.id? null : post.id)}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </button>
                    <button onClick={() => setShowShare(post)}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                  <button onClick={() => setSaved((p) => ({...p, [post.id]:!p[post.id] }))}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={saved[post.id]? "white":"none"} stroke="white" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>

                <div className="px-3 text-[14px] leading-5">
                  <p className="font-bold">{post.likes || 0} likes • {post.shares || 0} shares • R2</p>
                  <p className="mt-1"><span className="font-bold mr-1">{post.username}</span>{post.caption || "My ChitPix moment"}</p>
                  <button onClick={() => setShowComments(showComments === post.id? null : post.id)} className="text-zinc-400 text-[13px] mt-1">View all comments</button>
                  <p className="text-zinc-500 text-[10px] uppercase mt-1 tracking-wider">{new Date(post.created_at).toLocaleString()} • R2 Storage</p>
                </div>

                {showComments === post.id && (
                  <div className="px-3 mt-3 flex gap-2 items-center">
                    <img src={userPhoto || "https://i.pravatar.cc/100"} className="w-7 h-7 rounded-full" alt="" />
                    <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent border-b border-zinc-700 text-[13px] outline-none py-1" />
                    <button onClick={() => { if(!commentText.trim()) return; showToast("Comment added"); setCommentText(""); }} className="text-[#0095f6] font-bold text-[13px]">Post</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Create Post - R2 Upload</h3>
                <button onClick={()=>setShowCreate(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-sm text-zinc-400 mb-3" />
              {preview && (file?.type.includes("video")? <video src={preview} className="w-full h-48 object-cover rounded-xl mb-3" controls/> : <img src={preview} className="w-full h-48 object-cover rounded-xl mb-3" alt="preview"/>) }
              <textarea value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Write caption..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm mb-3 outline-none" rows={3} />
              <button onClick={uploadToR2} disabled={uploading} className="w-full bg-white text-black py-3 rounded-full font-bold disabled:opacity-50">{uploading? "Uploading to R2..." : "Upload to R2"}</button>
            </div>
          </div>
        )}

        {showShare && (
          <div className="fixed inset-0 bg-black/85 z-[100] flex items-end justify-center" onClick={() => setShowShare(null)}>
            <div className="bg-zinc-900 w-full max-w-[470px] rounded-t-[26px] p-5 max-h-[75vh] overflow-y-auto border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
              <h3 className="font-bold text-center">Share • {showShare.shares || 0} shares • R2 Cloud</h3>
              <p className="text-[11px] text-zinc-500 text-center truncate mt-1">{showShare.image_url}</p>
              <div className="grid grid-cols-4 gap-4 mt-6">
                {friends.slice(0,8).map((f:any)=>(
                  <div key={f.username} className="flex flex-col items-center gap-1 cursor-pointer" onClick={()=>handleDirectShare(showShare, f.username)}>
                    <img src={`https://i.pravatar.cc/100?u=${f.username}`} className="w-14 h-14 rounded-full" alt=""/>
                    <span className="text-[11px] truncate w-14 text-center">{f.username.slice(0,8)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={()=>handleDirectShare(showShare)} className="flex-1 bg-zinc-800 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white"><path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"/><path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"/></svg> Copy Link</button>
                <button onClick={()=>{ if(navigator.share) navigator.share({url: showShare.image_url}); setShowShare(null)}} className="flex-1 bg-white text-black py-3 rounded-full font-bold text-sm">Share via...</button>
              </div>
            </div>
          </div>
        )}

        {activeStory && (
          <div className="fixed inset-0 bg-black z-[200] flex flex-col">
            <div className="h-1 bg-zinc-800 w-full"><div className="h-full bg-white transition-all" style={{width: `${storyProgress}%`}}></div></div>
            <div className="flex justify-between p-4 items-center">
              <div className="flex gap-2 items-center"><img src={activeStory.image_url} className="w-8 h-8 rounded-full" alt=""/><span className="font-bold text-sm">{activeStory.username}</span></div>
              <button onClick={()=>setActiveStory(null)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="flex-1 flex items-center justify-center"><img src={activeStory.image_url} className="max-w-full max-h-full object-contain" alt="story"/></div>
          </div>
        )}

        {toastMsg && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold z-[300]">{toastMsg}</div>}
      </div>
      <BottomNav />
    </div>
  )
                                                                                                                     }
