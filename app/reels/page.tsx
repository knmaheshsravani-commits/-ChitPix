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
  Search,
  Sparkles,
  Clock3,
  BarChart3,
  ListVideo,
  Repeat2,
  Captions,
  WandSparkles,
  CalendarClock,
  History,
  Users,
  Link2,
  Scissors,
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

  // REEL FEED
  const [posts, setPosts] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingReels, setLoadingReels] = useState(true)
  const [reelsError, setReelsError] = useState("")
  const [likesCount, setLikesCount] = useState<Record<string, number>>({})

  // REEL ACTIONS
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [followed, setFollowed] = useState<Record<string, boolean>>({})
  const [muted, setMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [captionExpand, setCaptionExpand] =
    useState<Record<string, boolean>>({})

  // MODALS
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showAudioPanel, setShowAudioPanel] = useState(false)
  const [showReferencePanel, setShowReferencePanel] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showCollections, setShowCollections] = useState(false)

  // COMMENTS
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

  // SIGNED-IN USER
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState("ChitPix User")
  const [currentAvatar, setCurrentAvatar] = useState(DEFAULT_AVATAR)

  // NEW FEATURE STATES
  const [reelHistory, setReelHistory] = useState<string[]>([])
  const [collectionIds, setCollectionIds] = useState<string[]>([])
  const [notInterested, setNotInterested] = useState<string[]>([])
  const [feedMode, setFeedMode] = useState<"all" | "following">("all")
  const [reelSearch, setReelSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [autoCaptions, setAutoCaptions] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [loopEnabled, setLoopEnabled] = useState(true)
  const [featureMessage, setFeatureMessage] = useState("")

  // REFS
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({})
  const touchStartY = useRef<number | null>(null)
  const likingRef = useRef<Record<string, boolean>>({})

  // LOAD SIGNED-IN USER
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

        const { data: profile, error: profileError } =
          await supabase
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

  // LOAD REELS FROM EXISTING API
  const loadReels = useCallback(async () => {
    setLoadingReels(true)
    setReelsError("")

    try {
      const savedMute = localStorage.getItem("reels_muted")

      if (savedMute !== null) {
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

      // FALLBACK TO EXISTING POSTS API
      if (reels.length === 0) {
        const fallback = await fetch("/api/posts?limit=50", {
          cache: "no-store",
        })

        if (fallback.ok) {
          const fallbackData = await fallback.json()
          const allPosts: Reel[] = fallbackData.posts || []

          reels = allPosts.filter((post) => {
            const media =
              post.videoUrl || post.video_url || post.url || ""

            return (
              post.type === "video" ||
              /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(media)
            )
          })
        }
      }

      setPosts(reels)
    } catch (error) {
      console.error("Reels loading error:", error)
      setReelsError("Reels load avvaledu bro. Malli try cheyyi.")
      setPosts([])
    } finally {
      setLoadingReels(false)
    }
  }, [])

  useEffect(() => {
    void loadReels()
  }, [loadReels])

  // LOAD REEL LIKES FROM SUPABASE
  useEffect(() => {
    if (!posts.length) return

    let active = true

    const loadReelLikes = async () => {
      const postIds = posts.map((post) => String(post.id))

      const { data, error } = await supabase
        .from("post_likes")
        .select("post_id, user_id")
        .in("post_id", postIds)

      if (error) {
        console.error("Reel likes loading error:", error)
        return
      }

      if (!active) return

      const counts: Record<string, number> = {}
      const myLikes: Record<string, boolean> = {}

      postIds.forEach((id) => {
        counts[id] = 0
      })

      data?.forEach((like) => {
        const id = String(like.post_id)
        counts[id] = (counts[id] || 0) + 1

        if (like.user_id === currentUserId) {
          myLikes[id] = true
        }
      })

      setLikesCount(counts)
      setLiked(myLikes)
    }

    void loadReelLikes()

    return () => {
      active = false
    }
  }, [posts, currentUserId])

  // PLAY ONLY THE CURRENT REEL
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      const reelIndex = Number(index)

      if (!video) return

      if (reelIndex !== currentIndex) {
        video.pause()
        video.muted = true
      } else {
        video.muted = muted
        video.playbackRate = playbackSpeed

        if (isPlaying) {
          void video.play().catch((error) => {
            console.log("Reel playback:", error)
          })
        } else {
          video.pause()
        }
      }
    })
  }, [currentIndex, posts, muted, isPlaying, playbackSpeed])

  // PART 2 CONTINUES
          
  // LOAD SAVED COMMENTS
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

  // OPEN COMMENTS
  const openComments = async () => {
    const post = posts[currentIndex]

    if (!post?.id) {
      alert("Reel ID dorakaledu bro.")
      return
    }

    setCommentText("")
    setReplyTo(null)
    setShowEmojiPicker(false)
    setShowComments(true)

    await loadComments(String(post.id))
  }

  // POST COMMENT
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
      await loadComments(String(post.id))
    } catch (error) {
      console.error("Post comment error:", error)
      alert("Network problem bro. Malli try cheyyi.")
    } finally {
      setPostingComment(false)
    }
  }

  // REFRESH COMMENTS WHEN REEL CHANGES
  useEffect(() => {
    if (!showComments) return

    const post = posts[currentIndex]
    if (!post?.id) return

    void loadComments(String(post.id))
  }, [currentIndex, showComments, posts, loadComments])

  // COMMENT LIKE
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

  // LIKE REEL - SUPABASE PERSISTENCE
  const toggleLike = async (postId: string) => {
    if (likingRef.current[postId]) return

    likingRef.current[postId] = true

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        alert("Please login to like this Reel.")
        return
      }

      const { data: existingLike, error: checkError } =
        await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle()

      if (checkError) throw checkError

      if (existingLike) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id)

        if (error) throw error

        setLiked((previous) => ({
          ...previous,
          [postId]: false,
        }))
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: user.id,
          })

        if (error) throw error

        setLiked((previous) => ({
          ...previous,
          [postId]: true,
        }))
      }

      const { count, error: countError } = await supabase
        .from("post_likes")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId)

      if (countError) throw countError

      setLikesCount((previous) => ({
        ...previous,
        [postId]: count ?? 0,
      }))
    } catch (error) {
      console.error("Reel like error:", error)
      alert("Like save avvaledu bro. Malli try cheyyi.")
    } finally {
      delete likingRef.current[postId]
    }
  }

  // SAVE REEL
  const toggleSave = (postId: string) => {
    setSaved((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }))
  }

  // LOAD FOLLOWING USERS
  useEffect(() => {
    if (!currentUserId) return

    let active = true

    const loadFollowing = async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", currentUserId)

      if (error) {
        console.error("Following load error:", error)
        return
      }

      if (!active) return

      const followingMap: Record<string, boolean> = {}

      data?.forEach((item) => {
        followingMap[String(item.following_id)] = true
      })

      setFollowed(followingMap)
    }

    void loadFollowing()

    return () => {
      active = false
    }
  }, [currentUserId])

  // FOLLOW / UNFOLLOW
  const toggleFollow = async (userId: string) => {
    if (!currentUserId || !userId) return
    if (userId === currentUserId) return

    const { data: existing, error: checkError } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error(checkError)
      alert("Follow status check failed bro.")
      return
    }

    if (existing) {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)

      if (error) {
        console.error(error)
        alert("Unfollow failed bro.")
        return
      }

      setFollowed((previous) => ({
        ...previous,
        [userId]: false,
      }))
    } else {
      const { error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: currentUserId,
          following_id: userId,
        })

      if (error) {
        console.error(error)
        alert("Follow failed bro.")
        return
      }

      setFollowed((previous) => ({
        ...previous,
        [userId]: true,
      }))
    }
  }

  // MUTE / UNMUTE
  const toggleMute = () => {
    setMuted((previous) => {
      const next = !previous
      localStorage.setItem("reels_muted", String(next))
      return next
    })
  }

  // PLAY / PAUSE
  const togglePlayback = () => {
    const video = videoRefs.current[currentIndex]
    if (!video) return

    if (video.paused) {
      void video.play().catch((error) => {
        console.error("Video play error:", error)
      })
    } else {
      video.pause()
    }
  }

  // CHANGE PLAYBACK SPEED
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed)

    const video = videoRefs.current[currentIndex]
    if (video) video.playbackRate = speed
  }

  // SHARE CURRENT REEL
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
      }
    } catch (error) {
      console.error("Share error:", error)
    } finally {
      setShowShare(false)
    }
  }

  // PART 3 CONTINUES
            
  // TRACK CURRENT REEL WHILE SCROLLING
  const handleScroll = () => {
    const container = containerRef.current
    if (!container || posts.length === 0) return

    const height = container.clientHeight
    if (!height) return

    const nextIndex = Math.round(container.scrollTop / height)
    const safeIndex = Math.max(
      0,
      Math.min(nextIndex, posts.length - 1)
    )

    setCurrentIndex(safeIndex)
    setProgress(0)

    const nextPost = posts[safeIndex]

    if (nextPost?.id) {
      addToWatchHistory(String(nextPost.id))
    }
  }

  // FORMAT COUNTS
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }

    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }

    return String(count)
  }

  // SAVE REEL TO WATCH HISTORY
  const addToWatchHistory = (postId: string) => {
    setReelHistory((previous) => {
      const updated = [
        postId,
        ...previous.filter((id) => id !== postId),
      ].slice(0, 100)

      try {
        localStorage.setItem(
          "chitpix_reel_history",
          JSON.stringify(updated)
        )
      } catch (error) {
        console.error("History save error:", error)
      }

      return updated
    })
  }

  // RESTORE WATCH HISTORY AND SAVED COLLECTION
  useEffect(() => {
    try {
      const history = localStorage.getItem("chitpix_reel_history")
      const collections = localStorage.getItem("chitpix_reel_collections")
      const interests = localStorage.getItem("chitpix_reel_not_interested")

      if (history) setReelHistory(JSON.parse(history))
      if (collections) setCollectionIds(JSON.parse(collections))
      if (interests) setNotInterested(JSON.parse(interests))
    } catch (error) {
      console.error("Reel preferences load error:", error)
    }
  }, [])

  // SAVE REEL TO COLLECTION
  const toggleCollection = (postId: string) => {
    setCollectionIds((previous) => {
      const updated = previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [postId, ...previous]

      try {
        localStorage.setItem(
          "chitpix_reel_collections",
          JSON.stringify(updated)
        )
      } catch (error) {
        console.error("Collection save error:", error)
      }

      return updated
    })
  }

  // NOT INTERESTED
  const markNotInterested = (postId: string) => {
    setNotInterested((previous) => {
      const updated = previous.includes(postId)
        ? previous
        : [...previous, postId]

      try {
        localStorage.setItem(
          "chitpix_reel_not_interested",
          JSON.stringify(updated)
        )
      } catch (error) {
        console.error("Preference save error:", error)
      }

      return updated
    })

    setShowMore(false)
    setFeatureMessage("We'll show you fewer similar Reels.")
  }

  // FILTER REELS BY FOLLOWING AND SEARCH
  const visiblePosts = posts.filter((post) => {
    const id = String(post.id)
    const creatorId = String(post.user_id || "")

    if (notInterested.includes(id)) return false

    if (
      feedMode === "following" &&
      creatorId &&
      !followed[creatorId] &&
      creatorId !== currentUserId
    ) {
      return false
    }

    if (reelSearch.trim()) {
      const search = reelSearch.toLowerCase()
      const caption = (post.caption || "").toLowerCase()
      const username = (
        post.username ||
        post.user ||
        ""
      ).toLowerCase()

      if (
        !caption.includes(search) &&
        !username.includes(search)
      ) {
        return false
      }
    }

    return true
  })

  // AUDIO PAGE
  const currentReel = posts[currentIndex]

  const currentAudioName =
    currentReel?.audio_name || "Original audio · ChitPix"

  const audioReels = posts.filter(
    (post) =>
      (post.audio_name || "Original audio · ChitPix") ===
      currentAudioName
  )

  const openAudioPage = () => {
    setShowAudioPanel(true)
  }

  // USE THIS AUDIO
  const useThisAudio = () => {
    const post = posts[currentIndex]
    if (!post) return

    const audioName =
      post.audio_name || "Original audio · ChitPix"

    try {
      sessionStorage.setItem(
        "chitpix_selected_audio",
        JSON.stringify({
          name: audioName,
          reelId: post.id,
          creator: post.username || post.user || "ChitPix User",
        })
      )

      router.push("/upload?type=reel&useAudio=1")
    } catch (error) {
      console.error("Audio selection error:", error)
      setFeatureMessage("Audio selection failed.")
    }
  }

  // USE CURRENT REEL AS EDITING REFERENCE
  const useAsReference = () => {
    const post = posts[currentIndex]
    if (!post) return

    try {
      sessionStorage.setItem(
        "chitpix_reel_reference",
        JSON.stringify({
          reelId: post.id,
          caption: post.caption || "",
          username: post.username || post.user || "",
          mediaUrl:
            post.videoUrl ||
            post.video_url ||
            post.url ||
            "",
        })
      )

      setShowReferencePanel(false)
      router.push("/upload?type=reel&reference=1")
    } catch (error) {
      console.error("Reference save error:", error)
      setFeatureMessage("Reference save avvaledu bro.")
    }
  }

  // CREATE A REMIX
  const startRemix = () => {
    const post = posts[currentIndex]
    if (!post) return

    try {
      sessionStorage.setItem(
        "chitpix_remix_source",
        JSON.stringify({
          reelId: post.id,
          username: post.username || post.user || "",
          caption: post.caption || "",
        })
      )

      setShowCreateMenu(false)
      router.push("/upload?type=reel&remix=1")
    } catch (error) {
      console.error("Remix request error:", error)
      setFeatureMessage("Remix start avvaledu bro.")
    }
  }

  // OPEN CREATOR PROFILE
  const openCreatorProfile = (post: Reel) => {
    const username = post.username || post.user

    if (username) {
      router.push(
        `/profile/${encodeURIComponent(username)}`
      )
    } else {
      setFeatureMessage("Creator username dorakaledu.")
    }
  }

  // OPEN REEL DETAIL
  const openReelDetail = (post: Reel) => {
    router.push(`/reels/${encodeURIComponent(post.id)}`)
  }

  // REPORT REEL
  const reportCurrentReel = async () => {
    const post = posts[currentIndex]

    if (!post?.id || !currentUserId) {
      alert("Report cheyyadaniki login avvu bro.")
      return
    }

    const reason = window.prompt(
      "Report reason enter cheyyi:"
    )

    if (!reason?.trim()) return

    try {
      const { error } = await supabase
        .from("post_reports")
        .insert({
          post_id: post.id,
          reporter_id: currentUserId,
          reason: reason.trim(),
        })

      if (error) throw error

      setShowMore(false)
      alert("Report submitted. Thank you.")
    } catch (error) {
      console.error("Report error:", error)
      alert("Report submit avvaledu bro.")
    }
  }

  // REEL PLAYBACK SPEED OPTIONS
  const speedOptions = [0.5, 1, 1.5, 2]

  // REEL ANALYTICS
  const currentReelLikes =
    likesCount[String(currentReel?.id)] ??
    Number(currentReel?.likes || 0)

  const currentReelComments =
    Number(currentReel?.comments || 0)

  const currentReelViews =
    currentReel?.views || "Not available"

  // PART 4 CONTINUES
              
  // SAVE WATCH HISTORY
  useEffect(() => {
    try {
      localStorage.setItem(
        "chitpix_reel_history",
        JSON.stringify(reelHistory)
      )
    } catch (error) {
      console.error("History storage error:", error)
    }
  }, [reelHistory])

  // HANDLE VISIBLE REEL SCROLL
  const handleVisibleFeedScroll = () => {
    const container = containerRef.current
    if (!container || visiblePosts.length === 0) return

    const height = container.clientHeight
    if (!height) return

    const nextIndex = Math.max(
      0,
      Math.min(
        Math.round(container.scrollTop / height),
        visiblePosts.length - 1
      )
    )

    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex)
      setProgress(0)
      setIsPlaying(true)

      const nextPost = visiblePosts[nextIndex]

      if (nextPost?.id) {
        addToWatchHistory(String(nextPost.id))
      }
    }
  }

  // OPEN CREATE OPTIONS
  const openCreateOptions = () => {
    setShowCreateMenu(true)
    setIsPlaying(false)
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">

      {/* REELS FEED */}
      <div
        ref={containerRef}
        onScroll={handleVisibleFeedScroll}
        className="h-[calc(100dvh-68px)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scrollbar-hide"
      >
        {loadingReels ? (
          <div className="flex h-full items-center justify-center">
            <LoaderCircle className="animate-spin" size={32} />
            <span className="ml-3 text-sm text-white/70">
              Loading Reels...
            </span>
          </div>
        ) : reelsError ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-semibold">
              Reels load avvaledu bro
            </p>

            <p className="mt-2 text-sm text-white/60">
              {reelsError}
            </p>

            <button
              onClick={loadReels}
              className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-bold text-black"
            >
              <RefreshCw size={15} className="mr-2 inline" />
              Try Again
            </button>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <Play size={42} className="mb-4 text-white/50" />

            <p className="font-semibold">No Reels found</p>

            <p className="mt-2 text-sm text-white/60">
              Search or Following filter change chesi try cheyyi.
            </p>

            <button
              onClick={() => {
                setFeedMode("all")
                setReelSearch("")
                setShowSearch(false)
              }}
              className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-bold text-black"
            >
              Show All Reels
            </button>
          </div>
        ) : (
          visiblePosts.map((post, idx) => {
            const postId = String(post.id)

            const media =
              post.videoUrl ||
              post.video_url ||
              post.url ||
              post.imageUrl ||
              post.image_url ||
              ""

            const isVideo =
              /\.(mp4|webm|mov|m4v)(\?|$)/i.test(media) ||
              post.type === "video" ||
              post.type === "reel"

            const username =
              post.username ||
              post.user ||
              "chitpix_user"

            const avatar =
              post.userAvatar ||
              post.avatar_url ||
              DEFAULT_AVATAR

            const isCurrent = idx === currentIndex
            const isLiked = !!liked[postId]
            const isFollowed = !!followed[String(post.user_id || "")]

            return (
              <section
                key={postId}
                data-reel-slide
                className="relative h-full w-full snap-start snap-always overflow-hidden bg-black"
              >
                {/* REEL MEDIA */}
                {media ? (
                  isVideo ? (
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[idx] = el
                        } else {
                          delete videoRefs.current[idx]
                        }
                      }}
                      src={media}
                      className="absolute inset-0 h-full w-full object-contain"
                      playsInline
                      loop={loopEnabled}
                      muted={muted}
                      preload="metadata"
                      onClick={togglePlayback}
                      onPlay={() => {
                        if (isCurrent) setIsPlaying(true)
                      }}
                      onPause={() => {
                        if (isCurrent) setIsPlaying(false)
                      }}
                      onTimeUpdate={(event) => {
                        const video = event.currentTarget

                        if (isCurrent && video.duration) {
                          setProgress(
                            (video.currentTime / video.duration) * 100
                          )
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={media}
                      alt="ChitPix Reel"
                      className="absolute inset-0 h-full w-full object-contain"
                      onClick={togglePlayback}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-white/60">
                      Media not available
                    </p>
                  </div>
                )}

                {/* DARK GRADIENT */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />

                {/* TOP HEADER */}
                {idx === 0 && (
                  <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-12">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={openCreateOptions}
                        className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur-md"
                      >
                        <Plus size={18} />
                        Create
                      </button>

                      <button
                        onClick={() => setFeedMode("all")}
                        className={`text-lg font-bold ${
                          feedMode === "all"
                            ? "text-white"
                            : "text-white/55"
                        }`}
                      >
                        Reels
                      </button>

                      <button
                        onClick={() => setFeedMode("following")}
                        className={`text-sm font-semibold ${
                          feedMode === "following"
                            ? "text-white"
                            : "text-white/55"
                        }`}
                      >
                        Following
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowSearch((value) => !value)}
                        aria-label="Search Reels"
                      >
                        <Search size={23} />
                      </button>

                      <button
                        onClick={() => router.push("/friends")}
                        aria-label="Friends"
                      >
                        <Users size={23} />
                      </button>
                    </div>
                  </div>
                )}

                {/* SEARCH BAR */}
                {idx === 0 && showSearch && (
                  <div className="absolute left-3 right-3 top-24 z-30">
                    <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/75 px-3 py-2 backdrop-blur-xl">
                      <Search size={18} className="text-white/60" />

                      <input
                        value={reelSearch}
                        onChange={(event) =>
                          setReelSearch(event.target.value)
                        }
                        placeholder="Search usernames or captions..."
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                      />

                      <button onClick={() => setShowSearch(false)}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* PLAY / PAUSE INDICATOR */}
                {!isPlaying && isCurrent && (
                  <button
                    onClick={togglePlayback}
                    className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 p-5 backdrop-blur-md"
                    aria-label="Play Reel"
                  >
                    <Play size={34} fill="white" />
                  </button>
                )}

                {/* PART 5 CONTINUES */}
                            
                {/* RIGHT SIDE ACTIONS */}
                <div className="absolute bottom-28 right-3 z-30 flex flex-col items-center gap-5 text-white">

                  {/* CREATOR AVATAR */}
                  <button
                    onClick={() => openCreatorProfile(post)}
                    className="mb-1"
                  >
                    <img
                      src={avatar}
                      alt=""
                      className="h-11 w-11 rounded-full border-2 border-white object-cover"
                    />
                  </button>

                  {/* LIKE */}
                  <button
                    onClick={() => toggleLike(postId)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Like Reel"
                  >
                    <Heart
                      size={29}
                      className={isLiked ? "fill-pink-500 text-pink-500" : ""}
                    />
                    <span className="text-xs font-semibold">
                      {formatCount(likesCount[postId] ?? post.likes ?? 0)}
                    </span>
                  </button>

                  {/* COMMENTS */}
                  <button
                    onClick={() => openComments(post)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Comments"
                  >
                    <MessageCircle size={28} strokeWidth={2.2} />
                    <span className="text-xs font-semibold">
                      {formatCount(post.comments ?? 0)}
                    </span>
                  </button>

                  {/* REMIX */}
                  <button
                    onClick={() => startRemix()}
                    className="flex flex-col items-center gap-1"
                    aria-label="Remix Reel"
                  >
                    <Repeat2 size={27} />
                    <span className="text-[10px] font-semibold">Remix</span>
                  </button>

                  {/* SHARE */}
                  <button
                    onClick={() => setShowShare(true)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Share Reel"
                  >
                    <Send size={27} />
                    <span className="text-xs font-semibold">Share</span>
                  </button>

                  {/* SAVE */}
                  <button
                    onClick={() => toggleCollection(postId)}
                    className="flex flex-col items-center gap-1"
                    aria-label="Save Reel"
                  >
                    <Bookmark
                      size={27}
                      className={
                        collectionIds.includes(postId)
                          ? "fill-white text-white"
                          : "text-white"
                      }
                    />
                    <span className="text-[10px] font-semibold">Save</span>
                  </button>

                  {/* MORE OPTIONS */}
                  <button
                    onClick={() => setShowMore(true)}
                    aria-label="More Reel options"
                  >
                    <MoreHorizontal size={29} />
                  </button>

                  {/* AUDIO DISC */}
                  <button
                    onClick={() => openAudioPage()}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/60 bg-white/15"
                    aria-label="Open audio"
                  >
                    <Music2 size={22} />
                  </button>
                </div>

                {/* BOTTOM CREATOR DETAILS */}
                <div className="absolute bottom-5 left-4 right-20 z-20">

                  <div className="mb-3 flex items-center gap-2">
                    <button
                      onClick={() => openCreatorProfile(post)}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={avatar}
                        alt=""
                        className="h-8 w-8 rounded-full border border-white/70 object-cover"
                      />
                      <span className="max-w-[145px] truncate text-sm font-bold">
                        {username}
                      </span>
                    </button>

                    {post.user_id &&
                      String(post.user_id) !== String(currentUserId) && (
                        <button
                          onClick={() => toggleFollow(String(post.user_id))}
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            isFollowed
                              ? "border-white/50 bg-white/10"
                              : "border-white bg-white text-black"
                          }`}
                        >
                          {isFollowed ? "Following" : "Follow"}
                        </button>
                      )}
                  </div>

                  {/* CAPTION */}
                  <button
                    onClick={() =>
                      setCaptionExpand((previous) => ({
                        ...previous,
                        [postId]: !previous[postId],
                      }))
                    }
                    className="block max-w-full text-left"
                  >
                    <p
                      className={`text-sm leading-5 ${
                        captionExpand[postId] ? "" : "line-clamp-2"
                      }`}
                    >
                      {post.caption || "Enjoy this Reel on ChitPix ✨"}
                    </p>

                    {!captionExpand[postId] &&
                      (post.caption || "").length > 75 && (
                        <span className="mt-1 text-xs font-semibold text-white/70">
                          more
                        </span>
                      )}
                  </button>

                  {/* AUDIO NAME */}
                  <button
                    onClick={() => openAudioPage()}
                    className="mt-3 flex max-w-full items-center gap-2 text-xs text-white/90"
                  >
                    <Music2 size={14} />
                    <span className="max-w-[220px] truncate">
                      {post.audio_name || `Original audio · ${username}`}
                    </span>
                  </button>

                  {/* PROGRESS BAR */}
                  {isVideo && (
                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${isCurrent ? progress : 0}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* MUTE CONTROL */}
                <button
                  onClick={toggleMute}
                  className="absolute right-4 top-24 z-20 rounded-full bg-black/40 p-2.5 backdrop-blur-md"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? (
                    <VolumeX size={19} />
                  ) : (
                    <Volume2 size={19} />
                  )}
                </button>

                {/* PLAYBACK SPEED */}
                <button
                  onClick={() => {
                    const next =
                      playbackSpeed === 1
                        ? 1.5
                        : playbackSpeed === 1.5
                          ? 2
                          : 0.5

                    changePlaybackSpeed(next)
                    setFeatureMessage(`Playback speed: ${next}x`)
                  }}
                  className="absolute right-4 top-40 z-20 rounded-full bg-black/40 px-3 py-2 text-xs font-bold backdrop-blur-md"
                >
                  {playbackSpeed}x
                </button>

              </section>
            )
          })
        )}
      </div>

      {/* COMMENTS MODAL */}
      {showComments && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70">
          <div className="flex max-h-[82dvh] w-full max-w-lg flex-col rounded-t-3xl border-t border-white/10 bg-[#151515]">

            {/* COMMENTS HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-base font-bold">Comments</h2>
                <p className="text-xs text-white/50">
                  {comments.length} comments
                </p>
              </div>

              <button
                onClick={() => {
                  setShowComments(false)
                  setReplyTo(null)
                }}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            {/* SORT OPTIONS */}
            <div className="flex gap-2 px-4 py-3">
              <button
                onClick={() => setSortBy("new")}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  sortBy === "new"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                Newest
              </button>

              <button
                onClick={() => setSortBy("top")}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  sortBy === "top"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                Top comments
              </button>
            </div>

            {/* COMMENT LIST */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3">
              {commentsLoading ? (
                <div className="flex justify-center py-10">
                  <LoaderCircle className="animate-spin" size={25} />
                </div>
              ) : comments.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle
                    size={35}
                    className="mx-auto mb-3 text-white/40"
                  />
                  <p className="font-semibold">No comments yet</p>
                  <p className="mt-1 text-xs text-white/50">
                    Be the first to comment!
                  </p>
                </div>
              ) : (
                [...comments]
                  .sort((a: any, b: any) => {
                    if (sortBy === "top") {
                      return (b.likes || 0) - (a.likes || 0)
                    }

                    return (
                      new Date(b.time || 0).getTime() -
                      new Date(a.time || 0).getTime()
                    )
                  })
                  .map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.avatar || DEFAULT_AVATAR}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold">
                              {comment.username || comment.user || "User"}
                            </span>

                            {String(pinnedId) === String(comment.id) && (
                              <span className="text-[10px] text-yellow-400">
                                Pinned
                              </span>
                            )}
                          </div>

                          <p className="mt-1 break-words text-sm text-white/90">
                            {comment.text}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center gap-4 px-2 text-[11px] text-white/50">
                          <span>{comment.time || " "}</span>

                          <button
                            onClick={() => toggleCommentLike(comment.id)}
                            className={
                              commentLikes[comment.id]
                                ? "font-bold text-pink-400"
                                : ""
                            }
                          >
                            Like {comment.likes ? `· ${comment.likes}` : ""}
                          </button>

                          <button
                            onClick={() => {
                              setReplyTo(comment)
                              setCommentText(
                                `@${comment.username || comment.user || "user"} `
                              )
                            }}
                          >
                            Reply
                          </button>

                          <button
                            onClick={() => {
                              setPinnedId(
                                String(pinnedId) === String(comment.id)
                                  ? null
                                  : comment.id
                              )
                            }}
                          >
                            {String(pinnedId) === String(comment.id)
                              ? "Unpin"
                              : "Pin"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* PART 6 CONTINUES */}
                          
            {/* REPLY INDICATOR */}
            {replyTo && (
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
                <span className="text-xs text-white/60">
                  Replying to {replyTo.username || replyTo.user || "user"}
                </span>
                <button onClick={() => setReplyTo(null)}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* COMMENT INPUT */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                postComment()
              }}
              className="flex items-center gap-2 border-t border-white/10 px-3 py-3 pb-6"
            >
              <img
                src={currentAvatar || DEFAULT_AVATAR}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />

              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-white/40"
              />

              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="p-2 text-yellow-300"
              >
                <Smile size={22} />
              </button>

              <button
                type="submit"
                disabled={!commentText.trim() || postingComment}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black disabled:opacity-40"
              >
                {postingComment ? "..." : "Post"}
              </button>
            </form>

            {/* EMOJI PICKER */}
            {showEmojiPicker && (
              <div className="flex flex-wrap gap-3 border-t border-white/10 px-4 py-3 text-2xl">
                {["❤️", "😂", "🔥", "😍", "👏", "🥰", "😎", "👍", "🙏", "🎉"].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCommentText((v) => v + emoji)}
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShare && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70">
          <div className="w-full max-w-lg rounded-t-3xl border-t border-white/10 bg-[#171717] px-5 pb-9 pt-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Share Reel</h2>
              <button onClick={() => setShowShare(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-5 text-center">
              {/* WHATSAPP */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/reels/${currentReel?.id || ""}`
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(url)}`,
                    "_blank"
                  )
                }}
                className="flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                  <Send size={22} />
                </span>
                <span className="text-xs">WhatsApp</span>
              </button>

              {/* TELEGRAM */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/reels/${currentReel?.id || ""}`
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(url)}`,
                    "_blank"
                  )
                }}
                className="flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600">
                  <Send size={22} />
                </span>
                <span className="text-xs">Telegram</span>
              </button>

              {/* FACEBOOK */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/reels/${currentReel?.id || ""}`
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    "_blank"
                  )
                }}
                className="flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                  f
                </span>
                <span className="text-xs">Facebook</span>
              </button>

              {/* MORE SHARE */}
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/reels/${currentReel?.id || ""}`

                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: "ChitPix Reel",
                        url,
                      })
                    } else {
                      await navigator.clipboard.writeText(url)
                      setFeatureMessage("Reel link copied!")
                    }
                  } catch {}
                }}
                className="flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500">
                  <Link2 size={22} />
                </span>
                <span className="text-xs">More</span>
              </button>
            </div>

            {/* COPY LINK */}
            <button
              onClick={async () => {
                const url = `${window.location.origin}/reels/${currentReel?.id || ""}`

                try {
                  await navigator.clipboard.writeText(url)
                  setFeatureMessage("Reel link copied!")
                  setShowShare(false)
                } catch {
                  setFeatureMessage("Unable to copy link")
                }
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-semibold"
            >
              <Copy size={17} />
              Copy Reel Link
            </button>
          </div>
        </div>
      )}

      {/* CREATE REEL MENU */}
      {showCreateMenu && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75">
          <div className="w-full max-w-lg rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Create on ChitPix</h2>
              <button onClick={() => setShowCreateMenu(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/upload?type=reel")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <Plus size={25} />
                <span className="text-sm font-semibold">New Reel</span>
              </button>

              <button
                onClick={() => router.push("/upload?type=reel&draft=1")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <ListVideo size={25} />
                <span className="text-sm font-semibold">Draft Reel</span>
              </button>

              <button
                onClick={() => router.push("/upload?type=reel&effects=1")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <WandSparkles size={25} />
                <span className="text-sm font-semibold">Video Effects</span>
              </button>

              <button
                onClick={() => router.push("/upload?type=reel&edit=1")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <Scissors size={25} />
                <span className="text-sm font-semibold">Video Editor</span>
              </button>

              <button
                onClick={() => {
                  setShowCreateMenu(false)
                  setShowAudioPanel(true)
                }}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <Music2 size={25} />
                <span className="text-sm font-semibold">Audio Library</span>
              </button>

              <button
                onClick={() => router.push("/upload?type=reel&schedule=1")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <CalendarClock size={25} />
                <span className="text-sm font-semibold">Schedule Reel</span>
              </button>

              <button
                onClick={() => router.push("/upload?type=reel&poll=1")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <Users size={25} />
                <span className="text-sm font-semibold">Poll / Quiz</span>
              </button>

              <button
                onClick={() => router.push("/upload?type=reel&collab=1")}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
              >
                <Users size={25} />
                <span className="text-sm font-semibold">Collab Reel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIO LIBRARY */}
      {showAudioPanel && (
        <div className="fixed inset-0 z-[125] flex items-end justify-center bg-black/75">
          <div className="max-h-[75dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Audio Library</h2>
                <p className="text-xs text-white/50">
                  Explore audio from available Reels
                </p>
              </div>

              <button onClick={() => setShowAudioPanel(false)}>
                <X size={22} />
              </button>
            </div>

            {audioReels.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/50">
                No audio available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {audioReels.map((audioPost: any) => (
                  <div
                    key={audioPost.id}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Music2 size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {audioPost.audio_name || "Original Audio"}
                      </p>
                      <p className="truncate text-xs text-white/50">
                        {audioPost.username || audioPost.user || "ChitPix Creator"}
                      </p>
                    </div>

                    <button
                      onClick={() => useThisAudio(audioPost)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-bold text-black"
                    >
                      Use Audio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PART 7 CONTINUES */}
                      
      {/* USE AS REFERENCE */}
      {showReferencePanel && (
        <div className="fixed inset-0 z-[126] flex items-end justify-center bg-black/75">
          <div className="w-full max-w-lg rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Use as Reference</h2>
              <button onClick={() => setShowReferencePanel(false)}>
                <X size={22} />
              </button>
            </div>

            <p className="mb-5 text-sm text-white/60">
              Use this Reel as a reference when creating your own video.
            </p>

            <button
              onClick={() => {
                if (currentReel) useAsReference(currentReel)
                setShowReferencePanel(false)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-black"
            >
              <Sparkles size={18} />
              Create from Reference
            </button>
          </div>
        </div>
      )}

      {/* WATCH HISTORY */}
      {showHistory && (
        <div className="fixed inset-0 z-[127] flex items-end justify-center bg-black/75">
          <div className="max-h-[75dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Watch History</h2>
                <p className="text-xs text-white/50">
                  Recently watched Reels
                </p>
              </div>
              <button onClick={() => setShowHistory(false)}>
                <X size={22} />
              </button>
            </div>

            {reelHistory.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/50">
                Your watch history is empty.
              </p>
            ) : (
              <div className="space-y-2">
                {reelHistory.map((historyId: string) => {
                  const historyPost = posts.find(
                    (p: any) => String(p.id) === String(historyId)
                  )

                  if (!historyPost) return null

                  return (
                    <button
                      key={historyId}
                      onClick={() => {
                        setShowHistory(false)
                        router.push(
                          `/reels/${encodeURIComponent(historyId)}`
                        )
                      }}
                      className="flex w-full items-center gap-3 rounded-xl bg-white/[0.06] p-3 text-left"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <History size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {historyPost.username || historyPost.user || "Reel"}
                        </p>
                        <p className="truncate text-xs text-white/50">
                          {historyPost.caption || "Watched Reel"}
                        </p>
                      </div>

                      <Play size={18} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REEL COLLECTIONS */}
      {showCollections && (
        <div className="fixed inset-0 z-[128] flex items-end justify-center bg-black/75">
          <div className="max-h-[70dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">My Collections</h2>
                <p className="text-xs text-white/50">
                  Your saved Reels
                </p>
              </div>
              <button onClick={() => setShowCollections(false)}>
                <X size={22} />
              </button>
            </div>

            {collectionIds.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/50">
                No saved Reels yet. Tap the Save icon on a Reel.
              </p>
            ) : (
              <div className="space-y-2">
                {collectionIds.map((savedId: string) => {
                  const savedPost = posts.find(
                    (p: any) => String(p.id) === String(savedId)
                  )

                  if (!savedPost) return null

                  return (
                    <div
                      key={savedId}
                      className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3"
                    >
                      <Bookmark size={21} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {savedPost.username || savedPost.user || "Saved Reel"}
                        </p>
                        <p className="truncate text-xs text-white/50">
                          {savedPost.caption || "ChitPix Reel"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowCollections(false)
                          router.push(
                            `/reels/${encodeURIComponent(savedId)}`
                          )
                        }}
                        className="text-xs font-bold"
                      >
                        Open
                      </button>

                      <button
                        onClick={() => toggleCollection(savedId)}
                        className="text-xs text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATOR ANALYTICS */}
      {showAnalytics && (
        <div className="fixed inset-0 z-[129] flex items-end justify-center bg-black/75">
          <div className="w-full max-w-lg rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Reel Insights</h2>
                <p className="text-xs text-white/50">
                  Current Reel engagement
                </p>
              </div>

              <button onClick={() => setShowAnalytics(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.07] p-4">
                <Heart className="mb-2 text-pink-400" size={22} />
                <p className="text-xl font-bold">{analytics.likes}</p>
                <p className="text-xs text-white/50">Likes</p>
              </div>

              <div className="rounded-xl bg-white/[0.07] p-4">
                <MessageCircle className="mb-2 text-sky-400" size={22} />
                <p className="text-xl font-bold">{analytics.comments}</p>
                <p className="text-xs text-white/50">Comments</p>
              </div>

              <div className="rounded-xl bg-white/[0.07] p-4">
                <Play className="mb-2 text-green-400" size={22} />
                <p className="text-xl font-bold">{analytics.views}</p>
                <p className="text-xs text-white/50">Views</p>
              </div>

              <div className="rounded-xl bg-white/[0.07] p-4">
                <BarChart3 className="mb-2 text-purple-400" size={22} />
                <p className="text-xl font-bold">
                  {analytics.likes + analytics.comments}
                </p>
                <p className="text-xs text-white/50">Likes + Comments</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/40">
              These figures use the data currently available for this Reel.
              Detailed reach and audience analytics need backend tracking.
            </p>
          </div>
        </div>
      )}

      {/* MORE OPTIONS */}
      {showMore && (
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/75">
          <div className="w-full max-w-lg rounded-t-3xl bg-[#171717] p-5 pb-9">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Reel Options</h2>
              <button onClick={() => setShowMore(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setShowMore(false)
                  setShowReferencePanel(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-white/10"
              >
                <Sparkles size={20} />
                Use as Reference
              </button>

              <button
                onClick={() => {
                  setShowMore(false)
                  setShowAudioPanel(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-white/10"
              >
                <Music2 size={20} />
                Explore Audio
              </button>

              <button
                onClick={() => {
                  setShowMore(false)
                  setShowHistory(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-white/10"
              >
                <History size={20} />
                Watch History
              </button>

              <button
                onClick={() => {
                  setShowMore(false)
                  setShowCollections(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-white/10"
              >
                <Bookmark size={20} />
                My Collections
              </button>

              <button
                onClick={() => {
                  setShowMore(false)
                  setShowAnalytics(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-white/10"
              >
                <BarChart3 size={20} />
                Reel Insights
              </button>

              <button
                onClick={() => {
                  if (currentReel) {
                    markNotInterested(String(currentReel.id))
                  }
                  setShowMore(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-white/10"
              >
                <X size={20} />
                Not Interested
              </button>

              <button
                onClick={() => {
                  reportCurrentReel()
                  setShowMore(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-red-400 hover:bg-white/10"
              >
                <Flag size={20} />
                Report Reel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE MESSAGE / TOAST */}
      {featureMessage && (
        <div className="fixed bottom-24 left-1/2 z-[200] w-max max-w-[90%] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#252525] px-5 py-3 text-sm font-medium text-white shadow-2xl">
            <Check size={17} className="text-green-400" />
            <span>{featureMessage}</span>

            <button
              onClick={() => setFeatureMessage("")}
              className="ml-2"
              aria-label="Close message"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AUTO CAPTIONS PREVIEW */}
      {autoCaptions && currentReel?.caption && (
        <div className="pointer-events-none fixed bottom-36 left-1/2 z-30 w-[85%] -translate-x-1/2 text-center">
          <span className="inline-block rounded-lg bg-black/75 px-3 py-2 text-sm font-bold text-white">
            {currentReel.caption}
          </span>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>

    </main>
  )
          }
