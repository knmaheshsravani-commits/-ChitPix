// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import StoryViewer from "./StoryViewer"

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

  if (/^https?:\/\//i.test(url)) return url

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
                s.avatar_url ||
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

        if (active) {
          setStories(Object.values(grouped))
        }
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

      if (fileRef.current) {
        fileRef.current.value = ""
      }
    }
  }

  const openStory = (user: any) => {
    if (!user?.stories?.length) return

    setSelectedUser(user)
    setStoryIndex(0)

    if (typeof onSelectUser === "function") {
      try {
        onSelectUser(user, stories.indexOf(user))
      } catch (error) {
        console.error("Parent story callback error:", error)
      }
    }
  }

  const closeStory = () => {
    setSelectedUser(null)
  }

  return (
    <>
      {/* INSTAGRAM STYLE STORIES BAR */}

      <div className="w-full bg-white border-b border-zinc-100 py-3 px-3 flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide select-none">

        {/* HIDDEN FILE INPUT */}

        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/*,video/*"
          onChange={handleFile}
        />

        {/* YOUR STORY */}

        <button
          type="button"
          onClick={handleAddClick}
          disabled={uploading}
          className="flex flex-col items-center min-w-[76px] shrink-0 touch-manipulation"
        >
          <div className="relative w-[66px] h-[66px] rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center">

            <span className="text-3xl text-black">
              {uploading ? "⏳" : ""}
            </span>

            {!uploading && (
              <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white text-lg font-bold">
                +
              </span>
            )}

          </div>

          <span className="text-[12px] mt-1 text-black">
            Your Story
          </span>
        </button>

        {/* OTHER USERS STORIES */}

        {stories.map((user: any, i: number) => {
          const isSeen = seen[user.username]

          const ringClass = user.isCloseFriend
            ? "bg-green-500"
            : isSeen
            ? "bg-zinc-300"
            : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"

          return (
            <button
              type="button"
              key={user.username || i}
              onClick={() => openStory(user)}
              className="flex flex-col items-center min-w-[76px] shrink-0 touch-manipulation"
            >

              {/* PROFILE RING */}

              <div
                className={`w-[66px] h-[66px] rounded-full p-[3px] ${ringClass}`}
              >
                <div className="w-full h-full rounded-full bg-white p-[2px]">

                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />

                </div>
              </div>

              {/* USERNAME */}

              <span className="text-[12px] mt-1 text-black max-w-[76px] truncate">
                {user.username}
                {user.verified && " 👑"}
              </span>

            </button>
          )
        })}

      </div>

      {/* STORY VIEWER */}

      {selectedUser && (
        <StoryViewer
          users={stories}
          startIndex={stories.findIndex(
            (user: any) =>
              user.username === selectedUser.username
          )}
          onClose={closeStory}
        />
      )}
    </>
  )
                        }
                     
