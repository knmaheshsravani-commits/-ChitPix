"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  UserRound,
  Settings,
  Search,
  Plus,
  Grid3X3,
  Clapperboard,
  Users,
  Camera,
  Bookmark,
  Archive,
  Activity,
  Bell,
  Clock,
  LockKeyhole,
  Star,
  Ban,
  Send,
  AtSign,
  MessageCircle,
  Repeat,
  UserPlus,
  Languages,
  Smartphone,
  Download,
  Accessibility,
  BarChart3,
  CircleHelp,
  Flag,
  Info,
  Heart,
  SlidersHorizontal,
  VolumeX,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal,
  Share2,
  Pencil,
  QrCode,
  X,
  Check,
  Menu,
  LogOut,
  ShieldCheck,
} from "lucide-react"

import BottomNav from "../components/BottomNav"
import { supabase } from "../../lib/supabase"

const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

// R2 URL FIX

function fixR2Url(p: any) {
  if (!p) return ""

  let url =
    typeof p === "string"
      ? p
      : p?.image_url ||
        p?.avatar_url ||
        p?.url ||
        p?.image ||
        p?.r2Url ||
        p?.publicUrl ||
        ""

  if (!url) return ""

  url = String(url).trim()

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url
  }

  if (url.startsWith("r2://")) {
    return `${R2_PUBLIC_URL}/${url
      .replace("r2://", "")
      .replace(/^\/+/, "")}`
  }

  return url
}

// R2 IMAGE UPLOAD

