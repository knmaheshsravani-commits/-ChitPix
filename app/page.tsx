"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ChitPix(){
const [tab,setTab]=useState("home")
const [posts,setPosts]=useState<any[]>([])
const [user,setUser]=useState<any>(null)
const [email,setEmail]=useState(""),[pass,setPass]=useState("")
const [caption,setCaption]=useState(""),[file,setFile]=useState<File|null>(null),[uploading,setUploading]=useState(false)
const [liked,setLiked]=useState<Set<string>>(new Set()),[following,setFollowing]=useState<Set<string>>(new Set())

useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user));getPosts()},[])
async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data)setPosts(data.map((p:any)=>({...p,likes:Math.floor(Math.random()*30)+5})))}
async function signup(){const {data,error}=await supabase.auth.signUp({email,password:pass}); if(error)alert(error.message); else{setUser(data.user); alert("Account Created bro! 🎉")}}
async function login(){const {data,error}=await supabase.auth.signInWithPassword({email,password:pass}); if(error)alert(error.message); else setUser(data.user)}
async function logout(){await supabase.auth.signOut(); setUser(null)}
function likePost(id:string){if(liked.has(id)){const n=new Set(liked);n.delete(id);setLiked(n);setPosts(posts.map(p=>p.id===id?{...p,likes:p.likes-1}:p))}else{const n=new Set(liked);n.add(id);setLiked(n);setPosts(posts.map(p=>p.id===id?{...p,likes:p.likes+1}:p))}}
function followUser(id:string){if(following.has(id)){const n=new Set(following);n.delete(id);setFollowing(n)}else{const n=new Set(following);n.add(id);setFollowing(n)}}
function sharePost(url:string){if(navigator.share)navigator.share({title:"ChitPix",url}); else{navigator.clipboard.writeText(url); alert("Link Copied 📤")}}
async function postNow(){if(!file)return alert("File select chey!");setUploading(true);const fn=Date.now()+"-"+file.name;const {error}=await supabase.storage.from("posts").upload(fn,file);if(error){alert(error.message);setUploading(false);return}const {data}=supabase.storage.from("posts").getPublicUrl(fn);await supabase.from("posts").insert([{caption,image_url:data.publicUrl}]);setCaption("");setFile(null);setUploading(false);getPosts();setTab("home")}

if(!user)return(
<div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
<div className="w-full max-w-sm">
<h1 className="text-5xl font-black text-center mb-2">ChitPix 📸</h1>
<p className="text-center text-zinc-500 mb-10">Login to continue like Instagram</p>
<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-5 rounded-2xl bg-zinc-900 mb-3 text-lg"/>
<input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password (6+ chars)" className="w-full p-5 rounded-2xl bg-zinc-900 mb-8 text-lg"/>
<button onClick={login} className="w-full bg-white text-black p-5 rounded-2xl font-bold text-xl">Log In</button>
<button onClick={signup} className="w-full mt-4 border-2 border-zinc-800 p-5 rounded-2xl font-bold text-xl">Sign Up</button>
<p className="text-center text-zinc-600 mt-6 text-sm">Nee email tho account create chesko bro</p>
</div>
</div>
)

