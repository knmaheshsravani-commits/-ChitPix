"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
  avatar_url?: string | null
  avatar?: string | null
  full_name?: string | null
  image_url?: string
  r2_url?: string
  url?: string
  caption?: string
  price?: string | number | null
  created_at?: string
  location?: string
  post_type?: string
}

function fixR2Url(post: Post | string | null | undefined): string {
  if (!post) return ""
  if (typeof post === "string") return post.trim()

  return String(
    post.image_url || post.r2_url || post.url || ""
  ).trim()
}
// PROFILE AVATAR URL FIX

function fixAvatarUrl(value: any): string {
  if (!value) return ""

  let raw = ""

  if (typeof value === "string") {
    raw = value
  } else if (typeof value === "object") {
    raw =
      value.avatar_url ||
      value.avatarUrl ||
      value.avatar ||
      value.image_url ||
      value.url ||
      value.publicUrl ||
      value.public_url ||
      value.r2Url ||
      value.r2_url ||
      value.key ||
      ""
  }

  raw = String(raw).trim()

  if (!raw) return ""

  if (/^(https?:\/\/|data:image\/|blob:)/i.test(raw)) {
    return raw
  }

  const baseUrl = R2_PUBLIC.replace(/\/$/, "")
  const cleanPath = raw.replace(/^\/+/, "")

  if (cleanPath.startsWith("r2://")) {
    return `${baseUrl}/${cleanPath.slice(5)}`
  }

  if (
    cleanPath.startsWith("avatars/") ||
    cleanPath.startsWith("profiles/")
  ) {
    return `${baseUrl}/${cleanPath}`
  }

  return `${baseUrl}/avatars/${cleanPath}`
}

function getMediaType(post: Post): "video" | "image" {
  const url = fixR2Url(post).toLowerCase().split("?")[0]
  return /\.(mp4|webm|mov|m4v|ogg)$/.test(url)
    ? "video"
    : "image"
}

async function uploadToR2(file: File): Promise<string> {
  const response = await fetch("/api/r2-presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: `posts/${Date.now()}_${file.name.replace(/\s+/g, "-")}`,
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
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error("R2 upload failed")
  }

  return (
    result.publicUrl ||
    `${R2_PUBLIC.replace(/\/$/, "")}/${result.key}`
  )
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
  return (
    <svg {...common}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )

case "send":
  return (
    <svg {...common}>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8.5Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  )
      

    case "bookmark":
      return (
        <svg
          {...common}
          fill={active ? "currentColor" : "none"}
        >
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

    default:
      return null
  }
}

