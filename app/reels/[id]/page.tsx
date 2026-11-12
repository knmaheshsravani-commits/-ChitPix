"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import BottomNav from "../../components/BottomNav"

export default function ReelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const id = String(params?.id || "")

  const [post, setPost] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    let active = true

    async function loadReel() {
      try {
        setLoading(true)
        setError("")

        const { data, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .maybeSingle()

        if (postError) throw postError

        if (!data) {
          throw new Error("Reel not found")
        }

        if (!active) return

        setPost(data)

        if (data.user_id) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user_id)
            .maybeSingle()

          if (active) setProfile(userProfile)
        }
      } catch (e: any) {
        console.error("REEL DETAIL ERROR:", e)

        if (active) {
          setError(e?.message || "Unable to load reel")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    if (id) loadReel()

    return () => {
      active = false
    }
  }, [id])

  const mediaUrl = post
    ? post.image_url || post.image || post.r2_url || post.url || ""
    : ""

  const username =
    profile?.username || post?.username || "ChitPix User"

  const avatar =
    profile?.avatar_url ||
    profile?.avatar ||
    post?.avatar_url ||
    ""

  function toggleMute() {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setMuted(video.muted)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading reel...
      </main>
    )
  }

  if (error || !post || !mediaUrl) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <h2 className="text-xl font-bold">Reel unavailable</h2>

        <p className="mt-2 text-sm text-gray-300">
          {error || "Video not available"}
        </p>

        <button
          onClick={() => router.back()}
          className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-3 font-bold"
        >
          Go back
        </button>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <button
        onClick={() => router.back()}
        className="absolute left-4 top-5 z-30 rounded-full bg-black/40 px-4 py-2 text-2xl"
        aria-label="Go back"
      >
        ←
      </button>

      <video
        ref={videoRef}
        src={mediaUrl}
        autoPlay
        controls
        playsInline
        loop
        muted={muted}
        className="h-[calc(100dvh-80px)] w-full object-contain"
        onError={() => setError("Video could not be played")}
      />

      <button
        onClick={toggleMute}
        className="absolute right-4 top-5 z-30 rounded-full bg-black/50 px-4 py-3"
      >
        {muted ? "🔇 Sound off" : "🔊 Sound on"}
      </button>

      <div className="absolute bottom-24 left-4 right-4 z-20">

        <button
          onClick={() =>
            router.push(
              `/profile/${encodeURIComponent(username)}`
            )
          }
          className="flex items-center gap-3 text-left"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="h-11 w-11 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-600 font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="font-bold">{username}</span>
        </button>

        {post.caption && (
          <p className="mt-3 max-w-[90%] whitespace-pre-wrap text-sm">
            {post.caption}
          </p>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-40 bg-black">
        <BottomNav />
      </div>

    </main>
  )
            }
