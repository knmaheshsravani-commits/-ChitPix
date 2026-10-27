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

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "chitpix"
const KEY = "data/story-likes.json"

async function getLikes() {
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

async function saveLikes(likes: any[]) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(likes),
      ContentType: "application/json",
      CacheControl: "no-cache",
    })
  )
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const storyId = searchParams.get("storyId")
    const username = (searchParams.get("username") || "")
  .trim()
  .replace(/^@/, "")
  .toLowerCase()
    const likes = await getLikes()

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId required" },
        { status: 400 }
      )
    }

    const storyLikes = likes.filter(
      (like: any) => like.storyId === storyId
    )

    return NextResponse.json({
      count: storyLikes.length,
      liked: username
  ? storyLikes.some(
      (like: any) =>
        String(like.username || "").trim().replace(/^@/, "").toLowerCase() === username
    )
  : false,
    })
  } catch {
    return NextResponse.json(
      { error: "Could not load story likes" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const storyId = String(body.storyId || "")
    const username = String(body.username || "").trim().toLowerCase()

    if (!storyId || !username) {
      return NextResponse.json(
        { error: "storyId and username required" },
        { status: 400 }
      )
    }

    const likes = await getLikes()
    const exists = likes.some(
      (like: any) =>
        like.storyId === storyId && like.username === username
    )

    let updatedLikes: any[]
    let action: string

    if (exists) {
      updatedLikes = likes.filter(
        (like: any) =>
          !(like.storyId === storyId && like.username === username)
      )
      action = "unliked"
    } else {
      updatedLikes = [
        ...likes,
        {
          id: `${storyId}_${username}`,
          storyId,
          username,
          created_at: new Date().toISOString(),
        },
      ]
      action = "liked"
    }

    await saveLikes(updatedLikes)

    if (action === "liked" && body.storyOwner) {
      const storyOwner = String(body.storyOwner).trim().toLowerCase()

      if (storyOwner && storyOwner !== username) {
        try {
          await fetch(new URL("/api/notifications", req.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toUser: storyOwner,
              fromUser: username,
              type: "story_like",
              message: `${username} liked your story`,
              storyId,
            }),
          })
        } catch (error) {
          console.error("Story like notification failed:", error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      count: updatedLikes.filter(
        (like: any) => like.storyId === storyId
      ).length,
    })
  } catch (error: any) {
    console.error("Story likes API error:", error)
    return NextResponse.json(
      { error: "Could not save story like" },
      { status: 500 }
    )
  }
}
