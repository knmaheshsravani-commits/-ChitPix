 // @ts-nocheck
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "../../lib/supabase"

const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function getStoryImage(story: any) {
  const value =
    story?.image_url ||
    story?.url ||
    story?.image ||
    story?.publicUrl ||
    story?.video_url ||
    ""

  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value

  const path = String(value).replace(/^\/+/, "")
  return `${R2_PUBLIC.replace(/\/$/, "")}/${
    path.startsWith("stories/") ? path : `stories/${path}`
  }`
}

function cleanUsername(value: any) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase()
}

export default function StoryViewer({
  users = [],
  startIndex = 0,
  onClose,
}: any) {
  const [userIdx, setUserIdx] = useState(startIndex || 0)
  const [storyIdx, setStoryIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const [username, setUsername] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [authReady, setAuthReady] = useState(false)

  const [liked, setLiked] = useState<any>({})
  const [likeCounts, setLikeCounts] = useState<any>({})
  const [likeBusy, setLikeBusy] = useState<any>({})

  const [showSeenList, setShowSeenList] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState("")
  const [viewCounts, setViewCounts] = useState<any>({})

  const timerRef = useRef<any>(null)
  const startedAtRef = useRef(0)
  const elapsedRef = useRef(0)
  const durationRef = useRef(7000)

  const currentUser = users?.[userIdx]
  const currentStory = currentUser?.stories?.[storyIdx]
  const storyId = String(currentStory?.id || "")
  const storyImage = getStoryImage(currentStory)

  const owner = cleanUsername(
    currentUser?.username || currentStory?.username
  )
  const isOwnStory = !!username && username === owner

  // Get the actual signed-in Supabase user and profile username.
  useEffect(() => {
    let active = true

    const loadUsername = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error

        const user = data?.user

        if (!user) {
          if (active) {
            setUsername("")
            setCurrentUserId("")
            setAuthReady(true)
          }
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Story profile load failed:", profileError)
        }

        const name = cleanUsername(
          profile?.username ||
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          ""
        )

        if (active) {
          setCurrentUserId(user.id)
          setUsername(name)
          setAuthReady(true)
        }
      } catch (error) {
        console.error("Story login check failed:", error)
        if (active) setAuthReady(true)
      }
    }

    loadUsername()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUsername()
    })

    return () => {
      active = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const close = useCallback(() => {
    stopTimer()
    if (typeof onClose === "function") onClose()
  }, [onClose, stopTimer])

  const goNext = useCallback(() => {
    stopTimer()
    elapsedRef.current = 0
    setProgress(0)

    const storyCount = currentUser?.stories?.length || 0

    if (storyIdx < storyCount - 1) {
      setStoryIdx((n: number) => n + 1)
    } else if (userIdx < users.length - 1) {
      setUserIdx((n: number) => n + 1)
      setStoryIdx(0)
    } else {
      close()
    }
  }, [close, currentUser, storyIdx, userIdx, users.length, stopTimer])

  const goPrev = useCallback(() => {
    stopTimer()
    elapsedRef.current = 0
    setProgress(0)

    if (storyIdx > 0) {
      setStoryIdx((n: number) => n - 1)
    } else if (userIdx > 0) {
      const previousStories = users[userIdx - 1]?.stories || []
      setUserIdx((n: number) => n - 1)
      setStoryIdx(Math.max(0, previousStories.length - 1))
    }
  }, [storyIdx, userIdx, users, stopTimer])
    
  useEffect(() => {
    if (!storyId) return

    let active = true

    const loadLikes = async () => {
      try {
        const query = new URLSearchParams({ storyId })
        if (username) query.set("username", username)

        const res = await fetch(`/api/story-likes?${query}`, {
          cache: "no-store",
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Likes load failed")
        if (!active) return

        setLikeCounts((old: any) => ({
          ...old,
          [storyId]: Number(data.count || 0),
        }))
        setLiked((old: any) => ({
          ...old,
          [storyId]: !!data.liked,
        }))
      } catch (error) {
        console.error("Story likes load failed:", error)
      }
    }

    loadLikes()
    return () => {
      active = false
    }
  }, [storyId, username])

  // Register a view. The route must exist for the count to persist.
  useEffect(() => {
    if (!storyId || !username) return

    let active = true

    const registerView = async () => {
      try {
        const res = await fetch("/api/story_views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, storyId, storyOwner: owner }),
        })

        const data = await res.json().catch(() => ({}))

        if (active && res.ok && typeof data.count === "number") {
          setViewCounts((old: any) => ({
            ...old,
            [storyId]: data.count,
          }))
        }
      } catch (error) {
        console.error("Story view save failed:", error)
      }
    }

    registerView()
    return () => {
      active = false
    }
  }, [storyId, username, owner])

  useEffect(() => {
    if (!currentStory || paused || showSeenList || showMore) {
      stopTimer()
      return
    }

    startedAtRef.current = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed =
        elapsedRef.current + Date.now() - startedAtRef.current
      const nextProgress = Math.min(
        (elapsed / durationRef.current) * 100,
        100
      )

      setProgress(nextProgress)

      if (elapsed >= durationRef.current) {
        stopTimer()
        goNext()
      }
    }, 50)

    return () => stopTimer()
  }, [
    currentStory,
    paused,
    showSeenList,
    showMore,
    storyId,
    goNext,
    stopTimer,
  ])

  const togglePause = () => {
    elapsedRef.current = (progress / 100) * durationRef.current
    setPaused((value: boolean) => !value)
  }

  const toggleLike = async () => {
    if (!storyId) return

    if (!authReady || !username) {
      setStatus("Like cheyyadaniki Gmail tho login avvali.")
      return
    }

    if (likeBusy[storyId]) return

    const wasLiked = !!liked[storyId]
    const previousCount = Number(likeCounts[storyId] || 0)

    setLikeBusy((old: any) => ({ ...old, [storyId]: true }))
    setLiked((old: any) => ({ ...old, [storyId]: !wasLiked }))
    setLikeCounts((old: any) => ({
      ...old,
      [storyId]: Math.max(0, previousCount + (wasLiked ? -1 : 1)),
    }))
    setStatus("")

    try {
      const res = await fetch("/api/story-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, username, storyOwner: owner }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Like save avvaledu")
      }

      setLiked((old: any) => ({
        ...old,
        [storyId]: data.action === "liked",
      }))
      setLikeCounts((old: any) => ({
        ...old,
        [storyId]: Number(data.count ?? previousCount),
      }))
    } catch (error: any) {
      setLiked((old: any) => ({ ...old, [storyId]: wasLiked }))
      setLikeCounts((old: any) => ({ ...old, [storyId]: previousCount }))
      setStatus(error.message || "Like save avvaledu.")
    } finally {
      setLikeBusy((old: any) => ({ ...old, [storyId]: false }))
    }
    }
      
  const sendReply = async () => {
    const message = reply.trim()
    if (!message) return

    if (!authReady || !username) {
      setStatus("Reply pampadaniki Gmail tho login avvali.")
      return
    }

    if (!storyId) {
      setStatus("Story ID dorakaledu.")
      return
    }

    try {
      setStatus("Reply sending...")

      const res = await fetch("/api/story-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, username, storyOwner: owner, message }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Reply save avvaledu.")
      }

      setReply("")
      setStatus("Reply sent successfully!")
    } catch (error: any) {
      setStatus(error.message || "Reply pampadam fail ayindi.")
    }
  }

  const shareStory = async () => {
    if (!storyImage) {
      setStatus("Story URL dorakaledu.")
      return
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${owner || "ChitPix"} story`,
          text: `ChitPix story by ${owner || "user"}`,
          url: storyImage,
        })
      } else {
        await navigator.clipboard.writeText(storyImage)
        setStatus("Story link copied.")
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") setStatus("Share cheyyalekapoyanu.")
    }
  }

  const downloadStory = async () => {
    if (!storyImage) {
      setStatus("Story URL dorakaledu.")
      return
    }

    try {
      setStatus("Download preparing...")

      const response = await fetch(storyImage)
      if (!response.ok) throw new Error("Media download failed")

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = objectUrl
      link.download = `chitpix-story-${storyId || Date.now()}`
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(objectUrl)
      setStatus("Download started.")
    } catch (error) {
      console.error("Story download failed:", error)
      // Cross-origin or R2 CORS restrictions may block blob download.
      window.open(storyImage, "_blank", "noopener,noreferrer")
      setStatus("Story open chesanu. Download option browser lo try cheyyi.")
    }
  }

  const convertToPost = async () => {
    if (!storyImage) {
      setStatus("Story URL dorakaledu.")
      return
    }

    if (!authReady || !currentUserId || !username) {
      setStatus("Post cheyyadaniki Gmail tho login avvali.")
      return
    }

    try {
      setStatus("Post create chestunnanu...")

      // Use the same Supabase posts table as page.tsx.
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: currentUserId,
          image_url: storyImage,
          r2_url: storyImage,
          caption: String(currentStory?.caption || "").trim(),
          price: null,
          username,
        })
        .select("*")
        .single()

      if (error) throw error

      setStatus("Post create ayyindi! Feed refresh chesi check cheyyi.")
    } catch (error: any) {
      console.error("Story to post failed:", error)
      setStatus(error?.message || "Post create avvaledu.")
    }
  }

  const deleteStory = async () => {
    if (!isOwnStory) {
      setStatus("Mee story matrame delete cheyyagalru.")
      return
    }

    if (!window.confirm("Ee story delete cheyyala?")) return

    try {
      const res = await fetch(
        `/api/stories?id=${encodeURIComponent(storyId)}`,
        { method: "DELETE" }
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Story delete avvaledu")
      }

      setStatus("Story deleted.")
      goNext()
    } catch (error: any) {
      setStatus(error.message || "Story delete avvaledu.")
    }
  }

  if (!currentStory || !currentUser) return null

  const isVideo =
    currentStory.type === "video" ||
    currentStory.type === "reel" ||
    !!currentStory.video_url ||
    /\.(mp4|webm|mov)(\?|$)/i.test(storyImage)

  const displayedViews = Number(
    viewCounts[storyId] ?? currentStory.views ?? 0
  )
    
  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col w-full max-w-[480px] mx-auto overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-2">
        {(currentUser.stories || []).map((_: any, i: number) => (
          <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white"
              style={{
                width:
                  i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-0 right-0 z-30 flex justify-between items-center px-3 pt-5">
        <button
          type="button"
          onClick={() => {
            setPaused(true)
            window.location.href = `/profile/${encodeURIComponent(owner)}`
          }}
          className="flex items-center gap-2 text-left"
        >
          <img
            src={currentUser.avatar || currentStory.avatar_url || ""}
            className="w-9 h-9 rounded-full object-cover"
            alt=""
          />
          <span>
            <span className="block text-sm font-bold">
              {owner || "user"} {currentUser.verified ? "👑" : ""}
            </span>
            <span className="block text-[10px] text-white/70">
              Story · {likeCounts[storyId] || 0} likes
            </span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button type="button" onClick={togglePause} aria-label={paused ? "Resume" : "Pause"}>
            {paused ? "▶️" : "⏸️"}
          </button>
          <button type="button" onClick={close} className="text-2xl" aria-label="Close">
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-950">
        {storyImage ? (
          isVideo ? (
            <video
              key={storyImage}
              src={storyImage}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              key={storyImage}
              src={storyImage}
              alt="Story"
              className="max-w-full max-h-full object-contain"
              onError={() => setStatus("Story photo load avvaledu. URL check cheyyali.")}
            />
          )
        ) : (
          <p className="text-sm text-white/70">Story photo URL dorakaledu.</p>
        )}

        <button
          type="button"
          aria-label="Previous story"
          onClick={goPrev}
          className="absolute left-0 top-1/4 bottom-1/4 w-1/5 z-10"
        />
        <button
          type="button"
          aria-label="Next story"
          onClick={goNext}
          className="absolute right-0 top-1/4 bottom-1/4 w-1/5 z-10"
        />

        <div className="absolute top-[30%] left-3 bg-black/60 rounded-full px-3 py-1 text-xs pointer-events-none">
          {currentStory.caption || "ChitPix Story"}
        </div>

        <button
          type="button"
          onClick={toggleLike}
          disabled={!!likeBusy[storyId]}
          className={`absolute right-4 bottom-36 z-[60] rounded-full px-4 py-3 text-xl ${
            liked[storyId] ? "bg-pink-600" : "bg-black/60"
          }`}
          aria-label="Like story"
        >
          {liked[storyId] ? "❤️" : "🤍"}
          <span className="ml-2 text-sm">{Number(likeCounts[storyId] || 0)}</span>
        </button>

        {liked[storyId] && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl pointer-events-none">
            ❤️
          </div>
        )}

        {status && (
          <div className="absolute top-16 left-3 right-3 z-40 rounded-lg bg-black/80 p-3 text-center text-xs">
            {status}
            <button type="button" className="ml-3 underline" onClick={() => setStatus("")}>
              Close
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[100] p-3 pb-6 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <input
            value={reply}
            onChange={(e: any) => setReply(e.target.value)}
            placeholder={`Reply to ${owner || "user"}...`}
            className="min-w-0 flex-1 bg-white/10 border border-white/30 rounded-full px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none"
            onFocus={() => setPaused(true)}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") sendReply()
            }}
          />

          <button
            type="button"
            onClick={sendReply}
            className="rounded-full bg-blue-600 px-4 py-3 text-sm font-bold"
          >
            Send
          </button>

          <button
            type="button"
            onClick={() => setShowSeenList(true)}
            className="text-xs"
            aria-label="Views"
          >
            👁️ {displayedViews}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          <button type="button" onClick={shareStory} className="border border-white/30 rounded-full px-3 py-2 text-xs">
            ↗️ Share
          </button>
          <button type="button" onClick={downloadStory} className="border border-white/30 rounded-full px-3 py-2 text-xs">
            ⬇️ Download
          </button>
          <button type="button" onClick={convertToPost} className="border border-white/30 rounded-full px-3 py-2 text-xs">
            📌 To Post
          </button>
          <button type="button" onClick={() => setShowMore(!showMore)} className="border border-white/30 rounded-full px-3 py-2 text-xs">
            ⋯ More
          </button>
        </div>
      </div>

      {showMore && (
        <div className="absolute inset-0 z-40 bg-black/70 flex items-end">
          <div className="w-full bg-white text-black rounded-t-2xl p-5 space-y-3">
            <p className="font-bold">Story options</p>
            {isOwnStory ? (
              <button type="button" onClick={deleteStory} className="w-full text-left py-2 text-red-600">
                🗑️ Delete my story
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStatus("Report API inka connect cheyyali.")}
                className="w-full text-left py-2"
              >
                🚩 Report story
              </button>
            )}
            <button type="button" onClick={() => setShowMore(false)} className="w-full rounded-full bg-black text-white py-3">
              Close
            </button>
          </div>
        </div>
      )}

      {showSeenList && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-end">
          <div className="w-full bg-white text-black rounded-t-2xl p-5">
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-4" />
            <h2 className="font-bold text-lg">Story views</h2>
            <p className="text-sm text-zinc-500 mt-2">
              Current story view count: {displayedViews}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Viewer names show avvadaniki API viewer list return cheyyali.
            </p>
            <button
              type="button"
              onClick={() => setShowSeenList(false)}
              className="w-full bg-black text-white rounded-full py-3 mt-5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
                                           }
        
