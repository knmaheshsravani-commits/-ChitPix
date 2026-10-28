"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

type Comment = {
  id: string
  username: string
  user_id?: string
  content: string
  created_at: string
  parent_id?: string | null
  likes?: number
  liked?: boolean
  replies?: Comment[]
}

const EMOJIS = ["❤️", "😂", "🔥", "😍", "👏", "💯", "😎", "🥹"]

export default function CommentAZ({
  postId,
  isOpen,
  onClose,
}: {
  postId: string
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()

  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [sort, setSort] = useState<"top" | "newest">("newest")
  const [posting, setPosting] = useState(false)
  const [me, setMe] = useState({
    id: "",
    username: "user",
    photo: "",
  })

  useEffect(() => {
    const loadMe = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      setMe({
        id: user.id,
        username:
          profile?.username || user.email?.split("@")[0] || "user",
        photo: profile?.avatar_url || "",
      })
    }

    loadMe()
  }, [])

  const load = useCallback(async () => {
    if (!postId) return

    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Comments load error:", error)
      return
    }

    const { data: likeRows, error: likeError } = await supabase
      .from("comment_likes")
      .select("comment_id, username")

    if (likeError) {
      console.error("Comment likes load error:", likeError)
    }

    const allLikes = likeRows || []

    const makeComment = (c: any): Comment => ({
      ...c,
      likes: allLikes.filter((l: any) => l.comment_id === c.id).length,
      liked: allLikes.some(
        (l: any) =>
          l.comment_id === c.id && l.username === me.username
      ),
      replies: [],
    })

    const rows = (data || []).map(makeComment)

    const parents = rows
      .filter((c: Comment) => !c.parent_id)
      .map((c: Comment) => ({
        ...c,
        replies: rows.filter(
          (r: Comment) => r.parent_id === c.id
        ),
      }))

    setComments(parents)
  }, [postId, me.username])

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = "hidden"
    load()

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, load])

  const post = async () => {
    const savedText = text.trim()

    if (!savedText || posting) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Bro, comment cheyyadaniki login avvali.")
      return
    }

    setPosting(true)

    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      username: me.username,
      user_id: user.id,
      content: savedText,
      parent_id: replyTo?.id || null,
    })

    setPosting(false)

    if (error) {
      console.error("Comment save error:", error)
      alert("Comment save avvaledu bro. Database/RLS check cheddam.")
      return
    }

    setText("")
    setReplyTo(null)
    await load()
  }

  const like = async (c: Comment) => {
    const wasLiked = !!c.liked

    if (!me.id) {
      alert("Bro, comment like cheyyadaniki login avvali.")
      return
    }

    // Update the screen immediately.
    const updateComment = (item: Comment): Comment => {
      if (item.id === c.id) {
        return {
          ...item,
          liked: !wasLiked,
          likes: Math.max(
            0,
            (item.likes || 0) + (wasLiked ? -1 : 1)
          ),
        }
      }

      return {
        ...item,
        replies: item.replies?.map(updateComment),
      }
    }

    setComments((prev) => prev.map(updateComment))

    let error

    if (wasLiked) {
      const result = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", c.id)
        .eq("username", me.username)

      error = result.error
    } else {
      const result = await supabase
        .from("comment_likes")
        .insert({
          comment_id: c.id,
          username: me.username,
        })

      error = result.error
    }

    if (error) {
      console.error("Comment like error:", error)
      await load()
    }
  }

  const timeAgo = (value: string) => {
    const seconds = Math.max(
      0,
      Math.floor((Date.now() - new Date(value).getTime()) / 1000)
    )

    if (seconds < 60) return "now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`

    return `${Math.floor(seconds / 86400)}d`
  }

  const addEmoji = (emoji: string) => {
    setText((previous) => previous + emoji)
  }

  const copyComment = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      alert("Comment copy cheyyalekapoyanu bro.")
    }
  }

  if (!isOpen) return null

  const orderedComments = [...comments].sort((a, b) => {
    if (sort === "top") {
      return (b.likes || 0) - (a.likes || 0)
    }

    return (
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
    )
  })

  const totalComments = comments.reduce(
    (total, c) => total + 1 + (c.replies?.length || 0),
    0
  )

  const renderComment = (c: Comment, isReply = false) => (
    <div
      key={c.id}
      className={isReply ? "ml-10 mt-4" : "mt-5"}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.push(`/profile/${c.username}`)}
          className="shrink-0"
          aria-label={`Open ${c.username} profile`}
        >
          <img
            src={`https://i.pravatar.cc/100?u=${encodeURIComponent(
              c.username
            )}`}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <b className="text-[14px] text-neutral-900">
              {c.username}
            </b>
            <span className="text-xs text-neutral-400">
              {timeAgo(c.created_at)}
            </span>
          </div>

          <p className="text-[15px] text-neutral-900 mt-1 break-words">
            {c.content}
          </p>

          <div className="flex items-center gap-3 flex-wrap mt-3 text-sm text-neutral-500">
            <button
              type="button"
              onClick={() => like(c)}
              className={c.liked ? "font-semibold text-red-500" : ""}
            >
              {c.liked ? "❤️" : "🤍"} {c.likes || 0}
            </button>

            <button
              type="button"
              className="font-semibold"
              onClick={() => {
                setReplyTo(c)
                document.getElementById("comment-input")?.focus()
              }}
            >
              Reply
            </button>

            {["❤️", "😂", "🔥", "😍", "📌"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                aria-label={`Add ${emoji}`}
              >
                {emoji}
              </button>
            ))}

            <button
              type="button"
              onClick={() => copyComment(c.content)}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {c.replies?.map((reply) => renderComment(reply, true))}
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/55 flex justify-center items-end"
      onClick={onClose}
    >
      <section
        className="w-full max-w-[470px] h-[88dvh] bg-white rounded-t-[30px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <header className="shrink-0 bg-white border-b border-neutral-200 px-4 pt-3 pb-4">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-5" />

          <div className="text-center text-[25px] font-bold text-neutral-950">
            {totalComments} Comments
          </div>

          <div className="flex justify-center gap-4 mt-5">
            <button
              type="button"
              onClick={() => setSort("top")}
              className={`px-7 py-3 rounded-full text-sm font-bold ${
                sort === "top"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              ⬆️ Top
            </button>

            <button
              type="button"
              onClick={() => setSort("newest")}
              className={`px-7 py-3 rounded-full text-sm font-bold ${
                sort === "newest"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              ✨ Newest
            </button>
          </div>
        </header>

        {/* SCROLLABLE COMMENTS */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
          {orderedComments.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-neutral-900">
                No comments yet
              </h3>
              <p className="text-neutral-500 mt-2">
                Start the conversation.
              </p>
            </div>
          ) : (
            orderedComments.map((c) => renderComment(c))
          )}
        </div>

        {/* FIXED INPUT AREA */}
        <footer className="shrink-0 bg-white border-t border-neutral-200">
          {replyTo && (
            <div className="px-4 pt-2 flex justify-between items-center text-sm text-neutral-500">
              <span>
                Replying to <b>{replyTo.username}</b>
              </span>

              <button
                type="button"
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-between px-4 pt-3 pb-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-[27px]"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form
            className="px-3 pb-4 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              post()
            }}
          >
            <img
              src={
                me.photo ||
                `https://i.pravatar.cc/100?u=${encodeURIComponent(me.username)}`
              }
              alt="Your profile"
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />

            <div className="flex-1 min-w-0 flex items-center rounded-full border-2 border-neutral-200 bg-neutral-50 pl-4 pr-2 py-2">
              <input
                id="comment-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  replyTo
                    ? `Reply to ${replyTo.username}...`
                    : "Add a comment..."
                }
                className="flex-1 min-w-0 bg-transparent text-[16px] text-black outline-none py-2"
              />

              <button
                type="submit"
                disabled={!text.trim() || posting}
                className="ml-2 px-5 py-3 rounded-full bg-blue-600 text-white font-bold disabled:opacity-40"
              >
                {posting ? "..." : "Post"}
              </button>
            </div>
          </form>
        </footer>
      </section>
    </div>
  )
    }
      
