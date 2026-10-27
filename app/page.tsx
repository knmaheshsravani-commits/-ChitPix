import ShareAZ from "./components/ShareAZ"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "./components/BottomNav"
import Stories from "./components/Stories"
import { supabase } from "../lib/supabase"

export const dynamic = "force-dynamic"

const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

const WA = "916363373372"

type Post = {
  id: string
  user_id?: string
  username?: string
  image_url?: string
  r2_url?: string
  url?: string
  caption?: string
  price?: string | number | null
  created_at?: string
}

function fixR2Url(post: Post | string | null | undefined): string {
  if (!post) return ""
  if (typeof post === "string") return post.trim()

  return String(
    post.image_url || post.r2_url || post.url || ""
  ).trim()
}

function getMediaType(post: Post): "video" | "image" {
  const url = fixR2Url(post).toLowerCase().split("?")[0]
  return /\.(mp4|webm|mov|m4v|ogg)$/.test(url) ? "video" : "image"
}

async function uploadToR2(file: File): Promise<string> {
  const response = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: `posts/${Date.now()}_${file.name}`,
      contentType: file.type,
      fileSize: file.size,
    }),
  })

  const result = await response.json()

  if (!response.ok || !result.url) {
    throw new Error(result.error || "R2 presign failed")
  }

  const uploadResponse = await fetch(result.url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error("R2 upload failed")
  }

  return result.publicUrl || `${R2_PUBLIC}/${result.key}`
}

function ChitIcon({
  name,
  size = 26,
  active = false,
}: {
  name:
    | "heart"
    | "comment"
    | "share"
    | "bookmark"
    | "send"
    | "more"
    | "user-plus"
    | "link"
    | "close"
  size?: number
  active?: boolean
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  }

  switch (name) {
    case "heart":
      return (
        <svg
          {...common}
          fill={active ? "#F43F5E" : "none"}
          stroke={active ? "#F43F5E" : "currentColor"}
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      )
    case "comment":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z" />
        </svg>
      )
    case "share":
    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      )
    case "bookmark":
      return (
        <svg {...common} fill={active ? "currentColor" : "none"}>
          <path d="M6 3.8A1.8 1.8 0 0 1 7.8 2h8.4A1.8 1.8 0 0 1 18 3.8V22l-6-4-6 4Z" />
        </svg>
      )
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="19" cy="12" r="1" fill="currentColor" />
        </svg>
      )
    case "user-plus":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21v-2a7 7 0 0 1 12-4.9" />
          <path d="M19 8v6M16 11h6" />
        </svg>
      )
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" />
          <path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" />
        </svg>
      )
    case "close":
      return (
        <svg {...common}>
          <path d="m18 6-12 12M6 6l12 12" />
        </svg>
      )
  }
}

