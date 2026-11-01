import { NextRequest, NextResponse } from "next/server"
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"

import { supabase } from "../../../lib/supabase"
import { supabaseAdmin } from "../../../lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// R2 STORAGE CONFIGURATIONS
const R2_CONFIGS = [1, 2, 3, 4, 5]
  .map((i) => ({
    id: i,
    accountId:
      process.env[`R2_ACCOUNT_ID_${i}`] ||
      process.env.R2_ACCOUNT_ID,
    accessKey:
      process.env[`R2_ACCESS_KEY_${i}`] ||
      process.env.R2_ACCESS_KEY_ID,
    secretKey:
      process.env[`R2_SECRET_KEY_${i}`] ||
      process.env.R2_SECRET_ACCESS_KEY,
    bucket:
      process.env[`R2_BUCKET_${i}`] ||
      process.env.R2_BUCKET_NAME ||
      process.env.R2_BUCKET ||
      "chitpix",
    publicUrl:
      process.env[`R2_URL_${i}`] ||
      process.env.R2_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  }))
  .filter(
    (c, i, self) =>
      c.accountId &&
      c.accessKey &&
      c.secretKey &&
      c.publicUrl &&
      self.findIndex((x) => x.accountId === c.accountId) === i
  )

const PRIMARY = R2_CONFIGS[0]

function getClient(cfg: any) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKey,
      secretAccessKey: cfg.secretKey,
    },
  })
}

const POSTS_KEY = "data/posts.json"
const STORIES_KEY = "data/stories.json"

// R2 JSON HELPERS
async function getData(key: string) {
  if (!PRIMARY) return []

  try {
    const R2 = getClient(PRIMARY)

    const res = await R2.send(
      new GetObjectCommand({
        Bucket: PRIMARY.bucket,
        Key: key,
      })
    )

    const text = await res.Body?.transformToString()

    return text ? JSON.parse(text) : []
  } catch {
    return []
  }
}

async function saveData(key: string, data: any) {
  if (!PRIMARY) {
    throw new Error("R2 storage is not configured")
  }

  const R2 = getClient(PRIMARY)

  await R2.send(
    new PutObjectCommand({
      Bucket: PRIMARY.bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
      CacheControl: "no-cache",
    })
  )
}

