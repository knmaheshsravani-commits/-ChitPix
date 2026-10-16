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

export async function POST(req: Request){
  try{
    const body = await req.json()
    if(!body.url || !body.username) return NextResponse.json({error:"url & username required"}, {status:400})

    // 1. Get old posts
    let posts:any[]=[]
    try{
      const res = await R2.send(new GetObjectCommand({Bucket: BUCKET, Key: POSTS_KEY}))
      const text = await res.Body?.transformToString()
      posts = text ? JSON.parse(text) : []
    }catch{}

    // 2. New post - reel / story / post
    const newPost = {
      id: Date.now().toString(),
      image_url: body.url,
      url: body.url,
      username: body.username,
      caption: body.caption || `ChitPix 2026 🔥`,
      type: body.type || (body.url.includes('.mp4') ? 'reel' : 'post'),
      likes: Math.floor(Math.random()*5000),
      views: 9415+Math.floor(Math.random()*2000),
      created_at: new Date().toISOString(),
    }
    posts.unshift(newPost)

    // 3. Save to R2
    await R2.send(new PutObjectCommand({Bucket: BUCKET, Key: POSTS_KEY, Body: JSON.stringify(posts.slice(0,500), null, 2), ContentType:"application/json"}))

    // 4. 🔔 NOTIFICATION - PASTE LOCATION IDI - FOLLOWERS KI VENTANE
    try{
      let follows:any[]=[]
      try{
        const r = await R2.send(new GetObjectCommand({Bucket: BUCKET, Key:"data/follows.json"}))
        const t = await r.Body?.transformToString()
        follows = t?JSON.parse(t):[]
      }catch{}
      const followers = follows.filter((f:any)=>f.following===body.username).map((f:any)=>f.follower)
      if(followers.length){
        let notifs:any[]=[]
        try{
          const r = await R2.send(new GetObjectCommand({Bucket: BUCKET, Key:"data/notifications.json"}))
          const t = await r.Body?.transformToString()
          notifs = t?JSON.parse(t):[]
        }catch{}
        followers.forEach((follower:string)=>{
          notifs.unshift({
            id: (Date.now()+Math.random()).toString(),
            toUser: follower,
            fromUser: body.username,
            type: newPost.type,
            postId: newPost.id,
            message: `posted new ${newPost.type} 🔥`,
            read: false,
            created_at: new Date().toISOString(),
          })
        })
        await R2.send(new PutObjectCommand({Bucket: BUCKET, Key:"data/notifications.json", Body: JSON.stringify(notifs.slice(0,200), null, 2), ContentType:"application/json"}))
      }
    }catch(e){ console.log("notif error", e) }

    return NextResponse.json({success:true, post:newPost})
  }catch(e:any){
    return NextResponse.json({error:e.message}, {status:500})
  }
}
