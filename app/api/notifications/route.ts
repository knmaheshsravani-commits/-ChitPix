import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

async function getAuthenticatedUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only authentication in this API route
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return user
}

// CREATE NOTIFICATIONS FOR FOLLOWERS
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please login first" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const type = body.type
    const contentId = body.content_id

    if (!["post", "reel", "story"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification type" },
        { status: 400 }
      )
    }

    if (
      !contentId ||
      typeof contentId !== "string" ||
      contentId.length > 200
    ) {
      return NextResponse.json(
        { success: false, error: "Valid content_id is required" },
        { status: 400 }
      )
    }

    // Get creator username
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()

    const username = profile?.username || "Someone"

    // Get followers from Supabase
    const { data: followers, error: followError } = await supabaseAdmin
      .from("user_follows")
      .select("follower_id")
      .eq("following_id", user.id)

    if (followError) {
      console.error("Followers fetch error:", followError)

      return NextResponse.json(
        { success: false, error: "Could not load followers" },
        { status: 500 }
      )
    }

    const recipientIds = [
      ...new Set(
        (followers || [])
          .map((f: any) => f.follower_id)
          .filter((id: string) => id && id !== user.id)
      ),
    ]

    if (recipientIds.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No followers to notify",
      })
    }

    const messages: Record<string, string> = {
      post: `${username} shared a new post`,
      reel: `${username} shared a new reel`,
      story: `${username} added a new story`,
    }

    const rows = recipientIds.map((recipientId) => ({
      recipient_id: recipientId,
      actor_id: user.id,
      type,
      content_id: contentId,
      message: messages[type],
      is_read: false,
    }))

    const { error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert(rows)

    if (insertError) {
      console.error("Notification insert error:", insertError)

      return NextResponse.json(
        { success: false, error: "Could not save notifications" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sent: rows.length,
    })
  } catch (error) {
    console.error("Notification POST error:", error)

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}

// GET MY NOTIFICATIONS
export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please login first" },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Notification GET error:", error)

      return NextResponse.json(
        { success: false, error: "Could not load notifications" },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Notification GET error:", error)

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
          }
