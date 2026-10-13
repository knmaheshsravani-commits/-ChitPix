import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const R2_ENDPOINT = process.env.R2_ENDPOINT!
const R2_ACCESS = process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || ""
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY || ""
const R2_BUCKET = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || ""
const R2_PUBLIC = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS, secretAccessKey: R2_SECRET },
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Vercel lo add cheyyi bro - IMPORTANT!
)

const POSTS_KEY = "data/posts.json"

async function getPostsFromR2() {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: POSTS_KEY }))
    // @ts-ignore
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch { return [] }
}

export async function GET() {
  try {
    const posts = await getPostsFromR2()
    return NextResponse.json({ posts, success: true })
  } catch (e:any) {
    return NextResponse.json({ posts: [], error: e.message })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!R2_BUCKET || !R2_ENDPOINT) {
      throw new Error("R2 Env missing! Vercel Settings check chey")
    }
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

    // 1. R2 ki upload
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: file.type,
    }))

    const url = `${R2_PUBLIC.replace(/\/$/, "")}/${key}`
    
    // 2. R2 json update (backup)
    const posts = await getPostsFromR2()
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
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET, Key: POSTS_KEY, 
      Body: JSON.stringify([newPost, ...posts]), 
      ContentType: 'application/json',
    }))

    // 3. ✅ SUPABASE LO KUDA INSERT - IDI MISS AYINDI BRO!
    const { error: dbErr } = await supabaseAdmin.from('posts').insert({
      username: username,
      image_url: url,
      video_url: isVideo ? url : null,
      caption: caption,
      url: key,
      type: type
    })
    if (dbErr) {
      console.log("Supabase insert error:", dbErr)
      // R2 ayindi kabatti error throw cheyaku - just log
    }

    return NextResponse.json({ url, secure_url: url, post: newPost, success: true })
    
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
