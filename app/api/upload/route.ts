import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 5 KEYS SUPPORT + OLD SINGLE KEY FALLBACK
const R2_CONFIGS = [1,2,3,4,5].map(i=>({
  id: i,
  accountId: process.env[`R2_ACCOUNT_ID_${i}`] || process.env.R2_ACCOUNT_ID,
  accessKey: process.env[`R2_ACCESS_KEY_${i}`] || process.env.R2_ACCESS_KEY_ID,
  secretKey: process.env[`R2_SECRET_KEY_${i}`] || process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env[`R2_BUCKET_${i}`] || process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix',
  publicUrl: process.env[`R2_URL_${i}`] || process.env.R2_PUBLIC_URL,
})).filter((c,i,self)=> c.accountId && c.accessKey && self.findIndex(x=>x.accountId===c.accountId)===i) // unique

// Primary bucket for JSON data (posts.json, stories.json) - First key
const PRIMARY = R2_CONFIGS[0]

function getClient(cfg:any){
  return new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: cfg.accessKey, secretAccessKey: cfg.secretKey },
  })
}

const POSTS_KEY = "data/posts.json"
const STORIES_KEY = "data/stories.json"

async function getData(key: string) {
  if(!PRIMARY) return []
  try {
    const R2 = getClient(PRIMARY)
    const res = await R2.send(new GetObjectCommand({ Bucket: PRIMARY.bucket, Key: key }))
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch { return [] }
}

async function saveData(key: string, data:any){
  if(!PRIMARY) throw new Error('No R2 config')
  const R2 = getClient(PRIMARY)
  await R2.send(new PutObjectCommand({ 
    Bucket: PRIMARY.bucket, Key: key, 
    Body: JSON.stringify(data, null, 2), 
    ContentType: "application/json", 
    CacheControl: 'no-cache' 
  }))
}

export async function POST(req: NextRequest) {
  try {
    if(!PRIMARY?.publicUrl) return NextResponse.json({ error: 'R2_PUBLIC_URL missing!' }, { status: 500 })
    const baseUrl = PRIMARY.publicUrl.replace(/\/$/, '')

    const contentType = req.headers.get('content-type') || ''
    let publicUrl = ''
    let username = 'knmahesh'
    let caption = ''
    let fileName = ''
    let uploadType = 'post'
    let isPermanentRaw: any = null
    let fileBuffer: Buffer | null = null
    let fileExt = 'jpg'
    let fileMime = 'image/jpeg'

    if (contentType.includes('application/json')) {
      const body = await req.json()
      publicUrl = body.url || body.publicUrl || body.image_url
      username = body.username || 'knmahesh'
      caption = body.caption || ''
      uploadType = body.type || body.uploadType || 'post'
      isPermanentRaw = body.isPermanent ?? body.isR2Permanent ?? null
    } else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      username = (formData.get('username') as string) || 'knmahesh'
      caption = (formData.get('caption') as string) || ''
      uploadType = (formData.get('type') as string) || (formData.get('uploadType') as string) || 'post'
      const urlFromForm = (formData.get('url') as string) || (formData.get('publicUrl') as string)
      isPermanentRaw = formData.get('isPermanent') || formData.get('isR2Permanent')

      if (urlFromForm) {
        publicUrl = urlFromForm
      } else {
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
        fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        fileMime = file.type || `image/${fileExt}`
        fileBuffer = Buffer.from(await file.arrayBuffer())
      }
    }

    // UPLOAD WITH 5 KEYS ROTATION + COMPRESS
    if(fileBuffer){
      // Compress image if not video
      const isImage = !fileMime.includes('video') && !fileExt.match(/mp4|mov|webm/)
      let finalBuffer = fileBuffer
      let finalExt = fileExt
      let finalMime = fileMime

      if(isImage){
        try{
          finalBuffer = await sharp(fileBuffer)
            .resize({ width: 1080, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer()
          finalExt = 'webp'
          finalMime = 'image/webp'
        }catch{}
      }

      const folder = uploadType === 'story' ? 'stories' : 'posts'
      const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${finalExt}`

      // Try 5 keys one by one
      let uploaded = false
      const shuffled = [...R2_CONFIGS].sort(()=>0.5-Math.random())
      for(const cfg of shuffled){
        try{
          const client = getClient(cfg)
          await client.send(new PutObjectCommand({
            Bucket: cfg.bucket, Key: key, Body: finalBuffer,
            ContentType: finalMime,
            CacheControl: 'public, max-age=31536000, immutable'
          }))
          publicUrl = `${cfg.publicUrl?.replace(/\/$/, '')}/${key}`
          fileName = key
          uploaded = true
          console.log(`✅ Uploaded to R2-${cfg.id}: ${cfg.bucket}/${key} - Saved ${Math.round((1-finalBuffer.length/fileBuffer.length)*100)}%`)
          break
        }catch(e:any){
          console.warn(`❌ R2-${cfg.id} failed: ${e.message}`)
          continue
        }
      }
      if(!uploaded) return NextResponse.json({ error: 'All R2 buckets failed' }, { status: 500 })
    }

    const cleanUrl = publicUrl.split('?')[0].toLowerCase()
    const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm')
    const isPermanent = isPermanentRaw === true || isPermanentRaw === 'true' || isPermanentRaw === '1'

    if (uploadType === 'story') {
      const now = new Date()
      const newStory = {
        id: Date.now().toString(), 
        image_url: publicUrl, url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(), caption, fileName,
        created_at: now.toISOString(), 
        expires_at: isPermanent ? null : new Date(now.getTime() + 24*60*60*1000).toISOString(),
        type: 'story', views: 0, isR2Permanent: isPermanent,
        viewsText: isPermanent ? '0 views • R2 Permanent ♾️' : '0 views • 24h left'
      }
      const stories = await getData(STORIES_KEY)
      const updatedStories = [newStory, ...stories].slice(0, 500)
      await saveData(STORIES_KEY, updatedStories)
      return NextResponse.json({ 
        success: true, url: publicUrl, story: newStory, 
        message: isPermanent ? 'R2 Permanent ♾️ - Never deletes!' : '24h Story ⏳',
        bucket_used: PRIMARY.bucket,
        keys_active: R2_CONFIGS.length
      })
    } else {
      const newPost = {
        id: Date.now().toString(), image_url: publicUrl, url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(), caption, content: caption, fileName,
        created_at: new Date().toISOString(), type: isVideo ? 'reel' : 'post',
        likes: 0, views: '0 views • R2 Permanent'
      }
      const posts = await getData(POSTS_KEY)
      const updated = [newPost, ...posts].slice(0, 1000)
      await saveData(POSTS_KEY, updated)
      return NextResponse.json({ success: true, url: publicUrl, post: newPost, keys_active: R2_CONFIGS.length })
    }
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: `Ready ✅ ${R2_CONFIGS.length} R2 Keys • Stories + Posts • Permanent + 24h`,
    buckets: R2_CONFIGS.map(c=>({id: c.id, bucket: c.bucket})),
    primary: PRIMARY?.bucket
  })
  }
