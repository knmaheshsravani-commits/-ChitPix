import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
const R2 = new S3Client({ region:'auto', endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials:{ accessKeyId:process.env.R2_ACCESS_KEY_ID!, secretAccessKey:process.env.R2_SECRET_ACCESS_KEY! } })
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'
const KEY = "data/follows.json"
async function getFollows(){ try{ const r=await R2.send(new GetObjectCommand({Bucket:BUCKET, Key:KEY})); const t=await r.Body?.transformToString(); return t?JSON.parse(t):[] }catch{return[]} }
export async function POST(req:Request){
  const {follower, following} = await req.json()
  const follows = await getFollows()
  const exists = follows.find((f:any)=>f.follower===follower && f.following===following)
  let action='followed'
  if(exists){
    const filtered = follows.filter((f:any)=>!(f.follower===follower && f.following===following))
    await R2.send(new PutObjectCommand({Bucket:BUCKET, Key:KEY, Body:JSON.stringify(filtered), ContentType:"application/json"}))
    action='unfollowed'
  } else {
    follows.push({follower, following, created_at:new Date().toISOString()})
    await R2.send(new PutObjectCommand({Bucket:BUCKET, Key:KEY, Body:JSON.stringify(follows), ContentType:"application/json"}))
    // Notification create - R2
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL||''}/api/notifications`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toUser:following, fromUser:follower, type:'follow', message:`${follower} started following you`})}).catch(async()=>{
      // Direct R2 fallback
      try{
        let notifs:any[]=[]; try{ const r=await R2.send(new GetObjectCommand({Bucket:BUCKET, Key:"data/notifications.json"})); const t=await r.Body?.transformToString(); notifs=t?JSON.parse(t):[] }catch{}
        notifs.unshift({id:Date.now().toString(), toUser:following, fromUser:follower, type:'follow', message:`${follower} started following you`, read:false, created_at:new Date().toISOString()})
        await R2.send(new PutObjectCommand({Bucket:BUCKET, Key:"data/notifications.json", Body:JSON.stringify(notifs.slice(0,100)), ContentType:"application/json"}))
      }catch{}
    })
  }
  return Response.json({success:true, action})
}
export async function GET(req:Request){
  const {searchParams} = new URL(req.url)
  const user = searchParams.get('user')
  const follows = await getFollows()
  if(user) return Response.json(follows.filter((f:any)=>f.follower===user || f.following===user))
  return Response.json(follows)
}
