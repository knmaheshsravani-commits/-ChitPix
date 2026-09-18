"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default function ChitPix(){
const [tab,setTab]=useState("home")
const [posts,setPosts]=useState<any[]>([])
const [caption,setCaption]=useState("")
const [file,setFile]=useState<File|null>(null)
const [uploading,setUploading]=useState(false)
useEffect(()=>{getPosts()},[])
async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});if(data)setPosts(data)}
async function postNow(){if(!file)return alert("File select chey!");setUploading(true);const name=Date.now()+"-"+file.name;const {error}=await supabase.storage.from("posts").upload(name,file);if(error){alert(error.message);setUploading(false);return}const {data}=supabase.storage.from("posts").getPublicUrl(name);await supabase.from("posts").insert([{caption,image_url:data.publicUrl}]);setCaption("");setFile(null);setUploading(false);getPosts();setTab("home")}
return(
<div className="min-h-screen bg-black text-white pb-20">
<div className="sticky top-0 bg-black border-b border-zinc-800 p-3 flex justify-between items-center z-10"><b className="text-xl">ChitPix 📸</b><button onClick={()=>setTab("create")} className="bg-orange-500 px-4 py-1 rounded-full text-xl font-bold">+</button></div>
{tab==="home" && <div className="w-full">{posts.map((p:any)=><div key={p.id} className="border-b border-zinc-800"><img src={p.image_url} className="w-full h-auto min-h-[400px] object-cover"/><div className="p-4"><p className="text-[16px]"><b className="mr-2">You</b>{p.caption}</p></div></div>)}</div>}
{tab==="search" && <div className="p-4"><input placeholder="Search..." className="w-full p-3 rounded-xl bg-zinc-900 text-lg"/></div>}
{tab==="reels" && <div className="w-full">{posts.map((p:any)=><video key={p.id} src={p.image_url} controls className="w-full h-[80vh] object-cover"/>)}</div>}
{tab==="profile" && <div className="p-4 text-center"><div className="w-24 h-24 bg-zinc-700 rounded-full mx-auto"></div><h2 className="mt-3 text-xl font-bold">Mahesh</h2><div className="grid grid-cols-3 gap-1 mt-6">{posts.map((p:any)=><img key={p.id} src={p.image_url} className="h-40 object-cover w-full"/>)}</div></div>}
{tab==="create" && <div className="p-6"><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full bg-zinc-900 p-4 rounded-xl"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-zinc-900 p-4 rounded-xl mt-4 text-lg"/><button onClick={postNow} className="w-full bg-white text-black p-4 rounded-xl mt-6 font-bold text-lg">{uploading?"Uploading...":"Post"}</button></div>}
<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around py-4">
<button onClick={()=>setTab("home")} className={tab==="home"?"text-white text-3xl":"text-zinc-500 text-3xl"}>🏠<p className="text-xs mt-1">Home</p></button>
<button onClick={()=>setTab("search")} className={tab==="search"?"text-white text-3xl":"text-zinc-500 text-3xl"}>🔍<p className="text-xs mt-1">Search</p></button>
<button onClick={()=>setTab("reels")} className={tab==="reels"?"text-white text-3xl":"text-zinc-500 text-3xl"}>🎬<p className="text-xs mt-1">Reels</p></button>
<button onClick={()=>setTab("profile")} className={tab==="profile"?"text-white text-3xl":"text-zinc-500 text-3xl"}>👤<p className="text-xs mt-1">Profile</p></button>
</div>
</div>
)
}