// PART 2 CONTINUES BELOW
function PostCard({
  post,
  index,
  currentUserId,
  currentUserName,
  onRefresh,
  galleryRef,
}: {
  post: Post
  index?: number
  currentUserId: string | null
  currentUserName: string
  onRefresh: () => void
  galleryRef?: React.RefObject<HTMLInputElement | null>
}) {
  const router = useRouter()

  const [liked, setLiked] = useState(false)
const [shareCount, setShareCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [likes, setLikes] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)

  const [commentLikeCounts, setCommentLikeCounts] =
    useState<Record<string, number>>({})
  const [likedComments, setLikedComments] =
    useState<Record<string, boolean>>({})

  const [replyingTo, setReplyingTo] = useState<any | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const mediaUrl = fixR2Url(post)
  const mediaType = getMediaType(post)
  const avatarUrl = fixAvatarUrl(
  post.avatar_url || post.avatar
)


const [avatarFailed, setAvatarFailed] = useState(false)
const [avatarLoaded, setAvatarLoaded] = useState(false)

useEffect(() => {
  setAvatarFailed(false)
  setAvatarLoaded(false)

  console.log("AVATAR CHECK:", {
    username: post.username,
    avatarUrl,
    hasAvatar: !!avatarUrl,
  })
}, [avatarUrl, post.username])
  
  const isOwner =
    !!currentUserId && currentUserId === post.user_id

  // Load likes, saved status and follow status
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
      
const { count: shares, error: sharesError } = await supabase
  .from("post_shares")
  .select("id", { count: "exact", head: true })
  .eq("post_id", post.id)

if (!cancelled && !sharesError) {
  setShareCount(shares || 0)
}
      
      if (!currentUserId) {
        setLiked(false)
        setSaved(false)
        setFollowed(false)
        return
      }

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
            : Promise.resolve({
                data: null,
                error: null,
              }),
        ])

      if (cancelled) return

      if (!likeResult.error) {
        setLiked(!!likeResult.data)
      }

      if (!saveResult.error) {
        setSaved(!!saveResult.data)
      }

      if (!followResult.error) {
        setFollowed(!!followResult.data)
      }
    }

    loadPostActions()

    return () => {
      cancelled = true
    }
  }, [currentUserId, post.id, post.user_id])

  // LIKE POST
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
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: post.id,
            user_id: currentUserId,
          })

        if (error && error.code !== "23505") {
          throw error
        }

        if (!error) {
          setLikes(value => value + 1)
        }

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

  // SAVE POST
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
        const { error } = await supabase
          .from("saved_posts")
          .insert({
            post_id: post.id,
            user_id: currentUserId,
          })

        if (error && error.code !== "23505") {
          throw error
        }

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

  // FOLLOW CREATOR
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
        const { error } = await supabase
          .from("user_follows")
          .insert({
            follower_id: currentUserId,
            following_id: post.user_id,
          })

        if (error && error.code !== "23505") {
          throw error
        }

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

  // POST COMMENT OR REPLY
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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Malli login avvali")
      }

      const username =
        user.user_metadata?.username ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "ChitPix User"

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          username,
          content: text,
          parent_id: replyingTo?.id || null,
        })
        .select(
          "id, post_id, user_id, username, content, created_at, parent_id"
        )
        .single()

      if (error) throw error

      setComments(previous => [...previous, data])
      setCommentCount(previous => previous + 1)
      setCommentText("")
      setReplyingTo(null)
      setShowEmojiPicker(false)

      setMessage(
        data.parent_id
          ? "Reply posted successfully"
          : "Comment posted successfully"
      )
    } catch (error: any) {
      setMessage(error.message || "Comment save avvaledu")
    } finally {
      setBusy(false)
    }
  }

  // LOAD COMMENTS AND COMMENT LIKES
  const loadComments = async () => {
    setShowComments(true)
    setMessage("")

    const { data, error } = await supabase
      .from("post_comments")
      .select(
        "id, post_id, user_id, username, content, created_at, parent_id"
      )
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })

    if (error) {
      setMessage(error.message || "Comments load avvaledu")
      return
    }

    const rows = data || []
    setCommentCount(rows.length)
    setComments(rows)

    if (rows.length === 0) {
      setCommentLikeCounts({})
      setLikedComments({})
      return
    }

    const commentIds = rows.map((item: any) => item.id)

    const { data: likeRows, error: likesError } = await supabase
      .from("comment_likes")
      .select("comment_id, user_id")
      .in("comment_id", commentIds)

    if (likesError) {
      setMessage(likesError.message || "Comment likes load avvaledu")
      return
    }

    const counts: Record<string, number> = {}
    const mine: Record<string, boolean> = {}

    ;(likeRows || []).forEach((like: any) => {
      counts[like.comment_id] =
        (counts[like.comment_id] || 0) + 1

      if (
        currentUserId &&
        like.user_id === currentUserId
      ) {
        mine[like.comment_id] = true
      }
    })

    setCommentLikeCounts(counts)
    setLikedComments(mine)
  }

  // LIKE OR UNLIKE A COMMENT
  const handleCommentLike = async (comment: any) => {
    if (!currentUserId) {
      setMessage("Comment like cheyadaniki login avvali")
      return
    }

    if (busy) return

    setBusy(true)
    setMessage("")

    try {
      if (likedComments[comment.id]) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", comment.id)
          .eq("user_id", currentUserId)

        if (error) throw error

        setLikedComments(previous => ({
          ...previous,
          [comment.id]: false,
        }))

        setCommentLikeCounts(previous => ({
          ...previous,
          [comment.id]: Math.max(
            0,
            (previous[comment.id] || 0) - 1
          ),
        }))
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({
  comment_id: comment.id,
  user_id: currentUserId,
  username: currentUserName || "ChitPix User",
})

        if (error && error.code !== "23505") {
          throw error
        }

        setLikedComments(previous => ({
          ...previous,
          [comment.id]: true,
        }))

        if (!error) {
          setCommentLikeCounts(previous => ({
            ...previous,
            [comment.id]:
              (previous[comment.id] || 0) + 1,
          }))
        }
      }
    } catch (error: any) {
      setMessage(
        error.message || "Comment like update failed"
      )
    } finally {
      setBusy(false)
    }
  }

  // PART 3 CONTINUES BELOW
          
  // PART 3 - Post actions and UI

  
