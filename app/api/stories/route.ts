import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET =
  process.env.R2_BUCKET_NAME ||
  process.env.R2_BUCKET ||
  "chitpix"

const STORIES_KEY = "data/stories.json"

const HOURS_24 = 24 * 60 * 60 * 1000

// READ ALL STORIES
async function readStories() {
  try {
    const res = await R2.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: STORIES_KEY,
      })
    )

    const text = await res.Body?.transformToString()

    if (!text) return []

    const data = JSON.parse(text)

    return Array.isArray(data) ? data : []
  } catch (error: any) {
    if (
      error?.name === "NoSuchKey" ||
      error?.name === "NotFound" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return []
    }

    throw error
  }
}

// SAVE ALL STORIES
async function saveStories(stories: any[]) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: STORIES_KEY,
      Body: JSON.stringify(stories, null, 2),
      ContentType: "application/json",
      CacheControl: "no-cache",
    })
  )
}

// CHECK 24 HOURS
function isActiveStory(story: any) {
  const now = Date.now()

  const created = new Date(
    story.created_at || 0
  ).getTime()

  if (!Number.isFinite(created) || !created) {
    return false
  }

  const expiry = story.expires_at
    ? new Date(story.expires_at).getTime()
    : created + HOURS_24

  return (
    now < expiry &&
    now - created < HOURS_24
  )
}

// GET ALL USERS STORIES
export async function GET() {
  try {
    let stories = await readStories()

    const activeStories = stories.filter(
      (story: any) => isActiveStory(story)
    )

    // CLEAN EXPIRED STORIES
    if (activeStories.length !== stories.length) {
      await saveStories(activeStories)

      console.log("Expired stories cleaned")
    }

    // NEWEST STORIES FIRST
    activeStories.sort((a: any, b: any) => {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      )
    })

    return NextResponse.json(
      activeStories,
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error: any) {
    console.error("GET STORIES ERROR:", error)

    return NextResponse.json(
      {
        error: error.message || "Stories load failed",
      },
      { status: 500 }
    )
  }
}

// CREATE NEW STORY
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const username = String(
      body.username || ""
    )
      .trim()
      .replace(/^@/, "")

    const imageUrl =
      body.image_url ||
      body.url ||
      body.video_url ||
      ""

    if (!username) {
      return NextResponse.json(
        {
          error: "Username missing. Login and send username.",
        },
        { status: 400 }
      )
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Story image or video missing" },
        { status: 400 }
      )
    }

    if (
      !/^https?:\/\//i.test(String(imageUrl))
    ) {
      return NextResponse.json(
        { error: "Invalid story URL" },
        { status: 400 }
      )
    }

    const now = Date.now()

    // REMOVE EXPIRED STORIES
    let stories = await readStories()

    stories = stories.filter(
      (story: any) => isActiveStory(story)
    )

    // CREATE STORY
    const story = {
      id: `${now}_${Math.random().toString(36).slice(2, 9)}`,

      user_id: body.user_id || "",

      username,

      avatar_url: body.avatar_url || "",

      image_url: imageUrl,

      url: imageUrl,

      video_url: body.video_url || "",

      caption: body.caption || "",

      created_at: new Date(now).toISOString(),

      expires_at: new Date(
        now + HOURS_24
      ).toISOString(),

      views: 0,

      type: "story",

      isR2Permanent: false,

      viewsText: "24h story • Auto delete after 24h",
    }

    // ADD NEW STORY
    stories.unshift(story)

    // MAXIMUM 1000 STORIES
    stories = stories.slice(0, 1000)

    await saveStories(stories)

    return NextResponse.json(
      {
        success: true,
        story,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("POST STORY ERROR:", error)

    return NextResponse.json(
      {
        error: error.message || "Story upload failed",
      },
      { status: 500 }
    )
  }
}

// DELETE STORY
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Story ID missing" },
        { status: 400 }
      )
    }

    let stories = await readStories()

    const exists = stories.some(
      (story: any) => String(story.id) === String(id)
    )

    if (!exists) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      )
    }

    stories = stories.filter(
      (story: any) => String(story.id) !== String(id)
    )

    await saveStories(stories)

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    })
  } catch (error: any) {
    console.error("DELETE STORY ERROR:", error)

    return NextResponse.json(
      {
        error: error.message || "Story delete failed",
      },
      { status: 500 }
    )
  }
      }
