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
const [liked,setLiked]=useState<Set<string>>(new Set())
const [comments,setComments]=useState<{[key:string]:string}>({})
const [showComments,setShowComments]=useState<string|null>(null)
useEffect(()=>{getPosts()},[])
async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});if(data)setPosts(data.map((p:any)=>({...p,likes:Math.floor(Math.random()*100)+5,commentsList:[]}))) }
async function postNow(){if(!file)return alert("File select chey!");setUploading(true);const name=Date.now()+"-"+file.name;const {error}=await supabase.storage.from("posts").upload(name,file);if(error){alert(error.message);setUploading(false);return}const {data}=supabase.storage.from("posts").getPublicUrl(name);await supabase.from("posts").insert([{caption,image_url:data.publicUrl}]);setCaption("");setFile(null);setUploading(false);getPosts();setTab("home")}
function likePost(id:string){if(liked.has(id)){const n=new Set(liked);n.delete(id);setLiked(n);setPosts(posts.map(p=>p.id===id?{...p,likes:p.likes-1}:p))}else{const n=new Set(liked);n.add(id);setLiked(n);setPosts(posts.map(p=>p.id===id?{...p,likes:p.likes+1}:p))}}
function addComment(id:string){if(!comments[id])return;setPosts(posts.map(p=>p.id===id?{...p,commentsList:[...p.commentsList,comments[id]]}:p));setComments({...comments,[id]:""})}

return(
<div className="min-h-screen bg-black text-white pb-28">
<div className="sticky top-0 bg-black border-b-2 border-zinc-800 p-4 flex justify-between items-center z-10"><b className="text-2xl">ChitPix 📸</b><button onClick={()=>setTab("create")} className="bg-orange-500 px-6 py-2 rounded-full text-2xl font-bold">+</button></div>

{tab==="home" && <div className="w-full">{posts.map((p:any)=><div key={p.id} className="border-b-2 border-zinc-800">
<img src={p.image_url} className="w-full min-h-[500px] object-cover"/>
<div className="p-4 flex gap-6 text-[32px]">
<button onClick={()=>likePost(p.id)}>{liked.has(p.id)?"❤️":"🤍"} </button>
<button onClick={()=>setShowComments(showComments===p.id?null:p.id)}>💬</button>
<button>📤</button>
</div>
<div className="px-4 pb-2 font-bold text-lg">{p.likes} likes</div>
<div className="px-4 pb-1 text-lg"><b>You</b> {p.caption}</div>
{p.commentsList.map((c:string,i:number)=><div key={i} className="px-4 text-zinc-300">💬 {c}</div>)}
{showComments===p.id && <div className="p-4 flex gap-2"><input value={comments[p.id]||""} onChange={e=>setComments({...comments,[p.id]:e.target.value})} placeholder="Add comment..." className="flex-1 bg-zinc-900 p-3 rounded-full"/><button onClick={()=>addComment(p.id)} className="text-orange-500 font-bold">Post</button></div>}
</div>)}</div>}

{tab==="profile" && <div>
<div className="p-6 flex gap-6 items-center">
<div className="w-24 h-24 bg-zinc-700 rounded-full"></div>
<div className="flex gap-8 text-center">
<div><b className="block text-2xl">{posts.length}</b><span className="text-zinc-400">Posts</span></div>
<div><b className="block text-2xl">{posts.reduce((a,b)=>a+b.likes,0)}</b><span className="text-zinc-400">Likes</span></div>
<div><b className="block text-2xl">{posts.reduce((a,b)=>a+b.commentsList.length,0)}</b><span className="text-zinc-400">Comments</span></div>
</div>
</div>
<div className="px-6"><h2 className="text-2xl font-bold">Mahesh</h2><p className="text-zinc-400">Live like a wolf 🐺</p><button className="w-full mt-4 border border-zinc-700 p-3 rounded-xl font-bold">Edit Profile</button></div>
<div className="grid grid-cols-3 gap-1 mt-6">{posts.map((p:any)=><div key={p.id} className="relative"><img src={p.image_url} className="h-48 w-full object-cover"/><div className="absolute bottom-1 left-1 text-xs bg-black/70 px-2 rounded">❤️{p.likes}</div></div>)}</div>
</div>}

{tab==="search" && <div className="p-5"><input placeholder="Search..." className="w-full p-5 rounded-2xl bg-zinc-900 text-xl"/><div className="grid grid-cols-3 gap-1 mt-5">{posts.map((p:any)=><img key={p.id} src={p.image_url} className="h-40 object-cover w-full"/>)}</div></div>}
{tab==="reels" && <div className="w-full">{posts.map((p:any)=><div key={p.id} className="relative"><video src={p.image_url} controls className="w-full h-[85vh] object-cover"/><div className="absolute bottom-20 left-4"><b>@Mahesh</b><p>{p.caption}</p><p>❤️ {p.likes} likes</p></div></div>)}</div>}
{tab==="create" && <div className="p-6"><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full bg-zinc-900 p-5 rounded-2xl text-lg"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-zinc-900 p-5 rounded-2xl mt-5 text-xl"/><button onClick={postNow} className="w-full bg-white text-black p-5 rounded-2xl mt-6 font-bold text-xl">{uploading?"Uploading...":"Post"}</button></div>}

<div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-zinc-700 flex justify-around py-5">
<button onClick={()=>setTab("home")}><div className="text-[45px]">🏠</div><p className="text-[12px] font-bold">Home</p></button>
<button onClick={()=>setTab("search")}><div className="text-[45px]">🔍</div><p className="text-[12px] font-bold">Search</p></button>
<button onClick={()=>setTab("reels")}><div className="text-[45px]">🎬</div><p className="text-[12px] font-bold">Reels</p></button>
<button onClick={()=>setTab("profile")}><div className="text-[45px]">👤</div><p className="text-[12px] font-bold">Profile</p></button>
</div>
</div>
)
  }
