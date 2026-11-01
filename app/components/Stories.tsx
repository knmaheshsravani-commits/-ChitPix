// @ts-nocheck
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import StoryViewer from "./StoryViewer"
import { supabase } from "../../lib/supabase"

const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p: any) {
  const value =
    typeof p === "string"
      ? p
      : p?.image_url ||
        p?.url ||
        p?.image ||
        p?.publicUrl ||
        p?.video_url ||
        p?.key ||
        ""

  if (!value) return ""

  if (/^https?:\/\//i.test(value)) return value

  const cleanPath = String(value).replace(/^\/+/, "")

  if (
    cleanPath.startsWith("stories/") ||
    cleanPath.startsWith("posts/") ||
    cleanPath.startsWith("avatars/")
  ) {
    return `${R2_PUBLIC.replace(/\/$/, "")}/${cleanPath}`
  }

  return `${R2_PUBLIC.replace(/\/$/, "")}/stories/${cleanPath}`
}

function cleanUsername(value: any) {
  return String(value || "").trim().replace(/^@/, "")
}

function getStoryTime(story: any) {
  const value =
    story?.created_at ||
    story?.createdAt ||
    story?.timestamp ||
    story?.date ||
    ""

  if (!value) return 0

  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function isActiveStory(story: any) {
  const now = Date.now()

  const expiry =
    story?.expires_at ||
    story?.expiresAt ||
    ""

  if (expiry) {
    const expiryTime = new Date(expiry).getTime()

    if (Number.isFinite(expiryTime) && expiryTime <= now) {
      return false
    }
  }

  const created = getStoryTime(story)

  if (created && now - created >= 24 * 60 * 60 * 1000) {
    return false
  }

  return true
}

export default function StoriesBar({ onSelectUser, onAdd }: any) {
  const [stories, setStories] = useState<any[]>([])
  const [seen, setSeen] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [loadingStories, setLoadingStories] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  // LOAD ALL USERS STORIES
  const loadStories = useCallback(async () => {
    try {
      setLoadingStories(true)

      const res = await fetch("/api/stories?limit=500", {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Stories load failed")
      }

      const data = await res.json()

      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.stories)
        ? data.stories
        : Array.isArray(data?.data)
        ? data.data
        : []

      const grouped: any = {}

      raw.forEach((s: any) => {
        if (!s) return

        const username = cleanUsername(
          s.username ||
          s.profile?.username ||
          s.profiles?.username ||
          s.user?.username ||
          (typeof s.user === "string" ? s.user : "")
        )

        const image = fixR2Url(s)

        // STORY MEDIA MUST EXIST
        if (!image) return

        // EXPIRED STORIES MUST NOT SHOW
        if (!isActiveStory(s)) return

        const userId =
          s.user_id ||
          s.userId ||
          s.profile_id ||
          s.profile?.id ||
          s.profiles?.id ||
          ""

        const ownerKey = String(
          userId || username.toLowerCase() || s.id || ""
        )

        if (!ownerKey) return

        if (!grouped[ownerKey]) {
          grouped[ownerKey] = {
            id: ownerKey,
            user_id: userId,
            username: username || "user",

            avatar:
              s.avatar_url ||
              s.avatar ||
              s.profile?.avatar_url ||
              s.profiles?.avatar_url ||
              s.user?.avatar_url ||
              `https://i.pravatar.cc/100?u=${encodeURIComponent(
                username || ownerKey
              )}`,

            stories: [],
            verified: !!s.verified,
            isCloseFriend: !!s.isCloseFriend,
          }
        }

        grouped[ownerKey].stories.push({
          ...s,
          username: username || grouped[ownerKey].username,
          image,
          image_url: image,
        })

        // USE LATEST AVAILABLE PROFILE DATA
        if (
          s.avatar_url ||
          s.avatar ||
          s.profile?.avatar_url ||
          s.profiles?.avatar_url
        ) {
          grouped[ownerKey].avatar =
            s.avatar_url ||
            s.avatar ||
            s.profile?.avatar_url ||
            s.profiles?.avatar_url
        }

        if (s.verified) {
          grouped[ownerKey].verified = true
        }
      })

      // REMOVE EMPTY USERS AND SORT STORIES
      const users = Object.values(grouped)
        .filter((user: any) => user.stories.length > 0)
        .map((user: any) => {
          user.stories.sort((a: any, b: any) => {
            return getStoryTime(a) - getStoryTime(b)
          })

          return user
        })

      // USERS WITH NEWEST STORIES FIRST
      users.sort((a: any, b: any) => {
        const aLatest = Math.max(
          ...a.stories.map((s: any) => getStoryTime(s))
        )

        const bLatest = Math.max(
          ...b.stories.map((s: any) => getStoryTime(s))
        )

        return bLatest - aLatest
      })

      setStories(users)
    } catch (error) {
      console.error("Stories load error:", error)
    } finally {
      setLoadingStories(false)
    }
  }, [])

  // INITIAL LOAD + AUTOMATIC REFRESH
  useEffect(() => {
    let active = true

    loadStories()

    fetch("/api/story_views", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setSeen(data.views || {})
        }
      })
      .catch(() => {})

    const refreshTimer = setInterval(() => {
      if (active) loadStories()
    }, 60000)

    return () => {
      active = false
      clearInterval(refreshTimer)
    }
  }, [loadStories])

  // ADD STORY BUTTON
  const handleAddClick = () => {
    if (typeof onAdd === "function") {
      onAdd()
    } else {
      fileRef.current?.click()
    }
  }

  // UPLOAD STORY
  const handleFile = async (e: any) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/") &&
        !file.type.startsWith("video/")) {
      alert("Image or video select cheyyi.")
      return
    }

    setUploading(true)

    try {
      const presignRes = await fetch("/api/r2-presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: `stories/${Date.now()}-${file.name}`,
          contentType: file.type,
          fileSize: file.size,
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
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadRes.ok) {
        throw new Error(
          `R2 upload failed: ${uploadRes.status}`
        )
      }

      
      // GET LOGGED-IN USER
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData?.user) {
        throw new Error("Please login again")
      }

      const loggedUser = authData.user

      // GET USER PROFILE
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", loggedUser.id)
          .maybeSingle()

      if (profileError) throw profileError

      const username =
        profile?.username ||
        loggedUser.user_metadata?.username ||
        loggedUser.email?.split("@")[0]

      if (!username) {
        throw new Error("Username not found")
      }

      // SAVE STORY WITH REAL USER DETAILS
      const saveRes = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: presignData.publicUrl,
          image: presignData.publicUrl,
          username,
          user_id: loggedUser.id,
          avatar_url: profile?.avatar_url || "",
        }),
      })

      const saveData = await saveRes.json()

      if (!saveRes.ok) {
        throw new Error(
          saveData.error || "Story database save failed"
        )
      }
      

      await loadStories()

      alert("Story uploaded successfully!")
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

  // OPEN STORY
  const openStory = (user: any) => {
    if (!user?.stories?.length) return

    setSelectedUser(user)

    if (typeof onSelectUser === "function") {
      try {
        onSelectUser(
          user,
          stories.findIndex(
            (item: any) => item.id === user.id
          )
        )
      } catch (error) {
        console.error("Parent story callback error:", error)
      }
    }
  }

  // CLOSE STORY
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

        {/* ALL USERS WHO POSTED STORIES */}

        {stories.map((user: any, i: number) => {
          const isSeen =
            seen[user.username] ||
            seen[user.id]

          const ringClass = user.isCloseFriend
            ? "bg-green-500"
            : isSeen
            ? "bg-zinc-300"
            : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"

          return (
            <button
              type="button"
              key={user.id || user.username || i}
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
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        `https://i.pravatar.cc/100?u=${encodeURIComponent(user.username)}`
                    }}
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

        {loadingStories && stories.length === 0 && (
          <div className="text-xs text-zinc-400 py-5">
            Loading Stories...
          </div>
        )}

        {!loadingStories && stories.length === 0 && (
          <div className="text-xs text-zinc-400 py-5">
            No Stories yet
          </div>
        )}

      </div>

      {/* STORY VIEWER */}

      {selectedUser && (
        <StoryViewer
          users={stories}
          startIndex={stories.findIndex(
            (user: any) => user.id === selectedUser.id
          )}
          onClose={closeStory}
        />
      )}

    </>
  )
}
