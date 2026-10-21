import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
const R2 = new S3Client({ 
  region:'auto', 
  endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, 
  credentials:{ 
    accessKeyId:process.env.R2_ACCESS_KEY_ID!, 
    secretAccessKey:process.env.R2_SECRET_ACCESS_KEY! 
  } 
})
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'

// Prati device ki veru session - 1 lakh users ki no clash!
const getSessionKey = (sessionId: string) => `sessions/${sessionId}.json`

export async function POST(req:Request){ 
  const b = await req.json()
  // b = { username, email, mobile, sessionId }
  const sessionId = b.sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const username = b.username?.toLowerCase()

  if(!username) return Response.json({ success:false }, { status:400 })

  // R2 lo session save - Prati user ki veru file!
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET, 
    Key: getSessionKey(sessionId), 
    Body: JSON.stringify({ 
      username, 
      email: b.email || "", 
      mobile: b.mobile || "",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString() // 30 days
    }), 
    ContentType:"application/json"
  }))
  
  return Response.json({ success:true, sessionId }) 
}

export async function GET(req:Request){ 
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")

  if(!sessionId){
    return Response.json({ username: null, error: "sessionId required" }, { status:400 })
  }

  try{ 
    const r = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: getSessionKey(sessionId) }))
    const t = await r.Body?.transformToString()
    const data = t ? JSON.parse(t) : null
    
    // Expire ayinda check
    if(data && new Date(data.expires_at) < new Date()){
      await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: getSessionKey(sessionId) }))
      return Response.json({ username: null, expired:true })
    }

    return Response.json(data || { username: null }) 
  }catch{ 
    return Response.json({ username: null }) 
  } 
}

export async function DELETE(req:Request){
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if(sessionId){
    await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: getSessionKey(sessionId) }))
  }
  return Response.json({ success:true })
}
