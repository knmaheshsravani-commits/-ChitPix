import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

const R2_ENDPOINT = process.env.R2_ENDPOINT!
const R2_ACCESS = process.env.R2_ACCESS_KEY_ID || (process.env as any).R2_ACCE_KEY_ID || process.env.R2_ACCESS_KEY || ""
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY || (process.env as any).R2_SECR_SS_KEY || process.env.R2_SECRET_KEY || ""
const R2_BUCKET = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || ""
const R2_PUBLIC = process.env.R2_PUBLIC_URL || ""

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS, secretAccessKey: R2_SECRET },
})

const POSTS_KEY = "data/posts.json"

async function getPostsFromR2() {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: POSTS_KEY }))
    // @ts-ignore
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch { return [] }
}

export async function POST(req: NextRequest) {
  try {
    if (!R2_BUCKET || !R2_ENDPOINT || !R2_PUBLIC || !R2_ACCESS) {
      throw new Error("R2 Env missing - Vercel lo R2_ACCESS_KEY_ID add chey")
    }
    const form = await req.formData()
    const file = form.get("file") as File
    const type = (form.get("type") as string) || "posts"
    const caption = (form.get("caption") as string) || "New Reel 🔥 #chitpix"
    const username = (form.get("username") as string) || "Knmahesh"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "Max 100MB" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const isVideo = file.type.startsWith("video/")
    const cleanName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
    const ext = cleanName.split(".").pop() || (isVideo ? "mp4" : "jpg")
    const baseName = cleanName.replace(`.${ext}`, "")
    const key = `${type}/${Date.now()}_${baseName}.${ext}`

    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: file.type,
    }))

    const url = `${R2_PUBLIC.replace(/\/$/, "")}/${key}`
    const posts = await getPostsFromR2()
    const newPost = {
      id: Date.now().toString(), image: url, image_url: url,
      video: isVideo ? url : null, video_url: isVideo ? url : null, isVideo,
      caption, username, user_avatar: `https://i.pravatar.cc/150?u=${username}`,
      likes: 0, comments: 0, saves: 0, created_at: new Date().toISOString(), type
    }
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET, Key: POSTS_KEY, Body: JSON.stringify([newPost, ...posts]), ContentType: 'application/json',
    }))
    return NextResponse.json({ url, secure_url: url, post: newPost, success: true })
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
