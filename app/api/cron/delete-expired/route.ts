import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'
const STORIES_KEY = "data/stories.json"

export async function GET(){
  try{
    const res = await R2.send(new GetObjectCommand({Bucket: BUCKET, Key: STORIES_KEY}))
    const text = await res.Body?.transformToString() || "[]"
    const stories = JSON.parse(text)
    const now = Date.now()
    const filtered = stories.filter((s:any) => {
      if(s.expires_at === null || s.isR2Permanent) return true // Keep permanent
      if(!s.expires_at) return true
      return new Date(s.expires_at).getTime() > now // Keep if not expired
    })
    const deleted = stories.length - filtered.length
    if(deleted>0){
      await R2.send(new PutObjectCommand({Bucket: BUCKET, Key: STORIES_KEY, Body: JSON.stringify(filtered,null,2), ContentType:"application/json", CacheControl:'no-cache'}))
    }
    return NextResponse.json({ok:true, deleted, kept: filtered.length, msg: `Deleted ${deleted} expired, kept ${filtered.length} permanent`})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
