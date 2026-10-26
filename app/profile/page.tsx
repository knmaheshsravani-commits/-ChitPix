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
      : p?.image_url ||
        p?.avatar_url ||
        p?.url ||
        p?.image ||
        p?.r2Url ||
        p?.publicUrl ||
        ""

  if (!url) return ""

  url = String(url).trim()

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  if (url.startsWith("r2://")) {
    return `${R2_PUBLIC_URL}/${url.replace("r2://", "").replace(/^\/+/, "")}`
  }

  return url
}

async function uploadToR2(file: File, folder = "avatars") {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.")
  }

  const presignRes = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`,
      contentType: file.type,
      fileSize: file.size,
    }),
  })

  if (!presignRes.ok) {
    throw new Error(`R2 presign failed (${presignRes.status})`)
  }

  const result = await presignRes.json()
  const { url, publicUrl, key } = result

  if (!url) throw new Error("R2 presigned URL was not returned.")

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  })

  if (!uploadRes.ok) {
    throw new Error(`R2 upload failed (${uploadRes.status})`)
  }

  const finalUrl = fixR2Url(
    publicUrl || (key ? `${R2_PUBLIC_URL}/${key}` : "")
  )

  if (!finalUrl) throw new Error("R2 public URL is missing.")

  return finalUrl
}

function HighlightsInline({ username, onSelect }: any) {
  const items = [
    {
      id: "1",
      title: "Welcome",
      cover: `https://i.pravatar.cc/100?u=${encodeURIComponent(username)}`,
      stories: [
        {
          image: "https://picsum.photos/400/700?random=1",
          caption: "Welcome to ChitPix!",
          price: 350,
        },
      ],
    },
  ]

  return (
    <div className="flex gap-4 px-4 mt-4 overflow-x-auto">
      <button
        type="button"
        onClick={() => alert("Highlight creation is not connected yet.")}
        className="flex flex-col items-center gap-1 min-w-[64px]"
      >
        <div className="w-16 h-16 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-2xl">
          +
        </div>
        <span className="text-[11px]">New</span>
      </button>

      {items.map((item: any) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onSelect(item)}
          className="flex flex-col items-center gap-1 min-w-[64px]"
        >
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500">
            <div className="bg-black rounded-full p-[2px]">
              <img
                src={item.cover}
                className="w-14 h-14 rounded-full object-cover"
                alt="Highlight"
              />
            </div>
          </div>
          <span className="text-[11px]">{item.title}</span>
        </button>
      ))}
    </div>
  )
}

