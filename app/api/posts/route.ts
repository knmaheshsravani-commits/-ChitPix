import { NextResponse } from "next/server"
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME!
const KEY = "data/posts.json"

async function getPosts() {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }))
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const posts = await getPosts()
    return NextResponse.json(posts, { headers: { "Cache-Control": "no-store" } })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const newPost = await req.json()
    const posts = await getPosts()
    const updated = [newPost, ...posts]
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(updated, null, 2),
      ContentType: "application/json",
    }))
    return NextResponse.json({ success: true, post: newPost })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
