"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Play,
  Pause,
  Plus,
  X,
  Smile,
  Copy,
  Download,
  Music2,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  Flag,
  UserRound,
  Check,
} from "lucide-react"

import BottomNav from "../components/BottomNav"
import { supabase } from "../../lib/supabase"

type Reel = {
  id: string
  videoUrl?: string
  video_url?: string
  url?: string
  imageUrl?: string
  image_url?: string
  caption?: string
  user?: string
  username?: string
  userAvatar?: string
  avatar_url?: string
  user_id?: string
  likes?: number
  comments?: number
  views?: string
  type?: string
  audio_name?: string
}

type ReelComment = {
  id: string | number
  post_id?: string
  user_id?: string
  user: string
  username: string
  avatar: string
  text: string
  likes: number
  time: string
  parent_id?: string | null
}

type UserProfile = {
  id?: string
  username?: string
  full_name?: string
  avatar_url?: string
}

const DEFAULT_AVATAR =
  "https://i.pravatar.cc/100?u=chitpix-user"

const GRADIENTS = {
  pink: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
  heart: "bg-gradient-to-tr from-orange-400 via-pink-500 to-rose-600",
  blue: "bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600",
  purple: "bg-gradient-to-tr from-violet-500 via-purple-600 to-pink-500",
  orange: "bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500",
}

