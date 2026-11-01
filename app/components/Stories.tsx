// @ts-nocheck
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import StoryViewer from "./StoryViewer"
import StoryComposer from "./StoryComposer"
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

  const expiry = story?.expires_at || story?.expiresAt || ""

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

function getStoryOwner(story: any) {
  const userId =
    story?.user_id ||
    story?.userId ||
    story?.profile_id ||
    story?.profile?.id ||
    story?.profiles?.id ||
    story?.user?.id ||
    ""

  const username = cleanUsername(
    story?.username ||
      story?.profile?.username ||
      story?.profiles?.username ||
      story?.user?.username ||
      (typeof story?.user === "string" ? story.user : "")
  )

  if (userId) {
    return {
      key: `user:${String(userId)}`,
      userId: String(userId),
      username,
    }
  }

  if (username) {
    return {
      key: `username:${username.toLowerCase()}`,
      userId: "",
      username,
    }
  }

  return null
}

export default function StoriesBar({ onSelectUser, onAdd }: any) {
  const [stories, setStories] = useState<any[]>([])
  const [seen, setSeen] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loadingStories, setLoadingStories] = useState(false)
  const [showComposer, setShowComposer] = useState(false)

  const [currentUserId, setCurrentUserId] = useState("")
  const [myUsername, setMyUsername] = useState("")
  const [myAvatar, setMyAvatar] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  // GET LOGGED-IN USER AND PROFILE DP
  const loadMyProfile = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser()
      const authUser = data?.user

      if (!authUser) return

      setCurrentUserId(authUser.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle()

      setMyUsername(
        cleanUsername(
          profile?.username ||
            authUser.user_metadata?.username ||
            authUser.email?.split("@")[0]
        )
      )

      setMyAvatar(profile?.avatar_url || "")
    } catch (error) {
      console.error("My profile load error:", error)
    }
  }, [])

  // LOAD ALL USERS STORIES
  const loadStories = useCallback(async () => {
    try {
      setLoadingStories(true)

      const res = await fetch("/api/stories?limit=500", {
        cache: "no-store",
      })

      if (!res.ok) throw new Error("Stories load failed")

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

        const owner = getStoryOwner(s)
        if (!owner) return

        const image = fixR2Url(s)
        if (!image || !isActiveStory(s)) return

        const ownerKey = owner.key

        if (!grouped[ownerKey]) {
          grouped[ownerKey] = {
            id: ownerKey,
            user_id: owner.userId,
            username: owner.username || "user",
            avatar:
              s.avatar_url ||
              s.avatar ||
              s.profile?.avatar_url ||
              s.profiles?.avatar_url ||
              s.user?.avatar_url ||
              "",
            stories: [],
            verified: !!s.verified,
            isCloseFriend: !!s.isCloseFriend,
          }
        }

        grouped[ownerKey].stories.push({
          ...s,
          user_id: owner.userId || s.user_id || "",
          username: owner.username || grouped[ownerKey].username,
          image,
          image_url: image,
        })

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

        if (s.verified) grouped[ownerKey].verified = true
      })

      const users = Object.values(grouped)
        .filter((user: any) => user.stories.length > 0)
        .map((user: any) => {
          user.stories.sort(
            (a: any, b: any) => getStoryTime(a) - getStoryTime(b)
          )
          return user
        })

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

  // INITIAL LOAD + AUTO REFRESH
  useEffect(() => {
    let active = true

    loadMyProfile()
    loadStories()

    fetch("/api/story_views", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) setSeen(data.views || {})
      })
      .catch(() => {})

    const refreshTimer = setInterval(() => {
      if (active) {
        loadMyProfile()
        loadStories()
      }
    }, 60000)

    return () => {
      active = false
      clearInterval(refreshTimer)
    }
  }, [loadMyProfile, loadStories])

  // FIND MY OWN STORIES
  const myStories = stories.find(
    (user: any) =>
      currentUserId &&
      String(user.user_id || "") === String(currentUserId)
  )

  // OTHER USERS ONLY
  const otherUsersStories = stories.filter(
    (user: any) =>
      !currentUserId ||
      String(user.user_id || "") !== String(currentUserId)
  )

  // OPEN COMPOSER
  const handleAddClick = () => {
    if (typeof onAdd === "function") {
      try {
        onAdd()
      } catch (error) {
        console.error(error)
      }
    }

    setShowComposer(true)
  }

  // UPLOAD STORY
  const handleFile = async (file: File) => {
    if (!file) return

    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
    ) {
      alert("Image or video select cheyyi.")
      return
    }

    setUploading(true)

    try {
      const presignRes = await fetch("/api/r2-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": file.type },
      })

      if (!uploadRes.ok) {
        throw new Error(`R2 upload failed: ${uploadRes.status}`)
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData?.user) {
        throw new Error("Please login again")
      }

      const loggedUser = authData.user

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

      if (!username) throw new Error("Username not found")

      const saveRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setCurrentUserId(loggedUser.id)
      setMyUsername(cleanUsername(username))
      setMyAvatar(profile?.avatar_url || "")

      await loadStories()
      alert("Story uploaded successfully!")
    } catch (error) {
      console.error("Story upload error:", error)
      alert("Story upload failed! Please try again.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleInputChange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // PUBLISH FROM STORY COMPOSER
  const handleComposerPublish = async (file: File) => {
    setShowComposer(false)
    await handleFile(file)
  }

  // OPEN STORY
  const openStory = (user: any) => {
    if (!user?.stories?.length) return

    setSelectedUser(user)

    if (typeof onSelectUser === "function") {
      try {
        const index = stories.findIndex(
          (item: any) => item.id === user.id
        )
        onSelectUser(user, index)
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
          onChange={handleInputChange}
        />

        {/* YOUR STORY - PROFILE DP */}
        <button
          type="button"
          onClick={() => {
            if (myStories?.stories?.length) {
              openStory(myStories)
            } else {
              handleAddClick()
            }
          }}
          disabled={uploading}
          className="flex flex-col items-center min-w-[76px] shrink-0 touch-manipulation"
        >
          <div
            className={`relative w-[70px] h-[70px] rounded-full p-[3px] ${
              myStories?.stories?.length
                ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                : "bg-zinc-200"
            }`}
          >
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              {myAvatar ? (
                <img
                  src={myAvatar}
                  alt="Your profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center text-2xl font-bold text-zinc-500">
                  {myUsername?.charAt(0)?.toUpperCase() || "Y"}
                </div>
              )}
            </div>

            {!myStories?.stories?.length && (
              <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white text-lg font-bold">
                +
              </span>
            )}

            {uploading && (
              <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white">
                ⏳
              </span>
            )}
          </div>

          <span className="text-[12px] mt-1 text-black max-w-[76px] truncate">
            Your Story
          </span>
        </button>

        {/* OTHER USERS STORIES */}
        {otherUsersStories.map((user: any) => {
          const isSeen =
            seen[user.username] ||
            seen[user.id] ||
            seen[user.user_id]

          const ringClass = user.isCloseFriend
            ? "bg-green-500"
            : isSeen
              ? "bg-zinc-300"
              : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"

          return (
            <button
              type="button"
              key={user.id}
              onClick={() => openStory(user)}
              className="flex flex-col items-center min-w-[76px] shrink-0 touch-manipulation"
            >
              <div
                className={`w-[70px] h-[70px] rounded-full p-[3px] ${ringClass}`}
              >
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          `https://i.pravatar.cc/100?u=${encodeURIComponent(
                            user.username
                          )}`
                      }}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-500">
                      {user.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[12px] mt-1 text-black max-w-[76px] truncate">
                {user.username}
                {user.verified && " 👑"}
              </span>
            </button>
          )
        })}

        {/* LOADING */}
        {loadingStories && stories.length === 0 && (
          <div className="text-xs text-zinc-400 py-5">
            Loading Stories...
          </div>
        )}

        {/* EMPTY STORIES */}
        {!loadingStories && stories.length === 0 && (
          <div className="text-xs text-zinc-400 py-5">
            No Stories yet
          </div>
        )}

      </div>

      {/* STORY COMPOSER */}
      {showComposer && (
        <StoryComposer
          onClose={() => setShowComposer(false)}
          onPublish={handleComposerPublish}
        />
      )}

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
