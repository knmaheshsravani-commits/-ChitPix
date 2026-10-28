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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError("")

      try {
        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user

        if (active) setCurrentUserId(user?.id || "")

        const { data: found, error: profileError } = await supabase
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

        const { data: userPosts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", found.id)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError
        if (active) setPosts(userPosts || [])

        if (user && user.id !== found.id) {
          const { data: relation, error: followError } = await supabase
            .from("user_follows")
            .select("follower_id")
            .eq("follower_id", user.id)
            .eq("following_id", found.id)
            .maybeSingle()

          if (!followError && active) {
            setFollowing(!!relation)
          }
        }
      } catch (e: any) {
        console.error("USER PROFILE ERROR:", e)
        if (active) setError(e?.message || "Unable to load profile.")
      } finally {
        if (active) setLoading(false)
      }
    }

    if (username) loadProfile()

    return () => {
      active = false
    }
  }, [username])

  async function toggleFollow() {
    if (!currentUserId) {
      router.push("/login")
      return
    }

    if (!profile || busy || currentUserId === profile.id) return

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
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({
            follower_id: currentUserId,
            following_id: profile.id,
          })

        if (error) throw error
        setFollowing(true)
      }
    } catch (e: any) {
      alert("Follow update failed: " + (e?.message || "Unknown error"))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <main className="min-h-screen p-8 text-center">Loading profile...</main>
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-white p-8 text-center text-black">
        <h2 className="text-xl font-bold">Profile unavailable</h2>
        <p className="mt-3">{error || "User not found."}</p>
        <button className="mt-5 rounded-xl bg-black px-5 py-3 text-white"
          onClick={() => router.back()}>
          Go back
        </button>
      </main>
    )
  }

  const avatar = profile.avatar_url || profile.avatar || ""

  return (
    <main className="min-h-screen bg-white pb-24 text-black">
      <div className="mx-auto max-w-[470px]">
        <header className="flex items-center gap-4 border-b p-4">
          <button onClick={() => router.back()} className="text-2xl">←</button>
          <h1 className="text-xl font-bold">{profile.username}</h1>
        </header>

        <section className="p-5">
          <div className="flex items-center gap-6">
            {avatar ? (
              <img src={avatar} alt="Profile photo"
                className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
                {String(profile.username || "U")[0].toUpperCase()}
              </div>
            )}

            <div className="flex flex-1 justify-around text-center">
              <div>
                <b className="block text-xl">{posts.length}</b>
                <span className="text-sm">Posts</span>
              </div>
              
<div>
  <b className="block text-xl">
    {Number(profile.followers_count || 0)}
  </b>
  <span className="text-sm">Followers</span>
</div>
<div>
  <b className="block text-xl">
    {Number(profile.following_count || 0)}
  </b>
  <span className="text-sm">Following</span>
</div>
              

          <h2 className="mt-4 font-bold">
            {profile.full_name || profile.username}
          </h2>
          <p className="mt-1 whitespace-pre-line text-sm">
            {profile.bio || ""}
          </p>

          {currentUserId !== profile.id && (
            <button onClick={toggleFollow} disabled={busy}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-50">
              {busy ? "Please wait..." : following ? "Following" : "Follow"}
            </button>
          )}
        </section>

        <h3 className="border-t p-4 text-center font-bold">POSTS</h3>
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post: any, index: number) => {
            const src = post.image_url || post.image || post.r2_url || post.url
            return src ? (
              <button key={post.id || index}
                onClick={() => router.push(`/post/${post.id}`)}
                className="aspect-square overflow-hidden bg-gray-100">
                {String(post.type || post.media_type || "").toLowerCase().includes("video") ||
                String(src).toLowerCase().includes(".mp4") ? (
                  <video src={src} muted playsInline
                    className="h-full w-full object-cover" />
                ) : (
                  <img src={src} alt="Post"
                    className="h-full w-full object-cover" />
                )}
              </button>
            ) : null
          })}
        </div>
      </div>
      <BottomNav active="profile" avatar={avatar} />
    </main>
  )
      }
      
