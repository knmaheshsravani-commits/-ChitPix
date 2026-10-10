import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET! || process.env.R2_BUCKET_NAME!
const POSTS_KEY = "data/posts.json"

async function getPostsFromR2() {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }))
    const text = await res.Body?.transformToString()
    return text? JSON.parse(text) : []
  } catch {
    return [] // First time file lekapothe empty
  }
}

// GET - Home lo andari posts - 5 sec refresh tho andari ki kanipistadi
export async function GET() {
  const posts = await getPostsFromR2()
  return NextResponse.json(posts, { headers: { "Cache-Control": "no-store" } })
}

// POST - R2 lo Photo + R2 lone posts.json update - A to Z R2 ONLY
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, filename, folder, caption, username } = body

    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 })

    // Base64 to Buffer
    const buffer = Buffer.from(image.split(",")[1], "base64")
    const key = `${folder || 'posts'}/${Date.now()}_${(filename || 'post').replaceAll(" ", "_")}.jpg`

    // 1. Photo R2 lo upload
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    }))

    const url = `${process.env.R2_PUBLIC_URL}/${key}`

    // 2. Posts list R2 lone update - Supabase 0% - Ide main fix!
    const posts = await getPostsFromR2()
    const newPost = {
      id: Date.now().toString(),
      image_url: url,
      caption: caption || "",
      username: username || "knmahesh",
      likes: 0,
      user_photo: "",
      created_at: new Date().toISOString(),
    }

    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify([newPost,...posts]),
      ContentType: 'application/json',
    }))

    return NextResponse.json({ url, post: newPost })

  } catch (e: any) {
    console.error("R2 ERROR:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
