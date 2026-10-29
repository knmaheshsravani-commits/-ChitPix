import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase server environment variables missing")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// LOAD COMMENTS
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Load comments error:", error.message)
      return NextResponse.json(
        { error: "Could not load comments" },
        { status: 500 }
      )
    }

    return NextResponse.json({ comments: data || [] })
  } catch (error: any) {
    console.error("Comments GET error:", error.message)
    return NextResponse.json(
      { error: "Server error loading comments" },
      { status: 500 }
    )
  }
}

// SAVE COMMENT
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const postId = String(body.postId || body.post_id || "").trim()
    const content = String(body.text || body.content || "").trim()
    const userId = String(body.userId || body.user_id || "").trim()
    const username = String(body.username || "ChitPix user").trim()
    const userPhoto = body.userPhoto || body.user_photo || null
    const parentId = body.parentId || body.parent_id || null

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and comment text are required" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Please login before commenting" },
        { status: 401 }
      )
    }

    const supabase = getSupabase()

    const { data: user, error: userError } =
      await supabase.auth.admin.getUserById(userId)

    if (userError || !user?.user) {
      return NextResponse.json(
        { error: "Logged-in user could not be verified" },
        { status: 401 }
      )
    }

    const actualUsername = String(
      user.user.user_metadata?.username ||
      user.user.user_metadata?.full_name ||
      user.user.email?.split("@")[0] ||
      username
    )

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        username: actualUsername,
        content,
        user_photo: userPhoto,
        parent_id: parentId,
        likes: 0,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Save comment error:", error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, comment: data },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Comments POST error:", error?.message || error)
    return NextResponse.json(
      { error: "Server error saving comment" },
      { status: 500 }
    )
  }
}