function StoryViewerInline({ users, onClose }: any) {
  const story = users?.[0]?.stories?.[0]

  if (!story) return null

  const image =
    typeof story === "string"
      ? story
      : story.image || story.url || ""

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col max-w-[470px] mx-auto">
      <div className="flex justify-between items-center p-4 text-white">
        <span className="font-bold">
          {users[0]?.title || users[0]?.username}
        </span>
        <button type="button" onClick={onClose}>✕</button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-zinc-950 relative">
        <img
          src={fixR2Url(image)}
          className="w-full h-full object-contain"
          alt="Story"
        />
        <div className="absolute bottom-8 left-4">
          <p className="text-white font-bold">{story.caption || "Story"}</p>
          {story.price != null && (
            <p className="text-white">₹{story.price}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="m-4 bg-white text-black py-3 rounded-xl font-bold"
      >
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

  const [followers] = useState(129)
  const [following] = useState(205)

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
  const [hasStory] = useState(true)
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showQR, setShowQR] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null)

  useEffect(() => {
    let cancelled = false

    const fetchProfileData = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) throw profileError
        if (cancelled) return

        const name =
          profile?.username || user.email?.split("@")[0] || "knmahesh"

        setUsername(name)
        setEditName(name)
        setBio(profile?.bio || "")
        setEditBio(profile?.bio || "")
        setLink(profile?.website || "")
        setEditLink(profile?.website || "")
        setPhoto(fixR2Url(profile?.avatar_url))

        const { data: myPosts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError
        if (cancelled) return

        const mapped = (myPosts || [])
          .map((post: any) => {
            const image = fixR2Url(
              post.image_url || post.image || post.r2_url || post.url || post
            )

            const isVideo =
              String(post.type || "").toLowerCase().includes("reel") ||
              String(post.media_type || "").toLowerCase().includes("video") ||
              String(image).toLowerCase().includes(".mp4")

            return {
              ...post,
              image,
              imageUrl: image,
              r2Url: image,
              url: image,
              type: isVideo ? "reels" : "post",
              username: name,
              id: post.id,
              caption: post.caption || "",
            }
          })
          .filter((post: any) => post.image && post.image.length > 5)

        setPosts(mapped)
      } catch (error) {
        console.error("PROFILE FETCH ERROR:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProfileData()

    return () => {
      cancelled = true
    }
  }, [])

  const handlePhotoChange = async (event: any) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.")
      return
    }

    const previousPhoto = photo
    const localPreview = URL.createObjectURL(file)

    setPhoto(localPreview)
    setUploading(true)

    try {
      const fixedUrl = await uploadToR2(file, "avatars")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Please login again.")
      }

      const { data: existing, error: existingError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("id", user.id)
        .maybeSingle()

      if (existingError) throw existingError

      const profileEmail = user.email || existing?.email

      if (!profileEmail) {
        throw new Error("Login email not found. Please sign in again.")
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: profileEmail,
            username,
            avatar_url: fixedUrl,
            bio,
            website: link,
          },
          { onConflict: "id" }
        )

      if (saveError) throw saveError

      setPhoto(fixedUrl)
      alert("Profile photo uploaded and saved! ✅")
    } catch (error: any) {
      console.error("PROFILE PHOTO SAVE ERROR:", error)
      setPhoto(previousPhoto)
      alert("Photo save failed: " + (error?.message || "Unknown error"))
    } finally {
      URL.revokeObjectURL(localPreview)
      setUploading(false)
    }
  }

  const handleProfileSave = async () => {
    if (uploading) return

    setUploading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Please login again.")
      }

      const newName = editName.trim()
      const newBio = editBio
      const newLink = editLink.trim()

      if (!newName) {
        throw new Error("Username cannot be empty.")
      }

      const { data: existing, error: existingError } = await supabase
        .from("profiles")
        .select("id, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      if (existingError) throw existingError

      const profileEmail = user.email || existing?.email

      if (!profileEmail) {
        throw new Error("Login email not found. Please sign in again.")
      }

      const safeAvatar =
        photo && !photo.startsWith("blob:")
          ? photo
          : existing?.avatar_url || null

      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: profileEmail,
            username: newName,
            bio: newBio,
            avatar_url: safeAvatar,
            website: newLink,
          },
          { onConflict: "id" }
        )
        .select("id, username, avatar_url, bio, website")
        .single()

      if (error) throw error

      if (!data || data.id !== user.id) {
        throw new Error("Profile ID mismatch.")
      }

      setUsername(data.username || newName)
      setEditName(data.username || newName)
      setBio(data.bio || "")
      setEditBio(data.bio || "")
      setLink(data.website || "")
      setEditLink(data.website || "")
      setPhoto(fixR2Url(data.avatar_url))
      setShowEdit(false)

      alert("Profile saved successfully! ✅")
    } catch (error: any) {
      console.error("PROFILE SAVE FAILED:", error)
      alert("Profile save failed: " + (error?.message || "Unknown error"))
    } finally {
      setUploading(false)
    }
            }

  const handleDelete = async (post: any) => {
    if (!confirm("Delete this post? This cannot be undone.")) return

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Please login again.")
      }

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("user_id", user.id)

      if (error) throw error

      setPosts((current) => current.filter((item) => item.id !== post.id))
      setSelectedPost(null)
    } catch (error: any) {
      console.error("POST DELETE ERROR:", error)
      alert("Delete failed: " + (error?.message || "Unknown error"))
    }
  }

  const handleArchive = (post: any) => {
    setArchivedPosts((current) => [...current, post])
    setPosts((current) => current.filter((item) => item.id !== post.id))
    setSelectedPost(null)
    alert("Post hidden from profile. Archive is temporary in this version.")
  }

  const handlePinPost = (post: any) => {
    setPinnedPosts((current) => {
      if (current.includes(post.id)) {
        return current.filter((id) => id !== post.id)
      }

      if (current.length >= 3) {
        alert("You can pin up to 3 posts.")
        return current
      }

      return [...current, post.id]
    })
  }

  const filteredPosts = posts.filter((post) => {
    const url = post.image || ""
    const isVideo =
      post.type === "reels" ||
      String(url).toLowerCase().includes(".mp4")

    const matchesSearch = searchQuery
      ? (post.caption || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true

    if (!matchesSearch) return false
    if (activeTab === "REELS") return isVideo
    if (activeTab === "POSTS") return !isVideo
    return false
  })

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="mx-auto min-h-screen max-w-[470px] overflow-hidden bg-black">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-blue-500/20 bg-black/95 p-4 backdrop-blur-xl">
          <h1 className="flex items-center gap-2 text-xl font-black">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {username}
            </span>
            <span className="text-sm text-blue-400">⌄</span>
          </h1>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.push("/create")}
              className="text-3xl text-blue-400"
              aria-label="Create post"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setShowMenu(true)}
              className="text-2xl"
              aria-label="Open profile menu"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 left-8 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-36 w-36 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative flex items-center gap-5 p-4">
            <div className="relative shrink-0">
              <div
                className={`rounded-full p-[3px] ${
                  hasStory
                    ? "bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500"
                    : "bg-zinc-700"
                }`}
              >
                <div className="rounded-full bg-black p-[3px]">
                  {photo ? (
                    <img
                      src={photo}
                      className="h-[76px] w-[76px] rounded-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-zinc-900 text-3xl">
                      👤
                    </div>
                  )}
                </div>
              </div>

              <label
                htmlFor="photoInput"
                className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-blue-500 font-bold"
              >
                +
              </label>
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 text-xs">
                  ...
                </div>
              )}
            </div>

            <div className="flex flex-1 justify-around text-center">
              <div>
                <b className="block text-xl">
                  {posts.filter((post) => post.type !== "reels").length}
                </b>
                <span className="text-xs text-zinc-400">Posts</span>
              </div>

              <button
                type="button"
                onClick={() => setShowFollowers(true)}
              >
                <b className="block text-xl">{followers}</b>
                <span className="text-xs text-zinc-400">Followers</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFollowing(true)}
              >
                <b className="block text-xl">{following}</b>
                <span className="text-xs text-zinc-400">Following</span>
              </button>
            </div>
          </div>

          <div className="relative px-4">
            <p className="font-bold">{username}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-zinc-300">
              {bio}
            </p>

            {link && (
              <a
                href={
                  link.startsWith("http://") || link.startsWith("https://")
                    ? link
                    : `https://${link}`
                }
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block break-all text-sm font-semibold text-blue-400"
              >
                🔗 {link}
              </a>
            )}

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search your posts..."
              className="mt-4 w-full rounded-xl border border-blue-500/20 bg-zinc-900/80 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative mt-4 flex gap-2 px-4">
            <button
              type="button"
              onClick={() => {
                setEditName(username)
                setEditBio(bio)
                setEditLink(link)
                setShowEdit(true)
              }}
              className="flex-1 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 py-2.5 text-sm font-bold"
            >
              Edit profile
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  alert("Profile link copied! ✅")
                } catch {
                  alert("Copy failed. Please copy the profile URL manually.")
                }
              }}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-bold"
            >
              Share profile
            </button>

            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 font-bold"
            >
              QR
            </button>
          </div>

          <HighlightsInline
            username={username}
            onSelect={(highlight: any) => {
              const stories =
                highlight.stories?.length > 0
                  ? highlight.stories
                  : [{ image: highlight.cover, caption: highlight.title }]

              setSelectedHighlight({
                username,
                title: highlight.title,
                stories: stories.map((story: any) => ({
                  ...story,
                  image: fixR2Url(
                    typeof story === "string"
                      ? story
                      : story.image || story.url
                  ),
                })),
              })
            }}
          />
        </div>

        <div className="mt-4 flex border-y border-zinc-800">
          {(["POSTS", "REELS", "TAGGED"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 border-t-2 py-3 text-xs font-bold tracking-widest ${
                activeTab === tab
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-zinc-500"
              }`}
            >
              {tab === "POSTS"
                ? "▦ POSTS"
                : tab === "REELS"
                  ? "▶ REELS"
                  : "♙ TAGGED"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-blue-300">
            Loading your profile...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px]">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post: any, index: number) => {
                const url = post.image || ""
                const isVideo =
                  post.type === "reels" ||
                  String(url).toLowerCase().includes(".mp4")

                return (
                  <button
                    type="button"
                    key={post.id || index}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square overflow-hidden bg-zinc-900"
                  >
                    {pinnedPosts.includes(post.id) && (
                      <span className="absolute left-1 top-1 z-10 rounded bg-black/80 px-1.5 py-1 text-xs">
                        📌
                      </span>
                    )}

                    {isVideo ? (
                      <>
                        <video
                          src={url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <span className="absolute right-2 top-2">▶</span>
                      </>
                    ) : (
                      <img
                        src={url}
                        alt="Post"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                )
              })
            ) : (
              <div className="col-span-3 px-5 py-20 text-center">
                <p className="text-xl font-bold">
                  {activeTab === "REELS"
                    ? "No Reels yet"
                    : activeTab === "TAGGED"
                      ? "No tagged posts"
                      : "Share a photo"}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {searchQuery
                    ? "No posts match your search."
                    : "Posts for this account will appear here."}
                </p>

                {activeTab !== "TAGGED" && (
                  <button
                    type="button"
                    onClick={() => router.push("/create")}
                    className="mt-4 rounded-xl bg-blue-600 px-5 py-2 font-bold"
                  >
                    Create post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav active="profile" avatar={photo} />

      
      {/* Selected post */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] mx-auto flex max-w-[470px] flex-col bg-black">
          <div className="flex items-center justify-between border-b border-zinc-800 p-4">
            <button type="button" onClick={() => setSelectedPost(null)}>
              ✕
            </button>
            <span className="font-bold">{username}</span>
            <button
              type="button"
              onClick={() => handlePinPost(selectedPost)}
              className="text-lg"
            >
              {pinnedPosts.includes(selectedPost.id) ? "Unpin" : "📌"}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-hidden">
            {selectedPost.type === "reels" ||
            String(selectedPost.url || "").toLowerCase().includes(".mp4") ? (
              <video
                src={selectedPost.url || selectedPost.image}
                controls
                autoPlay
                playsInline
                className="max-h-full w-full"
              />
            ) : (
              <img
                src={selectedPost.url || selectedPost.image}
                alt="Selected post"
                className="max-h-full w-full object-contain"
              />
            )}
          </div>

          <div className="border-t border-zinc-800 p-4">
            {selectedPost.caption && (
              <p className="mb-3 text-sm text-zinc-300">
                {selectedPost.caption}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleArchive(selectedPost)}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 py-3"
              >
                📦 Archive
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedPost)}
                className="flex-1 rounded-xl bg-red-600 py-3 font-bold"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story viewer */}
      {selectedHighlight && (
        <StoryViewerInline
          users={[selectedHighlight]}
          onClose={() => setSelectedHighlight(null)}
        />
      )}

      {/* Edit profile */}
      {showEdit && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80"
          onClick={() => !uploading && setShowEdit(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[470px] overflow-y-auto rounded-t-3xl border border-blue-500/20 bg-zinc-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-700" />

            <h2 className="mb-5 text-center text-lg font-black">
              Edit Profile
            </h2>

            <div className="mb-5 flex flex-col items-center">
              <div className="rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[3px]">
                <div className="rounded-full bg-black p-[3px]">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-3xl">
                      👤
                    </div>
                  )}
                </div>
              </div>

              <label
                htmlFor="editPhotoInput2"
                className="mt-3 cursor-pointer font-bold text-blue-400"
              >
                {uploading ? "Uploading..." : "Change Profile Photo"}
              </label>

              <input
                id="editPhotoInput2"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            <label className="mb-1 block text-xs text-zinc-400">
              Username
            </label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Username"
              className="mb-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 outline-none focus:border-blue-500"
            />

            <label className="mb-1 block text-xs text-zinc-400">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Write your bio"
              className="mb-3 h-24 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 outline-none focus:border-blue-500"
            />

            <label className="mb-1 block text-xs text-zinc-400">
              Website
            </label>
            <input
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="Website link"
              className="mb-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={handleProfileSave}
              disabled={uploading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-black disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Save Profile"}
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={() => setShowEdit(false)}
              className="mt-2 w-full rounded-xl bg-zinc-800 py-3 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Profile menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="w-full max-w-[470px] rounded-t-3xl border border-blue-500/20 bg-zinc-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-700" />

            <h3 className="mb-3 text-center font-black">Profile Menu</h3>

            <button
              type="button"
              onClick={() => {
                setShowArchive(true)
                setShowMenu(false)
              }}
              className="w-full border-b border-zinc-800 py-4 text-left"
            >
              📦 Archive ({archivedPosts.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setShowQR(true)
                setShowMenu(false)
              }}
              className="w-full border-b border-zinc-800 py-4 text-left"
            >
              ▦ Profile QR
            </button>

            <button
              type="button"
              onClick={() => {
                setEditName(username)
                setEditBio(bio)
                setEditLink(link)
                setShowEdit(true)
                setShowMenu(false)
              }}
              className="w-full py-4 text-left"
            >
              ✎ Edit profile
            </button>

            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="mt-2 w-full rounded-xl bg-zinc-800 py-3 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Profile link panel */}
      {showQR && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-6"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-3xl border border-blue-500/20 bg-zinc-950 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black">@{username}</h3>

            <p className="mt-2 text-xs text-zinc-400">Profile link</p>

            <p className="mt-2 break-all rounded-xl bg-zinc-900 p-3 text-sm text-blue-300">
              {typeof window !== "undefined"
                ? window.location.href
                : `https://chitpix.com/${username}`}
            </p>

            <p className="mt-3 text-xs text-zinc-500">
              This panel shows your profile link. A scannable QR image has not
              been generated in this version.
            </p>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  alert("Profile link copied! ✅")
                } catch {
                  alert("Unable to copy link.")
                }
              }}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-bold"
            >
              Copy profile link
            </button>

            <button
              type="button"
              onClick={() => setShowQR(false)}
              className="mt-2 w-full rounded-xl bg-zinc-800 py-3 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Archive */}
      {showArchive && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80"
          onClick={() => setShowArchive(false)}
        >
          <div
            className="max-h-[75vh] w-full max-w-[470px] overflow-y-auto rounded-t-3xl border border-blue-500/20 bg-zinc-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">📦 Archive</h3>
              <button
                type="button"
                onClick={() => setShowArchive(false)}
              >
                ✕
              </button>
            </div>

            {archivedPosts.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-500">
                No archived posts in this session.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {archivedPosts.map((post: any, index: number) => (
                  <div key={post.id || index}>
                    <img
                      src={post.image || post.url}
                      alt="Archived post"
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPosts((current) => [post, ...current])
                        setArchivedPosts((current) =>
                          current.filter((item) => item.id !== post.id)
                        )
                      }}
                      className="mt-1 w-full rounded-lg bg-blue-600 py-1.5 text-xs font-bold"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-zinc-500">
              Archive is temporary in this version and will reset when the page
              reloads.
            </p>
          </div>
        </div>
      )}

      {/* Followers / Following */}
      {(showFollowers || showFollowing) && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80"
          onClick={() => {
            setShowFollowers(false)
            setShowFollowing(false)
          }}
        >
          <div
            className="w-full max-w-[470px] rounded-t-3xl border border-blue-500/20 bg-zinc-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />

            <h3 className="text-center text-lg font-black">
              {showFollowers ? "Followers" : "Following"}
            </h3>

            <p className="py-8 text-center text-sm text-zinc-400">
              {showFollowers
                ? `${followers} followers`
                : `Following ${following} accounts`}
            </p>

            <p className="mb-4 text-center text-xs text-zinc-500">
              These are display counts. Real user lists need the relevant
              Supabase tables.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowFollowers(false)
                setShowFollowing(false)
              }}
              className="w-full rounded-xl bg-zinc-800 py-3 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
              }
                
