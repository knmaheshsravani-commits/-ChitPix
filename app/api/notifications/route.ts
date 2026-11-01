import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseAdmin } from "../../../lib/supabaseAdmin"

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
        setAll() {},
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

// CREATE POST / REEL / STORY NOTIFICATIONS
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
    const type = body?.type
    const contentId = body?.content_id

    if (!["post", "reel", "story"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification type" },
        { status: 400 }
      )
    }

    if (
      typeof contentId !== "string" ||
      !contentId.trim() ||
      contentId.length > 200
    ) {
      return NextResponse.json(
        { success: false, error: "Valid content_id is required" },
        { status: 400 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()

    const username = profile?.username || "Someone"

    const { data: followers, error: followError } =
      await supabaseAdmin
        .from("user_follows")
        .select("follower_id")
        .eq("following_id", user.id)

    if (followError) {
      console.error("Followers error:", followError)

      return NextResponse.json(
        { success: false, error: "Could not load followers" },
        { status: 500 }
      )
    }

    const recipientIds = Array.from(
  new Set(
    (followers || [])
      .map((f: any) => f.follower_id)
      .filter((id: string) => id && id !== user.id)
  )
)

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
      content_id: contentId.trim(),
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

    const notifications = data || []

    const actorIds = Array.from(
  new Set(
    notifications
      .map((n: any) => n.actor_id)
      .filter(Boolean)
  )
)

    let profiles: any[] = []

    if (actorIds.length > 0) {
      const { data: profileData, error: profileError } =
        await supabaseAdmin
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", actorIds)

      if (profileError) {
        console.error("Notification profiles error:", profileError)
      } else {
        profiles = profileData || []
      }
    }

    const result = notifications.map((n: any) => {
      const actor = profiles.find(
        (p: any) => p.id === n.actor_id
      )

      return {
        ...n,
        actor_username: actor?.username || "ChitPix User",
        actor_avatar_url: actor?.avatar_url || null,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Notification GET error:", error)

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}

// MARK ONE OR ALL NOTIFICATIONS AS READ
export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please login first" },
        { status: 401 }
      )
    }

    const body = await req.json()

    let query = supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)

    if (body?.markAll === true) {
      query = query.eq("is_read", false)
    } else if (
      typeof body?.id === "string" &&
      body.id.trim()
    ) {
      query = query.eq("id", body.id)
    } else {
      return NextResponse.json(
        { success: false, error: "Notification id or markAll required" },
        { status: 400 }
      )
    }

    const { error } = await query

    if (error) {
      console.error("Mark read error:", error)

      return NextResponse.json(
        { success: false, error: "Could not update notification" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification PATCH error:", error)

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
              }
       
