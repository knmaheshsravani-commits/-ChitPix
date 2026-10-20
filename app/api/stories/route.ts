import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix'
const STORIES_KEY = "data/stories.json"

const HOURS_24 = 24 * 60 * 60 * 1000 // 86400000 ms

export async function GET() {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY }))
    const text = await res.Body?.transformToString()
    let stories = text ? JSON.parse(text) : []

    // 24H AUTO DELETE LOGIC
    const now = Date.now()
    const validStories = stories.filter((s: any) => {
      const created = new Date(s.created_at).getTime()
      const isValid = now - created < HOURS_24
      return isValid
    })

    // Auto cleanup - expired stories ni R2 nundi kuda delete chey
    if (validStories.length !== stories.length) {
      await R2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: STORIES_KEY,
        Body: JSON.stringify(validStories, null, 2),
        ContentType: "application/json",
        CacheControl: 'no-cache'
      }))
      console.log(`Cleaned ${stories.length - validStories.length} expired stories`)
    }

    validStories.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return NextResponse.json(validStories)
  } catch (e: any) {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.image_url && !body.url) return NextResponse.json({ error: "No image" }, { status: 400 })

    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY })).catch(() => null)
    const text = (res as any)?.Body ? await (res as any).Body?.transformToString() : null
    let stories = text ? JSON.parse(text) : []

    // Cleanup old before adding new
    const now = Date.now()
    stories = stories.filter((s: any) => now - new Date(s.created_at).getTime() < HOURS_24)

    const story = {
      id: Date.now().toString(),
      image_url: body.image_url || body.url,
      url: body.image_url || body.url,
      video_url: body.video_url,
      username: (body.username || "knmahesh").toLowerCase(),
      avatar_url: body.avatar_url || `https://i.pravatar.cc/100?u=${body.username}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(now + HOURS_24).toISOString(), // 24h expiry time
      caption: body.caption || "",
      views: 0,
      type: 'story',
      isR2Permanent: false,
      viewsText: '24h story • Auto delete after 24h'
    }

    stories.unshift(story)
    stories = stories.slice(0, 1000)

    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: STORIES_KEY,
      Body: JSON.stringify(stories, null, 2),
      ContentType: "application/json",
      CacheControl: 'no-cache'
    }))

    return NextResponse.json(story)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Optional: DELETE - Manual delete
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY }))
    const text = await res.Body?.transformToString()
    let stories = text ? JSON.parse(text) : []
    stories = stories.filter((s: any) => s.id !== id)
    await R2.send(new PutObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY, Body: JSON.stringify(stories, null, 2), ContentType: "application/json", CacheControl: 'no-cache' }))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