const handleShare = async () => {
  const link = `${window.location.origin}/post/${post.id}`

  try {
    if (navigator.share) {
      await navigator.share({
        title: "ChitPix",
        text: post.caption || "Check out this post on ChitPix!",
        url: link,
      })
    } else {
      await navigator.clipboard.writeText(link)
      setMessage("Post link copied!")
    }

    if (currentUserId) {
      const { error } = await supabase
        .from("post_shares")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
        })

      if (error) {
        console.error("Share count save failed:", error)
      } else {
        setShareCount(value => value + 1)
      }
    }
  } catch (error) {
    console.log("Share cancelled or unavailable:", error)
  }
}
  

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/post/${post.id}`
      await navigator.clipboard.writeText(link)
      setShowShare(false)
      setMessage("Link copied successfully!")
    } catch {
      setMessage("Link copy failed")
    }
  }

  const handleDM = () => {
    const text = `Hi! Check this post on ChitPix: ${post.caption || ""} ${window.location.origin}/post/${post.id}`
    window.open(
      `https://wa.me/${WA}?text=${encodeURIComponent(text)}`,
      "_blank"
    )
  }

  const handleReport = async () => {
    if (!currentUserId) {
      setMessage("Please login to report this post")
      return
    }

    const reason = window.prompt("Why are you reporting this post?")
    if (!reason?.trim()) return

    setBusy(true)

    const { error } = await supabase.from("post_reports").insert({
      post_id: post.id,
      reporter_id: currentUserId,
      reason: reason.trim(),
    })

    setBusy(false)

    if (error) {
      setMessage(error.message)
    } else {
      setShowMore(false)
      setMessage("Report submitted. Thank you!")
    }
  }
 
