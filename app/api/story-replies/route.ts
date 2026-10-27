
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET =
  process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "chitpix"
const KEY = "data/story-replies.json"

async function getReplies() {
  try {
    const result = await R2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: KEY })
    )
    const text = await result.Body?.transformToString()
    const data = text ? JSON.parse(text) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function saveReplies(replies: any[]) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(replies),
      ContentType: "application/json",
      CacheControl: "no-cache",
    })
  )
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const storyId = searchParams.get("storyId")

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId required" },
        { status: 400 }
      )
    }

    const replies = await getReplies()
    return NextResponse.json({
      replies: replies.filter((r: any) => r.storyId === storyId),
    })
  } catch {
    return NextResponse.json(
      { error: "Could not load replies" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const storyId = String(body.storyId || "").trim()
    const username = String(body.username || "").trim().toLowerCase()
    const message = String(body.message || "").trim()
    const storyOwner = String(body.storyOwner || "").trim().toLowerCase()

    if (!storyId || !username || !message) {
      return NextResponse.json(
        { error: "storyId, username and message required" },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Reply is too long (max 1000 characters)" },
        { status: 400 }
      )
    }

    const replies = await getReplies()
    const reply = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storyId,
      username,
      message,
      created_at: new Date().toISOString(),
    }

    const updated = [reply, ...replies].slice(0, 5000)
    await saveReplies(updated)

    if (storyOwner && storyOwner !== username) {
      try {
        await fetch(new URL("/api/notifications", req.url), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toUser: storyOwner,
            fromUser: username,
            type: "story_reply",
            message: `${username} replied to your story`,
            storyId,
          }),
        })
      } catch (error) {
        console.error("Story reply notification failed:", error)
      }
    }

    return NextResponse.json({ success: true, reply })
  } catch (error: any) {
    console.error("Story replies API error:", error)
    return NextResponse.json(
      { error: "Could not save reply" },
      { status: 500 }
    )
  }
}
