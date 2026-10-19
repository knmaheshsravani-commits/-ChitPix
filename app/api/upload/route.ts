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
const STORIES_KEY = "data/stories.json" // <-- NEW FOR STORIES

async function getPosts(key: string) {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch (e: any) {
    if (e.Code === 'NoSuchKey' || e.name === 'NoSuchKey') return []
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      return NextResponse.json({ error: 'R2 ENV missing' }, { status: 500 })
    }
    const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    if (!baseUrl) return NextResponse.json({ error: 'R2_PUBLIC_URL missing!' }, { status: 500 })

    const contentType = req.headers.get('content-type') || ''
    let publicUrl = ''
    let username = 'knmahesh'
    let caption = ''
    let fileName = ''
    let uploadType = 'post' // DEFAULT

    if (contentType.includes('application/json')) {
      const body = await req.json()
      publicUrl = body.url || body.publicUrl || body.video_url || body.image_url || body.imageUrl
      username = body.username || 'knmahesh'
      caption = body.caption || ''
      fileName = body.fileName || ''
      uploadType = body.type || body.uploadType || 'post' // story ani vastundi
      if (!publicUrl) return NextResponse.json({ error: 'No URL' }, { status: 400 })
    } else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      username = (formData.get('username') as string) || 'knmahesh'
      caption = (formData.get('caption') as string) || ''
      uploadType = (formData.get('type') as string) || (formData.get('uploadType') as string) || 'post' // <-- STORY TYPE
      const urlFromForm = (formData.get('url') as string) || (formData.get('publicUrl') as string)

      if (urlFromForm) {
        publicUrl = urlFromForm
        fileName = urlFromForm.split('/').pop() || ''
      } else {
        if (!file) return NextResponse.json({ error: 'No file found' }, { status: 400 })
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: `File ${Math.round(file.size/1024/1024)}MB too big.`, usePresign: true }, { status: 413 })
        }
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const folder = uploadType === 'story' ? 'stories' : 'posts' // <-- SEPARATE FOLDER
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
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

    const cleanUrl = publicUrl.split('?')[0].toLowerCase()
    const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm')

    // --- LOGIC CHANGE: STORY vs POST ---
    if (uploadType === 'story') {
      const newStory = {
        id: Date.now().toString(),
        image_url: publicUrl,
        url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(),
        caption,
        fileName,
        created_at: new Date().toISOString(),
        expires_at: null, // <-- R2 PERMANENT - 24h delete avadu!
        type: 'story',
        views: 0,
        isR2Permanent: true,
        viewsText: '0 views • R2 Permanent views'
      }
      const stories = await getPosts(STORIES_KEY)
      const updatedStories = [newStory, ...stories].slice(0, 500)
      await R2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: STORIES_KEY,
        Body: JSON.stringify(updatedStories, null, 2),
        ContentType: "application/json",
        CacheControl: 'no-cache'
      }))
      return NextResponse.json({ success: true, url: publicUrl, story: newStory, message: 'R2 Story saved - will NOT go to Home!' })
    } else {
      // OLD POST LOGIC - as it is
      const newPost = {
        id: Date.now().toString(),
        image_url: publicUrl,
        url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(),
        caption,
        fileName,
        created_at: new Date().toISOString(),
        type: isVideo ? 'reel' : 'post',
        likes: 0,
        views: '0 views • R2 Permanent'
      }
      const posts = await getPosts(POSTS_KEY)
      const updated = [newPost, ...posts].slice(0, 1000)
      await R2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: POSTS_KEY,
        Body: JSON.stringify(updated, null, 2),
        ContentType: "application/json",
        CacheControl: 'no-cache'
      }))
      return NextResponse.json({ success: true, url: publicUrl, post: newPost, message: 'R2 upload done - permanent!' })
    }

  } catch (e: any) {
    console.error('UPLOAD ERROR:', e)
    return NextResponse.json({ error: e.message || 'Upload failed', details: e.toString(), code: e.Code || e.name }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ChitPix upload endpoint ready ✅ - Stories + Posts separated',
    bucket: BUCKET,
    postsKey: POSTS_KEY,
    storiesKey: STORIES_KEY,
  })
                              }
