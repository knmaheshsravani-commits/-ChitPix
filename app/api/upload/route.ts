import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME! || process.env.R2_BUCKET!
const POSTS_KEY = "data/posts.json"

async function getPosts() {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }))
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    
    let publicUrl = ''
    let username = 'knmahesh'
    let caption = ''
    let fileName = ''

    // CASE 1: JSON with pre-uploaded R2 URL (for big videos - NEW WAY)
    if (contentType.includes('application/json')) {
      const body = await req.json()
      publicUrl = body.url || body.publicUrl || body.video_url || body.image_url
      username = body.username || 'knmahesh'
      caption = body.caption || ''
      fileName = body.fileName || ''
      if (!publicUrl) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    } 
    // CASE 2: FormData with file (small files <4MB - OLD WAY)
    else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      username = formData.get('username') as string || 'knmahesh'
      caption = formData.get('caption') as string || ''
      const urlFromForm = formData.get('url') as string || formData.get('publicUrl') as string

      if (urlFromForm) {
        publicUrl = urlFromForm
      } else {
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
        // Size check
        if (file.size > 4 * 1024 * 1024) {
          return NextResponse.json({ error: 'File too big for direct upload, use presigned URL. Size: ' + Math.round(file.size/1024/1024) + 'MB' }, { status: 413 })
        }
        const ext = file.name.split('.').pop() || 'jpg'
        const key = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())
        await R2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: file.type }))
        const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
        publicUrl = baseUrl ? `${baseUrl}/${key}` : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`
      }
    }

    // Create post - FIXED to detect video properly
    const newPost = {
      id: Date.now().toString(),
      image_url: publicUrl,
      url: publicUrl,
      video_url: publicUrl,
      username,
      caption,
      content: caption,
      created_at: new Date().toISOString(),
      type: publicUrl.toLowerCase().endsWith('.mp4') || publicUrl.toLowerCase().endsWith('.mov') ? 'reel' : 'post'
    }

    const posts = await getPosts()
    const updated = [newPost, ...posts].slice(0, 1000) // Keep 1000 max
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify(updated, null, 2),
      ContentType: "application/json",
    }))

    return NextResponse.json({ success: true, url: publicUrl, post: newPost })

  } catch (e: any) {
    console.error('UPLOAD ERROR:', e)
    // ALWAYS return JSON - Fix for your screenshot error
    return NextResponse.json({ error: e.message || 'Upload failed', details: e.toString() }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'upload endpoint ready', bucket: BUCKET, hasR2: !!process.env.R2_ACCOUNT_ID })
}
