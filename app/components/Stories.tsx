// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"

const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p: any) {
  const url =
    p?.image_url ||
    p?.url ||
    p?.image ||
    p?.publicUrl ||
    p?.key ||
    ""

  if (!url) return ""

  // Already a complete URL: keep it unchanged.
  if (/^https?:\/\//i.test(url)) return url

  // Keep the complete object path if it is already present.
  const cleanPath = url.replace(/^\/+/, "")
  if (
    cleanPath.startsWith("stories/") ||
    cleanPath.startsWith("posts/") ||
    cleanPath.startsWith("avatars/")
  ) {
    return `${R2_PUBLIC.replace(/\/$/, "")}/${cleanPath}`
  }

  return `${R2_PUBLIC.replace(/\/$/, "")}/stories/${cleanPath}`
}

export default function StoriesBar({ onSelectUser, onAdd }: any) {
  const [stories, setStories] = useState<any[]>([])
  const [seen, setSeen] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch("/api/stories?limit=100", {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Stories load failed")

        const data = await res.json()
        const raw = Array.isArray(data)
          ? data
          : data.stories || []

        const grouped: any = {}

        raw.forEach((s: any) => {
          const username = s.username || s.user || "user"

          if (!grouped[username]) {
            grouped[username] = {
              username,
              avatar:
                s.avatar ||
                `https://i.pravatar.cc/100?u=${encodeURIComponent(username)}`,
              stories: [],
              verified: s.verified || false,
              isCloseFriend: s.isCloseFriend || false,
            }
          }

          const image = fixR2Url(s)

          if (image) {
            grouped[username].stories.push({
              ...s,
              image,
              image_url: image,
            })
          }
        })

        if (active) setStories(Object.values(grouped))
      } catch (error) {
        console.error("Stories load error:", error)
        if (active) setStories([])
      }
    }

    load()

    fetch("/api/story_views", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) setSeen(data.views || {})
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const handleAddClick = () => {
    if (typeof onAdd === "function") {
      onAdd()
    } else {
      fileRef.current?.click()
    }
  }

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const presignRes = await fetch("/api/r2-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `stories/${Date.now()}-${file.name}`,
          contentType: file.type,
        }),
      })

      const presignData = await presignRes.json()

      if (
        !presignRes.ok ||
        !presignData.url ||
        !presignData.publicUrl
      ) {
        throw new Error(
          presignData.error || "R2 upload URL dorakaledu"
        )
      }

      const uploadRes = await fetch(presignData.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!uploadRes.ok) {
        throw new Error(`R2 upload failed: ${uploadRes.status}`)
      }

      const saveRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: presignData.publicUrl,
          image: presignData.publicUrl,
        }),
      })

      if (!saveRes.ok) {
        throw new Error("Story database save failed")
      }

      window.location.reload()
    } catch (error) {
      console.error("Story upload error:", error)
      alert("Story upload failed! Please try again.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const openStory = (user: any) => {
    if (!user?.stories?.length) return

    // Open this component's viewer directly.
    setSelectedUser(user)
    setStoryIndex(0)

    // Notify the parent too, if it uses this callback.
    if (typeof onSelectUser === "function") {
      try {
        onSelectUser(user, stories.indexOf(user))
      } catch (error) {
        console.error("Parent story callback error:", error)
      }
    }
  }

  const closeStory = () => setSelectedUser(null)

  const currentStory = selectedUser?.stories?.[storyIndex]
  const currentImage = currentStory ? fixR2Url(currentStory) : ""

  const nextStory = () => {
    if (!selectedUser) return

    if (storyIndex < selectedUser.stories.length - 1) {
      setStoryIndex((index: number) => index + 1)
    } else {
      closeStory()
    }
  }

  return (
    <>
      <div className="w-full bg-white border-b border-zinc-100 py-3 px-2 flex gap-3 overflow-x-auto scrollbar-hide select-none">
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/*,video/*"
          onChange={handleFile}
        />

        <button
          type="button"
          onClick={handleAddClick}
          disabled={uploading}
          className="flex flex-col items-center min-w-[66px] cursor-pointer touch-manipulation"
        >
          <div className="w-[66px] h-[66px] rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-2xl">
            {uploading ? "⏳" : "＋"}
          </div>
          <span className="text-[11px] mt-1">Your Story</span>
          <span className="text-[9px] text-zinc-400">Kadur • HD</span>
        </button>

        {stories.map((user: any, i: number) => {
          const isSeen = seen[user.username]

          const ringClass = user.isCloseFriend
            ? "p-[2.5px] bg-green-500"
            : isSeen
            ? "p-[2.5px] bg-zinc-200"
            : "p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"

          return (
            <button
              type="button"
              key={user.username || i}
              onClick={() => openStory(user)}
              className="flex flex-col items-center min-w-[66px] cursor-pointer touch-manipulation"
            >
              <div className={`rounded-full ${ringClass}`}>
                <div className="bg-white p-[2px] rounded-full">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-[60px] h-[60px] rounded-full object-cover"
                  />
                </div>
              </div>

              <span className="text-[11px] mt-1 max-w-[66px] truncate">
                {user.username} {user.verified && "👑"}
              </span>

              <span className="text-[8px] text-zinc-400">
                {user.stories.length} • R2
              </span>
            </button>
          )
        })}
      </div>

      {selectedUser && currentStory && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={closeStory}
        >
          <div
            className="relative w-full h-full max-w-[480px] bg-black flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              {selectedUser.stories.map((_: any, i: number) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full bg-white/40 overflow-hidden"
                >
                  <div
                    className={`h-full ${
                      i <= storyIndex ? "bg-white" : "bg-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-7 left-3 z-20 text-white text-sm">
              {selectedUser.username}
            </div>

            <button
              type="button"
              onClick={closeStory}
              className="absolute top-5 right-4 z-30 text-white text-3xl px-2"
              aria-label="Close story"
            >
              ×
            </button>

            {currentImage ? (
              currentImage.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                <video
                  key={currentImage}
                  src={currentImage}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-full object-contain"
                />
              ) : (
                <img
                  key={currentImage}
                  src={currentImage}
                  alt="Story"
                  className="w-full max-h-full object-contain"
                  onError={() =>
                    console.error("Story image failed to load:", currentImage)
                  }
                />
              )
            ) : (
              <p className="text-white">Story photo dorakaledu.</p>
            )}

            <button
              type="button"
              onClick={nextStory}
              className="absolute right-0 top-1/3 bottom-1/3 w-1/4 z-10"
              aria-label="Next story"
            />

            {storyIndex > 0 && (
              <button
                type="button"
                onClick={() => setStoryIndex((index: number) => index - 1)}
                className="absolute left-0 top-1/3 bottom-1/3 w-1/4 z-10"
                aria-label="Previous story"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
