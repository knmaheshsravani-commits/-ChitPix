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
const getUserKey = (username: string) => `users/${username.toLowerCase()}.json`

async function getUserByUsername(username: string){
  try{
    const r = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: getUserKey(username) }))
    const t = await r.Body?.transformToString()
    return t ? JSON.parse(t) : null
  }catch{ return null }
}

// POST - Same as yours - Perfect!
export async function POST(req:Request){
  const b = await req.json()
  const username = b.username?.toLowerCase().replace(/[^a-z0-9_]/g,'')
  if(!username) return Response.json({ success:false, error:"username required" }, { status:400 })
  const existing = await getUserByUsername(username)
  if(existing) return Response.json({ success:true, exists:true, user:existing })
  const newUser = {
    ...b,
    username,
    id: b.id || Date.now().toString(),
    created_at: new Date().toISOString(),
    photo: b.photo || `https://i.pravatar.cc/150?u=${username}`,
    followers: b.followers || 0,
    following: b.following || 0,
    posts: b.posts || 0,
    bio: b.bio || "ChitPix User 🔥"
  }
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET, Key: getUserKey(username), Body: JSON.stringify(newUser, null, 2), ContentType:"application/json"
  }))
  return Response.json({ success:true, user:newUser })
}

// GET - FIXED FOR INSTAGRAM SEARCH!
export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")
  const search = searchParams.get("search")?.toLowerCase()

  // 1. Exact user - ?username=knmahesh
  if(username){
    const user = await getUserByUsername(username)
    return Response.json(user || null)
  }

  // 2. NEW - Instagram search - ?search=knmahesh
  if(search){
    try{
      // Prefix tho fast search - users/kn -> knmahesh, knmani anni vasthayi - 5 lakhs lo kuda fast!
      const list = await R2.send(new ListObjectsV2Command({ 
        Bucket: BUCKET, 
        Prefix:`users/${search}`, // Ikkada magic - R2 fast filter!
        MaxKeys: 20 
      }))
      const keys = list.Contents?.map(c=>c.Key!) || []
      
      // Full user objects fetch - DP, followers tho
      const users = await Promise.all(keys.map(k=>{
        const uname = k.replace("users/","").replace(".json","")
        return getUserByUsername(uname)
      }))
      
      return Response.json({ count: users.length, users: users.filter(Boolean) })
    }catch(e){
      return Response.json({ count:0, users:[] })
    }
  }

  // 3. Default list - Home feed ki
  try{
    const list = await R2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix:"users/", MaxKeys:20 }))
    const keys = list.Contents?.map(c=>c.Key!) || []
    const users = await Promise.all(keys.slice(0,20).map(k=> getUserByUsername(k.replace("users/","").replace(".json",""))))
    return Response.json({ count: list.KeyCount, users: users.filter(Boolean) })
  }catch{
    return Response.json({ count:0, users:[] })
  }
}
