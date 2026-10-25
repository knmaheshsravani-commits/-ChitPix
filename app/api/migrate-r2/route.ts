import { NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(){
  try{
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      MaxKeys: 100,
      Prefix: "posts/"
    })
    const data = await R2.send(cmd)
    const files = data.Contents || []
    
    let inserted = 0
    for(const f of files){
      if(!f.Key || f.Key.endsWith('/')) continue
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${f.Key}`
      
      // Check if already exists
      const { data: exists } = await supabase.from('posts').select('id').eq('image_url', publicUrl).single()
      if(exists) continue
      
      await supabase.from('posts').insert({
        image_url: publicUrl,
        r2_url: publicUrl,
        caption: f.Key.split('/').pop()?.replace(/_/g,' ') || 'Design',
        price: '350',
        username: 'mahesh_tailor'
      })
      inserted++
    }
    
    return NextResponse.json({ success: true, found: files.length, inserted })
  }catch(e:any){
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
