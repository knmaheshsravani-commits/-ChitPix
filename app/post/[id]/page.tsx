"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import BottomNav from "../../components/BottomNav"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()

  const id = String(params?.id || "")

  const [post, setPost] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadPost() {
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
          throw new Error("Post not found")
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
        console.error("POST DETAIL ERROR:", e)
        if (active) {
          setError(e?.message || "Unable to load post")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    if (id) loadPost()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-500">Loading post...</p>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <h2 className="text-xl font-bold">Post unavailable</h2>
        <p className="mt-2 text-slate-500">
          {error || "Post not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-5 rounded-xl bg-black px-6 py-3 text-white"
        >
          Go back
        </button>
      </main>
    )
  }

  const mediaUrl =
    post.image_url ||
    post.image ||
    post.r2_url ||
    post.url ||
    ""

  const username =
    profile?.username ||
    post.username ||
    "ChitPix User"

  const avatar =
    profile?.avatar_url ||
    profile?.avatar ||
    post.avatar_url ||
    ""

  const mediaType = String(
    post.type ||
    post.media_type ||
    post.post_type ||
    ""
  ).toLowerCase()

  const isVideo =
    mediaType.includes("video") ||
    /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(mediaUrl)

  return (
    <main className="min-h-screen bg-white pb-24 text-slate-900">
      <div className="mx-auto max-w-[600px]">

        <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-white p-4">
          <button
            onClick={() => router.back()}
            className="text-3xl"
            aria-label="Go back"
          >
            ←
          </button>

          <h1 className="text-lg font-bold">
            Post
          </h1>
        </header>

        <button
          onClick={() =>
            router.push(
              `/profile/${encodeURIComponent(username)}`
            )
          }
          className="flex w-full items-center gap-3 border-b p-4 text-left"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="h-12 w-12 rounded-full border-2 border-fuchsia-400 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="font-bold">{username}</span>
        </button>

        <div className="flex min-h-[300px] w-full items-center justify-center bg-black">
          {mediaUrl ? (
            isVideo ? (
              <video
                src={mediaUrl}
                controls
                playsInline
                className="max-h-[75vh] w-full object-contain"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="ChitPix post"
                className="max-h-[75vh] w-full object-contain"
              />
            )
          ) : (
            <p className="text-white">Media unavailable</p>
          )}
        </div>

        <section className="space-y-3 p-4">
          <p className="break-words text-sm">
            <button
              onClick={() =>
                router.push(
                  `/profile/${encodeURIComponent(username)}`
                )
              }
              className="mr-2 font-bold"
            >
              {username}
            </button>

            {post.caption || ""}
          </p>

          {post.price && (
            <p className="font-bold text-fuchsia-600">
              ₹{post.price}
            </p>
          )}

          {post.created_at && (
            <p className="text-xs text-slate-400">
              {new Date(post.created_at).toLocaleString()}
            </p>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  )
              }
