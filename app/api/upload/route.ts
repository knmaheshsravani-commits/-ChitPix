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

// ✅ FIX 1: ! teesesanu - crash avvakunda
const BUCKET = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || ""
const POSTS_KEY = "data/posts.json"

async function getPostsFromR2() {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }))
    // @ts-ignore - SDK v3 lo string ga vastadi
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch { 
    return [] 
  }
}

export async function POST(req: NextRequest) {
  try {
    // Env check - 500 error rakunda
    if (!BUCKET || !process.env.R2_ENDPOINT || !process.env.R2_PUBLIC_URL) {
      throw new Error("R2 Env missing - Vercel Settings lo check chey")
    }

    const form = await req.formData()
    const file = form.get("file") as File
    const type = (form.get("type") as string) || "posts"
    const caption = (form.get("caption") as string) || "New Reel 🔥 #chitpix"
    const username = (form.get("username") as string) || "Knmahesh"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    // 100MB check
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large - Max 100MB" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const isVideo = file.type.startsWith("video/")
    
    // ✅ FIX 2: Clean file name - double .mp4 radu
    const cleanName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
    const ext = cleanName.split(".").pop() || (isVideo ? "mp4" : "jpg")
    const baseName = cleanName.replace(`.${ext}`, "")
    const key = `${type}/${Date.now()}_${baseName}.${ext}`

    // 1. R2 Upload - Full HD
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
    }))

    // ✅ FIX 3: Public URL - / correct ga
    const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/$/, "")
    const url = `${publicBase}/${key}`

    // 2. posts.json update - Andariki same feed 20k users ki
    const posts = await getPostsFromR2()
    const newPost = {
      id: Date.now().toString(),
      image: url,
      image_url: url,
      video: isVideo ? url : null,
      video_url: isVideo ? url : null,
      isVideo: isVideo,
      caption,
      username,
      user_avatar: `https://i.pravatar.cc/150?u=${username}`,
      likes: 0,
      likes_count: 0,
      liked_by: [], // Future: like feature kosam
      comments: 0,
      comments_list: [], // Future: comment feature kosam
      reposts: 0,
      shares: 0,
      saves: 0,
      music: "Original audio - Knmahesh",
      created_at: new Date().toISOString(),
      type: type
    }

    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify([newPost, ...posts], null, 2),
      ContentType: 'application/json',
    }))

    console.log("SUCCESS:", url)

    return NextResponse.json({ 
      url, 
      secure_url: url, 
      post: newPost,
      success: true 
    })

  } catch (e: any) {
    console.error("R2 UPLOAD ERROR:", e)
    return NextResponse.json({ error: e.message, url: "" }, { status: 500 })
  }
}