async function uploadToR2(
  file: File,
  folder = "avatars"
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.")
  }

  const presignRes = await fetch("/api/r2-presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: `${folder}/${Date.now()}_${file.name.replace(
        /\s+/g,
        "_"
      )}`,
      contentType: file.type,
      fileSize: file.size,
    }),
  })

  if (!presignRes.ok) {
    throw new Error(
      `R2 presign failed (${presignRes.status})`
    )
  }

  const result = await presignRes.json()

  const { url, publicUrl, key } = result

  if (!url) {
    throw new Error("R2 presigned URL missing.")
  }

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!uploadRes.ok) {
    throw new Error(
      `R2 upload failed (${uploadRes.status})`
    )
  }

  const finalUrl = fixR2Url(
    publicUrl ||
      (key ? `${R2_PUBLIC_URL}/${key}` : "")
  )

  if (!finalUrl) {
    throw new Error("R2 public URL missing.")
  }

  return finalUrl
}

// PROFILE HIGHLIGHTS

function HighlightsInline({
  username,
  onSelect,
}: any) {
  const items = [
    {
      id: "1",
      title: "Welcome",
      cover: `https://i.pravatar.cc/100?u=${encodeURIComponent(
        username
      )}`,
      stories: [
        {
          image: "https://picsum.photos/400/700?random=1",
          caption: "Welcome to ChitPix!",
          price: 350,
        },
      ],
    },
  ]

  return (
    <div className="flex gap-5 px-4 mt-5 overflow-x-auto">

      <button
        type="button"
        onClick={() =>
          alert("Highlight creation will be connected soon.")
        }
        className="flex min-w-[65px] flex-col items-center gap-2"
      >
        <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full border border-gray-300 bg-gray-100">
          <Plus size={28} strokeWidth={1.7} />
        </div>

        <span className="text-xs text-gray-800">
          New
        </span>
      </button>

      {items.map((item: any) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onSelect(item)}
          className="flex min-w-[65px] flex-col items-center gap-2"
        >
          <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="rounded-full bg-white p-[2px]">
              <img
                src={item.cover}
                className="h-[60px] w-[60px] rounded-full object-cover"
                alt="Highlight"
              />
            </div>
          </div>

          <span className="text-xs text-gray-800">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  )
}

// STORY VIEWER

function StoryViewerInline({
  users,
  onClose,
}: any) {
  const story = users?.[0]?.stories?.[0]

  if (!story) return null

  const image =
    typeof story === "string"
      ? story
      : story.image || story.url || ""

  return (
    <div className="fixed inset-0 z-[100] mx-auto flex max-w-[470px] flex-col bg-black">

      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-bold">
          {users[0]?.title || users[0]?.username}
        </span>

        <button type="button" onClick={onClose}>
          <X size={26} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-black">
        <img
          src={fixR2Url(image)}
          className="h-full w-full object-contain"
          alt="Story"
        />

        <div className="absolute bottom-8 left-4">
          <p className="font-bold text-white">
            {story.caption || "Story"}
          </p>

          {story.price != null && (
            <p className="text-white">
              ₹{story.price}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="m-4 rounded-xl bg-white py-3 font-bold text-black"
      >
        Close
      </button>
    </div>
  )
}
// ==========================================
// PART 2 / 8
// PROFILE STATES & SUPABASE DATA
// ==========================================

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()

  const usernameFromUrl = (params as any)?.username

  // PROFILE DATA

  const [posts, setPosts] = useState<any[]>([])

  const [activeTab, setActiveTab] = useState<
    "POSTS" | "REELS" | "TAGGED"
  >("POSTS")

  const [followers] = useState(129)
  const [following] = useState(205)

  const [username, setUsername] = useState("knmahesh")

  const [bio, setBio] = useState(
    "Welcome to ChitPix\nPhotographer | Creator"
  )

  const [link, setLink] = useState("chitpix.com")
  const [photo, setPhoto] = useState("")

  // EDIT PROFILE

  const [showEdit, setShowEdit] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")

  // POSTS

  const [selectedPost, setSelectedPost] = useState<any>(null)

  const [uploading, setUploading] = useState(false)

  const [pinnedPosts, setPinnedPosts] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState("")

  const [archivedPosts, setArchivedPosts] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  // PROFILE MENU

  const [showQR, setShowQR] = useState(false)

  const [showFollowers, setShowFollowers] = useState(false)

  const [showFollowing, setShowFollowing] = useState(false)

  const [showArchive, setShowArchive] = useState(false)

  const [selectedHighlight, setSelectedHighlight] =
    useState<any>(null)

  // ADDITIONAL PROFILE STATES

  const [currentUserId, setCurrentUserId] = useState("")

  const [isOwnProfile, setIsOwnProfile] = useState(true)

  const [notice, setNotice] = useState("")

  const [showSettings, setShowSettings] = useState(false)

  // ==========================================
  // LOAD PROFILE FROM SUPABASE
  // ==========================================

  useEffect(() => {
    let cancelled = false

    const fetchProfileData = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
          if (!cancelled) {
            setNotice("Please login to view your profile.")
            setLoading(false)
          }

          return
        }

        if (cancelled) return

        setCurrentUserId(user.id)

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle()

        if (profileError) throw profileError

        if (cancelled) return

        const name =
          profile?.username ||
          user.email?.split("@")[0] ||
          "knmahesh"

        setUsername(name)
        setEditName(name)

        setBio(profile?.bio || "")
        setEditBio(profile?.bio || "")

        setLink(profile?.website || "")
        setEditLink(profile?.website || "")

        setPhoto(fixR2Url(profile?.avatar_url))

        // LOAD USER POSTS

        const { data: myPosts, error: postsError } =
          await supabase
            .from("posts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })

        if (postsError) throw postsError

        if (cancelled) return

        // FORMAT POSTS AND REELS

        const mapped = (myPosts || [])
          .map((post: any) => {
            const image = fixR2Url(
              post.image_url ||
                post.image ||
                post.r2_url ||
                post.url ||
                post
            )

            const isVideo =
              String(post.type || "")
                .toLowerCase()
                .includes("reel") ||
              String(post.media_type || "")
                .toLowerCase()
                .includes("video") ||
              String(image)
                .toLowerCase()
                .includes(".mp4")

            return {
              ...post,
              image,
              imageUrl: image,
              r2Url: image,
              url: image,
              type: isVideo ? "reels" : "post",
              username: name,
              id: post.id,
              caption: post.caption || "",
            }
          })
          .filter(
            (post: any) =>
              post.image && post.image.length > 5
          )

        if (!cancelled) {
          setPosts(mapped)
        }

      } catch (error: any) {
        console.error(
          "CHITPIX PROFILE FETCH ERROR:",
          error
        )

        if (!cancelled) {
          setNotice(
            error?.message || "Profile loading failed."
          )
        }

      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProfileData()

    return () => {
      cancelled = true
    }
  }, [])

  // ==========================================
  // END PART 2
  // PART 3 CONTINUES BELOW
  // ==========================================
       
// ==========================================
// PART 3 / 8
// PROFILE ACTIONS & EDIT FUNCTIONS
// ==========================================

// PROFILE PHOTO UPLOAD

const handlePhotoChange = async (event: any) => {
  const file = event.target.files?.[0]
  event.target.value = ""

  if (!file) return

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.")
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    alert("Image must be smaller than 10 MB.")
    return
  }

  const previousPhoto = photo
  const localPreview = URL.createObjectURL(file)

  setPhoto(localPreview)
  setUploading(true)

  try {
    const fixedUrl = await uploadToR2(file, "avatars")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Please login again.")
    }

    const { data: existing, error: existingError } =
      await supabase
        .from("profiles")
        .select("id, email")
        .eq("id", user.id)
        .maybeSingle()

    if (existingError) throw existingError

    const profileEmail = user.email || existing?.email

    if (!profileEmail) {
      throw new Error("Login email not found.")
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: profileEmail,
          username,
          avatar_url: fixedUrl,
          bio,
          website: link,
        },
        { onConflict: "id" }
      )

    if (error) throw error

    setPhoto(fixedUrl)

    alert("Profile photo updated successfully! ❤️")

  } catch (error: any) {
    console.error("PHOTO UPLOAD ERROR:", error)

    setPhoto(previousPhoto)

    alert(
      error?.message || "Photo upload failed."
    )

  } finally {
    URL.revokeObjectURL(localPreview)
    setUploading(false)
  }
}

// EDIT PROFILE OPEN

const openEditProfile = () => {
  setEditName(username)
  setEditBio(bio)
  setEditLink(link)
  setShowEdit(true)
}

// SAVE PROFILE

const handleProfileSave = async () => {
  if (uploading) return

  const newName = editName.trim()
  const newBio = editBio
  const newLink = editLink.trim()

  if (!newName) {
    alert("Username cannot be empty.")
    return
  }

  setUploading(true)

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Please login again.")
    }

    const { data: existing, error: existingError } =
      await supabase
        .from("profiles")
        .select("id, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

    if (existingError) throw existingError

    const profileEmail = user.email || existing?.email

    if (!profileEmail) {
      throw new Error("Login email not found.")
    }

    const safeAvatar =
      photo && !photo.startsWith("blob:")
        ? photo
        : existing?.avatar_url || null

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: profileEmail,
          username: newName,
          bio: newBio,
          website: newLink,
          avatar_url: safeAvatar,
        },
        { onConflict: "id" }
      )
      .select(
        "id, username, avatar_url, bio, website"
      )
      .single()

    if (error) throw error

    if (!data || data.id !== user.id) {
      throw new Error("Profile update verification failed.")
    }

    setUsername(data.username || newName)
    setEditName(data.username || newName)

    setBio(data.bio || "")
    setEditBio(data.bio || "")

    setLink(data.website || "")
    setEditLink(data.website || "")

    setPhoto(fixR2Url(data.avatar_url))

    setShowEdit(false)

    alert("Profile saved successfully! ❤️")

  } catch (error: any) {
    console.error("PROFILE SAVE ERROR:", error)

    alert(
      error?.message || "Profile save failed."
    )

  } finally {
    setUploading(false)
  }
}

// SHARE PROFILE

const handleShareProfile = async () => {
  const profileUrl = window.location.href

  try {
    if (navigator.share) {
      await navigator.share({
        title: `${username} on ChitPix`,
        text: `Follow ${username} on ChitPix!`,
        url: profileUrl,
      })
    } else {
      await navigator.clipboard.writeText(profileUrl)
      alert("Profile link copied! ❤️")
    }
  } catch (error: any) {
    if (error?.name !== "AbortError") {
      alert("Unable to share profile.")
    }
  }
}

// QR PROFILE

const handleQRProfile = async () => {
  const profileUrl = window.location.href

  try {
    await navigator.clipboard.writeText(profileUrl)
    setShowQR(true)
  } catch {
    setShowQR(true)
  }
}

// FOLLOW / UNFOLLOW
// Uses existing user_follows table.

const handleFollow = async (targetUserId: string) => {
  if (!currentUserId) {
    alert("Please login to follow.")
    return
  }

  if (!targetUserId || targetUserId === currentUserId) {
    return
  }

  try {
    const { data: existing, error: checkError } =
      await supabase
        .from("user_follows")
        .select("follower_id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)

      if (error) throw error

      alert("Unfollowed successfully.")
    } else {
      const { error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        })

      if (error && error.code !== "23505") {
        throw error
      }

      alert("Following successfully! ❤️")
    }

  } catch (error: any) {
    console.error("FOLLOW ERROR:", error)
    alert(error?.message || "Follow action failed.")
  }
}

// PROFILE MENU

const openProfileMenu = () => {
  setShowMenu(true)
}

const closeProfileMenu = () => {
  setShowMenu(false)
}

// PROFILE NOTICE

const showProfileNotice = (message: string) => {
  setNotice(message)
}

// ==========================================
// END PART 3
// PART 4 CONTINUES BELOW
// ==========================================
 
// ==========================================
// PART 4 / 8
// POSTS, REELS & HIGHLIGHTS
// ==========================================

// FILTER PROFILE POSTS

const profilePosts = posts.filter(
  (post: any) =>
    post.type === "post" &&
    !post.is_archived
)

const profileReels = posts.filter(
  (post: any) =>
    post.type === "reels" &&
    !post.is_archived
)

const taggedPosts = posts.filter(
  (post: any) =>
    post.is_tagged === true
)

// ACTIVE TAB POSTS

const visiblePosts =
  activeTab === "POSTS"
    ? profilePosts
    : activeTab === "REELS"
      ? profileReels
      : taggedPosts

// POST PREVIEW

const openPostPreview = (post: any) => {
  setSelectedPost(post)
}

// CLOSE POST PREVIEW

const closePostPreview = () => {
  setSelectedPost(null)
}

// CHANGE PROFILE TAB

const changeProfileTab = (
  tab: "POSTS" | "REELS" | "TAGGED"
) => {
  setActiveTab(tab)
  setSelectedPost(null)
}

// CHECK VIDEO FILE

const isVideoPost = (post: any) => {
  const value = String(
    post?.media_type ||
    post?.type ||
    post?.image ||
    ""
  ).toLowerCase()

  return (
    value.includes("video") ||
    value.includes("reel") ||
    /\.(mp4|mov|webm|m4v)(\?|$)/i.test(value)
  )
}

// GET POST IMAGE

const getPostImage = (post: any) => {
  return fixR2Url(
    post?.thumbnail_url ||
    post?.image_url ||
    post?.image ||
    post?.r2_url ||
    post?.url ||
    ""
  )
}

// FORMAT POST DATE

const formatPostDate = (date: any) => {
  if (!date) return ""

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// HIGHLIGHT SELECTION

const handleHighlightSelect = (item: any) => {
  setSelectedHighlight(item)
}

// CLOSE HIGHLIGHT

const closeHighlight = () => {
  setSelectedHighlight(null)
}

// PIN / UNPIN POST
// Local UI state until database persistence
// is connected in the later integration step.

const togglePinPost = (postId: string) => {
  if (!postId) return

  setPinnedPosts(previous =>
    previous.includes(postId)
      ? previous.filter(id => id !== postId)
      : [...previous, postId].slice(0, 3)
  )
}

// SEARCH PROFILE POSTS

const searchedPosts = visiblePosts.filter(
  (post: any) => {
    const caption = String(
      post?.caption || ""
    ).toLowerCase()

    return caption.includes(
      searchQuery.toLowerCase().trim()
    )
  }
)

// PROFILE POST COUNTS

const totalPostCount = profilePosts.length

const totalReelCount = profileReels.length

// ==========================================
// END PART 4
// PART 5 CONTINUES BELOW
// ==========================================
// PART 5 / 8

// PROFILE MENU ACTIONS
const handleMenuAction = (action: string) => {
  setShowMenu(false)

  switch (action) {
    case "edit":
      openEditProfile()
      break

    case "share":
      handleShareProfile()
      break

    case "qr":
      handleQRProfile()
      break

    case "archive":
      setShowArchive(true)
      break

    case "settings":
      setShowSettings(true)
      break

    case "saved":
      showProfileNotice("Saved posts feature coming soon")
      break

    case "activity":
      showProfileNotice("Your activity feature coming soon")
      break

    case "logout":
      handleLogout()
      break

    default:
      break
  }
}

// LOGOUT
const handleLogout = async () => {
  const confirmed = window.confirm("Are you sure you want to log out?")
  if (!confirmed) return

  const { error } = await supabase.auth.signOut()

  if (error) {
    showProfileNotice(error.message)
    return
  }

  router.push("/login")
}

// EDIT PROFILE FIELD HANDLER
const updateEditField = (
  field: "username" | "bio" | "link",
  value: string
) => {
  if (field === "username") setEditUsername(value)
  if (field === "bio") setEditBio(value)
  if (field === "link") setEditLink(value)
}

// CLOSE ALL PROFILE OVERLAYS
const closeProfileOverlays = () => {
  setShowMenu(false)
  setShowQR(false)
  setShowArchive(false)
  setShowSettings(false)
  setShowFollowers(false)
  setShowFollowing(false)
  setSelectedPost(null)
  setSelectedHighlight(null)
}

// PROFILE SETTINGS NAVIGATION
const openSettingsSection = (section: string) => {
  setShowSettings(false)

  if (section === "Edit profile") {
    openEditProfile()
    return
  }

  if (section === "Saved") {
    handleMenuAction("saved")
    return
  }

  if (section === "Archive") {
    setShowArchive(true)
    return
  }

  if (section === "Activity") {
    handleMenuAction("activity")
    return
  }

  if (section === "Notifications") {
    showProfileNotice("Notification settings coming soon")
    return
  }

  if (section === "Privacy") {
    showProfileNotice("Privacy settings coming soon")
    return
  }

  if (section === "Help") {
    showProfileNotice("Help center coming soon")
    return
  }
}

// ARCHIVE POSTS
const restoreArchivedPost = (postId: string) => {
  setArchivedPosts((previous: any[]) =>
    previous.filter((post: any) => post.id !== postId)
  )

  setPosts((previous: any[]) =>
    previous.map((post: any) =>
      post.id === postId
        ? { ...post, is_archived: false }
        : post
    )
  )

  showProfileNotice("Post restored")
}

// ARCHIVE POST LOCALLY
const archivePost = (postId: string) => {
  const post = posts.find((item: any) => item.id === postId)

  if (!post) return

  setArchivedPosts((previous: any[]) => [
    post,
    ...previous.filter((item: any) => item.id !== postId),
  ])

  setPosts((previous: any[]) =>
    previous.map((item: any) =>
      item.id === postId
        ? { ...item, is_archived: true }
        : item
    )
  )

  setSelectedPost(null)
  showProfileNotice("Post moved to archive")
}

// REMOVE PIN
const removePinnedPost = (postId: string) => {
  setPinnedPosts((previous: string[]) =>
    previous.filter((id: string) => id !== postId)
  )
}

// PROFILE NOTICE
const clearNotice = () => {
  setNotice("")
}

// PART 6 CONTINUES BELOW
// PART 6 / 8

// PROFILE MENU ITEMS
const profileMenuItems = [
  {
    label: "Settings and activity",
    icon: Settings,
    action: "settings",
  },
  {
    label: "Your activity",
    icon: Activity,
    action: "activity",
  },
  {
    label: "Archive",
    icon: Archive,
    action: "archive",
  },
  {
    label: "Saved",
    icon: Bookmark,
    action: "saved",
  },
  {
    label: "QR code",
    icon: QrCode,
    action: "qr",
  },
  {
    label: "Share profile",
    icon: Share2,
    action: "share",
  },
  {
    label: "Log out",
    icon: LogOut,
    action: "logout",
  },
]

// SETTINGS MENU ITEMS
const settingsMenuItems = [
  {
    label: "Edit profile",
    description: "Update your profile information",
    icon: UserRound,
  },
  {
    label: "Notifications",
    description: "Manage your notifications",
    icon: Bell,
  },
  {
    label: "Privacy",
    description: "Control who can see your content",
    icon: LockKeyhole,
  },
  {
    label: "Saved",
    description: "Your saved posts",
    icon: Bookmark,
  },
  {
    label: "Archive",
    description: "Your archived posts",
    icon: Archive,
  },
  {
    label: "Activity",
    description: "Your account activity",
    icon: Activity,
  },
  {
    label: "Help",
    description: "Help and support",
    icon: CircleHelp,
  },
]

// PROFILE STATISTICS
const profileStats = [
  {
    label: "Posts",
    value: totalPostCount,
    action: () => changeProfileTab("POSTS"),
  },
  {
    label: "Followers",
    value: followers,
    action: () => setShowFollowers(true),
  },
  {
    label: "Following",
    value: following,
    action: () => setShowFollowing(true),
  },
]

// GET USER INITIALS
const getUserInitials = (value: string) => {
  const cleaned = String(value || "U").trim()

  return cleaned
    .slice(0, 2)
    .toUpperCase()
}

// FORMAT COUNTS
const formatCount = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return String(value)
}

// POST GRID EMPTY MESSAGE
const getEmptyMessage = () => {
  if (activeTab === "REELS") {
    return {
      title: "No Reels Yet",
      description: "Videos you share will appear here.",
    }
  }

  if (activeTab === "TAGGED") {
    return {
      title: "No Tagged Posts",
      description: "Photos and videos you're tagged in will appear here.",
    }
  }

  return {
    title: "Share Your First Photo",
    description: "When you share photos, they will appear on your profile.",
  }
}

// POST ACTION HANDLER
const handlePostAction = (action: string, post: any) => {
  if (action === "view") {
    openPostPreview(post)
    return
  }

  if (action === "pin") {
    togglePinPost(post.id)
    showProfileNotice(
      pinnedPosts.includes(post.id)
        ? "Post unpinned"
        : "Post pinned"
    )
    return
  }

  if (action === "archive") {
    archivePost(post.id)
    return
  }

  if (action === "share") {
    handleShareProfile()
    return
  }
}

// CHECK WHETHER POST IS PINNED
const isPostPinned = (postId: string) => {
  return pinnedPosts.includes(postId)
}

// SORT PINNED POSTS FIRST
const sortedVisiblePosts = [...searchedPosts].sort(
  (a: any, b: any) => {
    const aPinned = pinnedPosts.includes(a.id) ? 1 : 0
    const bPinned = pinnedPosts.includes(b.id) ? 1 : 0

    return bPinned - aPinned
  }
)

// PART 7 CONTINUES BELOW
// PART 7 / 8

return (
  <main className="min-h-screen bg-white text-gray-900 pb-24">

    {/* TOP HEADER */}
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">
          {username || "ChitPix"}
        </h1>
        <icon className="hidden" />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => showProfileNotice("Create post feature coming soon")}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Create post"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => setShowMenu(true)}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>

    {/* PROFILE DETAILS */}
    <section className="px-4 pt-5">

      <div className="flex items-center gap-5">

        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
          {photo ? (
            <img
              src={fixR2Url(photo)}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500">
              {getUserInitials(username)}
            </div>
          )}
        </div>

        <div className="grid flex-1 grid-cols-3 text-center">
          {profileStats.map((stat) => (
            <button
              key={stat.label}
              onClick={stat.action}
              className="rounded-lg py-2 hover:bg-gray-50"
            >
              <p className="text-lg font-bold">
                {formatCount(stat.value)}
              </p>
              <p className="text-xs text-gray-500">
                {stat.label}
              </p>
            </button>
          ))}
        </div>

      </div>

      {/* BIO */}
      <div className="mt-4">
        <h2 className="font-bold">{username || "ChitPix User"}</h2>

        {bio && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
            {bio}
          </p>
        )}

        {link && (
          <a
            href={link.startsWith("http") ? link : `https://${link}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block text-sm font-semibold text-blue-600"
          >
            {link}
          </a>
        )}
      </div>

      {/* PROFILE BUTTONS */}
      <div className="mt-4 flex gap-2">
        {isOwnProfile ? (
          <>
            <button
              onClick={openEditProfile}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold hover:bg-gray-200"
            >
              Edit profile
            </button>

            <button
              onClick={handleShareProfile}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold hover:bg-gray-200"
            >
              Share profile
            </button>

            <button
              onClick={() => setShowQR(true)}
              className="rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200"
              aria-label="QR code"
            >
              <QrCode size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => currentUserId && handleFollow(currentUserId)}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white"
            >
              Follow
            </button>

            <button
              onClick={() => showProfileNotice("Messaging feature coming soon")}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold"
            >
              Message
            </button>
          </>
        )}
      </div>

    </section>

    {/* HIGHLIGHTS */}
    <section className="mt-6">
      <HighlightsInline
        username={username}
        onSelect={handleHighlightSelect}
      />
    </section>

    {/* PROFILE TABS */}
    <div className="mt-6 grid grid-cols-3 border-t border-gray-100">
      {[
        { id: "POSTS", icon: Grid3X3 },
        { id: "REELS", icon: Clapperboard },
        { id: "TAGGED", icon: Users },
      ].map((tab) => {
        const TabIcon = tab.icon

        return (
          <button
            key={tab.id}
            onClick={() => changeProfileTab(tab.id as any)}
            className={`flex items-center justify-center border-b-2 py-3 ${
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
            aria-label={tab.id}
          >
            <TabIcon size={21} />
          </button>
        )
      })}
    </div>

    {/* SEARCH POSTS */}
    <div className="px-3 py-3">
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3">
        <Search size={17} className="text-gray-500" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search posts..."
          className="w-full bg-transparent py-2 text-sm outline-none"
        />
      </div>
    </div>

    {/* POSTS GRID */}
    {loading ? (
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse bg-gray-100"
          />
        ))}
      </div>
    ) : sortedVisiblePosts.length > 0 ? (
      <div className="grid grid-cols-3 gap-0.5">
        {sortedVisiblePosts.map((post: any) => (
          <button
            key={post.id}
            onClick={() => openPostPreview(post)}
            className="relative aspect-square overflow-hidden bg-gray-100"
          >
            {getPostImage(post) ? (
              <img
                src={getPostImage(post)}
                alt={post.caption || "Post"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <Camera size={28} />
              </div>
            )}

            {isVideoPost(post) && (
              <div className="absolute right-2 top-2 text-white drop-shadow">
                <Clapperboard size={19} />
              </div>
            )}

            {isPostPinned(post.id) && (
              <div className="absolute left-2 top-2 rounded bg-black/60 p-1 text-white">
                <Star size={13} />
              </div>
            )}
          </button>
        ))}
      </div>
    ) : (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-900">
          {activeTab === "REELS" ? (
            <Clapperboard size={30} />
          ) : activeTab === "TAGGED" ? (
            <Users size={30} />
          ) : (
            <Camera size={30} />
          )}
        </div>

        <h3 className="text-lg font-bold">
          {getEmptyMessage().title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {getEmptyMessage().description}
        </p>
      </div>
    )}

    {/* BOTTOM NAVIGATION */}
    <BottomNav />

    {/* PART 8 CONTINUES BELOW */}
  </main>
)
 {/* PART 8 / 8 - EDIT PROFILE MODAL */}

{showEdit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b p-4">
        <button onClick={() => setShowEdit(false)}>
          <X size={22} />
        </button>

        <h2 className="font-bold">Edit Profile</h2>

        <button
          onClick={handleProfileSave}
          disabled={uploading}
          className="font-semibold text-blue-600 disabled:opacity-50"
        >
          {uploading ? "Saving..." : "Done"}
        </button>
      </div>

      <div className="space-y-5 p-5">

        <div className="flex flex-col items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
            {photo ? (
              <img
                src={fixR2Url(photo)}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold">
                {getUserInitials(username)}
              </div>
            )}
          </div>

          <label className="mt-3 cursor-pointer font-semibold text-blue-600">
            Change profile photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handlePhotoChange(file)
              }}
            />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Username</label>
          <input
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-blue-500"
            placeholder="Username"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Bio</label>
          <textarea
            value={editBio}
            onChange={(event) => setEditBio(event.target.value)}
            rows={3}
            maxLength={150}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-blue-500"
            placeholder="Write something about yourself..."
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {editBio.length}/150
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Website</label>
          <input
            value={editLink}
            onChange={(event) => setEditLink(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>

      </div>
    </div>
  </div>
)}

{/* PROFILE MENU */}

{showMenu && (
  <div
    className="fixed inset-0 z-50 bg-black/40"
    onClick={() => setShowMenu(false)}
  >
    <div
      className="absolute right-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto rounded-l-2xl bg-white p-5 shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Menu</h2>
        <button onClick={() => setShowMenu(false)}>
          <X size={23} />
        </button>
      </div>

      {profileMenuItems.map((item) => {
        const ItemIcon = item.icon

        return (
          <button
            key={item.action}
            onClick={() => handleMenuAction(item.action)}
            className="flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left hover:bg-gray-100"
          >
            <ItemIcon size={22} />
            <span className="font-medium">{item.label}</span>
            <ChevronRight size={18} className="ml-auto text-gray-400" />
          </button>
        )
      })}
    </div>
  </div>
)}

{/* SETTINGS */}

{showSettings && (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-white">

    <div className="sticky top-0 flex items-center gap-4 border-b bg-white p-4">
      <button onClick={() => setShowSettings(false)}>
        <ArrowLeft size={23} />
      </button>
      <h2 className="text-xl font-bold">Settings and activity</h2>
    </div>

    <div className="p-4">
      {settingsMenuItems.map((item) => {
        const ItemIcon = item.icon

        return (
          <button
            key={item.label}
            onClick={() => openSettingsSection(item.label)}
            className="flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left hover:bg-gray-50"
          >
            <ItemIcon size={23} />
            <div className="flex-1">
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        )
      })}

      <button
        onClick={() => handleMenuAction("logout")}
        className="mt-5 flex w-full items-center gap-3 rounded-xl p-4 font-semibold text-red-600 hover:bg-red-50"
      >
        <LogOut size={22} />
        Log out
      </button>
    </div>
  </div>
)}

{/* ARCHIVE */}

{showArchive && (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-white">

    <div className="sticky top-0 flex items-center gap-4 border-b bg-white p-4">
      <button onClick={() => setShowArchive(false)}>
        <ArrowLeft size={23} />
      </button>
      <h2 className="text-xl font-bold">Archive</h2>
    </div>

    {archivedPosts.length > 0 ? (
      <div className="grid grid-cols-3 gap-0.5">
        {archivedPosts.map((post: any) => (
          <div key={post.id} className="relative aspect-square bg-gray-100">
            {getPostImage(post) && (
              <img
                src={getPostImage(post)}
                alt="Archived post"
                className="h-full w-full object-cover"
              />
            )}

            <button
              onClick={() => restoreArchivedPost(post.id)}
              className="absolute inset-x-1 bottom-1 rounded-md bg-white/90 py-2 text-xs font-bold"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="px-6 py-20 text-center">
        <Archive size={45} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-bold">No archived posts</h3>
        <p className="mt-2 text-sm text-gray-500">
          Posts you archive will appear here.
        </p>
      </div>
    )}
  </div>
)}

{/* QR PROFILE */}

{showQR && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Share Profile</h2>
        <button onClick={() => setShowQR(false)}>
          <X size={22} />
        </button>
      </div>

      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-gray-100">
        <QrCode size={85} />
      </div>

      <h3 className="mt-4 font-bold">{username}</h3>
      <p className="mt-1 text-sm text-gray-500">
        Share your ChitPix profile with friends.
      </p>

      <button
        onClick={handleShareProfile}
        className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
      >
        <span className="inline-flex items-center gap-2">
          <Share2 size={18} />
          Share profile
        </span>
      </button>
    </div>
  </div>
)}

{/* POST PREVIEW */}

{selectedPost && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3">

    <button
      onClick={closePostPreview}
      className="absolute right-5 top-5 z-10 rounded-full bg-white/20 p-2 text-white"
    >
      <X size={25} />
    </button>

    <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white">

      {getPostImage(selectedPost) && (
        <img
          src={getPostImage(selectedPost)}
          alt={selectedPost.caption || "Post"}
          className="max-h-[65vh] w-full bg-black object-contain"
        />
      )}

      <div className="p-4">
        <p className="font-semibold">{username}</p>

        {selectedPost.caption && (
          <p className="mt-2 whitespace-pre-wrap text-sm">
            {selectedPost.caption}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-400">
          {formatPostDate(selectedPost.created_at)}
        </p>

        {isOwnProfile && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handlePostAction("pin", selectedPost)}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold"
            >
              {isPostPinned(selectedPost.id) ? "Unpin" : "Pin"}
            </button>

            <button
              onClick={() => handlePostAction("archive", selectedPost)}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold"
            >
              Archive
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* STORY HIGHLIGHT VIEW */}

{selectedHighlight && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-5">
    <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center">
      <div className="mb-4 flex justify-end">
        <button onClick={closeHighlight}>
          <X size={23} />
        </button>
      </div>

      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
        <Camera size={42} className="text-gray-500" />
      </div>

      <h3 className="mt-4 font-bold">
        {selectedHighlight.title || "Story Highlight"}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Story highlight preview
      </p>
    </div>
  </div>
)}

{/* FOLLOWERS / FOLLOWING */}

{(showFollowers || showFollowing) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-5">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {showFollowers ? "Followers" : "Following"}
        </h2>

        <button
          onClick={() => {
            setShowFollowers(false)
            setShowFollowing(false)
          }}
        >
          <X size={22} />
        </button>
      </div>

      <p className="py-8 text-center text-sm text-gray-500">
        {showFollowers
          ? `${formatCount(followers)} followers`
          : `${formatCount(following)} following`}
      </p>
    </div>
  </div>
)}

      {/* NOTICE */}
{notice && (
  <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-white shadow-lg">
    {notice}
    <button onClick={clearNotice} className="ml-2">
      <X size={15} className="inline" />
    </button>
  </div>
)}
</main>
  );
      }
