function ChitIcon({
  name,
  size = 26,
  active = false,
}: {
  name: "heart" | "comment" | "share" | "bookmark" | "send" | "more" | "user-plus"
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
        <svg {...common} fill={active ? "#F43F5E" : "none"} stroke={active ? "#F43F5E" : "currentColor"}>
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
  }
}

function PostCard({
  post,
  index,
  currentUserId,
  onRefresh,
}: {
  post: Post
  index: number
  currentUserId: string | null
  onRefresh: () => void
}) {
  const router = useRouter()

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [likes, setLikes] = useState(Number(post.likes_count || 0))
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const mediaUrl = fixR2Url(post)
  const mediaType = getMediaType(post)
  const isOwner = !!currentUserId && currentUserId === post.user_id

  const handleLike = async () => {
    if (!currentUserId) {
      setMessage("Like cheyadaniki login avvali")
      return
    }
    setLiked(value => !value)
    setLikes(value => Math.max(0, value + (liked ? -1 : 1)))
  }

  const handleSave = async () => {
    if (!currentUserId) {
      setMessage("Save cheyadaniki login avvali")
      return
    }
    setSaved(value => !value)
  }

  const handleShare = async () => {
    const text = `ChitPix 🔥 ${post.caption || ""}\n${mediaUrl}`
    try {
      if (navigator.share) {
        await navigator.share({ title: "ChitPix", text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(text)
        setMessage("Share text copied")
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") setMessage("Share cheyalekapoyam")
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setMessage("Link copied")
      setShowShare(false)
    } catch {
      setMessage("Link copy avvaledu")
    }
  }

  const handleDM = () => {
    const text = `ChitPix post: ${post.caption || ""} ${mediaUrl}`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    if (!currentUserId) {
      setMessage("Comment cheyadaniki login avvali")
      return
    }
    setMessage("Comments integration Part 3 lo complete chestham")
  }

  const handleFollow = async () => {
    if (!currentUserId) {
      setMessage("Follow cheyadaniki login avvali")
      return
    }
    if (currentUserId === post.user_id) {
      setMessage("Mee profile ni meeru follow cheyyaleru")
      return
    }
    setFollowed(value => !value)
  }

  const handleProfile = () => {
    if (post.username) {
      router.push(`/profile/${encodeURIComponent(post.username)}`)
    } else {
      setMessage("Username dorakaledu")
    }
  }

  const handleReport = async () => {
    if (!currentUserId) {
      setMessage("Report cheyadaniki login avvali")
      return
    }
    setMessage("Report integration Part 4 lo complete chestham")
  }

  return (
    <article className="border-b-8 border-zinc-100 bg-white">
      <div className="flex items-center justify-between px-3 py-3">
        <button onClick={handleProfile} className="flex items-center gap-2 text-left">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold">
              {(post.username || "C").slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold">{post.username || "ChitPix Creator"}</p>
            <p className="text-xs text-zinc-500">
              {post.created_at ? new Date(post.created_at).toLocaleDateString() : "ChitPix"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <button onClick={handleFollow} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              {followed ? "Following" : "Follow"}
            </button>
          )}
          <button onClick={() => setShowMore(value => !value)} className="p-1" aria-label="More options">
            <ChitIcon name="more" size={24} />
          </button>
        </div>
      </div>

      {showMore && (
        <div className="mx-3 mb-2 space-y-2 rounded-xl bg-zinc-50 p-3 text-sm">
          <button onClick={handleReport} className="block">Report post</button>
          <button onClick={() => setShowMore(false)} className="block">Close</button>
        </div>
      )}

      {mediaUrl ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100">
          {mediaType === "video" ? (
            <video src={mediaUrl} controls playsInline preload="metadata" className="h-full w-full object-contain" />
          ) : (
            <img src={mediaUrl} alt={post.caption || "ChitPix post"} loading="lazy" className="h-full w-full object-cover" />
          )}
          {post.price != null && post.price !== "" && (
            <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
              ₹{post.price}
            </span>
          )}
        </div>
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center bg-zinc-100 text-sm text-zinc-500">
          Media URL missing
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-5">
          <button onClick={handleLike} aria-label={liked ? "Unlike post" : "Like post"} className="active:scale-75 transition-transform">
            <ChitIcon name="heart" size={27} active={liked} />
          </button>
          <button onClick={() => setShowComments(true)} aria-label="Comments" className="active:scale-75 transition-transform">
            <ChitIcon name="comment" size={27} />
          </button>
          <button onClick={() => setShowShare(true)} aria-label="Share" className="active:scale-75 transition-transform">
            <ChitIcon name="share" size={26} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} aria-label={saved ? "Unsave post" : "Save post"} className="active:scale-75 transition-transform">
            <ChitIcon name="bookmark" size={26} active={saved} />
          </button>
          <button onClick={handleDM} aria-label="Message seller" className="rounded-full bg-black p-2 text-white active:scale-75 transition-transform">
            <ChitIcon name="send" size={18} />
          </button>
        </div>
      </div>

      <div className="px-3 pb-3 text-sm">
        <button onClick={() => setShowLikes(true)} className="font-bold">{likes} likes</button>
        <p className="mt-1"><b>{post.username || "Creator"}</b> {post.caption || ""}</p>
      </div>

      {message && (
        <div className="mx-3 mb-3 rounded-lg bg-zinc-100 p-2 text-xs">
          {message}
          <button onClick={() => setMessage("")} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 z-[200] flex items-end bg-black/50" onClick={() => setShowComments(false)}>
          <div className="mx-auto flex max-h-[70vh] w-full max-w-[480px] flex-col rounded-t-2xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between border-b p-4">
              <b>Comments</b>
              <button onClick={() => setShowComments(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4 text-sm text-zinc-500">
              Comments database integration Part 3 lo add chestham.
            </div>
            <div className="flex gap-2 border-t p-3">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="min-w-0 flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm" />
              <button onClick={handleComment} className="font-bold text-blue-600">Post</button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-[200] flex items-end bg-black/50" onClick={() => setShowShare(false)}>
          <div className="mx-auto w-full max-w-[480px] rounded-t-2xl bg-white p-5" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <b>Share post</b>
              <button onClick={() => setShowShare(false)}>✕</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={handleShare} className="flex flex-col items-center gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 p-3"><ChitIcon name="share" size={25} /></span>
                Share
              </button>
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 p-3">🔗</span>
                Copy Link
              </button>
              <button onClick={handleDM} className="flex flex-col items-center gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 p-3"><ChitIcon name="send" size={25} /></span>
                WhatsApp DM
              </button>
            </div>
          </div>
        </div>
      )}

      {showLikes && (
        <div className="fixed inset-0 z-[200] flex items-end bg-black/50" onClick={() => setShowLikes(false)}>
          <div className="mx-auto max-h-[60vh] w-full max-w-[480px] rounded-t-2xl bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between">
              <b>{likes} Likes</b>
              <button onClick={() => setShowLikes(false)}>✕</button>
            </div>
            <p className="mt-3 text-sm text-zinc-500">Like details integration will be added in a later part.</p>
          </div>
        </div>
      )}
    </article>
  )
            }
          
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
        const { error } = await supabase
          .from("saved_posts")
          .insert({
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
        const { error } = await supabase
          .from("user_follows")
          .insert({
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
    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("Malli login avvali")
    }

    const username =
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      "ChitPix User"

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: post.id,
        user_id: user.id,
        username,
        content: text,
      })

    if (error) throw error

    setCommentText("")
    setMessage("Comment posted successfully ❤️")

    // Refresh current post/feed if parent supplies a refresh callback.
    onRefresh()
  } catch (error: any) {
    setMessage(error.message || "Comment save avvaledu")
  } finally {
    setBusy(false)
  }
}
const filtered = posts.filter((post) => {
  const query = searchText.trim().toLowerCase()

  if (!query) return true

  const captionText = String(post.caption || "").toLowerCase()
  const usernameText = String(post.username || "").toLowerCase()
  const priceText = String(post.price || "").toLowerCase()

  return (
    captionText.includes(query) ||
    usernameText.includes(query) ||
    priceText.includes(query)
  )
})
const [feedError, setFeedError] = useState("")
const [refreshing, setRefreshing] = useState(false)

const loadPosts = async () => {
  setRefreshing(true)
  setFeedError("")

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    setPosts(data || [])
  } catch (error: any) {
    console.error("ChitPix feed error:", error)
    setFeedError(error.message || "Posts load avvaledu")
  } finally {
    setLoading(false)
    setRefreshing(false)
  }
}

useEffect(() => {
  loadPosts()
}, [])
