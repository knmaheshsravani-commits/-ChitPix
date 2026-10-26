 // @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import BottomNav from "../components/BottomNav"
import { supabase } from "../../lib/supabase"

const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p: any) {
  if (!p) return ""

  let url =
    typeof p === "string"
      ? p
      : p?.avatar_url ||
        p?.image_url ||
        p?.video_url ||
        p?.url ||
        p?.image ||
        p?.r2Url ||
        p?.publicUrl ||
        ""

  url = String(url).trim()
  if (!url) return ""

  if (/^https?:\/\//i.test(url)) return url

  if (url.startsWith("r2://")) {
    return `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${url.slice(5).replace(/^\/+/, "")}`
  }

  return url
}

const uploadToR2 = async (file: File, folder = "avatars") => {
  try {
    const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

    const presignRes = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        contentType: file.type,
        fileSize: file.size,
      }),
    })

    if (!presignRes.ok) {
      throw new Error("R2 presign request failed")
    }

    const result = await presignRes.json()
    const { url, publicUrl, key } = result

    if (!url) throw new Error("Presign URL missing")

    const uploadRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })

    if (!uploadRes.ok) throw new Error(`R2 upload failed (${uploadRes.status})`)

    const finalUrl = publicUrl || `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${key || fileName}`
    return fixR2Url(finalUrl)
  } catch (error) {
    console.error("R2 upload error:", error)
    throw error
  }
}

function notifyAvatarUpdated(url: string) {
  try {
    localStorage.setItem("chitpix_profile_photo", url)
    window.dispatchEvent(new Event("chitpix-profile-photo-updated"))
  } catch (error) {
    console.error("Avatar sync error:", error)
  }
}

function HighlightsInline({ username, onSelect }: any) {
  const [items] = useState([
    {
      id: "1",
      title: "New",
      cover: `https://i.pravatar.cc/100?u=${username}`,
      stories: [
        {
          image: "https://picsum.photos/400/700?random=1",
          caption: "Welcome",
          price: 350,
        },
      ],
    },
  ])

  return (
    <div className="flex gap-4 px-4 mt-4 overflow-x-auto scrollbar-hide">
      <div className="flex flex-col items-center gap-1 min-w-[64px]">
        <div className="w-[64px] h-[64px] rounded-full bg-zinc-800 border flex items-center justify-center text-[24px]">
          +
        </div>
        <span className="text-[11px]">New</span>
      </div>

      {items.map((h: any) => (
        <div
          key={h.id}
          onClick={() => onSelect(h)}
          className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer"
        >
          <div className="w-[64px] h-[64px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <div className="bg-black rounded-full p-[2px]">
              <img
                src={h.cover}
                className="w-[56px] h-[56px] rounded-full object-cover"
                alt=""
              />
            </div>
          </div>
          <span className="text-[11px]">{h.title}</span>
        </div>
      ))}
    </div>
  )
}

