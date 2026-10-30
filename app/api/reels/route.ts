import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_R2_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12"

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
    url = `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${url
      .slice(5)
      .replace(/^\/+/, "")}`
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
      console.error("Reels API: Supabase credentials are missing")

      return NextResponse.json(
        {
          reels: [],
          posts: [],
          error: "Server configuration missing",
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // STEP 1: LOAD POSTS
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("Reels API posts error:", error.message)

      return NextResponse.json(
        {
          reels: [],
          posts: [],
          error: "Could not load posts",
        },
        { status: 500 }
      )
    }

    const allPosts = data || []

    // STEP 2: GET USER IDS
    const userIds: string[] = Array.from(
  new Set<string>(
    allPosts
      .map((post: any) => String(post.user_id || ""))
      .filter((id: string) => id.length > 0)
  )
)

    // STEP 3: LOAD REAL PROFILES
    const profileMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, email")
        .in("id", userIds)

      if (profileError) {
        console.error("Reels profiles error:", profileError.message)
      } else {
        ;(profiles || []).forEach((profile: any) => {
          profileMap[String(profile.id)] = profile
        })
      }
    }

    // STEP 4: GET COMMENT COUNTS FOR ALL POSTS
    const postIds = allPosts.map((post: any) => post.id)

    const commentCounts: Record<string, number> = {}

    if (postIds.length > 0) {
      const pageSize = 1000
      let from = 0

      while (true) {
        const { data: rows, error: commentError } = await supabase
          .from("post_comments")
          .select("post_id")
          .in("post_id", postIds)
          .range(from, from + pageSize - 1)

        if (commentError) {
          console.error(
            "Reels comments count error:",
            commentError.message
          )
          break
        }

        const batch = rows || []

        batch.forEach((comment: any) => {
          const id = String(comment.post_id)
          commentCounts[id] = (commentCounts[id] || 0) + 1
        })

        if (batch.length < pageSize) break

        from += pageSize
      }
    }

    // STEP 5: BUILD REELS WITH REAL USER DETAILS
    const reels = allPosts
      .map((post: any) => {
        const mediaUrl = getMediaUrl(post)

        const profile = post.user_id
          ? profileMap[String(post.user_id)]
          : null

        const username =
          profile?.username ||
          post.username ||
          post.user ||
          profile?.email?.split("@")[0] ||
          "ChitPix User"

        const avatar =
          profile?.avatar_url ||
          post.avatar_url ||
          post.userAvatar ||
          DEFAULT_AVATAR

        return {
          ...post,

          // REAL COMMENT COUNT
          comments: commentCounts[String(post.id)] || 0,

          // REAL USER PROFILE
          username,
          user: username,
          avatar_url: avatar,
          userAvatar: avatar,

          // MEDIA URL
          videoUrl: mediaUrl,
          video_url: mediaUrl,
          imageUrl: mediaUrl,
          image_url: mediaUrl,
          url: mediaUrl,

          type: isVideo(post, mediaUrl) ? "reel" : "post",
          caption: post.caption || "",
        }
      })
      .filter(
        (post: any) =>
          post.videoUrl && isVideo(post, post.videoUrl)
      )
      .slice(0, limit)

    // STEP 6: RETURN REELS
    return NextResponse.json(
      {
        reels,
        posts: reels,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error: any) {
    console.error("Reels API error:", error?.message || error)

    return NextResponse.json(
      {
        reels: [],
        posts: [],
        error: "Unable to load reels",
      },
      { status: 500 }
    )
  }
      }
