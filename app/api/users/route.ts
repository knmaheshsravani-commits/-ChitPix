import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"

const R2 = new S3Client({ 
  region:'auto', 
  endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, 
  credentials:{ 
    accessKeyId:process.env.R2_ACCESS_KEY_ID!, 
    secretAccessKey:process.env.R2_SECRET_ACCESS_KEY! 
  } 
})
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'

// 1 USER = 1 FILE = SCALABLE FOR 1 LAKH!
const getUserKey = (username: string) => `users/${username.toLowerCase()}.json`

async function getUserByUsername(username: string){
  try{
    const r = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: getUserKey(username) }))
    const t = await r.Body?.transformToString()
    return t ? JSON.parse(t) : null
  }catch{ return null }
}

// POST - 1 Lakh ki ready!
export async function POST(req:Request){
  const b = await req.json()
  const username = b.username?.toLowerCase().replace(/[^a-z0-9_]/g,'')
  if(!username) return Response.json({ success:false, error:"username required" }, { status:400 })

  // Already unda check - Oka file ne check - Fast!
  const existing = await getUserByUsername(username)
  if(existing){
    return Response.json({ success:true, exists:true, user:existing })
  }

  const newUser = {
    ...b,
    username,
    id: b.id || Date.now().toString(),
    created_at: new Date().toISOString(),
    photo: b.photo || `https://i.pravatar.cc/150?u=${username}`
  }

  // R2 ONLY - Veru file ga save - 1 lakh unna no problem!
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET, 
    Key: getUserKey(username), 
    Body: JSON.stringify(newUser, null, 2), 
    ContentType:"application/json"
  }))

  return Response.json({ success:true, user:newUser })
}

// GET - ?username=nani -> Oka user fast, lekapothe list (limit tho)
export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")

  // Single user fetch - Super fast - 1 lakh lo kuda!
  if(username){
    const user = await getUserByUsername(username)
    return Response.json(user || null)
  }

  // List - 1 lakh fetch cheyakudadu - So limit 100
  try{
    const list = await R2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix:"users/", MaxKeys:100 }))
    const keys = list.Contents?.map(c=>c.Key!) || []
    // Only keys return - Data antha return cheyakudadu - Crash avuddi!
    return Response.json({ count: list.KeyCount, users: keys.map(k=>k.replace("users/","").replace(".json","")) })
  }catch{
    return Response.json({ count:0, users:[] })
  }
}