return(
<div className="min-h-screen bg-black text-white pb-28">
<div className="sticky top-0 bg-black border-b-2 border-zinc-800 p-4 flex justify-between items-center z-10"><b className="text-2xl">ChitPix 📸</b><div className="flex gap-2"><button onClick={()=>setTab("create")} className="bg-orange-500 w-10 h-10 rounded-full font-bold text-2xl">+</button><button onClick={logout} className="bg-zinc-800 px-4 py-2 rounded-full text-sm">Logout</button></div></div>

{tab==="home" && <div>{posts.map((p:any)=><div key={p.id} className="border-b-2 border-zinc-800"><div className="p-4 flex justify-between"><div className="flex gap-3 items-center"><div className="w-9 h-9 bg-zinc-700 rounded-full"></div><b>{user.email.split("@")[0]}</b></div><button onClick={()=>followUser(p.id)} className={`px-5 py-1.5 rounded-full font-bold text-sm ${following.has(p.id)?"bg-zinc-800":"bg-white text-black"}`}>{following.has(p.id)?"Following":"Follow"}</button></div><img src={p.image_url} className="w-full min-h-[500px] object-cover"/><div className="p-4 flex gap-6 text-[32px]"><button onClick={()=>likePost(p.id)}>{liked.has(p.id)?"❤️":"🤍"}</button><button>💬</button><button onClick={()=>sharePost(p.image_url)}>📤</button></div><div className="px-4 font-bold">{p.likes} likes</div><div className="px-4 pb-4">{p.caption}</div></div>)}</div>}

{tab==="profile" && <div><div className="p-6 flex gap-6 items-center"><div className="w-24 h-24 bg-zinc-700 rounded-full"></div><div className="flex gap-8 text-center"><div><b className="block text-2xl">{posts.length}</b><span className="text-zinc-500 text-sm">Posts</span></div><div><b className="block text-2xl">{following.size}</b><span className="text-zinc-500 text-sm">Following</span></div><div><b className="block text-2xl">{posts.reduce((a,b)=>a+b.likes,0)}</b><span className="text-zinc-500 text-sm">Likes</span></div></div></div><div className="px-6"><h2 className="font-bold text-xl">{user.email}</h2><p className="text-zinc-400">Live like a wolf 🐺</p><p className="text-zinc-500 text-sm mt-2">Logged in • ChitPix Creator</p></div><div className="grid grid-cols-3 gap-1 mt-6">{posts.map((p:any)=><div key={p.id} className="relative"><img src={p.image_url} className="h-48 w-full object-cover"/><span className="absolute bottom-1 left-1 bg-black/70 text-xs px-2 rounded">❤️{p.likes}</span></div>)}</div></div>}

{tab==="search" && <div className="p-4"><input placeholder="Search users..." className="w-full p-5 rounded-2xl bg-zinc-900"/><div className="mt-6">{["Mahesh","Ravi","Sita","Arjun"].map(u=><div key={u} className="flex justify-between items-center py-4 border-b border-zinc-900"><div className="flex gap-3 items-center"><div className="w-10 h-10 bg-zinc-700 rounded-full"></div><b>{u}</b></div><button onClick={()=>followUser(u)} className={`px-6 py-2 rounded-full font-bold ${following.has(u)?"bg-zinc-800":"bg-white text-black"}`}>{following.has(u)?"Following":"Follow"}</button></div>)}</div></div>}
{tab==="reels" && <div>{posts.map((p:any)=><div key={p.id} className="relative"><video src={p.image_url} controls className="w-full h-[85vh] object-cover"/><div className="absolute bottom-24 left-4"><b>@{user.email.split("@")[0]}</b><p>{p.caption}</p></div><div className="absolute right-4 bottom-24 flex flex-col gap-6 text-[34px]"><button onClick={()=>likePost(p.id)}>{liked.has(p.id)?"❤️":"🤍"}<p className="text-xs text-center">{p.likes}</p></button><button onClick={()=>sharePost(p.image_url)}>📤</button></div></div>)}</div>}
{tab==="create" && <div className="p-6"><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full bg-zinc-900 p-5 rounded-2xl"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-zinc-900 p-5 rounded-2xl mt-4"/><button onClick={postNow} className="w-full bg-white text-black p-5 rounded-2xl mt-6 font-bold text-xl">{uploading?"Uploading...":"Post"}</button></div>}

<div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-zinc-700 flex justify-around py-4">
<button onClick={()=>setTab("home")}><div className="text-[40px]">🏠</div><p className="text-[11px] font-bold">Home</p></button>
<button onClick={()=>setTab("search")}><div className="text-[40px]">🔍</div><p className="text-[11px] font-bold">Search</p></button>
<button onClick={()=>setTab("reels")}><div className="text-[40px]">🎬</div><p className="text-[11px] font-bold">Reels</p></button>
<button onClick={()=>setTab("profile")}><div className="text-[40px]">👤</div><p className="text-[11px] font-bold">Profile</p></button>
</div>
</div>
)
                                                                                }
