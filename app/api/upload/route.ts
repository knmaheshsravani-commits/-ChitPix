import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 5 KEYS
const R2_CONFIGS = [1,2,3,4,5].map(i=>({
  id: i,
  accountId: process.env[`R2_ACCOUNT_ID_${i}`] || process.env.R2_ACCOUNT_ID,
  accessKey: process.env[`R2_ACCESS_KEY_${i}`] || process.env.R2_ACCESS_KEY_ID,
  secretKey: process.env[`R2_SECRET_KEY_${i}`] || process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env[`R2_BUCKET_${i}`] || process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix',
  publicUrl: process.env[`R2_URL_${i}`] || process.env.R2_PUBLIC_URL,
})).filter((c,i,self)=> c.accountId && c.accessKey && self.findIndex(x=>x.accountId===c.accountId)===i)

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
  const R2 = getClient(PRIMARY)
  await R2.send(new PutObjectCommand({ Bucket: PRIMARY.bucket, Key: key, Body: JSON.stringify(data,null,2), ContentType: "application/json", CacheControl: 'no-cache' }))
}

export async function POST(req: NextRequest) {
  try {
    if(!PRIMARY?.publicUrl) return NextResponse.json({ error: 'R2_PUBLIC_URL missing!' }, { status: 500 })
    const contentType = req.headers.get('content-type') || ''
    let publicUrl = '', username = 'knmahesh', caption = '', fileName = '', uploadType = 'post', isPermanentRaw:any = null
    let fileBuffer: Buffer | null = null, fileExt = 'jpg', fileMime = 'image/jpeg'

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
      if (urlFromForm) publicUrl = urlFromForm
      else {
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
        fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        fileMime = file.type || `image/${fileExt}`
        fileBuffer = Buffer.from(await file.arrayBuffer())
      }
    }

    if(fileBuffer){
      const folder = uploadType === 'story' ? 'stories' : 'posts'
      const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${fileExt}`
      let uploaded = false
      for(const cfg of [...R2_CONFIGS].sort(()=>0.5-Math.random())){
        try{
          await getClient(cfg).send(new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: fileBuffer, ContentType: fileMime, CacheControl: 'public, max-age=31536000, immutable' }))
          publicUrl = `${cfg.publicUrl?.replace(/\/$/, '')}/${key}`; fileName = key; uploaded = true; break
        }catch{ continue }
      }
      if(!uploaded) return NextResponse.json({ error: 'All R2 failed' }, { status: 500 })
    }

    const isVideo = publicUrl.toLowerCase().split('?')[0].match(/\.(mp4|mov|webm)$/)
    const isPermanent = isPermanentRaw === true || isPermanentRaw === 'true' || isPermanentRaw === '1'

    if (uploadType === 'story') {
      const now = new Date()
      const newStory = { id: Date.now().toString(), image_url: publicUrl, url: publicUrl, video_url: isVideo ? publicUrl : undefined, username: username.toLowerCase(), caption, fileName, created_at: now.toISOString(), expires_at: isPermanent ? null : new Date(now.getTime()+24*60*60*1000).toISOString(), type: 'story', views: 0, isR2Permanent: isPermanent, viewsText: isPermanent ? '0 views • R2 Permanent ♾️' : '0 views • 24h left' }
      const stories = await getData(STORIES_KEY)
      await saveData(STORIES_KEY, [newStory, ...stories].slice(0,500))
      return NextResponse.json({ success: true, url: publicUrl, story: newStory, keys_active: R2_CONFIGS.length })
    } else {
      const newPost = { id: Date.now().toString(), image_url: publicUrl, url: publicUrl, video_url: isVideo ? publicUrl : undefined, username: username.toLowerCase(), caption, content: caption, fileName, created_at: new Date().toISOString(), type: isVideo ? 'reel' : 'post', likes: 0, views: '0 views • R2 Permanent' }
      const posts = await getData(POSTS_KEY)
      await saveData(POSTS_KEY, [newPost, ...posts].slice(0,1000))
      return NextResponse.json({ success: true, url: publicUrl, post: newPost, keys_active: R2_CONFIGS.length })
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function GET() { return NextResponse.json({ status: `Ready ✅ ${R2_CONFIGS.length} Keys`, buckets: R2_CONFIGS.map(c=>({id:c.id, bucket:c.bucket})) }) }
