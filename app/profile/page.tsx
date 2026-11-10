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
// =====================================
// PROFILE PAGE
// PART 2 - STATE & DATABASE FUNCTIONS
// =====================================

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()

  // PROFILE DATA

  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("POSTS")

  const [username, setUsername] = useState("Loading...")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [link, setLink] = useState("")
  const [photo, setPhoto] = useState("")

  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)

  const [currentUserId, setCurrentUserId] = useState("")
  const [profileUserId, setProfileUserId] = useState("")
  const [isOwnProfile, setIsOwnProfile] = useState(true)

  // PROFILE EDIT

  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")
  const [uploading, setUploading] = useState(false)

  // PROFILE OPTIONS

  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsSection, setSettingsSection] = useState("")
  const [showActivity, setShowActivity] = useState(false)

  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null)

  // CREATOR FEATURES

  const [pinnedPosts, setPinnedPosts] = useState<string[]>([])
  const [featuredProfile, setFeaturedProfile] = useState(false)
  const [creatorBadge, setCreatorBadge] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [notice, setNotice] = useState("")

  const [loading, setLoading] = useState(true)

  // USER SETTINGS

  const [userSettings, setUserSettings] = useState<any>({
    privateAccount: false,
    notifications: true,
    activityStatus: true,
    commentsAllowed: true,
    messageRequests: true,
    saveOriginalPhotos: false,
    darkMode: false,
    language: "English",
  })

  // =====================================
  // LOAD PROFILE AND POSTS
  // =====================================

  useEffect(() => {
    loadProfileData()
  }, [])

  async function loadProfileData() {
    try {
      setLoading(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      if (!user) {
        setNotice("Please login to view your profile.")
        setLoading(false)
        return
      }

      setCurrentUserId(user.id)
      setProfileUserId(user.id)
      setIsOwnProfile(true)

      // PROFILE

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

      if (profileError) {
        console.error("Profile error:", profileError)
      }

      if (profile) {
        setUsername(profile.username || user.email?.split("@")[0] || "user")
        setFullName(profile.full_name || profile.username || "")
        setBio(profile.bio || "")
        setLink(profile.website || "")
        setPhoto(fixR2Url(profile.avatar_url))
      } else {
        setUsername(user.email?.split("@")[0] || "user")
      }

      // POSTS

      const { data: postData, error: postsError } =
        await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

      if (postsError) {
        console.error("Posts error:", postsError)
      }

      const formattedPosts = (postData || []).map(
        (post: any) => {
          const mediaUrl = fixR2Url(
            post.image_url ||
              post.r2_url ||
              post.image ||
              post.url
          )

          const mediaType =
            post.media_type ||
            post.type ||
            (mediaUrl.match(/\.(mp4|mov|webm)(\?|$)/i)
              ? "reels"
              : "post")

          return {
            ...post,
            image_url: mediaUrl,
            type:
              String(mediaType).toLowerCase().includes("video") ||
              String(mediaType).toLowerCase().includes("reel")
                ? "reels"
                : "post",
          }
        }
      )

      setPosts(formattedPosts)

      // FOLLOWERS COUNT
      // user_follows: follower_id, following_id

      const { count: followersCount, error: followersError } =
        await supabase
          .from("user_follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", user.id)

      if (followersError) {
        console.error("Followers count error:", followersError)
      } else {
        setFollowers(followersCount || 0)
      }

      // FOLLOWING COUNT

      const { count: followingCount, error: followingError } =
        await supabase
          .from("user_follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", user.id)

      if (followingError) {
        console.error("Following count error:", followingError)
      } else {
        setFollowing(followingCount || 0)
      }

      // USER SETTINGS

      const { data: settingsData, error: settingsError } =
        await supabase
          .from("user_settings")
          .select("settings")
          .eq("user_id", user.id)
          .maybeSingle()

      if (settingsError) {
        console.error("Settings load error:", settingsError)
      }

      if (settingsData?.settings) {
        setUserSettings((previous: any) => ({
          ...previous,
          ...settingsData.settings,
        }))

        setPinnedPosts(
          settingsData.settings.pinnedPosts || []
        )

        setFeaturedProfile(
          settingsData.settings.featuredProfile || false
        )
      }

    } catch (error: any) {
      console.error("Profile loading error:", error)
      setNotice(error.message || "Unable to load profile.")
    } finally {
      setLoading(false)
    }
  }

  // =====================================
  // SAVE USER SETTINGS
  // =====================================

  async function saveUserSettings(updatedSettings: any) {
    if (!currentUserId) return

    const newSettings = {
      ...userSettings,
      ...updatedSettings,
    }

    setUserSettings(newSettings)

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: currentUserId,
          settings: {
            ...newSettings,
            pinnedPosts,
            featuredProfile,
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

    if (error) {
      console.error("Settings save error:", error)
      setNotice("Settings could not be saved.")
    } else {
      setNotice("Settings saved successfully.")
    }
  }

  // =====================================
  // PROFILE EDIT SAVE
  // =====================================

  async function handleProfileSave() {
    if (!currentUserId) return

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: currentUserId,
            username: editName.trim() || username,
            bio: editBio,
            website: editLink,
            avatar_url: photo,
          },
          {
            onConflict: "id",
          }
        )

      if (error) throw error

      setUsername(editName.trim() || username)
      setFullName(editName.trim() || fullName)
      setBio(editBio)
      setLink(editLink)

      setShowEdit(false)
      setNotice("Profile updated successfully!")
    } catch (error: any) {
      console.error("Profile save error:", error)
      setNotice(error.message || "Profile update failed.")
    }
  }

  // =====================================
  // PROFILE PHOTO UPLOAD
  // =====================================

  async function handlePhotoChange(file: File) {
    if (!file || !currentUserId) return

    try {
      setUploading(true)

      const imageUrl = await uploadToR2(file, "avatars")

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: currentUserId,
            avatar_url: imageUrl,
          },
          {
            onConflict: "id",
          }
        )

      if (error) throw error

      setPhoto(imageUrl)
      setNotice("Profile photo updated!")
    } catch (error: any) {
      console.error("Photo upload error:", error)
      setNotice(error.message || "Photo upload failed.")
    } finally {
      setUploading(false)
    }
  }

  // =====================================
  // OPEN SETTINGS SECTION
  // =====================================

  function openSettingsSection(section: string) {
    setSettingsSection(section)
    setShowSettings(true)
    setShowMenu(false)
    setShowActivity(false)
  }

  function closeProfileOverlays() {
    setShowEdit(false)
    setShowMenu(false)
    setShowSettings(false)
    setShowActivity(false)
    setShowFollowers(false)
    setShowFollowing(false)
    setShowArchive(false)
    setShowQR(false)
    setSelectedPost(null)
    setSelectedHighlight(null)
  }

  // =====================================
  // PROFILE SHARE
  // =====================================

  function getProfileUrl() {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/profile/${username}`
  }

  async function handleShareProfile() {
    const url = getProfileUrl()

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username} on ChitPix`,
          text: `Check out ${username}'s profile on ChitPix!`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setNotice("Profile link copied!")
      }
    } catch (error) {
      console.log("Share cancelled or unavailable:", error)
    }
  }

  async function handleCopyProfileLink() {
    try {
      await navigator.clipboard.writeText(getProfileUrl())
      setNotice("Profile link copied!")
    } catch {
      setNotice("Could not copy profile link.")
    }
  }

  function handleQRProfile() {
    setShowQR(true)
  }

  // =====================================
  // FEATURED PROFILE
  // =====================================

  async function toggleFeaturedProfile() {
    const nextValue = !featuredProfile

    setFeaturedProfile(nextValue)

    await saveUserSettings({
      featuredProfile: nextValue,
    })

    setNotice(
      nextValue
        ? "Featured profile enabled!"
        : "Featured profile disabled."
    )
  }

  // =====================================
  // PIN PROFILE POSTS
  // =====================================

  async function togglePinPost(postId: string) {
    let updated: string[]

    if (pinnedPosts.includes(postId)) {
      updated = pinnedPosts.filter((id) => id !== postId)
    } else {
      if (pinnedPosts.length >= 3) {
        setNotice("You can pin up to 3 posts.")
        return
      }

      updated = [...pinnedPosts, postId]
    }

    setPinnedPosts(updated)

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: currentUserId,
          settings: {
            ...userSettings,
            pinnedPosts: updated,
            featuredProfile,
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

    if (error) {
      console.error("Pin save error:", error)
      setNotice("Could not save pinned posts.")
    } else {
      setNotice("Featured posts updated!")
    }
  }

  // =====================================
  // ARCHIVE POST
  // =====================================

  function archivePost(post: any) {
    setArchivedPosts((previous) => [
      ...previous,
      post,
    ])

    setPosts((previous) =>
      previous.filter((item) => item.id !== post.id)
    )

    setSelectedPost(null)
    setNotice("Post moved to archive in this session.")
  }

  // =====================================
  // PROFILE SEARCH
  // =====================================

  const filteredPosts = posts.filter((post) =>
    String(post.caption || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const postCount = posts.filter(
    (post) => post.type === "post"
  ).length

  const reelCount = posts.filter(
    (post) => post.type === "reels"
  ).length

  const shopPosts = posts.filter(
    (post) =>
      Number(post.price || 0) > 0
  )

  // =====================================
  // CREATOR BADGES
  // =====================================

  const creatorBadges = []

  if (posts.length >= 1) {
    creatorBadges.push("First Post")
  }

  if (posts.length >= 10) {
    creatorBadges.push("Active Creator")
  }

  if (reelCount >= 5) {
    creatorBadges.push("Reels Creator")
  }

  if (followers >= 100) {
    creatorBadges.push("Community Star")
  }

  // =====================================
  // PROFILE STATISTICS
  // =====================================

  const profileStats = [
    {
      label: "Posts",
      value: posts.length,
      onClick: () => setActiveTab("POSTS"),
    },
    {
      label: "Followers",
      value: followers,
      onClick: () => setShowFollowers(true),
    },
    {
      label: "Following",
      value: following,
      onClick: () => setShowFollowing(true),
    },
  ]

  // =====================================
  // NOTICE CLOSE
  // =====================================

  function closeNotice() {
    setNotice("")
  }

  // Part 3 continues here...
  // =====================================
  // PROFILE MENU ITEMS
  // =====================================

  const profileMenuItems = [
    {
      label: "Settings and privacy",
      icon: Settings,
      action: () => openSettingsSection("main"),
    },
    {
      label: "Your activity",
      icon: Activity,
      action: () => setShowActivity(true),
    },
    {
      label: "Saved",
      icon: Bookmark,
      action: () => openSettingsSection("Saved"),
    },
    {
      label: "Archive",
      icon: Archive,
      action: () => setShowArchive(true),
    },
    {
      label: "QR code",
      icon: QrCode,
      action: handleQRProfile,
    },
    {
      label: "Share profile",
      icon: Share2,
      action: handleShareProfile,
    },
  ]

  // =====================================
  // SETTINGS MENU ITEMS
  // =====================================

  const settingsMenuItems = [
    {
      title: "Your account",
      items: [
        { label: "Edit profile", icon: UserRound },
        { label: "Account privacy", icon: LockKeyhole },
        { label: "Security", icon: ShieldCheck },
        { label: "Notifications", icon: Bell },
        { label: "Your activity", icon: Activity },
        { label: "Archive", icon: Archive },
        { label: "Saved", icon: Bookmark },
      ],
    },
    {
      title: "How others can interact with you",
      items: [
        { label: "Messages and story replies", icon: Send },
        { label: "Comments", icon: MessageCircle },
        { label: "Tags and mentions", icon: AtSign },
        { label: "Sharing and reuse", icon: Repeat },
        { label: "Blocked accounts", icon: Ban },
        { label: "Restricted accounts", icon: UserPlus },
      ],
    },
    {
      title: "What you see",
      items: [
        { label: "Content preferences", icon: SlidersHorizontal },
        { label: "Like and share counts", icon: Heart },
        { label: "Muted accounts", icon: VolumeX },
      ],
    },
    {
      title: "Your app and media",
      items: [
        { label: "Language", icon: Languages },
        { label: "Accessibility", icon: Accessibility },
        { label: "Data usage and media quality", icon: Smartphone },
        { label: "Downloads", icon: Download },
      ],
    },
    {
      title: "More information and support",
      items: [
        { label: "Help", icon: CircleHelp },
        { label: "About ChitPix", icon: Info },
        { label: "Report a problem", icon: Flag },
      ],
    },
  ]

  // =====================================
  // SETTINGS ITEM CLICK
  // =====================================

  function handleSettingsItemClick(label: string) {
    if (label === "Edit profile") {
      setEditName(username)
      setEditBio(bio)
      setEditLink(link)
      setShowEdit(true)
      setShowSettings(false)
      return
    }

    if (label === "Your activity") {
      setShowActivity(true)
      setShowSettings(false)
      return
    }

    if (label === "Archive") {
      setShowArchive(true)
      setShowSettings(false)
      return
    }

    if (label === "Saved") {
      setSettingsSection("Saved")
      return
    }

    setSettingsSection(label)
  }

  // =====================================
  // POST TAB FILTER
  // =====================================

  const visiblePosts =
    activeTab === "POSTS"
      ? filteredPosts.filter(
          (post) => post.type === "post"
        )
      : activeTab === "REELS"
      ? filteredPosts.filter(
          (post) => post.type === "reels"
        )
      : filteredPosts

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <main className="min-h-screen bg-white pb-20">
        <div className="mx-auto flex min-h-[70vh] max-w-[600px] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-pink-500" />
          <p className="mt-4 text-sm text-gray-500">
            Loading ChitPix profile...
          </p>
        </div>
        <BottomNav />
      </main>
    )
  }

  // =====================================
  // MAIN PROFILE PAGE
  // =====================================

  return (
    <main className="mx-auto min-h-screen w-full max-w-[600px] bg-white pb-24 text-gray-900">

      {/* TOP HEADER */}
<header className="sticky top-0 z-30 flex w-full items-center justify-between gap-2 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">

  {/* USERNAME */}
  <div className="min-w-0 flex-1">
    <h1
      title={username || "ChitPix"}
      className="block max-w-full truncate whitespace-nowrap text-xl font-bold tracking-tight text-gray-900"
    >
      {username || "ChitPix"}
    </h1>
  </div>

  {/* HEADER BUTTONS */}
  <div className="flex shrink-0 items-center gap-4">

    {/* SETTINGS */}
    <button
      type="button"
      onClick={() => openSettingsSection("main")}
      aria-label="Settings"
      className="rounded-full p-2 transition hover:bg-gray-100 active:scale-95"
    >
      <Plus size={25} strokeWidth={1.8} />
    </button>

    {/* PROFILE MENU */}
    <button
      type="button"
      onClick={() => setShowMenu(true)}
      aria-label="Profile menu"
      className="rounded-full p-2 transition hover:bg-gray-100 active:scale-95"
    >
      <Menu size={26} strokeWidth={1.8} />
    </button>

  </div>
</header>

      {/* PROFILE DETAILS */}

      <section className="px-4 pt-5">

        <div className="flex items-center gap-5">

          {/* PROFILE PHOTO */}

          <div className="relative shrink-0">
            <div className="h-[88px] w-[88px] overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound size={42} className="text-gray-400" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white"
              aria-label="Edit profile photo"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* PROFILE STATS */}

          <div className="grid flex-1 grid-cols-3 text-center">

            {profileStats.map((stat) => (
              <button
                type="button"
                key={stat.label}
                onClick={stat.onClick}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold">
                  {stat.value}
                </span>

                <span className="text-xs text-gray-600">
                  {stat.label}
                </span>
              </button>
            ))}

          </div>
        </div>

        {/* NAME AND BIO */}

        <div className="mt-4">
          <p className="text-sm font-bold">
            {fullName || username}
          </p>

          {bio && (
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {bio}
            </p>
          )}

          {link && (
            <a
              href={
                link.startsWith("http")
                  ? link
                  : `https://${link}`
              }
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm font-semibold text-blue-700"
            >
              {link}
            </a>
          )}
        </div>

        {/* CREATOR BADGES */}

        {creatorBadges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {creatorBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                ⭐ {badge}
              </span>
            ))}
          </div>
        )}

        {/* FEATURED PROFILE LABEL */}

        {featuredProfile && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800">
            <Star size={14} />
            Featured Profile
          </div>
        )}

        {/* PROFILE ACTION BUTTONS */}

        <div className="mt-4 grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={() => {
              setEditName(username)
              setEditBio(bio)
              setEditLink(link)
              setShowEdit(true)
            }}
            className="rounded-lg bg-gray-100 py-2 text-sm font-semibold"
          >
            Edit profile
          </button>

          <button
            type="button"
            onClick={handleShareProfile}
            className="rounded-lg bg-gray-100 py-2 text-sm font-semibold"
          >
            Share profile
          </button>

        </div>

        {/* CREATOR FEATURE BUTTONS */}

        <div className="mt-2 grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={() => openSettingsSection("Creator Dashboard")}
            className="rounded-lg bg-gray-100 py-2 text-sm font-semibold"
          >
            <BarChart3 size={16} className="mr-1 inline" />
            Creator Dashboard
          </button>

          <button
            type="button"
            onClick={toggleFeaturedProfile}
            className="rounded-lg bg-gray-100 py-2 text-sm font-semibold"
          >
            <Star size={16} className="mr-1 inline" />
            {featuredProfile ? "Unfeature Profile" : "Featured Profile"}
          </button>

        </div>

      </section>

      {/* HIGHLIGHTS */}

      <HighlightsInline
        username={username}
        onSelect={(item: any) => setSelectedHighlight(item)}
      />

      {/* PROFILE SEARCH */}

      <div className="mx-4 mt-5 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
        <Search size={18} className="text-gray-500" />

        <input
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search your posts..."
          className="w-full bg-transparent text-sm outline-none"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* PROFILE TABS */}

      <div className="mt-5 grid grid-cols-3 border-t border-gray-200">

        <button
          type="button"
          onClick={() => setActiveTab("POSTS")}
          className={`flex items-center justify-center gap-2 border-t-2 py-3 text-xs font-semibold ${
            activeTab === "POSTS"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Grid3X3 size={19} />
          POSTS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REELS")}
          className={`flex items-center justify-center gap-2 border-t-2 py-3 text-xs font-semibold ${
            activeTab === "REELS"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Clapperboard size={19} />
          REELS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TAGGED")}
          className={`flex items-center justify-center gap-2 border-t-2 py-3 text-xs font-semibold ${
            activeTab === "TAGGED"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Users size={19} />
          TAGGED
        </button>

      </div>

      {/* POST GRID */}

      <section className="grid grid-cols-3 gap-[2px]">

        {visiblePosts.map((post: any) => (
          <button
            type="button"
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="relative aspect-square overflow-hidden bg-gray-100"
          >
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.caption || "ChitPix post"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Camera size={25} className="text-gray-400" />
              </div>
            )}

            {post.type === "reels" && (
              <div className="absolute right-2 top-2 text-white drop-shadow">
                <Clapperboard size={19} />
              </div>
            )}

            {pinnedPosts.includes(String(post.id)) && (
              <div className="absolute left-2 top-2 text-white drop-shadow">
                <Star size={18} fill="white" />
              </div>
            )}

          </button>
        ))}

      </section>

      {/* EMPTY POSTS */}

      {visiblePosts.length === 0 && (
        <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-900">
            {activeTab === "REELS" ? (
              <Clapperboard size={30} />
            ) : (
              <Camera size={30} />
            )}
          </div>

          <h2 className="text-lg font-bold">
            {searchQuery
              ? "No matching posts"
              : activeTab === "REELS"
              ? "No Reels Yet"
              : activeTab === "TAGGED"
              ? "No Tagged Posts"
              : "No Posts Yet"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try another search."
              : "Your ChitPix posts will appear here."}
          </p>
        </div>
      )}

      {/* PART 4 CONTINUES BELOW */}
            {/* =====================================
          CHITPIX MINI SHOP
      ===================================== */}

      {activeTab === "SHOP" && (
        <section className="px-4 py-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                ChitPix Mini Shop
              </h2>
              <p className="text-xs text-gray-500">
                Products shared on your profile
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
              {shopPosts.length} Items
            </span>
          </div>

          {shopPosts.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-5 py-10 text-center">
              <ShoppingBagIcon />
              <h3 className="mt-3 font-bold">
                Your shop is empty
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a price to a post to show it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {shopPosts.map((post: any) => (
                <button
                  type="button"
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="overflow-hidden rounded-xl border border-gray-100 text-left"
                >
                  <div className="aspect-square bg-gray-100">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.caption || "Shop item"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium">
                      {post.caption || "ChitPix item"}
                    </p>
                    <p className="mt-1 font-bold text-green-700">
                      ₹{Number(post.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =====================================
          CREATOR DASHBOARD
      ===================================== */}

      {settingsSection === "Creator Dashboard" && (
        <section className="mx-4 my-5 rounded-2xl border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Creator Dashboard
              </h2>
              <p className="text-xs text-gray-500">
                Your ChitPix creator overview
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSettingsSection("")}
              className="rounded-full bg-gray-100 p-2"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <Camera size={21} />
              <p className="mt-2 text-2xl font-bold">
                {postCount}
              </p>
              <p className="text-xs text-gray-500">
                Photo Posts
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <Clapperboard size={21} />
              <p className="mt-2 text-2xl font-bold">
                {reelCount}
              </p>
              <p className="text-xs text-gray-500">
                Reels
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <Users size={21} />
              <p className="mt-2 text-2xl font-bold">
                {followers}
              </p>
              <p className="text-xs text-gray-500">
                Followers
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <ShoppingBagIcon />
              <p className="mt-2 text-2xl font-bold">
                {shopPosts.length}
              </p>
              <p className="text-xs text-gray-500">
                Shop Items
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-blue-50 p-3">
            <p className="text-sm font-semibold text-blue-900">
              Insights information
            </p>
            <p className="mt-1 text-xs text-blue-800">
              Views, reach and earnings are not available yet.
              ChitPix needs post-view and earnings tracking
              before these numbers can be displayed.
            </p>
          </div>
        </section>
      )}

      {/* =====================================
          SHOP TAB BUTTON
      ===================================== */}

      <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("POSTS")}
          className={`rounded-lg py-2 text-xs font-semibold ${
            activeTab === "POSTS"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Posts
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REELS")}
          className={`rounded-lg py-2 text-xs font-semibold ${
            activeTab === "REELS"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Reels
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TAGGED")}
          className={`rounded-lg py-2 text-xs font-semibold ${
            activeTab === "TAGGED"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Tagged
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SHOP")}
          className={`rounded-lg py-2 text-xs font-semibold ${
            activeTab === "SHOP"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Shop
        </button>
      </div>

      {/* =====================================
          SELECTED POST DETAILS
      ===================================== */}

      {selectedPost && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[430px] overflow-hidden rounded-2xl bg-white">

            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold">
                Post details
              </h3>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
              >
                <X size={23} />
              </button>
            </div>

            {selectedPost.image_url && (
              <div className="max-h-[55vh] bg-black">
                <img
                  src={selectedPost.image_url}
                  alt="Selected post"
                  className="mx-auto max-h-[55vh] w-full object-contain"
                />
              </div>
            )}

            <div className="space-y-3 p-4">
              <p className="break-words text-sm">
                {selectedPost.caption || "No caption"}
              </p>

              {Number(selectedPost.price || 0) > 0 && (
                <p className="font-bold text-green-700">
                  ₹{Number(selectedPost.price).toLocaleString("en-IN")}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  togglePinPost(String(selectedPost.id))
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 text-sm font-semibold"
              >
                <Star size={17} />
                {pinnedPosts.includes(String(selectedPost.id))
                  ? "Unpin from profile"
                  : "Pin to profile"}
              </button>

              <button
                type="button"
                onClick={() => archivePost(selectedPost)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 text-sm font-semibold"
              >
                <Archive size={17} />
                Archive post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          SELECTED HIGHLIGHT
      ===================================== */}

      {selectedHighlight && (
        <StoryViewerInline
          users={[selectedHighlight]}
          onClose={() => setSelectedHighlight(null)}
        />
      )}

      {/* =====================================
          PART 5 CONTINUES BELOW
      ===================================== */}
            {/* =====================================
          SETTINGS SCREEN
      ===================================== */}

      {showSettings && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-white">

          {/* SETTINGS HEADER */}

          <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-white px-4 py-4">
            <button
              type="button"
              onClick={() => {
                if (settingsSection && settingsSection !== "main") {
                  setSettingsSection("main")
                } else {
                  setShowSettings(false)
                }
              }}
            >
              <ArrowLeft size={23} />
            </button>

            <h2 className="text-lg font-bold">
              {settingsSection === "main"
                ? "Settings and privacy"
                : settingsSection}
            </h2>
          </header>

          {/* MAIN SETTINGS MENU */}

          {settingsSection === "main" && (
            <div className="mx-auto max-w-[600px] px-4 py-4">

              <div className="mb-5 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                    <UserRound size={25} />
                  </div>

                  <div>
                    <p className="font-bold">{username}</p>
                    <p className="text-xs text-gray-500">
                      ChitPix account settings
                    </p>
                  </div>
                </div>
              </div>

              {settingsMenuItems.map((group: any) => (
                <section key={group.title} className="mb-6">

                  <h3 className="mb-2 text-sm font-bold text-gray-500">
                    {group.title}
                  </h3>

                  <div className="divide-y divide-gray-100">
                    {group.items.map((item: any) => {
                      const Icon = item.icon

                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() =>
                            handleSettingsItemClick(item.label)
                          }
                          className="flex w-full items-center gap-4 py-4 text-left"
                        >
                          <Icon size={21} strokeWidth={1.7} />

                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>

                          <ChevronRight
                            size={19}
                            className="text-gray-400"
                          />
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}

              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase.auth.signOut()

                  if (error) {
                    setNotice(error.message)
                    return
                  }

                  router.push("/login")
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-xl bg-red-50 p-4 text-left font-semibold text-red-600"
              >
                <LogOut size={20} />
                Log out
              </button>

              <p className="py-6 text-center text-xs text-gray-400">
                ChitPix Settings
              </p>
            </div>
          )}

          {/* ACCOUNT PRIVACY */}

          {settingsSection === "Account privacy" && (
            <div className="mx-auto max-w-[600px] p-4">

              <div className="flex items-center gap-3 py-4">
                <LockKeyhole size={24} />
                <div className="flex-1">
                  <p className="font-semibold">
                    Private account
                  </p>
                  <p className="text-xs text-gray-500">
                    Control who can see your posts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveUserSettings({
                      privateAccount: !userSettings.privateAccount,
                    })
                  }
                  className={`h-7 w-12 rounded-full p-1 ${
                    userSettings.privateAccount
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                      userSettings.privateAccount
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className="border-t py-4 text-xs text-gray-500">
                Note: This saves your privacy preference in
                user_settings. It does not yet enforce private
                profile visibility across all app pages.
              </p>
            </div>
          )}

          {/* NOTIFICATIONS */}

          {settingsSection === "Notifications" && (
            <div className="p-4">

              <h3 className="mb-3 font-bold">
                Push notifications
              </h3>

              <div className="flex items-center justify-between border-b py-4">
                <div>
                  <p className="font-medium">
                    Allow notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage your notification preference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveUserSettings({
                      notifications: !userSettings.notifications,
                    })
                  }
                  className={`h-7 w-12 rounded-full p-1 ${
                    userSettings.notifications
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                      userSettings.notifications
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                This stores your notification preference.
                Device push notification delivery needs
                notification service integration.
              </p>
            </div>
          )}

          {/* SECURITY */}

          {settingsSection === "Security" && (
            <div className="p-4">
              <ShieldCheck size={32} />

              <h3 className="mt-3 font-bold">
                Account Security
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Your ChitPix login is managed through Supabase
                Authentication.
              </p>

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="mt-4 w-full rounded-lg bg-gray-100 py-3 text-sm font-semibold"
              >
                Change or reset password
              </button>
            </div>
          )}

          {/* MESSAGES AND STORY REPLIES */}

          {settingsSection === "Messages and story replies" && (
            <div className="p-4">

              <h3 className="font-bold">
                Message preferences
              </h3>

              <div className="mt-4 flex items-center justify-between border-b py-4">
                <div>
                  <p className="font-medium">
                    Allow message requests
                  </p>
                  <p className="text-xs text-gray-500">
                    Save your message request preference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveUserSettings({
                      messageRequests: !userSettings.messageRequests,
                    })
                  }
                  className={`h-7 w-12 rounded-full p-1 ${
                    userSettings.messageRequests
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white ${
                      userSettings.messageRequests
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* COMMENTS */}

          {settingsSection === "Comments" && (
            <div className="p-4">
              <h3 className="font-bold">
                Comment controls
              </h3>

              <div className="mt-4 flex items-center justify-between border-b py-4">
                <div>
                  <p className="font-medium">
                    Allow comments
                  </p>
                  <p className="text-xs text-gray-500">
                    Save your comment preference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveUserSettings({
                      commentsAllowed: !userSettings.commentsAllowed,
                    })
                  }
                  className={`h-7 w-12 rounded-full p-1 ${
                    userSettings.commentsAllowed
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white ${
                      userSettings.commentsAllowed
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* LANGUAGE */}

          {settingsSection === "Language" && (
            <div className="p-4">
              <h3 className="mb-3 font-bold">
                App language preference
              </h3>

              {["English", "తెలుగు", "हिन्दी", "ಕನ್ನಡ"].map(
                (language) => (
                  <button
                    type="button"
                    key={language}
                    onClick={() =>
                      saveUserSettings({ language })
                    }
                    className="flex w-full items-center justify-between border-b py-4 text-sm"
                  >
                    {language}

                    {userSettings.language === language && (
                      <Check
                        size={20}
                        className="text-blue-600"
                      />
                    )}
                  </button>
                )
              )}

              <p className="mt-3 text-xs text-gray-500">
                This saves your language preference. Full app
                translation needs language support in the app.
              </p>
            </div>
          )}

          {/* DATA USAGE */}

          {settingsSection === "Data usage and media quality" && (
            <div className="p-4">
              <h3 className="font-bold">
                Data usage and media quality
              </h3>

              <div className="mt-4 flex items-center justify-between border-b py-4">
                <div>
                  <p className="font-medium">
                    Save original photos
                  </p>
                  <p className="text-xs text-gray-500">
                    Save your original photo preference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveUserSettings({
                      saveOriginalPhotos:
                        !userSettings.saveOriginalPhotos,
                    })
                  }
                  className={`h-7 w-12 rounded-full p-1 ${
                    userSettings.saveOriginalPhotos
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white ${
                      userSettings.saveOriginalPhotos
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* SAVED */}

          {settingsSection === "Saved" && (
            <div className="p-4">
              <Bookmark size={32} />

              <h3 className="mt-3 font-bold">
                Saved posts
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Saved posts will appear here when the ChitPix
                saved-post feature is connected to your database.
              </p>
            </div>
          )}

          {/* BLOCKED / RESTRICTED / OTHER SETTINGS */}

          {[
            "Tags and mentions",
            "Sharing and reuse",
            "Blocked accounts",
            "Restricted accounts",
            "Content preferences",
            "Like and share counts",
            "Muted accounts",
            "Accessibility",
            "Downloads",
            "Help",
            "About ChitPix",
            "Report a problem",
          ].includes(settingsSection) && (
            <div className="p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Settings size={27} />
              </div>

              <h3 className="mt-4 font-bold">
                {settingsSection}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                This ChitPix setting screen is ready for its
                dedicated feature integration. The full action
                will be enabled when its database and app
                functionality are connected.
              </p>
            </div>
          )}

        </div>
      )}

      {/* =====================================
          PART 6 CONTINUES BELOW
      ===================================== */}
            {/* =====================================
          EDIT PROFILE MODAL
      ===================================== */}

      {showEdit && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50">
          <div className="mx-auto min-h-screen max-w-[500px] bg-white">

            <header className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
              >
                <X size={23} />
              </button>

              <h2 className="font-bold">
                Edit Profile
              </h2>

              <button
                type="button"
                onClick={handleProfileSave}
                className="font-bold text-blue-600"
              >
                Save
              </button>
            </header>

            <div className="p-5">

              {/* PROFILE PHOTO */}

              <div className="mb-7 flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <UserRound size={42} />
                    </div>
                  )}
                </div>

                <label className="mt-3 cursor-pointer text-sm font-bold text-blue-600">
                  {uploading
                    ? "Uploading..."
                    : "Change profile photo"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0]

                      if (file) {
                        handlePhotoChange(file)
                      }

                      event.target.value = ""
                    }}
                  />
                </label>
              </div>

              {/* USERNAME */}

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold">
                  Username
                </label>

                <input
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  placeholder="Enter username"
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* BIO */}

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold">
                  Bio
                </label>

                <textarea
                  value={editBio}
                  onChange={(event) =>
                    setEditBio(event.target.value)
                  }
                  placeholder="Write something about yourself..."
                  rows={4}
                  maxLength={150}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {editBio.length}/150
                </p>
              </div>

              {/* WEBSITE */}

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold">
                  Website
                </label>

                <input
                  value={editLink}
                  onChange={(event) =>
                    setEditLink(event.target.value)
                  }
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                disabled={uploading}
                onClick={handleProfileSave}
                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white disabled:opacity-50"
              >
                Save Profile
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================
          YOUR ACTIVITY
      ===================================== */}

      {showActivity && (
        <div className="fixed inset-0 z-[95] overflow-y-auto bg-white">

          <header className="sticky top-0 flex items-center gap-4 border-b bg-white p-4">
            <button
              type="button"
              onClick={() => setShowActivity(false)}
            >
              <ArrowLeft size={23} />
            </button>

            <h2 className="text-lg font-bold">
              Your Activity
            </h2>
          </header>

          <div className="p-4">

            <div className="mb-5 rounded-xl bg-gray-50 p-4">
              <h3 className="font-bold">
                Profile overview
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-white p-3">
                  <Camera size={20} />
                  <p className="mt-2 text-xl font-bold">
                    {postCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Posts
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <Clapperboard size={20} />
                  <p className="mt-2 text-xl font-bold">
                    {reelCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Reels
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <Users size={20} />
                  <p className="mt-2 text-xl font-bold">
                    {followers}
                  </p>
                  <p className="text-xs text-gray-500">
                    Followers
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <UserPlus size={20} />
                  <p className="mt-2 text-xl font-bold">
                    {following}
                  </p>
                  <p className="text-xs text-gray-500">
                    Following
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowActivity(false)
                setShowArchive(true)
              }}
              className="flex w-full items-center gap-4 border-b py-4 text-left"
            >
              <Archive size={22} />
              <span className="flex-1 text-sm font-semibold">
                Archived posts
              </span>
              <ChevronRight size={19} />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowActivity(false)
                openSettingsSection("Saved")
              }}
              className="flex w-full items-center gap-4 border-b py-4 text-left"
            >
              <Bookmark size={22} />
              <span className="flex-1 text-sm font-semibold">
                Saved posts
              </span>
              <ChevronRight size={19} />
            </button>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Activity insights
              </p>

              <p className="mt-1 text-xs text-blue-800">
                Post views, profile visits and time spent
                tracking are not connected yet.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =====================================
          FOLLOWERS MODAL
      ===================================== */}

      {showFollowers && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white">

            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-bold">
                Followers
              </h2>

              <button
                type="button"
                onClick={() => setShowFollowers(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users size={30} />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {followers}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Total Followers
              </p>

              <p className="mt-4 text-xs text-gray-400">
                Follower count is loaded from your
                user_follows table.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =====================================
          FOLLOWING MODAL
      ===================================== */}

      {showFollowing && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white">

            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-bold">
                Following
              </h2>

              <button
                type="button"
                onClick={() => setShowFollowing(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <UserPlus size={30} />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {following}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Total Following
              </p>

              <p className="mt-4 text-xs text-gray-400">
                Following count is loaded from your
                user_follows table.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =====================================
          ARCHIVE SCREEN
      ===================================== */}

      {showArchive && (
        <div className="fixed inset-0 z-[95] overflow-y-auto bg-white">

          <header className="sticky top-0 flex items-center gap-4 border-b bg-white p-4">
            <button
              type="button"
              onClick={() => setShowArchive(false)}
            >
              <ArrowLeft size={23} />
            </button>

            <h2 className="text-lg font-bold">
              Archive
            </h2>
          </header>

          {archivedPosts.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-20 text-center">
              <Archive size={45} />

              <h3 className="mt-4 text-lg font-bold">
                No archived posts
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Posts you archive during this session
                will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px]">
              {archivedPosts.map((post: any) => (
                <button
                  type="button"
                  key={post.id}
                  onClick={() => {
                    setSelectedPost(post)
                    setShowArchive(false)
                  }}
                  className="aspect-square overflow-hidden bg-gray-100"
                >
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Archived post"
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {/* =====================================
          QR PROFILE SCREEN
      ===================================== */}

      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-[350px] rounded-2xl bg-white p-5 text-center">

            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                Share your profile
              </h2>

              <button
                type="button"
                onClick={() => setShowQR(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={42} />
              )}
            </div>

            <h3 className="mt-3 font-bold">
              {username}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              ChitPix Profile
            </p>

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <QrCode
                size={60}
                className="mx-auto text-gray-700"
              />

              <p className="mt-3 break-all text-xs text-gray-600">
                {getProfileUrl()}
              </p>

              <p className="mt-2 text-[11px] text-gray-400">
                QR preview only. A scannable QR code
                will need QR-code generation integration.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyProfileLink}
              className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-bold text-white"
            >
              Copy Profile Link
            </button>

            <button
              type="button"
              onClick={handleShareProfile}
              className="mt-2 w-full rounded-lg bg-gray-100 py-3 font-bold"
            >
              Share Profile
            </button>

          </div>
        </div>
      )}

      {/* =====================================
          PART 7 CONTINUES BELOW
      ===================================== */}
            {/* =====================================
          PROFILE MENU DRAWER
      ===================================== */}

      {showMenu && (
        <div
          className="fixed inset-0 z-[110] bg-black/40"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] overflow-y-auto bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* MENU HEADER */}

            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">
                ChitPix Menu
              </h2>

              <button
                type="button"
                onClick={() => setShowMenu(false)}
              >
                <X size={23} />
              </button>
            </div>

            {/* PROFILE INFO */}

            <div className="flex items-center gap-3 border-b p-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UserRound size={28} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {username}
                </p>

                <p className="text-xs text-gray-500">
                  ChitPix Creator
                </p>
              </div>
            </div>

            {/* MENU ITEMS */}

            <div className="p-3">

              {profileMenuItems.map((item: any) => {
                const Icon = item.icon

                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={item.action}
                    className="flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left hover:bg-gray-50"
                  >
                    <Icon size={22} strokeWidth={1.8} />

                    <span className="flex-1 text-sm font-semibold">
                      {item.label}
                    </span>

                    <ChevronRight
                      size={18}
                      className="text-gray-400"
                    />
                  </button>
                )
              })}

            </div>

            {/* CREATOR TOOLS */}

            <div className="border-t p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Creator tools
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  openSettingsSection("Creator Dashboard")
                }}
                className="flex w-full items-center gap-3 rounded-xl py-3 text-left"
              >
                <BarChart3 size={21} />

                <span className="flex-1 text-sm font-medium">
                  Creator Dashboard
                </span>

                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  setActiveTab("SHOP")
                }}
                className="flex w-full items-center gap-3 rounded-xl py-3 text-left"
              >
                <ShoppingBagIcon />

                <span className="flex-1 text-sm font-medium">
                  Mini Shop
                </span>

                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  toggleFeaturedProfile()
                }}
                className="flex w-full items-center gap-3 rounded-xl py-3 text-left"
              >
                <Star size={21} />

                <span className="flex-1 text-sm font-medium">
                  {featuredProfile
                    ? "Disable Featured Profile"
                    : "Enable Featured Profile"}
                </span>

                <ChevronRight size={18} />
              </button>
            </div>

            {/* SETTINGS */}

            <div className="border-t p-4">
              <button
                type="button"
                onClick={() => openSettingsSection("main")}
                className="flex w-full items-center gap-3 rounded-xl py-3 text-left"
              >
                <Settings size={22} />

                <span className="flex-1 text-sm font-semibold">
                  Settings and privacy
                </span>

                <ChevronRight size={18} />
              </button>
            </div>

            {/* LOGOUT */}

            <div className="border-t p-4">
              <button
                type="button"
                onClick={async () => {
                  const { error } =
                    await supabase.auth.signOut()

                  if (error) {
                    setNotice(error.message)
                    setShowMenu(false)
                    return
                  }

                  router.push("/login")
                }}
                className="flex w-full items-center gap-3 rounded-xl py-3 text-left text-red-600"
              >
                <LogOut size={21} />

                <span className="text-sm font-semibold">
                  Log out
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================
          NOTICE / SUCCESS MESSAGE
      ===================================== */}

      {notice && (
        <div className="fixed bottom-24 left-1/2 z-[150] w-[90%] max-w-[420px] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-xl">

            <Check size={19} className="shrink-0 text-green-400" />

            <p className="flex-1 text-sm">
              {notice}
            </p>

            <button
              type="button"
              onClick={closeNotice}
              className="shrink-0"
            >
              <X size={18} />
            </button>

          </div>
        </div>
      )}

      {/* =====================================
          BOTTOM NAVIGATION
      ===================================== */}

      <BottomNav />

      {/* =====================================
          MAIN PROFILE PAGE END
      ===================================== */}

    </main>
  )
}
// =====================================
// CHITPIX SHOPPING BAG ICON
// =====================================

function ShoppingBagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Shopping bag"
    >
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