// NOTIFICATION HELPER
async function notifyFollowers(
  actorId: string,
  contentId: string,
  type: "post" | "reel" | "story",
  username: string
) {
  try {
    const { data: followers, error: followError } =
      await supabaseAdmin
        .from("user_follows")
        .select("follower_id")
        .eq("following_id", actorId)

    if (followError) {
      console.error("Notification followers error:", followError)
      return
    }

    const recipientIds: string[] = (followers || [])
      .map((f: any) => f.follower_id)
      .filter(
        (id: string, index: number, arr: string[]) =>
          Boolean(id) &&
          id !== actorId &&
          arr.indexOf(id) === index
      )

    if (recipientIds.length === 0) return

    const messages = {
      post: `${username} shared a new post`,
      reel: `${username} shared a new reel`,
      story: `${username} added a new story`,
    }

    const rows = recipientIds.map((recipientId) => ({
      recipient_id: recipientId,
      actor_id: actorId,
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
    } else {
      console.log(
        `${type} notifications sent to ${rows.length} followers`
      )
    }
  } catch (error) {
    console.error("Notification helper error:", error)
  }
}

// UPLOAD API
export async function POST(req: NextRequest) {
  try {
    if (!PRIMARY?.publicUrl) {
      return NextResponse.json(
        { error: "R2_PUBLIC_URL missing or R2 configuration incomplete" },
        { status: 500 }
      )
    }

    const contentType = req.headers.get("content-type") || ""

    let publicUrl = ""
    let username = "knmahesh"
    let caption = ""
    let fileName = ""
    let uploadType = "post"
    let isPermanentRaw: any = null

    let fileBuffer: Buffer | null = null
    let fileExt = "jpg"
    let fileMime = "image/jpeg"

    // JSON OR FORM DATA
    if (contentType.includes("application/json")) {
      const body = await req.json()

      publicUrl =
        body.url ||
        body.publicUrl ||
        body.image_url ||
        ""

      username = body.username || "knmahesh"
      caption = body.caption || ""
      uploadType = body.type || body.uploadType || "post"

      isPermanentRaw =
        body.isPermanent ??
        body.isR2Permanent ??
        null
    } else {
      const formData = await req.formData()

      const file = formData.get("file") as File | null

      username =
        (formData.get("username") as string) ||
        "knmahesh"

      caption =
        (formData.get("caption") as string) || ""

      uploadType =
        (formData.get("type") as string) ||
        (formData.get("uploadType") as string) ||
        "post"

      const urlFromForm =
        (formData.get("url") as string) ||
        (formData.get("publicUrl") as string)

      isPermanentRaw =
        formData.get("isPermanent") ||
        formData.get("isR2Permanent")

      if (urlFromForm) {
        publicUrl = urlFromForm
      } else {
        if (!file) {
          return NextResponse.json(
            { error: "No file" },
            { status: 400 }
          )
        }

        fileExt =
          file.name.split(".").pop()?.toLowerCase() || "jpg"

        fileMime = file.type || `image/${fileExt}`

        fileBuffer = Buffer.from(await file.arrayBuffer())
      }
    }

    // UPLOAD FILE TO R2
    if (fileBuffer) {
      const folder =
        uploadType === "story" ? "stories" : "posts"

      const key =
        `${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${fileExt}`

      let uploaded = false

      const configs = [...R2_CONFIGS].sort(
        () => 0.5 - Math.random()
      )

      for (const cfg of configs) {
        try {
          await getClient(cfg).send(
            new PutObjectCommand({
              Bucket: cfg.bucket,
              Key: key,
              Body: fileBuffer,
              ContentType: fileMime,
              CacheControl:
                "public, max-age=31536000, immutable",
            })
          )

          publicUrl =
            `${cfg.publicUrl.replace(/\/$/, "")}/${key}`

          fileName = key
          uploaded = true
          break
        } catch (error) {
          console.error(`R2 key ${cfg.id} upload failed`)
          continue
        }
      }

      if (!uploaded) {
        return NextResponse.json(
          { error: "All R2 storage uploads failed" },
          { status: 500 }
        )
      }
    }

    if (!publicUrl) {
      return NextResponse.json(
        { error: "Media URL is missing" },
        { status: 400 }
      )
    }

    const isVideo = Boolean(
      publicUrl
        .toLowerCase()
        .split("?")[0]
        .match(/\.(mp4|mov|webm|m4v)$/)
    )

    const isPermanent =
      isPermanentRaw === true ||
      isPermanentRaw === "true" ||
      isPermanentRaw === "1"

    // GET AUTHENTICATED USER
    let realUserId: string | null = null
    let realUsername = username.toLowerCase()

    try {
      const authHeader = req.headers.get("authorization")

      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, "")

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token)

        if (!error && user) {
          realUserId = user.id
          realUsername =
            user.email?.split("@")[0] || realUsername
        }
      } else {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (!error && user) {
          realUserId = user.id
          realUsername =
            user.email?.split("@")[0] || realUsername
        }
      }
    } catch (authError) {
      console.error("Upload authentication error:", authError)
    }

    // GET PROFILE USERNAME
    if (realUserId) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("username")
          .eq("id", realUserId)
          .maybeSingle()

        if (profile?.username) {
          realUsername = profile.username
        }
      } catch (error) {
        console.error("Profile username lookup error:", error)
      }
    }

    // STORY UPLOAD
    if (uploadType === "story") {
      const now = new Date()

      const newStory = {
        id: Date.now().toString(),
        image_url: publicUrl,
        url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: realUsername,
        user_id: realUserId,
        caption,
        fileName,
        created_at: now.toISOString(),
        expires_at: isPermanent
          ? null
          : new Date(
              now.getTime() + 24 * 60 * 60 * 1000
            ).toISOString(),
        type: "story",
        views: 0,
        isR2Permanent: isPermanent,
        viewsText: isPermanent
          ? "0 views • R2 Permanent ♾️"
          : "0 views • 24h left",
      }

      const stories = await getData(STORIES_KEY)

      await saveData(
        STORIES_KEY,
        [newStory, ...stories].slice(0, 500)
      )

      // SAVE STORY RECORD TO SUPABASE
      if (realUserId) {
        try {
          const { error } = await supabaseAdmin
            .from("stories")
            .insert({
              user_id: realUserId,
              image_url: publicUrl,
              caption,
              expires_at: newStory.expires_at,
            })

          if (error) {
            console.error("Supabase story insert error:", error)
          }
        } catch (error) {
          console.error("Supabase story save error:", error)
        }

        // SEND STORY NOTIFICATIONS
        await notifyFollowers(
          realUserId,
          newStory.id,
          "story",
          realUsername
        )
      }

      return NextResponse.json({
        success: true,
        url: publicUrl,
        story: newStory,
        keys_active: R2_CONFIGS.length,
      })
    }

    // POST OR REEL UPLOAD
    const newPost = {
      id: Date.now().toString(),
      image_url: publicUrl,
      url: publicUrl,
      video_url: isVideo ? publicUrl : undefined,
      username: realUsername,
      user_id: realUserId,
      caption,
      content: caption,
      fileName,
      created_at: new Date().toISOString(),
      type: isVideo ? "reel" : "post",
      likes: 0,
      views: "0 views • R2 Permanent",
    }

    const posts = await getData(POSTS_KEY)

    await saveData(
      POSTS_KEY,
      [newPost, ...posts].slice(0, 1000)
    )

    // SAVE POST OR REEL TO SUPABASE
    if (realUserId) {
      try {
        const { error } = await supabaseAdmin
          .from("posts")
          .insert({
            user_id: realUserId,
            image_url: publicUrl,
            caption,
            type: isVideo ? "reel" : "post",
            username: realUsername,
          })

        if (error) {
          console.error("Supabase post insert error:", error)
        }
      } catch (error) {
        console.error("Supabase post save error:", error)
      }

      // SEND POST OR REEL NOTIFICATIONS
      await notifyFollowers(
        realUserId,
        newPost.id,
        isVideo ? "reel" : "post",
        realUsername
      )
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      post: newPost,
      keys_active: R2_CONFIGS.length,
    })
  } catch (e: any) {
    console.error("Upload API error:", e)

    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    )
  }
}

// API STATUS
export async function GET() {
  return NextResponse.json({
    status: `Ready ✅ ${R2_CONFIGS.length} Keys`,
    buckets: R2_CONFIGS.map((c) => ({
      id: c.id,
      bucket: c.bucket,
    })),
  })
  }
        
