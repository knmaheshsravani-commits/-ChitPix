import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Top level lo client create cheyaku - build fail avuthundi
function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT
  const accessKey = process.env.R2_ACCESS_KEY_ID
  const secret = process.env.R2_SECRET_ACCESS_KEY
  if (!endpoint || !accessKey || !secret) return null
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secret },
  })
}

async function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const { createClient } = await import("@supabase/supabase-js")
  return createClient(url, key)
}

const POSTS_KEY = "data/posts.json"

async function getPostsFromR2(client: S3Client, bucket: string) {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: POSTS_KEY }))
    // @ts-ignore
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch { return [] }
}

export async function GET() {
  try {
    const client = getR2Client()
    const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || ""
    if (!client || !bucket) return NextResponse.json({ posts: [], success: true })
    const posts = await getPostsFromR2(client, bucket)
    return NextResponse.json({ posts, success: true })
  } catch (e: any) {
    return NextResponse.json({ posts: [], error: e.message })
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getR2Client()
    const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || ""
    const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""

    if (!client || !bucket) throw new Error("R2 Env missing - Vercel Settings check chey bro")

    const form = await req.formData()
    const file = form.get("file") as File
    const type = (form.get("type") as string) || "reels"
    const caption = (form.get("caption") as string) || "New Reel 🔥 #chitpix"
    const username = (form.get("username") as string) || "knmahesh"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const isVideo = file.type.startsWith("video/")
    const cleanName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
    const ext = cleanName.split(".").pop() || (isVideo ? "mp4" : "jpg")
    const baseName = cleanName.replace(`.${ext}`, "")
    const key = `${type}/${Date.now()}_${baseName}.${ext}`

    // 1. R2 upload
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: file.type }))
    const url = publicUrl ? `${publicUrl.replace(/\/$/, "")}/${key}` : key

    // 2. R2 json backup
    const posts = await getPostsFromR2(client, bucket)
    const newPost = {
      id: Date.now().toString(),
      image: url, image_url: url,
      video: isVideo ? url : null, video_url: isVideo ? url : null,
      isVideo, is_video: isVideo,
      caption, username,
      user_avatar: `https://i.pravatar.cc/150?u=${username}`,
      likes: 0, comments: 0, saves: 0,
      created_at: new Date().toISOString(), type
    }
    try {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: POSTS_KEY, Body: JSON.stringify([newPost, ...posts]), ContentType: 'application/json' }))
    } catch {}

    // 3. Supabase insert - build fail avvakunda safe ga
    try {
      const supabaseAdmin = await getSupabaseAdmin()
      if (supabaseAdmin) {
        const { error } = await supabaseAdmin.from('posts').insert({ username, image_url: url, video_url: isVideo ? url : null, caption, url: key, type })
        if (error) console.log("Supabase error:", error.message)
      }
    } catch (e) { console.log("Supabase skip") }

    return NextResponse.json({ url, secure_url: url, post: newPost, success: true })
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
