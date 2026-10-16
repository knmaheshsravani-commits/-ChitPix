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

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix'
const POSTS_KEY = "data/posts.json"

// FIXED: Safe get posts - Vercel compatible
async function getPosts() {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }))
    const text = await res.Body?.transformToString()
    return text? JSON.parse(text) : []
  } catch (e: any) {
    if (e.Code === 'NoSuchKey' || e.name === 'NoSuchKey') return []
    console.log("No posts.json yet, creating new")
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    // ENV Check
    if (!process.env.R2_ACCOUNT_ID ||!process.env.R2_ACCESS_KEY_ID ||!process.env.R2_SECRET_ACCESS_KEY) {
      return NextResponse.json({ error: 'R2 ENV missing - Check Vercel Settings > Environment Variables' }, { status: 500 })
    }

    const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    if (!baseUrl) {
      return NextResponse.json({ error: 'R2_PUBLIC_URL missing! Add https://pub-xxx.r2.dev in Vercel ENV' }, { status: 500 })
    }

    const contentType = req.headers.get('content-type') || ''
    let publicUrl = ''
    let username = 'knmahesh'
    let caption = ''
    let fileName = ''

    // CASE 1: JSON (Presigned URL way - for videos >4MB)
    if (contentType.includes('application/json')) {
      const body = await req.json()
      publicUrl = body.url || body.publicUrl || body.video_url || body.image_url || body.imageUrl
      username = body.username || body.user || 'knmahesh'
      caption = body.caption || body.content || ''
      fileName = body.fileName || ''
      if (!publicUrl) return NextResponse.json({ error: 'No URL in JSON body' }, { status: 400 })
    }
    // CASE 2: FormData (Direct upload <10MB)
    else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      username = (formData.get('username') as string) || 'knmahesh'
      caption = (formData.get('caption') as string) || ''
      const urlFromForm = (formData.get('url') as string) || (formData.get('publicUrl') as string)

      if (urlFromForm) {
        publicUrl = urlFromForm
        fileName = urlFromForm.split('/').pop() || ''
      } else {
        if (!file) return NextResponse.json({ error: 'No file found' }, { status: 400 })

        // INCREASED to 10MB from 4MB
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({
            error: `File ${Math.round(file.size/1024/1024)}MB too big. Use /api/r2-presign for large files`,
            usePresign: true
          }, { status: 413 })
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const key = `posts/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())

        await R2.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type || `image/${ext}`,
          CacheControl: 'public, max-age=31536000, immutable'
        }))

        publicUrl = `${baseUrl}/${key}`
        fileName = key
      }
    }

    // FIXED: Clean URL for video check
    const cleanUrl = publicUrl.split('?')[0].toLowerCase()
    const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mkv')

    const newPost = {
      id: Date.now().toString(),
      image_url: publicUrl,
      url: publicUrl,
      video_url: isVideo? publicUrl : undefined,
      username: username.toLowerCase(),
      caption,
      content: caption,
      fileName,
      created_at: new Date().toISOString(),
      type: isVideo? 'reel' : 'post',
      likes: 0,
      views: '0 views • R2 Permanent'
    }

    const posts = await getPosts()
    const updated = [newPost,...posts].slice(0, 1000)

    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify(updated, null, 2),
      ContentType: "application/json",
      CacheControl: 'no-cache'
    }))

    // SUCCESS - PERMANENT R2 URL
    return NextResponse.json({
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      post: newPost,
      message: 'R2 upload done - permanent!'
    })

  } catch (e: any) {
    console.error('UPLOAD ERROR:', e)
    return NextResponse.json({
      error: e.message || 'Upload failed',
      details: e.toString(),
      code: e.Code || e.name
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ChitPix upload endpoint ready ✅',
    bucket: BUCKET,
    hasR2:!!process.env.R2_ACCOUNT_ID,
    hasKey:!!process.env.R2_ACCESS_KEY_ID,
    hasPublicUrl:!!process.env.R2_PUBLIC_URL,
    publicUrl: process.env.R2_PUBLIC_URL || 'MISSING - Add in Vercel!',
    owner: 'K N Mahesh'
  })
    }
