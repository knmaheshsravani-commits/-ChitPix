'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function ChitPix(){
const [posts,setPosts]=useState<any[]>([])
const [caption,setCaption]=useState('')
const [file,setFile]=useState<File|null>(null)
const [loading,setLoading]=useState(false)

const fetchPosts=async()=>{
const {data}=await supabase.from('posts').select('*').order('created_at',{ascending:false})
if(data) setPosts(data)
}

useEffect(()=>{fetchPosts()},[])

const upload=async()=>{
if(!file) return alert('Photo select chey bro!')
setLoading(true)
const name=Date.now()+'.'+file.name
const {error}=await supabase.storage.from('chitpix-posts').upload(name,file)
if(error){alert(error.message);setLoading(false);return}
const {data}=supabase.storage.from('chitpix-posts').getPublicUrl(name)
await supabase.from('posts').insert({username:'mahesh-07',caption,image_url:data.publicUrl})
setCaption('');setFile(null);fetchPosts();setLoading(false);alert('Post saved bro! 🔥')
}

return(
<div className="max-w-[480px] mx-auto bg-black text-white min-h-screen pb-20">
<header className="p-3 flex justify-between border-b border-gray-800 items-center">
<h1 className="font-bold">ChitPix</h1>
<Link href="/messages" className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold">DM</Link>
</header>

<div className="p-3 flex gap-2 border-b border-gray-800">
<input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="text-xs"/>
<input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Caption..." className="bg-gray-800 px-2 py-1 rounded text-sm flex-1"/>
<button onClick={upload} className="bg-orange-500 px-3 rounded-full text-sm font-bold">{loading?'...':'Post'}</button>
</div>

{posts.map(p=>(
<div key={p.id} className="border-b border-gray-800">
<div className="p-3 font-bold">{p.username}</div>
<img src={p.image_url} className="w-full"/>
<div className="p-3"><p>{p.caption}</p></div>
</div>
))}

</div>
)
}
