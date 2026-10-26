import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_R2_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function getMediaUrl(post: any): string {
  const value =
    post?.video_url ||
    post?.videoUrl ||
    post?.image_url ||
    post?.imageUrl ||
    post?.r2_url ||
    post?.url ||
    ""

  let url = String(value).trim()

  if (!url) return ""

  if (url.startsWith("r2://")) {
    url = `${R2_PUBLIC_URL}/${url.slice(5).replace(/^\/+/, "")}`
  } else if (!/^https?:\/\//i.test(url)) {
    url = `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`
  }

  return url
}

function isVideo(post: any, url: string): boolean {
  const type = String(post?.type || post?.p_type || "").toLowerCase()
  const path = url.split("?")[0].toLowerCase()

  return (
    type === "reel" ||
    type === "video" ||
    type === "reels" ||
    /\.(mp4|webm|mov|m4v|m3u8)$/i.test(path)
  )
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const requestedLimit = Number(searchParams.get("limit") || 50)
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Reels API: server-side Supabase credentials are missing")
      return NextResponse.json(
        { reels: [], posts: [], error: "Server configuration missing" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("Reels API Supabase error:", error.message)
      return NextResponse.json(
        { reels: [], posts: [], error: "Could not load posts" },
        { status: 500 }
      )
    }

    const reels = (data || [])
      .map((post: any) => {
        const mediaUrl = getMediaUrl(post)

        return {
          ...post,
          videoUrl: mediaUrl,
          video_url: mediaUrl,
          imageUrl: mediaUrl,
          image_url: mediaUrl,
          url: mediaUrl,
          type: isVideo(post, mediaUrl) ? "reel" : "post",
          caption: post.caption || "",
          user: post.username || post.user || "ChitPix user",
        }
      })
      .filter((post: any) => post.videoUrl && isVideo(post, post.videoUrl))
      .slice(0, limit)

    return NextResponse.json(
      { reels, posts: reels },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    )
  } catch (error: any) {
    console.error("Reels API error:", error?.message || error)

    return NextResponse.json(
      { reels: [], posts: [], error: "Unable to load reels" },
      { status: 500 }
    )
  }
}
