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
    return text ? JSON.parse(text) : []
  } catch { return [] }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File
    const type = (form.get("type") as string) || "posts"
    const caption = (form.get("caption") as string) || "New Reel 🔥 #chitpix"
    const username = (form.get("username") as string) || "Knmahesh"

    if (!file) return NextResponse.json({ error: "No file", url: "" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const isVideo = file.type.startsWith("video/")
    const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")
    const key = `${type}/${Date.now()}_${file.name.replaceAll(" ", "_").replaceAll(/[^a-zA-Z0-9._-]/g,"")}.${ext}`.replace(`.${ext}.${ext}`, `.${ext}`)

    // 1. R2 lo Full HD Upload - 100MB varaku
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
    }))

    const url = `${process.env.R2_PUBLIC_URL}/${key}`

    // 2. posts.json update - Andariki kanipinchadaniki
    const posts = await getPostsFromR2()
    const newPost = {
      id: Date.now().toString(),
      image: url,
      image_url: url,
      video: isVideo ? url : null,
      isVideo: isVideo,
      caption,
      username,
      likes: 0, comments: 0, reposts: 0, shares: 0, saves: 0,
      music: "Original audio",
      created_at: new Date().toISOString(),
      type: type
    }

    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify([newPost, ...posts]),
      ContentType: 'application/json',
    }))

    return NextResponse.json({ url, secure_url: url, post: newPost })

  } catch (e: any) {
    console.error("R2 UPLOAD ERROR:", e)
    return NextResponse.json({ error: e.message, url: "" }, { status: 500 })
  }
}