const handleProfile = () => {
  if (!post.username) return

  router.push(`/profile/${encodeURIComponent(post.username)}`)
}


  return (
    <>
      <article className="mb-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_5px_25px_rgba(15,23,42,0.06)]">
        {/* POST HEADER */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={handleProfile}
            className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 p-[2px]"
          >
            <div className="h-full w-full overflow-hidden rounded-full bg-white">
              
{avatarUrl && !avatarFailed ? (
  <img
    src={avatarUrl}
    alt={`${post.username || "User"} profile`}
    className="h-full w-full rounded-full object-cover"
    loading="eager"
    onLoad={() => {
      console.log("HOME DP LOADED:", post.username, avatarUrl)
    }}
    onError={() => {
      console.error("HOME DP FAILED:", post.username, avatarUrl)
      setAvatarFailed(true)
    }}
  />
) : (
  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500">
    {(post.username || "U").charAt(0).toUpperCase()}
  </div>
)}
              
            </div>
          </button>

          <button
            type="button"
            onClick={handleProfile}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-sm font-bold text-slate-900">
              {post.username || "ChitPix User"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {post.location || "ChitPix"}
            </p>
          </button>

          {!isOwner && (
            <button
              type="button"
              onClick={handleFollow}
              disabled={busy}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                followed
                  ? "bg-slate-100 text-slate-700"
                  : "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white"
              }`}
            >
              {followed ? "Following" : "Follow"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
            aria-label="More options"
          >
            <ChitIcon name="more" size={22} />
          </button>
        </div>

        {showMore && (
          <div className="mx-4 mb-3 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={handleProfile}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-slate-50"
            >
              View profile
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-slate-50"
            >
              Copy post link
            </button>
            {!isOwner && (
              <button
                type="button"
                onClick={handleReport}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Report post
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowMore(false)}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* PHOTO OR VIDEO */}
        {mediaUrl && (
          <div className="relative w-full overflow-hidden bg-black">
            {mediaType === "video" ? (
              <video
                src={mediaUrl}
                controls
                playsInline
                preload="metadata"
                className="max-h-[620px] w-full object-contain"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={post.caption || "ChitPix post"}
                loading={index !== undefined && index > 2 ? "lazy" : "eager"}
                className="max-h-[620px] w-full object-contain"
              />
            )}

            {post.price !== null &&
              post.price !== undefined &&
              String(post.price).trim() !== "" && (
                <div className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                  ₹{post.price}
                </div>
              )}
          </div>
        )}

        
        
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-4 px-4 pt-4 pb-2">

          {/* LIKE */}
          <button
            type="button"
            onClick={handleLike}
            disabled={busy}
            className={`flex items-center gap-1.5 ${
              liked ? "text-pink-600" : "text-slate-900"
            }`}
            aria-label="Like post"
          >
            <ChitIcon name="heart" size={30} active={liked} />
            <span className="text-[18px] font-semibold">
              {likes.toLocaleString("en-IN")}
            </span>
          </button>

          {/* COMMENT */}
          <button
            type="button"
            onClick={() => {
              setShowComments(true)
              loadComments()
            }}
            className="flex items-center gap-1.5 text-slate-900"
            aria-label="Comments"
          >
            <ChitIcon name="comment" size={30} />
            <span className="text-[18px] font-semibold">
              {commentCount.toLocaleString("en-IN")}
            </span>
          </button>

          {/* SHARE */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-slate-900"
            aria-label="Share post"
          >
            <ChitIcon name="share" size={30} />
            <span className="text-[18px] font-semibold">
              {shareCount.toLocaleString("en-IN")}
            </span>
          </button>

          {/* DM */}
          <button
            type="button"
            onClick={handleDM}
            className="text-slate-900"
            aria-label="Send post"
          >
            <ChitIcon name="send" size={30} />
          </button>

          {/* SAVE */}
          <button
            type="button"
            onClick={handleSave}
            className={`ml-auto ${
              saved ? "text-fuchsia-600" : "text-slate-900"
            }`}
            aria-label="Save post"
          >
            <ChitIcon name="bookmark" size={30} active={saved} />
          </button>

        </div>
        

        {/* POST DETAILS */}
        <div className="px-4 pb-4 pt-3">
          <p className="text-sm font-bold text-slate-900">
            {likes.toLocaleString("en-IN")} likes
          </p>

          {post.caption && (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">
              <button
                type="button"
                onClick={handleProfile}
                className="mr-2 font-bold text-slate-900"
              >
                {post.username || "user"}
              </button>
              {post.caption}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setShowComments(true)
              loadComments()
            }}
            className="mt-2 text-sm text-slate-500"
          >
            View all comments
          </button>

          {message && (
            <p className="mt-2 text-xs font-medium text-fuchsia-600">
              {message}
            </p>
          )}
        </div>
      </article>

      {/* SHARE SHEET */}
      {showShare && (
        <div
          className="fixed inset-0 z-[99998] flex items-end justify-center bg-black/50"
          onClick={() => setShowShare(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-300" />
            <h3 className="mb-4 text-center text-lg font-bold text-slate-900">
              Share post
            </h3>
            <button
              type="button"
              onClick={handleCopyLink}
              className="mb-2 w-full rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-800"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={handleDM}
              className="w-full rounded-2xl bg-green-500 p-4 text-sm font-bold text-white"
            >
              Share with WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* COMMENTS BOTTOM SHEET */}
      {showComments && (
        <div
          className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/55"
          onClick={() => {
            setShowComments(false)
            setShowEmojiPicker(false)
            setReplyingTo(null)
          }}
        >
          <section
            className="flex h-[82dvh] max-h-[82dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* COMMENTS HEADER */}
            <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Comments
                </h3>
                <p className="text-xs text-slate-500">
                  Join the ChitPix conversation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-700"
                aria-label="Close comments"
              >
                <ChitIcon name="close" size={20} />
              </button>
            </header>

            {/* SCROLLABLE COMMENTS LIST */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {comments.length === 0 ? (
                <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-full bg-fuchsia-50 p-4 text-fuchsia-500">
                    <ChitIcon name="comment" size={30} />
                  </div>
                  <p className="font-bold text-slate-800">No comments yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-xs font-bold text-white">
                        {(comment.username || "U").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm text-slate-800">
                          <span className="mr-2 font-bold text-slate-900">
                            {comment.username || "user"}
                          </span>
                          {comment.content}
                        </p>

                        <div className="mt-2 flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleCommentLike(comment)}
                            className="text-xs font-semibold text-slate-500"
                          >
                            {likedComments[comment.id]
  ? "Liked"
  : "Like"}{" "}
                            {commentLikeCounts[comment.id] || 0}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(comment)
                              setShowEmojiPicker(false)
                            }}
                            className="text-xs font-semibold text-slate-500"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {comments
                      .filter(
                        (reply: any) => reply.parent_id === comment.id
                      )
                      .map((reply: any) => (
                        <div
                          key={reply.id}
                          className="ml-11 flex items-start gap-2"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                            {(reply.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <p className="break-words text-sm text-slate-700">
                            <span className="mr-2 font-bold text-slate-900">
                              {reply.username || "user"}
                            </span>
                            {reply.content}
                          </p>
                        </div>
                      ))}
                  </div>
                ))
              )}
            </div>

            {/* REPLY INDICATOR */}
            {replyingTo && (
              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-fuchsia-50 px-4 py-2">
                <p className="text-xs text-slate-700">
                  Replying to{" "}
                  <span className="font-bold">
                    {replyingTo.username || "user"}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-xs font-bold text-fuchsia-600"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* EMOJI PICKER */}
            {showEmojiPicker && (
              <div className="flex shrink-0 flex-wrap gap-3 border-t border-slate-100 px-4 py-3 text-2xl">
                {["❤️", "😂", "😍", "🔥", "👏", "🥰", "👍", "🎉"].map(
                  (emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => {
                        setCommentText((old) => old + emoji)
                        setShowEmojiPicker(false)
                      }}
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            )}

            
{/* COMMENT INPUT - ALWAYS AT BOTTOM */}
<form
  onSubmit={(e) => {
    e.preventDefault()
    handleComment()
  }}
  className="sticky bottom-0 z-[100] flex min-h-[72px] w-full shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
>
  <button
    type="button"
    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
    className="shrink-0 rounded-full bg-slate-100 p-2 text-xl"
    aria-label="Choose emoji"
  >
    😊
  </button>

  <input
    type="text"
    value={commentText}
    onChange={(e) => setCommentText(e.target.value)}
    placeholder={
      replyingTo ? "Write a reply..." : "Add a comment..."
    }
    className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-fuchsia-300"
  />

  <button
    type="submit"
    disabled={!commentText.trim() || busy}
    className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
  >
    Post
  </button>
</form>
          </section>
        </div>
      )}
    </>
  )

}

// PART 4 CONTINUES BELOW
          
// PART 4 - HOME PAGE LOGIC

export default function HomePage() {
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState("")

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const [search, setSearch] = useState("")
  const [activeFeed, setActiveFeed] = useState<
    "For You" | "Photos" | "Videos" | "Shop"
  >("For You")

  const [showUpload, setShowUpload] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showDMList, setShowDMList] = useState(false)

  const [notifications, setNotifications] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifError, setNotifError] = useState("")

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // LOGIN USER DETAILS
  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (error || !user) {
        setCurrentUserId(null)
        setCurrentUsername("")
        return
      }

      setCurrentUserId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return

      setCurrentUsername(
        profile?.username ||
          profile?.full_name ||
          user.email?.split("@")[0] ||
          "user"
      )
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // LOAD POSTS FROM SUPABASE
  const loadPosts = async () => {
    setError("")

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Posts loading error:", error)
      setError("Posts load avvaledu. Please refresh.")
      setLoading(false)
      return
    }
    const postRows = data || []


const userIds = Array.from(
  new Set(
    postRows
      .map((post: any) => post.user_id)
      .filter(Boolean)
  )
)
    


const usernames = Array.from(
  new Set(
    postRows
      .map((post: any) => post.username)
      .filter(Boolean)
  )
)
    

let profiles: any[] = []

if (userIds.length > 0) {
  const { data: rows, error: profileError } = await supabase
    .from("profiles")
    
.select("id, username, avatar_url")
    .in("id", userIds)

  if (profileError) {
    console.error("Profile ID lookup error:", profileError)
  } else {
    profiles = rows || []
  }
}

if (usernames.length > 0) {
  const { data: rows, error: usernameError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("username", usernames)

  if (usernameError) {
    console.error("Profile username lookup error:", usernameError)
  } else {
    const existingIds = new Set(profiles.map((p: any) => p.id))
    profiles = [
      ...profiles,
      ...(rows || []).filter((p: any) => !existingIds.has(p.id)),
    ]
  }
}

const profileById = new Map(
  profiles.map((profile: any) => [profile.id, profile])
)

const profileByUsername = new Map(
  profiles.map((profile: any) => [
    String(profile.username || "").toLowerCase(),
    profile,
  ])
)

const formattedPosts: Post[] = postRows.map((post: any) => {
  const profile: any =
    profileById.get(post.user_id) ||
    profileByUsername.get(
      String(post.username || "").toLowerCase()
    )
   


console.log("DP DEBUG:", {
  postUsername: post.username,
  postUserId: post.user_id,
  profileFound: !!profile,
  profileId: profile?.id,
  profileUsername: profile?.username,
  profileAvatar: profile?.avatar_url,
})
  
  
  
  const avatarUrl = fixAvatarUrl(
    profile?.avatar_url ||
    post.avatar_url ||
    post.avatar ||
    null
  )

  return {
    ...post,
    username:
      profile?.username ||
      post.username ||
      profile?.full_name ||
      "ChitPix User",
    full_name: profile?.full_name || post.full_name || null,
    avatar_url: avatarUrl,
    avatar: avatarUrl,
  }
})
    
    

    setPosts(formattedPosts)
    setLoading(false)
  }

  // FIRST FEED LOAD
  useEffect(() => {
    loadPosts()
  }, [])

  // LOAD NOTIFICATIONS
  const loadNotifications = async () => {
    setNotifLoading(true)
    setNotifError("")

    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Notifications load failed")
      }

      const items = Array.isArray(result)
        ? result
        : result?.notifications || result?.data || []

      setNotifications(items)
    } catch (err: any) {
      console.error("Notification error:", err)
      setNotifError(err.message || "Notifications load failed")
    } finally {
      setNotifLoading(false)
    }
  }

  // REFRESH FEED
  const refreshFeed = async () => {
    setLoading(true)
    await loadPosts()
  }

  // OPEN CREATE POST
  const openUpload = () => {
    if (!currentUserId) {
      setNotice("Post upload cheyadaniki login avvandi.")
      return
    }

    setSelectedFile(null)
    setCaption("")
    setPrice("")
    setShowUpload(true)
  }

  // SELECT PHOTO OR VIDEO
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")

    if (!isVideo && !isImage) {
      setNotice("Please select a photo or video.")
      event.target.value = ""
      return
    }

    if (isVideo && file.size > 100 * 1024 * 1024) {
      setNotice("Video size 100MB lopu undali.")
      event.target.value = ""
      return
    }

    if (isImage && file.size > 15 * 1024 * 1024) {
      setNotice("Photo size 15MB lopu undali.")
      event.target.value = ""
      return
    }

    setSelectedFile(file)
    setNotice("")
  }

  // PART 5 CONTINUES BELOW
    
  // PART 5 - UPLOAD PHOTO / VIDEO TO R2

  const handleUpload = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    if (!currentUserId) {
      setNotice("Please login to upload a post.")
      return
    }

    if (!selectedFile) {
      setNotice("Please select a photo or video.")
      return
    }

    setUploading(true)
    setNotice("")
    setError("")

    try {
      // STEP 1: GET R2 PRESIGNED URL
      const presignResponse = await fetch("/api/r2-presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      })

      const presignData = await presignResponse.json()

      if (!presignResponse.ok) {
        throw new Error(
          presignData?.error || "R2 upload permission failed"
        )
      }

      const uploadUrl = presignData.uploadUrl || presignData.url

      if (!uploadUrl) {
        throw new Error("R2 upload URL missing")
      }

      // STEP 2: UPLOAD FILE TO R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      })

      if (!uploadResponse.ok) {
        throw new Error("Media upload to R2 failed")
      }

      // STEP 3: GET PUBLIC MEDIA URL
      const publicUrl =
        presignData.publicUrl ||
        (presignData.key
          ? `${R2_PUBLIC}/${String(presignData.key).replace(/^\/+/, "")}`
          : "")

      if (!publicUrl) {
        throw new Error("R2 public URL missing")
      }

      // STEP 4: SAVE POST DETAILS IN SUPABASE
      const { data: newPost, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: currentUserId,
          image_url: publicUrl,
          r2_url: publicUrl,
          caption: caption.trim(),
          price: price.trim() || null,
          username: currentUsername || "user",
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // STEP 5: SEND POST NOTIFICATION
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "post",
            content_id: newPost.id,
          }),
        })
      } catch (notificationError) {
        console.warn("Post notification could not be sent:", notificationError)
      }

      setShowUpload(false)
      setSelectedFile(null)
      setCaption("")
      setPrice("")

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setNotice("Your post was uploaded successfully!")
      await loadPosts()
    } catch (err: any) {
      console.error("Post upload error:", err)
      setNotice(err.message || "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  // MIXED FEED FILTERING
  const filteredPosts = posts.filter((post) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch =
      !searchText ||
      String(post.caption || "").toLowerCase().includes(searchText) ||
      String(post.username || "").toLowerCase().includes(searchText) ||
      String(post.price || "").toLowerCase().includes(searchText)

    if (!matchesSearch) return false

    if (activeFeed === "Photos") {
      return getMediaType(post) === "image"
    }

    if (activeFeed === "Videos") {
      return getMediaType(post) === "video"
    }

    if (activeFeed === "Shop") {
      return (
        post.price !== null &&
        post.price !== undefined &&
        String(post.price).trim() !== ""
      )
    }

    // FOR YOU = mixed photo + video feed
    return true
  })

  // OPEN NOTIFICATIONS
  const openNotifications = async () => {
    setShowNotif(true)
    await loadNotifications()
  }

  // OPEN MESSAGES
  const openMessages = () => {
    router.push("/messages")
  }

  // MARK ALL NOTIFICATIONS AS READ
  const markAllNotificationsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAll: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Could not update notifications")
      }

      setNotifications((old) =>
        old.map((item) => ({
          ...item,
          read: true,
          is_read: true,
        }))
      )
    } catch (err: any) {
      setNotifError(err.message || "Update failed")
    }
  }

  // MARK SINGLE NOTIFICATION AS READ
  const markNotificationRead = async (item: any) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Could not update notification")
      }

      setNotifications((old) =>
        old.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                read: true,
                is_read: true,
              }
            : notification
        )
      )
    } catch (err: any) {
      setNotifError(err.message || "Update failed")
    }
  }

  // UNREAD NOTIFICATION COUNT
  const unreadCount = notifications.filter(
    (item: any) => !item.read && !item.is_read
  ).length

  // PART 6 CONTINUES BELOW
    
  // PART 6 - MAIN HOME UI

  return (
    <main className="min-h-screen bg-[#f5f5fa] pb-24 text-slate-900">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[600px] items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 text-xl font-black text-white shadow-md">
              C
            </div>
            <div className="text-left">
              <h1 className="bg-gradient-to-r from-fuchsia-600 to-orange-500 bg-clip-text text-xl font-black tracking-tight text-transparent">
                ChitPix
              </h1>
              <p className="-mt-1 text-[9px] font-semibold tracking-[2px] text-slate-400">
                SHARE YOUR WORLD
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* NOTIFICATIONS */}
            <button
              type="button"
              onClick={openNotifications}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700"
              aria-label="Notifications"
            >
              <ChitIcon name="heart" size={23} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* MESSAGES */}
            <button
              type="button"
              onClick={openMessages}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700"
              aria-label="Messages"
            >
              <ChitIcon name="send" size={22} />
            </button>

            {/* CREATE POST */}
            <button
              type="button"
              onClick={openUpload}
              className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 text-sm font-bold text-white shadow-md shadow-pink-200"
            >
              <span className="text-xl leading-none">+</span>
              Post
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[600px]">
        {/* SEARCH BAR */}
        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people, posts, products..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-bold text-fuchsia-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* STORIES */}
        <section className="mb-3 overflow-hidden border-y border-slate-100 bg-white py-3">
          <div className="mb-2 flex items-center justify-between px-4">
            <h2 className="text-sm font-extrabold text-slate-900">
              Stories
            </h2>
            <p className="text-[11px] font-medium text-slate-400">
              Moments from your people
            </p>
          </div>

          <Stories />
        </section>

        {/* UPLOAD NOTICE */}
        {notice && (
          <div className="mx-4 mb-3 flex items-center justify-between rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-3">
            <p className="text-sm font-medium text-fuchsia-700">
              {notice}
            </p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-3 font-bold text-fuchsia-700"
            >
              ×
            </button>
          </div>
        )}

        {/* FEED INTRO */}
        <section className="px-4 pb-3 pt-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-600">
                Discover
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Your daily feed
              </h2>
            </div>

            <button
              type="button"
              onClick={refreshFeed}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </section>

        {/* FEED FILTER TABS */}
        <div className="sticky top-[64px] z-30 border-y border-slate-100 bg-[#f5f5fa]/95 px-4 py-3 backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto">
            {(["For You", "Photos", "Videos", "Shop"] as const).map(
              (tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveFeed(tab)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition ${
                    activeFeed === tab
                      ? "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-md shadow-pink-200"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {tab === "For You" && "✨ "}
                  {tab === "Photos" && "📸 "}
                  {tab === "Videos" && "▶ "}
                  {tab === "Shop" && "🛍️ "}
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* FEED CONTENT */}
        <section className="px-3 pt-4">
          {loading && posts.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl bg-white p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded bg-slate-200" />
                      <div className="h-2 w-20 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="aspect-square rounded-2xl bg-slate-200" />
                  <div className="mt-4 h-3 w-2/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : error && posts.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="font-bold text-slate-800">
                Feed load avvaledu
              </p>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={refreshFeed}
                className="mt-4 rounded-full bg-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-50 text-3xl">
                {search ? "🔍" : "📸"}
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {search ? "No results found" : "No posts yet"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try another search keyword."
                  : "Be the first to share a moment on ChitPix!"}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={openUpload}
                  className="mt-5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-6 py-3 text-sm font-bold text-white"
                >
                  + Create first post
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  currentUserId={currentUserId}
                  currentUserName={currentUsername}
                  onRefresh={refreshFeed}
                  galleryRef={fileInputRef}
                />
              ))}
            </div>
          )}
        </section>

        {/* PART 7 CONTINUES BELOW */}
              
        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* CREATE POST MODAL */}
        {showUpload && (
          <div
            className="fixed inset-0 z-[99990] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
            onClick={() => {
              if (!uploading) setShowUpload(false)
            }}
          >
            <section
              className="max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200 sm:hidden" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Create post
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Share your moment with ChitPix
                  </p>
                </div>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowUpload(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 disabled:opacity-40"
                  aria-label="Close upload"
                >
                  <ChitIcon name="close" size={21} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* MEDIA PICKER */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex min-h-[210px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-fuchsia-200 bg-fuchsia-50 p-4 text-center"
                >
                  {selectedFile ? (
                    <>
                      {selectedFile.type.startsWith("video/") ? (
                        <video
                          src={URL.createObjectURL(selectedFile)}
                          controls
                          playsInline
                          className="max-h-[260px] w-full rounded-2xl object-contain"
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Selected preview"
                          className="max-h-[260px] w-full rounded-2xl object-contain"
                        />
                      )}

                      <p className="mt-3 max-w-full truncate text-sm font-bold text-fuchsia-700">
                        {selectedFile.name}
                      </p>
                      <span className="mt-1 text-xs text-slate-500">
                        Tap to change media
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                        📸
                      </div>
                      <p className="font-bold text-slate-800">
                        Add photo or video
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Photos up to 15MB · Videos up to 100MB
                      </p>
                    </>
                  )}
                </button>

                {/* CAPTION */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    maxLength={2200}
                    placeholder="Write something about your post..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100"
                  />
                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    {caption.length}/2200
                  </p>
                </div>

                {/* OPTIONAL PRICE */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Product price (optional)
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                    <span className="font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                      className="w-full bg-transparent p-3 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* UPLOAD ERROR / NOTICE */}
                {notice && (
                  <p className="rounded-xl bg-fuchsia-50 p-3 text-sm text-fuchsia-700">
                    {notice}
                  </p>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-4 text-sm font-black text-white shadow-lg shadow-pink-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Uploading...
                    </>
                  ) : (
                    "Share on ChitPix"
                  )}
                </button>
              </form>
            </section>
          </div>
        )}

        {/* NOTIFICATIONS SCREEN */}
        {showNotif && (
          <div className="fixed inset-0 z-[99995] overflow-y-auto bg-[#f5f5fa]">
            <div className="mx-auto min-h-screen max-w-[600px] bg-white">
              <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNotif(false)}
                    className="rounded-full bg-slate-100 p-2"
                    aria-label="Back"
                  >
                    <ChitIcon name="close" size={20} />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Notifications
                    </h2>
                    <p className="text-xs text-slate-500">
                      Your ChitPix activity
                    </p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs font-bold text-fuchsia-600"
                  >
                    Mark all read
                  </button>
                )}
              </header>

              <div className="p-4">
                {notifError && (
                  <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {notifError}
                  </p>
                )}

                {notifLoading ? (
                  <div className="py-16 text-center text-sm text-slate-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-50 text-3xl">
                      🔔
                    </div>
                    <h3 className="font-bold text-slate-900">
                      No notifications yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Your activity updates will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    
{notifications.map((item: any) => (
  <div
    key={item.id}
    className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left ${
      item.read || item.is_read
        ? "bg-white"
        : "bg-fuchsia-50"
    }`}
  >
    <button
      type="button"
      onClick={async () => {
        await markNotificationRead(item)

        const username =
          item.actor_username || item.username

        if (username) {
          setShowNotif(false)
          router.push(
            `/profile/${encodeURIComponent(username)}`
          )
        }
      }}
      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white"
      aria-label="Open user profile"
    >
      {item.actor_avatar ||
      item.actor_avatar_url ||
      item.avatar_url ? (
        <img
          src={
            item.actor_avatar ||
            item.actor_avatar_url ||
            item.avatar_url
          }
          alt="User profile"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-bold">
          {(item.actor_username || item.username || "C")
            .charAt(0)
            .toUpperCase()}
        </span>
      )}
    </button>

    <button
      type="button"
      onClick={async () => {
        await markNotificationRead(item)

        const username =
          item.actor_username || item.username

        if (username) {
          setShowNotif(false)
          router.push(
            `/profile/${encodeURIComponent(username)}`
          )
        }
      }}
      className="min-w-0 flex-1 text-left"
    >
      <p className="break-words text-sm text-slate-800">
        <span className="font-bold">
          {item.actor_username ||
            item.username ||
            "ChitPix"}
        </span>{" "}
        {item.message ||
          item.content ||
          item.type ||
          "sent you an update"}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {item.created_at
          ? new Date(item.created_at).toLocaleString()
          : ""}
      </p>
    </button>

    {!item.read && !item.is_read && (
      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-fuchsia-500" />
    )}
  </div>
))}
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PART 8 CONTINUES BELOW */}
        
        {/* HOME CONTENT CONTAINER CLOSE */}
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </main>
  )
}

// HOME PAGE END