function PostCard({
  post,
  index,
  currentUserId,
  onRefresh,
  galleryRef,
}: {
  post: Post
  index?: number
  currentUserId: string | null
  onRefresh: () => void
  galleryRef?: React.RefObject<HTMLInputElement | null>
}) {
  const router = useRouter()

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const mediaUrl = fixR2Url(post)
  const mediaType = getMediaType(post)
  const isOwner = !!currentUserId && currentUserId === post.user_id

  useEffect(() => {
    let cancelled = false

    async function loadPostActions() {
      const { count, error: countError } = await supabase
        .from("post_likes")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.id)

      if (!cancelled && !countError) {
        setLikes(count || 0)
      }

      if (!currentUserId) return

      const [likeResult, saveResult, followResult] =
        await Promise.all([
          supabase
            .from("post_likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", currentUserId)
            .maybeSingle(),

          supabase
            .from("saved_posts")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", currentUserId)
            .maybeSingle(),

          post.user_id
            ? supabase
                .from("user_follows")
                .select("id")
                .eq("follower_id", currentUserId)
                .eq("following_id", post.user_id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ])

      if (cancelled) return

      if (!likeResult.error) setLiked(!!likeResult.data)
      if (!saveResult.error) setSaved(!!saveResult.data)
      if (!followResult.error) setFollowed(!!followResult.data)
    }

    loadPostActions()

    return () => {
      cancelled = true
    }
  }, [currentUserId, post.id, post.user_id])

  const handleLike = async () => {
    if (!currentUserId) {
      setMessage("Like cheyadaniki login avvali")
      return
    }
    if (busy) return

    setBusy(true)
    setMessage("")

    try {
      if (!liked) {
        const { error } = await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        if (error && error.code !== "23505") throw error

        if (!error) setLikes(value => value + 1)
        setLiked(true)
      } else {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId)

        if (error) throw error

        setLiked(false)
        setLikes(value => Math.max(0, value - 1))
      }
    } catch (error: any) {
      setMessage(error.message || "Like update failed")
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    if (!currentUserId) {
      setMessage("Save cheyadaniki login avvali")
      return
    }
    if (busy) return

    setBusy(true)
    setMessage("")

    try {
      if (!saved) {
        const { error } = await supabase.from("saved_posts").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        if (error && error.code !== "23505") throw error
        setSaved(true)
      } else {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId)

        if (error) throw error
        setSaved(false)
      }
    } catch (error: any) {
      setMessage(error.message || "Save update failed")
    } finally {
      setBusy(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId) {
      setMessage("Follow cheyadaniki login avvali")
      return
    }
    if (!post.user_id || currentUserId === post.user_id) {
      setMessage("Mee own profile ni follow cheyyaleru")
      return
    }
    if (busy) return

    setBusy(true)
    setMessage("")

    try {
      if (!followed) {
        const { error } = await supabase.from("user_follows").insert({
          follower_id: currentUserId,
          following_id: post.user_id,
        })

        if (error && error.code !== "23505") throw error
        setFollowed(true)
      } else {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", post.user_id)

        if (error) throw error
        setFollowed(false)
      }
    } catch (error: any) {
      setMessage(error.message || "Follow update failed")
    } finally {
      setBusy(false)
    }
  }

  const handleComment = async () => {
    const text = commentText.trim()

    if (!text) {
      setMessage("Comment type cheyyi bro")
      return
    }
    if (!currentUserId) {
      setMessage("Comment cheyadaniki login avvali")
      return
    }
    if (busy) return

    setBusy(true)
    setMessage("")

    try {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser()

      if (authError || !user) throw new Error("Malli login avvali")

      const username =
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "ChitPix User"

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          username,
          content: text,
        })
        .select("id, post_id, user_id, username, content, created_at")
        .single()

      if (error) throw error

      setComments(previous => [...previous, data])
      setCommentText("")
      setMessage("Comment posted successfully")
    } catch (error: any) {
      setMessage(error.message || "Comment save avvaledu")
    } finally {
      setBusy(false)
    }
  }

  const loadComments = async () => {
    setShowComments(true)
    setMessage("")

    const { data, error } = await supabase
      .from("post_comments")
      .select("id, post_id, user_id, username, content, created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })

    if (error) {
      setMessage(error.message || "Comments load avvaledu")
      return
    }

    setComments(data || [])
  }

  const handleShare = async () => {
    const text = `ChitPix: ${post.caption || ""}\n${mediaUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "ChitPix",
          text,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(text)
        setMessage("Share text copied")
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        setMessage("Share cheyalekapoyam")
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(mediaUrl || window.location.href)
      setMessage("Link copied")
      setShowShare(false)
    } catch {
      setMessage("Link copy avvaledu")
    }
  }

  const handleDM = () => {
    const text = `ChitPix post: ${post.caption || ""} ₹${post.price || ""} ${mediaUrl}`
    window.open(
      `https://wa.me/${WA}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleReport = async () => {
    if (!currentUserId) {
      setMessage("Report cheyadaniki login avvali")
      return
    }

    const reason = window.prompt(
      "Report reason enter cheyyi: spam, abuse, inappropriate content"
    )

    if (!reason?.trim()) return

    setBusy(true)

    try {
      const { error } = await supabase.from("post_reports").insert({
        post_id: post.id,
        reporter_id: currentUserId,
        reason: reason.trim(),
      })

      if (error) throw error

      setMessage("Report submitted")
      setShowMore(false)
    } catch (error: any) {
      setMessage(error.message || "Report submit avvaledu")
    } finally {
      setBusy(false)
    }
  }

  const handleProfile = () => {
    if (post.username) {
      router.push(`/profile/${encodeURIComponent(post.username)}`)
    } else {
      setMessage("Username dorakaledu")
    }
  }

  // Part 2 lo post UI and modals continue avuthayi.
  return (
    <article className="border-b-8 border-zinc-100 bg-white">
      {/* Post header */}
      <div className="flex items-center justify-between px-3 py-3">
        <button
          onClick={handleProfile}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white font-bold">
              {(post.username || "C").slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {post.username || "ChitPix Creator"}
            </p>
            <p className="text-xs text-zinc-500">
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString()
                : "ChitPix"}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {!isOwner && (
            <button
              onClick={handleFollow}
              disabled={busy}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                followed
                  ? "bg-zinc-100 text-zinc-700"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {followed ? "Following" : "Follow"}
            </button>
          )}

          <button
            onClick={() => setShowMore(value => !value)}
            className="rounded-full p-2 active:bg-zinc-100"
            aria-label="More post options"
          >
            <ChitIcon name="more" size={24} />
          </button>
        </div>
      </div>

      {/* More options */}
      {showMore && (
        <div className="mx-3 mb-3 space-y-3 rounded-xl bg-zinc-50 p-4 text-sm">
          <button
            onClick={handleReport}
            disabled={busy}
            className="block w-full text-left text-red-600"
          >
            Report post
          </button>

          <button
            onClick={() => {
              setShowMore(false)
              setMessage("Post hidden for this session")
            }}
            className="block w-full text-left"
          >
            Hide this post
          </button>

          <button
            onClick={() => setShowMore(false)}
            className="block w-full text-left text-zinc-500"
          >
            Close menu
          </button>
        </div>
      )}

      {/* Photo or video */}
      {mediaUrl ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100">
          {mediaType === "video" ? (
            <video
              src={mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={post.caption || "ChitPix post"}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setMessage("Media load avvaledu. R2 public URL check cheyyali.")}
            />
          )}

          {post.price !== null &&
            post.price !== undefined &&
            String(post.price).trim() !== "" && (
              <button
                onClick={handleDM}
                className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow"
              >
                ₹{post.price} · Order
              </button>
            )}
        </div>
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center bg-zinc-100 text-sm text-zinc-500">
          Media URL missing
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            disabled={busy}
            aria-label={liked ? "Unlike post" : "Like post"}
            className="transition-transform active:scale-75"
          >
            <ChitIcon name="heart" size={27} active={liked} />
          </button>

          <button
            onClick={loadComments}
            aria-label="Open comments"
            className="transition-transform active:scale-75"
          >
            <ChitIcon name="comment" size={27} />
          </button>

          <button
            onClick={() => setShowShare(true)}
            aria-label="Share post"
            className="transition-transform active:scale-75"
          >
            <ChitIcon name="share" size={26} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={busy}
            aria-label={saved ? "Unsave post" : "Save post"}
            className="transition-transform active:scale-75"
          >
            <ChitIcon name="bookmark" size={26} active={saved} />
          </button>

          <button
            onClick={handleDM}
            aria-label="Contact seller on WhatsApp"
            className="rounded-full bg-black p-2 text-white transition-transform active:scale-75"
          >
            <ChitIcon name="send" size={18} />
          </button>
        </div>
      </div>

      {/* Likes and caption */}
      <div className="px-3 pb-3 text-sm">
        <p className="font-bold">{likes} likes</p>

        <p className="mt-1 break-words">
          <button onClick={handleProfile} className="font-bold">
            {post.username || "Creator"}
          </button>{" "}
          {post.caption || ""}
        </p>

        <button
          onClick={loadComments}
          className="mt-2 text-left text-xs text-zinc-500"
        >
          View comments
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div className="mx-3 mb-3 flex items-start justify-between gap-2 rounded-lg bg-zinc-100 p-3 text-xs">
          <span className="break-words">{message}</span>
          <button
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
            className="shrink-0"
          >
            <ChitIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Comments modal */}
      {showComments && (
        <div
          className="fixed inset-0 z-[200] flex items-end bg-black/50"
          onClick={() => setShowComments(false)}
        >
          <div
            className="mx-auto flex max-h-[75vh] w-full max-w-[480px] flex-col rounded-t-2xl bg-white"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-4">
              <b>Comments ({comments.length})</b>
              <button
                onClick={() => setShowComments(false)}
                aria-label="Close comments"
              >
                <ChitIcon name="close" size={22} />
              </button>
            </div>

            <div className="min-h-[150px] flex-1 space-y-4 overflow-auto p-4">
              {comments.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">
                  Inka comments levu. First comment nuvvu cheyyi!
                </p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="text-sm">
                    <p className="break-words">
                      <b>{comment.username || "ChitPix User"}</b>{" "}
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              className="flex gap-2 border-t p-3"
              onSubmit={event => {
                event.preventDefault()
                handleComment()
              }}
            >
              <input
                value={commentText}
                onChange={event => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                maxLength={1000}
                className="min-w-0 flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm outline-none"
              />

              <button
                type="submit"
                disabled={busy || !commentText.trim()}
                className="font-bold text-blue-600 disabled:opacity-50"
              >
                {busy ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}

      import ShareAZ from "./components/ShareAZ"
      {/* ShareAZ modal */}
{showShare && (
  <ShareAZ
    post={{
      id: post.id,
      image_url: mediaUrl,
      url: window.location.href,
      caption: post.caption || "",
    }}
    onClose={() => setShowShare(false)}
    onToast={(message) => setMessage(message)}
    onShare={() => handleShare()}
    onDownload={() => {
      const link = document.createElement("a")
      link.href = mediaUrl
      link.download = `chitpix-${post.id || "media"}`
      link.click()
    }}
    onDirectMessage={() => {
      setShowShare(false)
      handleDM()
    }}
  />
)}

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentUsername, setCurrentUsername] = useState("ChitPix User")

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const [search, setSearch] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showDMList, setShowDMList] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current logged-in user
  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (!mounted) return

      if (error || !data.user) {
        setCurrentUserId("")
        return
      }

      setCurrentUserId(data.user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .maybeSingle()

      if (mounted && profile?.username) {
        setCurrentUsername(profile.username)
      } else if (data.user.email) {
        setCurrentUsername(data.user.email.split("@")[0])
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setCurrentUserId(session?.user?.id || "")
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load posts from Supabase
  const loadPosts = async () => {
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error

      setPosts(data || [])
    } catch (err: any) {
      console.error("ChitPix feed error:", err)
      setError(err?.message || "Posts load avvaledu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  // Select photo or video
  const handleSelectFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/") &&
        !file.type.startsWith("video/")) {
      setNotice("Photo leda video file select cheyyi")
      event.target.value = ""
      return
    }

    const maxSize = file.type.startsWith("video/")
      ? 100 * 1024 * 1024
      : 15 * 1024 * 1024

    if (file.size > maxSize) {
      setNotice(
        file.type.startsWith("video/")
          ? "Video size 100MB lopala undali"
          : "Photo size 15MB lopala undali"
      )
      event.target.value = ""
      return
    }

    setSelectedFile(file)
    setNotice("")
  }

  // Upload to existing Cloudflare R2 presign API
  const handleUpload = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!currentUserId) {
      setNotice("Munduga ChitPix lo login avvu")
      return
    }

    if (!selectedFile) {
      setNotice("Munduga photo leda video select cheyyi")
      return
    }

    setUploading(true)
    setNotice("Uploading...")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Keep the existing R2 API endpoint.
      const presignResponse = await fetch("/api/r2-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      })

      const presignData = await presignResponse.json()

      if (!presignResponse.ok) {
        throw new Error(
          presignData?.error || "R2 presign request failed"
        )
      }

      const uploadUrl = presignData.uploadUrl || presignData.url
      const publicUrl =
        presignData.publicUrl ||
        (presignData.key && R2_PUBLIC
          ? `${R2_PUBLIC.replace(/\/$/, "")}/${presignData.key}`
          : "")

      if (!uploadUrl || !publicUrl) {
        throw new Error(
          "R2 API response lo uploadUrl/publicUrl dorakaledu. Existing API response check cheyyali."
        )
      }

      const r2Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      })

      if (!r2Response.ok) {
        throw new Error(`R2 upload failed: ${r2Response.status}`)
      }

      // Your existing posts table columns:
      // user_id, image_url, caption, created_at, price, username, r2_url
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: currentUserId,
          image_url: publicUrl,
          r2_url: publicUrl,
          caption: caption.trim(),
          price: price.trim() || null,
          username: currentUsername,
        })

      if (insertError) throw insertError

      setNotice("Post upload success!")
      setSelectedFile(null)
      setCaption("")
      setPrice("")
      setShowUpload(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      await loadPosts()
    } catch (err: any) {
      console.error("ChitPix upload error:", err)
      setNotice(err?.message || "Upload fail ayindi")
    } finally {
      setUploading(false)
    }
  }

  // Search caption, username and price
  const filteredPosts = posts.filter((post) => {
    const query = search.trim().toLowerCase()
    if (!query) return true

    return (
      String(post.caption || "").toLowerCase().includes(query) ||
      String(post.username || "").toLowerCase().includes(query) ||
      String(post.price || "").toLowerCase().includes(query)
    )
  })

  // Part 4 lo feed UI and modals continue avuthayi.
  return (
    <main className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          ChitPix
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotif(true)}
            aria-label="Notifications"
            className="p-2 rounded-full hover:bg-zinc-100"
          >
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>

          <button
            onClick={() => setShowDMList(true)}
            aria-label="Messages"
            className="p-2 rounded-full hover:bg-zinc-100"
          >
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z" />
            </svg>
          </button>

          <button
            onClick={() => {
              setNotice("")
              setShowUpload(true)
            }}
            className="bg-black text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Post
          </button>
        </div>
      </header>

      {/* SEARCH */}
      <section className="sticky top-[62px] z-30 bg-white px-3 py-3 border-b">
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 5 5" />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, creators, price..."
            className="w-full bg-transparent py-3 outline-none text-sm"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* STORIES */}
      <section className="py-3">
        <Stories />
      </section>

      {/* STATUS MESSAGE */}
      {notice && (
        <div
          role="status"
          className="mx-3 mb-3 rounded-xl bg-zinc-100 p-3 text-sm"
        >
          {notice}
        </div>
      )}

      {/* FEED */}
      <section>
        {loading ? (
          <div className="p-10 text-center text-zinc-500">
            Loading ChitPix posts...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={loadPosts}
              className="rounded-full bg-black text-white px-5 py-2 font-bold"
            >
              Try Again
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-bold text-lg">No posts found</p>
            <p className="text-sm text-zinc-500 mt-2">
              Search clear cheyyi leda first post upload cheyyi bro.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 bg-black text-white rounded-full px-5 py-2 font-bold"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end px-3 py-2">
              <button
                onClick={loadPosts}
                className="text-sm rounded-full bg-zinc-100 px-4 py-2 font-semibold"
              >
                ↻ Refresh
              </button>
            </div>

            {filteredPosts.map((post: any, index: number) => (
              <PostCard
                key={post.id || index}
                post={post}
                index={index}
                currentUserId={currentUserId}
                onRefresh={loadPosts}
                galleryRef={fileInputRef}
              />
            ))}
          </>
        )}
      </section>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={handleSelectFile}
      />

      {/* CREATE POST MODAL */}
      {showUpload && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={() => {
            if (!uploading) setShowUpload(false)
          }}
        >
          <form
            onSubmit={handleUpload}
            className="bg-white w-full max-w-[400px] rounded-2xl p-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-lg">Create Post</h2>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setShowUpload(false)}
                className="w-8 h-8 rounded-full bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-36 border-2 border-dashed rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-2 p-4"
            >
              <svg
                viewBox="0 0 24 24"
                width="38"
                height="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>

              <span className="text-sm font-semibold">
                {selectedFile
                  ? selectedFile.name
                  : "Select photo or video"}
              </span>
            </button>

            {selectedFile && (
              <p className="text-xs text-zinc-500 mt-2">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}

            <label className="block text-sm font-semibold mt-4 mb-1">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Mee post gurinchi rayandi..."
              rows={3}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
            />

            <label className="block text-sm font-semibold mt-3 mb-1">
              Price (optional)
            </label>
            <div className="flex items-center border rounded-xl px-3">
              <span>₹</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="350"
                className="w-full p-3 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="mt-4 w-full rounded-xl bg-black text-white py-3 font-bold disabled:opacity-50"
            >
              {uploading ? "Uploading to R2..." : "Publish Post"}
            </button>
          </form>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {showNotif && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 flex items-end"
          onClick={() => setShowNotif(false)}
        >
          <section
            className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-5 min-h-48"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Notifications</h2>
              <button
                onClick={() => setShowNotif(false)}
                className="rounded-full bg-zinc-100 w-8 h-8"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-zinc-500 mt-5">
              Notifications panel open ayyindi. Live notifications kosam
              separate notification records and loading logic avasaram.
            </p>
          </section>
        </div>
      )}

      {/* MESSAGES */}
      {showDMList && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 flex items-end"
          onClick={() => setShowDMList(false)}
        >
          <section
            className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-5 min-h-48"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Messages</h2>
              <button
                onClick={() => setShowDMList(false)}
                className="rounded-full bg-zinc-100 w-8 h-8"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-zinc-500 mt-5">
              Messages panel open ayyindi. Live in-app DM kosam messages
              table and chat screen integration avasaram.
            </p>
          </section>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </main>
  )
                }