export default function ReelsPage() {
  const router = useRouter()

  // Reel feed
  const [posts, setPosts] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingReels, setLoadingReels] = useState(true)
  const [reelsError, setReelsError] = useState("")

  // Reel actions
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [followed, setFollowed] = useState<Record<string, boolean>>({})
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [captionExpand, setCaptionExpand] =
    useState<Record<string, boolean>>({})

  // Modals
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Real comment data; no dummy comments
  const [comments, setComments] = useState<ReelComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState("")
  const [commentText, setCommentText] = useState("")
  const [replyTo, setReplyTo] = useState<ReelComment | null>(null)
  const [commentLikes, setCommentLikes] =
    useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"new" | "top">("new")
  const [pinnedId, setPinnedId] = useState<string | number | null>(null)
  const [postingComment, setPostingComment] = useState(false)

  // Signed-in user's actual profile
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState("ChitPix User")
  const [currentAvatar, setCurrentAvatar] = useState(DEFAULT_AVATAR)

  // Refs for scrolling and video playback
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({})
  const touchStartY = useRef<number | null>(null)

  // Load signed-in user and profile details
  useEffect(() => {
    let active = true

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user || !active) return

        const user = data.user
        let username =
          user.user_metadata?.username ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "ChitPix User"

        let avatar =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          DEFAULT_AVATAR

        // Assumes profiles.id stores the authenticated user's ID.
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.warn("Profile lookup:", profileError.message)
        }

        if (!active) return

        const savedProfile = profile as UserProfile | null

        if (savedProfile) {
          username =
            savedProfile.username ||
            savedProfile.full_name ||
            username

          avatar = savedProfile.avatar_url || avatar
        }

        setCurrentUserId(user.id)
        setCurrentUsername(username)
        setCurrentAvatar(avatar)
      } catch (error) {
        console.error("Current user load error:", error)
      }
    }

    void loadUser()

    return () => {
      active = false
    }
  }, [])

  // Load actual Reels from the existing API
  useEffect(() => {
    let active = true

    const loadReels = async () => {
      setLoadingReels(true)
      setReelsError("")

      try {
        const savedMute = localStorage.getItem("reels_muted")

        if (savedMute !== null && active) {
          setMuted(savedMute === "true")
        }

        const response = await fetch("/api/reels?limit=50", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Reels API request failed")
        }

        const data = await response.json()
        let reels: Reel[] = data.reels || data.posts || []

        // Fallback to the existing posts API if needed
        if (reels.length === 0) {
          const fallback = await fetch("/api/posts?limit=50", {
            cache: "no-store",
          })

          if (fallback.ok) {
            const fallbackData = await fallback.json()
            const allPosts: Reel[] = fallbackData.posts || []

            reels = allPosts.filter(
              (post) =>
                post.videoUrl ||
                post.video_url ||
                /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(
                  post.url || ""
                )
            )
          }
        }

        if (active) {
          setPosts(reels)
        }
      } catch (error) {
        console.error("Reels loading error:", error)

        if (active) {
          setReelsError("Reels load avvaledu bro. Malli try cheyyi.")
          setPosts([])
        }
      } finally {
        if (active) setLoadingReels(false)
      }
    }

    void loadReels()

    return () => {
      active = false
    }
  }, [])

  // Part 2 continues with persistent, per-Reel comments,
  // posting, sharing, and the Reel interaction functions.
        
  // Load saved comments for the selected Reel.
  const loadComments = useCallback(async (postId: string) => {
    setCommentsLoading(true)
    setCommentsError("")
    setComments([])

    try {
      const response = await fetch(
        `/api/comment?postId=${encodeURIComponent(postId)}`,
        { cache: "no-store" }
      )

      if (!response.ok) {
        throw new Error("Comments API request failed")
      }

      const result = await response.json()
      const rows = Array.isArray(result.comments)
        ? result.comments
        : []

      const mapped: ReelComment[] = rows.map((item: any) => ({
        id: item.id,
        post_id: item.post_id,
        user_id: item.user_id,
        user: item.username || "ChitPix User",
        username: item.username || "ChitPix User",
        avatar: item.user_photo || DEFAULT_AVATAR,
        text: item.content || item.text || "",
        likes: Number(item.likes || 0),
        time: item.created_at
          ? new Date(item.created_at).toLocaleString()
          : "Just now",
        parent_id: item.parent_id || null,
      }))

      setComments(mapped)
    } catch (error) {
      console.error("Comments load error:", error)
      setCommentsError("Comments load avvaledu. Malli try cheyyi bro.")
    } finally {
      setCommentsLoading(false)
    }
  }, [])

  // Open comments for the current Reel.
  const openComments = async () => {
    const post = posts[currentIndex]

    if (!post?.id) {
      alert("Reel ID dorakaledu bro.")
      return
    }

    setCommentText("")
    setReplyTo(null)
    setShowComments(true)

    await loadComments(String(post.id))
  }

  // Save a comment through the server API.
  const postComment = async () => {
    const text = commentText.trim()
    const post = posts[currentIndex]

    if (!text || !post?.id || postingComment) return

    if (!currentUserId) {
      alert("Bro, comment cheyyadaniki mundu login avvu.")
      return
    }

    setPostingComment(true)

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: String(post.id),
          text,
          userId: currentUserId,
          username: currentUsername,
          userPhoto: currentAvatar,
          parentId: replyTo ? String(replyTo.id) : null,
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error("Comment API error:", result)
        alert(result.error || "Comment save avvaledu bro.")
        return
      }

      setCommentText("")
      setReplyTo(null)

      // Reload saved comments from the database.
      await loadComments(String(post.id))
    } catch (error) {
      console.error("Post comment error:", error)
      alert("Network problem bro. Malli try cheyyi.")
    } finally {
      setPostingComment(false)
    }
  }

  // Refresh comments when the selected Reel changes.
  useEffect(() => {
    if (!showComments) return

    const post = posts[currentIndex]
    if (!post?.id) return

    void loadComments(String(post.id))
  }, [currentIndex, showComments, posts, loadComments])

  // Comment likes currently update the UI only.
  // Persistent likes require a dedicated server endpoint.
  const toggleCommentLike = (id: string | number) => {
    const key = String(id)
    const wasLiked = Boolean(commentLikes[key])

    setCommentLikes((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))

    setComments((previous) =>
      previous.map((comment) =>
        String(comment.id) === key
          ? {
              ...comment,
              likes: Math.max(
                0,
                comment.likes + (wasLiked ? -1 : 1)
              ),
            }
          : comment
      )
    )
  }

  // Reel action states.
  const toggleLike = (postId: string) => {
    setLiked((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }))
  }

  const toggleSave = (postId: string) => {
    setSaved((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }))
  }

  const toggleFollow = (userId: string) => {
    setFollowed((previous) => ({
      ...previous,
      [userId]: !previous[userId],
    }))
  }

  const toggleMute = () => {
    setMuted((previous) => {
      const next = !previous
      localStorage.setItem("reels_muted", String(next))
      return next
    })
  }

  const togglePlayback = () => {
    const video = videoRefs.current[currentIndex]

    if (!video) {
      setIsPlaying((previous) => !previous)
      return
    }

    if (video.paused) {
      void video.play().catch((error) => {
        console.error("Video play error:", error)
      })
    } else {
      video.pause()
    }
  }

  // Share current Reel.
  const doShare = async (method: string) => {
    const post = posts[currentIndex]
    if (!post) return

    const mediaUrl =
      post.videoUrl ||
      post.video_url ||
      post.url ||
      post.imageUrl ||
      post.image_url ||
      ""

    const shareUrl =
      `${window.location.origin}/reels/${encodeURIComponent(post.id)}`

    const shareText =
      `${post.caption || "Watch this on ChitPix!"} ${shareUrl}`

    try {
      if (method === "copy") {
        await navigator.clipboard.writeText(shareUrl)
        alert("Reel link copied bro!")
      } else if (method === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          "_blank",
          "noopener,noreferrer"
        )
      } else if (method === "telegram") {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.caption || "ChitPix Reel")}`,
          "_blank",
          "noopener,noreferrer"
        )
      } else if (method === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "noopener,noreferrer"
        )
      } else if (
        method === "instagram" ||
        method === "chitpix" ||
        method === "native"
      ) {
        if (navigator.share) {
          await navigator.share({
            title: "ChitPix Reel",
            text: post.caption || "Watch this Reel",
            url: shareUrl,
          })
        } else {
          await navigator.clipboard.writeText(shareText)
          alert("Share link copied bro!")
        }
      } else if (method === "download") {
        if (mediaUrl) {
          window.open(mediaUrl, "_blank", "noopener,noreferrer")
        } else {
          alert("Media URL dorakaledu bro.")
        }
      } else if (method === "qr") {
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied. QR generator ni separate ga add cheyyali.")
      } else if (method === "clip" || method === "private") {
        alert("Ee feature ki separate backend implementation kavali bro.")
      }
    } catch (error) {
      console.error("Share error:", error)
    } finally {
      setShowShare(false)
    }
  }

  // Track which Reel is currently visible.
  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    const height = container.clientHeight
    if (!height) return

    const nextIndex = Math.round(container.scrollTop / height)

    setCurrentIndex(
      Math.max(0, Math.min(nextIndex, posts.length - 1))
    )
  }

  // Format comment count without adding fake comments.
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return String(count)
  }

  // Part 3 will contain the redesigned Reel UI,
  // gradient action icons, comments drawer and share sheet.
           
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-hide"
      >
        {loadingReels ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <LoaderCircle className="h-9 w-9 animate-spin text-pink-500" />
            <p className="text-sm text-white/70">Loading ChitPix Reels...</p>
          </div>
        ) : reelsError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p>{reelsError}</p>
            <button
              onClick={() => window.location.reload()}
              className={`rounded-full px-5 py-3 font-bold ${GRADIENTS.pink}`}
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Music2 className="h-12 w-12 text-pink-400" />
            <p className="text-lg font-bold">No Reels yet</p>
            <p className="text-sm text-white/60">
              Be the first to share a Reel!
            </p>
          </div>
        ) : (
          posts.map((post, idx) => {
            const postId = String(post.id)
            const media =
              post.videoUrl ||
              post.video_url ||
              post.url ||
              post.imageUrl ||
              post.image_url ||
              ""

            const isVideo =
              Boolean(post.videoUrl || post.video_url) ||
              /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(media)

            const username = post.username || post.user || "ChitPix User"
            const avatar =
              post.userAvatar || post.avatar_url || DEFAULT_AVATAR
            const isCurrent = idx === currentIndex
            const creatorId = post.user_id || username

            return (
              <section
                key={postId}
                className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
              >
                {media ? (
                  isVideo ? (
                    <video
                      ref={(element) => {
                        if (element) videoRefs.current[idx] = element
                        else delete videoRefs.current[idx]
                      }}
                      src={media}
                      className="absolute inset-0 h-full w-full object-contain"
                      loop
                      playsInline
                      muted={muted}
                      autoPlay={isCurrent}
                      onClick={togglePlayback}
                      onTimeUpdate={(event) => {
                        if (!isCurrent) return
                        const video = event.currentTarget
                        setProgress(
                          video.duration
                            ? (video.currentTime / video.duration) * 100
                            : 0
                        )
                      }}
                      onPlay={() => {
                        if (isCurrent) setIsPlaying(true)
                      }}
                      onPause={() => {
                        if (isCurrent) setIsPlaying(false)
                      }}
                    />
                  ) : (
                    <img
                      src={media}
                      alt={post.caption || "ChitPix post"}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/60">Media unavailable</p>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                {/* TOP BAR */}
                <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 pb-5 pt-12">
                  <button onClick={() => router.back()} aria-label="Go back">
                    <ChevronDown className="h-7 w-7 rotate-90" />
                  </button>

                  <h1 className="text-xl font-extrabold">
                    ChitPix <span className="text-pink-400">Reels</span>
                  </h1>

                  <button
                    onClick={toggleMute}
                    className={`rounded-full p-2.5 ${GRADIENTS.pink}`}
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                </header>

                {/* PLAY / PAUSE */}
                {isCurrent && isVideo && !isPlaying && (
                  <button
                    onClick={togglePlayback}
                    className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-5"
                    aria-label="Play video"
                  >
                    <Play className="h-9 w-9 fill-white" />
                  </button>
                )}

                {/* GRADIENT ACTION ICONS */}
                <aside className="absolute bottom-32 right-3 z-20 flex flex-col items-center gap-5 sm:right-5">
                  <button
                    onClick={() => toggleLike(postId)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Like Reel"
                  >
                    <span className={`rounded-full p-2.5 ${GRADIENTS.heart}`}>
                      <Heart
                        className={`h-6 w-6 ${
                          liked[postId] ? "fill-white" : ""
                        }`}
                      />
                    </span>
                    <span className="text-xs font-semibold">
                      {formatCount(
                        Number(post.likes || 0) + (liked[postId] ? 1 : 0)
                      )}
                    </span>
                  </button>

                  <button
                    onClick={() => void openComments()}
                    className="flex flex-col items-center gap-1"
                    aria-label="Open comments"
                  >
                    <span className={`rounded-full p-2.5 ${GRADIENTS.blue}`}>
                      <MessageCircle className="h-6 w-6" />
                    </span>
                    <span className="text-xs">
                      {formatCount(Number(post.comments || 0))}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowShare(true)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Share Reel"
                  >
                    <span className={`rounded-full p-2.5 ${GRADIENTS.purple}`}>
                      <Send className="h-6 w-6" />
                    </span>
                    <span className="text-xs">Share</span>
                  </button>

                  <button
                    onClick={() => toggleSave(postId)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Save Reel"
                  >
                    <span className={`rounded-full p-2.5 ${GRADIENTS.orange}`}>
                      <Bookmark
                        className={`h-6 w-6 ${
                          saved[postId] ? "fill-white" : ""
                        }`}
                      />
                    </span>
                    <span className="text-xs">
                      {saved[postId] ? "Saved" : "Save"}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleFollow(creatorId)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Follow creator"
                  >
                    <span className="relative">
                      <img
                        src={avatar}
                        alt={username}
                        className="h-11 w-11 rounded-full border-2 border-white object-cover"
                      />
                      <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full p-0.5 ${GRADIENTS.pink}`}>
                        {followed[creatorId] ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => setShowMore(true)}
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-8 w-8" />
                  </button>
                </aside>

                {/* CREATOR AND CAPTION */}
                <div className="absolute bottom-24 left-4 right-20 z-10 sm:left-6">
                  <div className="mb-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (post.user_id) {
                          router.push(`/profile/${post.user_id}`)
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={avatar}
                        alt={username}
                        className="h-10 w-10 rounded-full border border-white object-cover"
                      />
                      <span className="text-sm font-bold">{username}</span>
                    </button>

                    <button
                      onClick={() => toggleFollow(creatorId)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${GRADIENTS.pink}`}
                    >
                      {followed[creatorId] ? "Following" : "Follow"}
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-5">
                    {captionExpand[postId]
                      ? post.caption || ""
                      : (post.caption || "").slice(0, 120)}

                    {(post.caption || "").length > 120 && (
                      <button
                        onClick={() =>
                          setCaptionExpand((previous) => ({
                            ...previous,
                            [postId]: !previous[postId],
                          }))
                        }
                        className="ml-2 font-bold"
                      >
                        {captionExpand[postId] ? "less" : "...more"}
                      </button>
                    )}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                    <Music2 className="h-4 w-4" />
                    <span>{post.audio_name || "Original audio · ChitPix"}</span>
                  </div>
                </div>

                {/* VIDEO PROGRESS */}
                {isVideo && (
                  <div className="absolute bottom-[76px] left-0 right-0 z-20 h-1 bg-white/20">
                    <div
                      className={`h-full ${GRADIENTS.pink}`}
                      style={{ width: `${isCurrent ? progress : 0}%` }}
                    />
                  </div>
                )}
              </section>
            )
          })
        )}
      </div>

      {/* Part 3B starts here: comments drawer, share sheet, BottomNav and closing tags */}
                        
      {/* COMMENTS BOTTOM SHEET */}
      {showComments && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setShowComments(false)}
        >
          <section
            className="animate-slideUp flex h-[78%] flex-col rounded-t-3xl bg-white text-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-neutral-100 px-4 pb-3 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" />
              <div className="flex items-center justify-between">
                <span className="w-7" />
                <h2 className="text-base font-extrabold">
                  Comments ({comments.length})
                </h2>
                <button
                  onClick={() => setShowComments(false)}
                  aria-label="Close comments"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSortBy("new")}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    sortBy === "new"
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("top")}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    sortBy === "top"
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  Top
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {commentsLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading comments...
                </div>
              )}

              {commentsError && (
                <div className="py-6 text-center text-sm text-red-500">
                  <p>{commentsError}</p>
                  <button
                    onClick={() => {
                      const post = posts[currentIndex]
                      if (post?.id) void loadComments(String(post.id))
                    }}
                    className="mt-2 font-bold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!commentsLoading &&
                !commentsError &&
                comments.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <p className="font-semibold">No comments yet</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Start the conversation ❤️
                    </p>
                  </div>
                )}

              {[...comments]
                .sort((a, b) => {
                  if (pinnedId === a.id) return -1
                  if (pinnedId === b.id) return 1
                  return sortBy === "top" ? b.likes - a.likes : 0
                })
                .map((comment) => (
                  <article
                    key={String(comment.id)}
                    className="flex gap-3"
                  >
                    <img
                      src={comment.avatar || DEFAULT_AVATAR}
                      alt={comment.username}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs">
                        <span className="font-extrabold">
                          {comment.username}
                        </span>
                        <span className="ml-2 text-neutral-400">
                          {comment.time}
                        </span>
                      </p>

                      <p className="mt-1 break-words text-sm">
                        {comment.text}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                        <button
                          onClick={() => toggleCommentLike(comment.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              commentLikes[String(comment.id)]
                                ? "fill-pink-500 text-pink-500"
                                : ""
                            }`}
                          />
                          {comment.likes}
                        </button>

                        <button
                          onClick={() => {
                            setReplyTo(comment)
                            setCommentText(`@${comment.username} `)
                          }}
                          className="font-bold"
                        >
                          Reply
                        </button>

                        <button
                          onClick={() => {
                            void navigator.clipboard
                              .writeText(comment.text)
                              .then(() => alert("Comment copied!"))
                              .catch(() => alert("Copy cheyyalekapoyanu bro."))
                          }}
                        >
                          Copy
                        </button>

                        <button
                          onClick={() =>
                            setPinnedId(
                              pinnedId === comment.id ? null : comment.id
                            )
                          }
                        >
                          {pinnedId === comment.id ? "Unpin" : "Pin"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {/* COMMENT INPUT */}
            <div className="border-t border-neutral-100 bg-white p-3">
              {replyTo && (
                <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                  <span>Replying to {replyTo.username}</span>
                  <button
                    onClick={() => {
                      setReplyTo(null)
                      setCommentText("")
                    }}
                    className="font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <img
                  src={currentAvatar}
                  alt="Your profile"
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />

                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-200 px-3 py-2">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void postComment()
                    }}
                    placeholder="Add a comment..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />

                  <button
                    onClick={() =>
                      setShowEmojiPicker((previous) => !previous)
                    }
                    aria-label="Emoji picker"
                  >
                    <Smile className="h-5 w-5 text-pink-500" />
                  </button>

                  {commentText.trim() && (
                    <button
                      disabled={postingComment}
                      onClick={() => void postComment()}
                      className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {postingComment ? "Sending..." : "Post"}
                    </button>
                  )}
                </div>
              </div>

              {showEmojiPicker && (
                <div className="mt-3 grid grid-cols-8 gap-2">
                  {[
                    "❤️", "😂", "🔥", "😍", "👏", "💯", "😎", "🥺",
                    "🤩", "🙏", "😭", "😊", "🥰", "😅", "✨", "🙌",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() =>
                        setCommentText((text) => text + emoji)
                      }
                      className="text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* SHARE BOTTOM SHEET */}
      {showShare && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setShowShare(false)}
        >
          <section
            className="animate-slideUp rounded-t-3xl bg-white p-5 text-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300" />

            <div className="mb-5 flex items-center justify-between">
              <span className="w-7" />
              <h2 className="text-base font-extrabold">Share Reel</h2>
              <button
                onClick={() => setShowShare(false)}
                aria-label="Close share"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-5">
              {[
                ["whatsapp", "WhatsApp", "bg-gradient-to-tr from-green-400 to-green-600", "◉"],
                ["instagram", "Instagram", GRADIENTS.pink, "◎"],
                ["telegram", "Telegram", GRADIENTS.blue, "➤"],
                ["facebook", "Facebook", "bg-gradient-to-tr from-blue-500 to-blue-700", "f"],
                ["copy", "Copy Link", "bg-gradient-to-tr from-slate-600 to-slate-900", "↗"],
                ["download", "Open Media", GRADIENTS.orange, "↓"],
                ["chitpix", "ChitPix DM", GRADIENTS.purple, "✦"],
                ["native", "More", "bg-gradient-to-tr from-pink-500 to-purple-700", "•••"],
              ].map(([method, label, gradient, icon]) => (
                <button
                  key={method}
                  onClick={() => void doShare(method)}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-md ${gradient}`}
                  >
                    {icon}
                  </span>
                  <span className="text-center text-[11px] font-medium">
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowShare(false)}
              className="mt-6 w-full rounded-full bg-neutral-100 py-3 font-bold"
            >
              Cancel
            </button>
          </section>
        </div>
      )}

      {/* MORE OPTIONS */}
      {showMore && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        >
          <section
            className="rounded-t-3xl bg-white p-3 text-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto my-3 h-1 w-10 rounded-full bg-neutral-300" />

            <button
              onClick={() => {
                alert("Report API ni backend tho connect cheyyali bro.")
                setShowMore(false)
              }}
              className="w-full border-b py-4 text-red-500"
            >
              <Flag className="mr-2 inline h-4 w-4" />
              Report
            </button>

            <button
              onClick={() => {
                const post = posts[currentIndex]
                if (post) {
                  const creatorId =
                    post.user_id || post.user || post.username || post.id

                  setFollowed((previous) => ({
                    ...previous,
                    [creatorId]: false,
                  }))
                }
                setShowMore(false)
              }}
              className="w-full border-b py-4"
            >
              <UserRound className="mr-2 inline h-4 w-4" />
              Not interested
            </button>

            <button
              onClick={() => {
                void doShare("copy")
                setShowMore(false)
              }}
              className="w-full border-b py-4"
            >
              <Copy className="mr-2 inline h-4 w-4" />
              Copy Reel link
            </button>

            <button
              onClick={() => setShowMore(false)}
              className="mt-3 w-full rounded-full bg-neutral-100 py-4 font-bold"
            >
              Cancel
            </button>
          </section>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <BottomNav activeTab="reels" setActiveTab={() => {}} />

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.28s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  )
      }
      