function StoryViewerInline({ users, onClose }: any) {
  const s = users?.[0]?.stories?.[0]
  if (!s) return null

  const img = typeof s === "string" ? s : s.image || s.url || ""

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-[470px] mx-auto">
      <div className="flex justify-between p-4 text-white">
        <span className="font-bold">{users[0]?.title || users[0]?.username}</span>
        <button onClick={onClose} className="text-[20px]">✕</button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-zinc-950 relative">
        <img src={fixR2Url(img)} className="w-full h-full object-contain" alt="" />
        <div className="absolute bottom-20 left-4">
          <p className="text-white font-bold">{s.caption || "Story"}</p>
          <p className="text-white">₹{s.price || 350}</p>
        </div>
      </div>

      <button onClick={onClose} className="m-4 bg-white text-black py-3 rounded-xl font-bold">
        Close
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const usernameFromUrl = (params as any)?.username

  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"POSTS" | "REELS" | "TAGGED">("POSTS")
  const [followers, setFollowers] = useState(129)
  const [following, setFollowing] = useState(205)
  const [username, setUsername] = useState("knmahesh")
  const [bio, setBio] = useState("Welcome to ChitPix\nPhotographer | Creator")
  const [link, setLink] = useState("chitpix.com")
  const [photo, setPhoto] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [pinnedPosts, setPinnedPosts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hasStory, setHasStory] = useState(true)
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null)

  useEffect(() => {
    let cancelled = false

    const fetchR2Data = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile fetch error:", profileError)
        }

        if (profile && !cancelled) {
          setUsername(profile.username || "knmahesh")
          setEditName(profile.username || "knmahesh")
          setBio(profile.bio || "Welcome to ChitPix\nPhotographer | Creator")
          setEditBio(profile.bio || "")
          setLink(profile.website || "chitpix.com")
          setEditLink(profile.website || "")

          const savedAvatar = fixR2Url(profile.avatar_url)

          if (savedAvatar) {
            setPhoto(savedAvatar)
            notifyAvatarUpdated(savedAvatar)
          } else {
            setPhoto("")
          }
        } else if (!profile && !cancelled) {
          // Do not use an old local avatar as the source of truth.
          setPhoto("")
        }

        const { data: myPosts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (postsError) {
          console.error("Profile posts fetch error:", postsError)
        }

        if (!cancelled && myPosts) {
          const mapped = myPosts
            .map((p: any) => {
              const img = fixR2Url(
                p.image_url || p.image || p.r2_url || p.video_url || p.url
              )

              const path = img.split("?")[0].toLowerCase()
              const isVideo =
                /\.(mp4|mov|webm|m4v|m3u8)$/i.test(path) ||
                p.type === "reel" ||
                p.type === "reels" ||
                p.type === "video"

              return {
                ...p,
                image: img,
                imageUrl: img,
                r2Url: img,
                url: img,
                type: isVideo ? "reels" : p.type || "post",
                username: profile?.username || "knmahesh",
                id: p.id,
                created_at: p.created_at,
                caption: p.caption || "",
              }
            })
            .filter((p: any) => p.image && p.image.length > 5)

          setPosts(mapped)
        }
      } catch (error) {
        console.error("PROFILE FETCH ERROR:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchR2Data()

    return () => {
      cancelled = true
    }
  }, [])

  const handlePhotoChange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.")
      e.target.value = ""
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const previousPhoto = photo

    setPhoto(previewUrl)
    setUploading(true)

    try {
      const publicUrl = await uploadToR2(file, "avatars")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Login again and retry.")
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            username,
            avatar_url: publicUrl,
            bio,
            website: link,
          },
          { onConflict: "id" }
        )

      if (saveError) throw new Error(saveError.message)

      setPhoto(publicUrl)
      notifyAvatarUpdated(publicUrl)

      URL.revokeObjectURL(previewUrl)
      alert("Profile photo saved successfully! ✅")
    } catch (error: any) {
      console.error("PROFILE PHOTO ERROR:", error)
      setPhoto(previousPhoto)
      URL.revokeObjectURL(previewUrl)
      alert("DP save failed: " + (error?.message || "Please try again."))
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleProfileSave = async () => {
    const newName = editName || username
    const newBio = editBio
    const newLink = editLink

    setUploading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) throw new Error("Please login again.")

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: newName,
          bio: newBio,
          avatar_url: photo.startsWith("blob:") ? "" : photo,
          website: newLink,
        },
        { onConflict: "id" }
      )

      if (error) throw new Error(error.message)

      setUsername(newName)
      setBio(newBio)
      setLink(newLink)
      setEditName(newName)
      setEditBio(newBio)
      setEditLink(newLink)

      alert("Profile saved successfully! ✅")
      setShowEdit(false)
    } catch (error: any) {
      console.error("PROFILE SAVE ERROR:", error)
      alert("Profile save failed: " + (error?.message || "Try again."))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (post: any) => {
    if (!confirm("Delete this post?")) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", post.id)
          .eq("user_id", user.id)

        if (error) throw error
      }

      setPosts((current) => current.filter((p) => p.id !== post.id))
      setSelectedPost(null)
    } catch (error) {
      console.error("DELETE ERROR:", error)
      alert("Post delete failed.")
    }
  }

  const handleArchive = async (post: any) => {
    setArchivedPosts((current) => [...current, post])
    setPosts((current) => current.filter((p) => p.id !== post.id))
    setSelectedPost(null)
  }

  const handlePinPost = async (post: any) => {
    setPinnedPosts((current) =>
      current.includes(post.id)
        ? current.filter((id) => id !== post.id)
        : [...current, post.id].slice(0, 3)
    )
  }

  const filteredPosts = posts.filter((p) => {
    const url = p.image || ""
    const path = url.split("?")[0].toLowerCase()
    const isVideo =
      p.type === "reels" || /\.(mp4|mov|webm|m4v|m3u8)$/i.test(path)

    const matchesSearch = searchQuery
      ? (p.caption || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true

    if (!matchesSearch) return false
    if (activeTab === "REELS") return isVideo
    if (activeTab === "POSTS") return !isVideo
    return false
  })

  return (
    <div className="bg-black min-h-screen pb-20">
      <div className="max-w-[470px] mx-auto min-h-screen bg-black text-white">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-zinc-800">
          <h1 className="font-bold text-[20px] flex items-center gap-1">
            {username} <span className="text-[14px]">⌄</span>
          </h1>

          <div className="flex gap-5 items-center">
            <button onClick={() => router.push("/create")} className="cursor-pointer text-[22px]">+</button>
            <button onClick={() => setShowMenu(true)} className="cursor-pointer text-[20px]">☰</button>
          </div>
        </div>

        <div className="flex p-4 gap-5 items-center">
          <div className="relative">
            <div className={`w-[86px] h-[86px] rounded-full p-[2.5px] ${hasStory ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "bg-zinc-700"}`}>
              <div className="bg-black rounded-full p-[2.5px]">
                {photo ? (
                  <img
                    src={photo}
                    className="w-[77px] h-[77px] rounded-full object-cover"
                    alt="profile"
                    onError={() => console.error("Profile avatar failed to load:", photo)}
                  />
                ) : (
                  <div className="w-[77px] h-[77px] rounded-full bg-zinc-800 flex items-center justify-center text-[20px]">
                    👤
                  </div>
                )}
              </div>
            </div>

            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-[#0095f6] w-[22px] h-[22px] rounded-full flex items-center justify-center cursor-pointer border-2 border-black text-[12px]">
              +
            </label>

            <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

            {uploading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-[10px]">
                R2...
              </div>
            )}
          </div>

          <div className="flex gap-6 text-center flex-1 justify-around">
            <div>
              <b className="block text-[18px]">{posts.filter((p) => p.type !== "reels").length}</b>
              <span className="text-[14px] text-zinc-400">posts</span>
            </div>
            <div className="cursor-pointer" onClick={() => setShowFollowers(true)}>
              <b className="block text-[18px]">{followers}</b>
              <span className="text-[14px] text-zinc-400">followers</span>
            </div>
            <div className="cursor-pointer" onClick={() => setShowFollowing(true)}>
              <b className="block text-[18px]">{following}</b>
              <span className="text-[14px] text-zinc-400">following</span>
            </div>
          </div>
        </div>

        <div className="px-4">
          <p className="font-bold text-[14px]">{username}</p>
          <p className="text-[14px] mt-1 whitespace-pre-line text-zinc-200">{bio}</p>
          <p className="text-[14px] text-[#4da5ff] font-semibold mt-1">🔗 {link}</p>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search your posts..."
            className="w-full mt-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] outline-none"
          />
        </div>

        <div className="flex gap-2 mt-4 px-4">
          <button onClick={() => { setEditName(username); setEditBio(bio); setEditLink(link); setShowEdit(true) }} className="flex-1 py-[7px] rounded-lg bg-zinc-800 font-semibold text-[14px]">
            Edit profile
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link Copied!") }} className="flex-1 py-[7px] rounded-lg bg-zinc-800 font-semibold text-[14px]">
            Share profile
          </button>
          <button onClick={() => setShowQR(true)} className="px-4 py-[7px] rounded-lg bg-zinc-800 font-semibold text-[14px]">
            QR
          </button>
        </div>

        <div className="mt-2 bg-black">
          <HighlightsInline
            username={username}
            onSelect={(h: any) => {
              const storiesForViewer = h.stories?.length
                ? h.stories
                : [{ image: h.cover, price: 350, caption: h.title }]

              setSelectedHighlight({
                username,
                avatar: photo,
                stories: storiesForViewer.map((s: any) => ({
                  image: fixR2Url(typeof s === "string" ? s : s.image || s.url),
                  price: s.price || 350,
                  caption: s.caption || h.title,
                })),
                title: h.title,
              })
            }}
          />
        </div>

        <div className="flex border-t border-zinc-800 mt-1">
          <button onClick={() => setActiveTab("POSTS")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab === "POSTS" ? "border-t border-white font-bold" : "text-zinc-500"}`}>
            ⊞ POSTS R2
          </button>
          <button onClick={() => setActiveTab("REELS")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab === "REELS" ? "border-t border-white font-bold" : "text-zinc-500"}`}>
            ▶ REELS
          </button>
          <button onClick={() => setActiveTab("TAGGED")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab === "TAGGED" ? "border-t border-white font-bold" : "text-zinc-500"}`}>
            👤 TAGGED
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500">Loading R2 posts...</div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px]">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((p, i) => {
                const url = p.image || ""
                const path = url.split("?")[0].toLowerCase()
                const isVideo =
                  p.type === "reels" || /\.(mp4|mov|webm|m4v|m3u8)$/i.test(path)
                const isPinned = pinnedPosts.includes(p.id)

                return (
                  <div key={p.id || i} onClick={() => setSelectedPost(p)} className="aspect-square bg-zinc-900 cursor-pointer relative">
                    {isPinned && <div className="absolute top-1 left-1 bg-black/70 px-1 rounded text-[10px] z-10">📌</div>}
                    {isVideo ? (
                      <>
                        <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute top-1 right-1 text-[10px]">▶</div>
          
