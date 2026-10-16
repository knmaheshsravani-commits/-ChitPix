import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

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
const POSTS_KEY = 'data/posts.json'

export async function GET(){
  try{
    const res = await R2.send(new GetObjectCommand({Bucket: BUCKET, Key: POSTS_KEY}))
    const text = await res.Body?.transformToString()
    const posts = text ? JSON.parse(text) : []
    return NextResponse.json(posts, {headers:{'Cache-Control':'no-store'}})
  }catch(e:any){
    if(e.name === 'NoSuchKey') return NextResponse.json([])
    return NextResponse.json({error:e.message}, {status:500})
  }
}
