"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import BottomNav from "../../components/BottomNav"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()

  const username = decodeURIComponent(
    String(params?.username || "")
  )

  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("")
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<
  "posts" | "reels" | "reposts" | "tagged"
>("posts")
  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError("")
      setFollowing(false)
      setFollowersCount(0)
      setFollowingCount(0)

      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser()

        if (authError) throw authError

        const user = auth?.user

        if (active) {
          setCurrentUserId(user?.id || "")
        }

        const { data: found, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("username", username)
            .maybeSingle()

        if (profileError) throw profileError

        if (!found) {
          if (active) setError("User profile not found.")
          return
        }

        if (active) setProfile(found)

        const { data: userPosts, error: postsError } =
          await supabase
            .from("posts")
            .select("*")
            .eq("user_id", found.id)
            .order("created_at", { ascending: false })

        if (postsError) throw postsError

        if (active) setPosts(userPosts || [])

        // Count followers and following from user_follows.
        const [followersResult, followingResult] =
          await Promise.all([
            supabase
              .from("user_follows")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("following_id", found.id),

            supabase
              .from("user_follows")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("follower_id", found.id),
          ])

        if (followersResult.error) {
          throw followersResult.error
        }

        if (followingResult.error) {
          throw followingResult.error
        }

        if (active) {
          setFollowersCount(followersResult.count ?? 0)
          setFollowingCount(followingResult.count ?? 0)
        }

        // Check whether the logged-in user follows this profile.
        if (user && user.id !== found.id) {
          const { data: relation, error: followError } =
            await supabase
              .from("user_follows")
              .select("follower_id")
              .eq("follower_id", user.id)
              .eq("following_id", found.id)
              .maybeSingle()

          if (followError) throw followError

          if (active) {
            setFollowing(!!relation)
          }
        }
      } catch (e: any) {
        console.error("USER PROFILE ERROR:", e)

        if (active) {
          setError(e?.message || "Unable to load profile.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    if (username) {
      loadProfile()
    } else {
      setError("Username not available.")
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [username])

  async function toggleFollow() {
    if (!currentUserId) {
      router.push("/login")
      return
    }

    if (!profile || busy || currentUserId === profile.id) {
      return
    }

    setBusy(true)

    try {
      if (following) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", profile.id)

        if (error) throw error

        setFollowing(false)
        setFollowersCount((count) => Math.max(0, count - 1))
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({
            follower_id: currentUserId,
            following_id: profile.id,
          })

        if (error) throw error

        setFollowing(true)
        setFollowersCount((count) => count + 1)
      }
    } catch (e: any) {
      alert(
        "Follow update failed: " +
          (e?.message || "Unknown error")
      )
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 text-center">
        Loading profile...
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-white p-8 text-center text-black">
        <h2 className="text-xl font-bold">
          Profile unavailable
        </h2>

        <p className="mt-3">
          {error || "User not found."}
        </p>

        <button
          className="mt-5 rounded-xl bg-black px-5 py-3 text-white"
          onClick={() => router.back()}
        >
          Go back
        </button>
      </main>
    )
  }

  const avatar = profile.avatar_url || profile.avatar || ""
  

const visiblePosts = posts.filter((post: any) => {
  const src = String(
    post.image_url || post.image || post.r2_url || post.url || ""
  ).toLowerCase()

  const type = String(
    post.type || post.media_type || post.post_type || ""
  ).toLowerCase()

  const isVideo =
    type.includes("video") ||
    /\.(mp4|webm|mov|m4v|ogg)(\?|$)/.test(src)

  if (activeTab === "posts") return !isVideo
  if (activeTab === "reels") return isVideo

  return false
})
  
  
  return (
    <main className="min-h-screen bg-white pb-24 text-black">
      <div className="mx-auto max-w-[470px]">
        <header className="flex items-center gap-4 border-b p-4">
          <button
            onClick={() => router.back()}
            className="text-2xl"
            aria-label="Go back"
          >
            ←
          </button>

          <h1 className="text-xl font-bold">
            {profile.username}
          </h1>
        </header>

        
<section className="border-b border-slate-200 p-5">
  <div className="flex items-center gap-5">
    {/* PROFILE DP */}
    {avatar ? (
      <img
        src={avatar}
        alt="Profile photo"
        className="h-24 w-24 shrink-0 rounded-full border-2 border-fuchsia-400 object-cover"
      />
    ) : (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-3xl font-bold text-white">
        {String(profile.username || "U")[0].toUpperCase()}
      </div>
    )}

    {/* PROFILE COUNTS */}
    <div className="grid flex-1 grid-cols-3 text-center">
      <div>
        <b className="block text-xl">{posts.length}</b>
        <span className="text-xs text-slate-600">Posts</span>
      </div>

      <div>
        <b className="block text-xl">{followersCount}</b>
        <span className="text-xs text-slate-600">Followers</span>
      </div>

      <div>
        <b className="block text-xl">{followingCount}</b>
        <span className="text-xs text-slate-600">Following</span>
      </div>
    </div>
  </div>

  {/* NAME AND BIO */}
  <div className="mt-4">
    <h2 className="font-bold text-slate-900">
      {profile.full_name || profile.username}
    </h2>

    <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
      {profile.bio || ""}
    </p>

    {profile.website && (
      <a
        href={profile.website}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block break-all text-sm font-semibold text-blue-600"
      >
        {profile.website}
      </a>
    )}
  </div>

  {/* ACTION BUTTONS */}
  {currentUserId !== profile.id && (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        onClick={toggleFollow}
        disabled={busy}
        className={`rounded-xl py-3 font-bold ${
          following
            ? "bg-slate-100 text-slate-900"
            : "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white"
        } disabled:opacity-50`}
      >
        {busy
          ? "Please wait..."
          : following
            ? "Following"
            : "Follow"}
      </button>

      <button
        onClick={() => router.push("/messages")}
        className="rounded-xl bg-slate-100 py-3 font-bold text-slate-900"
      >
        Message
      </button>
    </div>
  )}
</section>
        

        

<div className="grid grid-cols-4 border-t border-slate-200">
  {([
    { id: "posts", label: "▦", title: "Posts" },
    { id: "reels", label: "▶", title: "Reels" },
    { id: "reposts", label: "⟳", title: "Reposts" },
    { id: "tagged", label: "♙", title: "Tagged" },
  ] as const).map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      aria-label={tab.title}
      className={`border-b-2 py-4 text-center text-2xl ${
        activeTab === tab.id
          ? "border-fuchsia-500 text-fuchsia-600"
          : "border-transparent text-slate-400"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
        
  
  <button
    onClick={() => setActiveTab("posts")}
    className={`border-b-2 py-4 text-center font-bold ${
      activeTab === "posts"
        ? "border-fuchsia-500 text-fuchsia-600"
        : "border-transparent text-slate-400"
    }`}
  >
    ▦ POSTS
  </button>

  <button
    onClick={() => setActiveTab("reels")}
    className={`border-b-2 py-4 text-center font-bold ${
      activeTab === "reels"
        ? "border-fuchsia-500 text-fuchsia-600"
        : "border-transparent text-slate-400"
    }`}
  >
    ▶ REELS
  </button>
</div>

{activeTab === "reposts" || activeTab === "tagged" ? (
  <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-50 text-4xl text-fuchsia-500">
      {activeTab === "reposts" ? "⟳" : "♙"}
    </div>

    <h3 className="text-lg font-bold text-slate-900">
      {activeTab === "reposts"
        ? "No reposts yet"
        : "No tagged posts yet"}
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      {activeTab === "reposts"
        ? "Posts you repost will appear here."
        : "Posts where this user is tagged will appear here."}
    </p>
  </div>
) : (
  <div className="grid grid-cols-3 gap-1">
    {visiblePosts.map((post: any, index: number) => {
      const src =
        post.image_url ||
        post.image ||
        post.r2_url ||
        post.url

      if (!src) return null

      const isVideo =
        String(post.type || post.media_type || "")
          .toLowerCase()
          .includes("video") ||
        /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(String(src))

      return (
        <button
          key={post.id || index}
          onClick={() => router.push(`/post/${post.id}`)}
          className="aspect-square overflow-hidden bg-gray-100"
        >
          {isVideo ? (
            <video
              src={src}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={src}
              alt="Post"
              className="h-full w-full object-cover"
            />
          )}
        </button>
      )
    })}
  </div>
)}
        </div>

      <BottomNav active="profile" avatar={avatar} />
    </main>
  )
  }
    
