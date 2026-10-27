
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

const STORIES_KEY = "data/stories.json"
const VIEWS_KEY = "data/story-views.json"

async function readJson(key: string): Promise<any[]> {
  try {
    const result = await R2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    )
    const text = await result.Body?.transformToString()
    const data = text ? JSON.parse(text) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function saveJson(key: string, data: any[]) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
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

    const views = await readJson(VIEWS_KEY)
    const storyViews = views.filter(
      (view: any) => String(view.storyId) === storyId
    )

    return NextResponse.json({
      success: true,
      count: storyViews.length,
      viewers: storyViews.map((view: any) => ({
        username: view.username,
        viewed_at: view.viewed_at,
      })),
    })
  } catch (error: any) {
    console.error("Story views GET error:", error)
    return NextResponse.json(
      { error: "Could not load story views" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const storyId = String(body.storyId || "").trim()
    const username = String(body.username || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase()

    if (!storyId || !username) {
      return NextResponse.json(
        { error: "storyId and username required" },
        { status: 400 }
      )
    }

    const stories = await readJson(STORIES_KEY)
    const story = stories.find(
      (item: any) => String(item.id) === storyId
    )

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      )
    }

    // Story owner chusthe own view ga count cheyyaku.
    const owner = String(story.username || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase()

    if (username === owner) {
      return NextResponse.json({
        success: true,
        count: Number(story.views || 0),
        alreadyViewed: true,
      })
    }

    const views = await readJson(VIEWS_KEY)

    const alreadyViewed = views.some(
      (view: any) =>
        String(view.storyId) === storyId &&
        String(view.username || "")
          .trim()
          .replace(/^@/, "")
          .toLowerCase() === username
    )

    if (!alreadyViewed) {
      views.push({
        storyId,
        username,
        viewed_at: new Date().toISOString(),
      })

      story.views = Number(story.views || 0) + 1

      await saveJson(VIEWS_KEY, views)
      await saveJson(STORIES_KEY, stories)
    }

    return NextResponse.json({
      success: true,
      count: Number(story.views || 0),
      alreadyViewed,
    })
  } catch (error: any) {
    console.error("Story views POST error:", error)
    return NextResponse.json(
      { error: "Could not save story view" },
      { status: 500 }
    )
  }
}
