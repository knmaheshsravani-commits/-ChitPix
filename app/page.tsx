"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ChitPix(){
const [tab,setTab]=useState("home")
const [posts,setPosts]=useState<any[]>([])
const [user,setUser]=useState<any>(null)
const [email,setEmail]=useState("")
const [pass,setPass]=useState("")
const [caption,setCaption]=useState("")
const [file,setFile]=useState<File|null>(null)
const [liked,setLiked]=useState<Set<string>>(new Set())
const [search,setSearch]=useState("")
useEffect(()=>{supabase.auth.getUser().then(d=>{setUser(d.data.user); getPosts()})},[])

async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data) setPosts(data)}
async function login(){const {error}=await supabase.auth.signInWithPassword({email,password:pass}); if(error) alert(error.message); else location.reload()}
async function logout(){await supabase.auth.signOut(); setUser(null)}
async function signup(){const {error}=await supabase.auth.signUp({email,password:pass}); if(error) alert(error.message); else alert("Signup ok, login chey")}
function likePost(id:string){const n=new Set(liked); if(liked.has(id)) n.delete(id); else n.add(id); setLiked(n)}

async function sharePost(p:any){
  const url = getImg(p);
  if(navigator.share){ try{ await navigator.share({title:p.caption, text:p.caption, url}) }catch{} }
  else { await navigator.clipboard.writeText(url); alert("Link Copied! ✅") }
}
async function commentPost(p:any){
  const c = prompt("Comment type chey:");
  if(c){ alert("Comment added: "+c); }
}

async function postNow(){if(!file) return alert("Photo select chey!"); const name=Date.now()+"-"+file.name; const {error}=await supabase.storage.from("posts").upload(name,file); if(error) return alert(error.message); const {data}=supabase.storage.from("posts").getPublicUrl(name); await supabase.from("posts").insert({image_url:data.publicUrl, caption}); setCaption(""); setFile(null); setTab("home"); getPosts()}
const getImg = (p:any) => p?.image_url || p?.image || ""
const filteredPosts = posts.filter(p => (p.caption||"").toLowerCase().includes(search.toLowerCase()))

if(!user) return(<div className="min-h-screen bg-black text-white flex items-center justify-center p-6"><div className="w-full max-w-sm space-y-4"><h1 className="text-3xl font-bold text-center">ChitPix</h1><input className="w-full p-3 bg-zinc-800 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input className="w-full p-3 bg-zinc-800 rounded" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)}/><button onClick={login} className="w-full bg-white text-black p-3 rounded font-bold">Login</button><button onClick={signup} className="w-full border p-3 rounded">Signup</button></div></div>)
return(
<div className="min-h-screen bg-black text-white">
<div className="sticky top-0 z-20 bg-black border-b border-zinc-800 flex justify-between items-center px-4 py-3"><h1 className="font-bold text-xl">ChitPix</h1><button onClick={logout} className="text-sm text-zinc-400">Logout</button></div>

{tab==="home"&& <div className="w-full pb-20">{filteredPosts.map((p:any)=><div key={p.id} className="w-full border-b border-zinc-800 pb-4">
<div className="flex gap-2 items-center p-3"><img src={`https://i.pravatar.cc/100?u=${p.id}`} className="w-8 h-8 rounded-full"/><span className="font-bold text-sm">user_{p.id.slice(0,4)}</span></div>
<img src={getImg(p)} className="w-full h-auto object-cover bg-zinc-900" style={{width:'100vw', marginLeft:'calc(-50vw + 50%)'}}/>
<button onClick={()=>{const n=prompt("New Name ento?"); if(n) alert("Name updated to: "+n+" ✅ (Supabase lo save cheyali ante cheppu, code ista)")}} className="flex-1 bg-zinc-800 p-3 rounded-xl font-bold text-base active:bg-zinc-700">Edit profile</button>
<button onClick={async()=>{const url=window.location.href; if(navigator.share){await navigator.share({title:"My ChitPix Profile", url})} else {await navigator.clipboard.writeText(url); alert("Profile Link Copied! ✅ "+url)}} } className="flex-1 bg-zinc-800 p-3 rounded-xl font-bold text-base active:bg-zinc-700">Share profile</button>
<button onClick={()=>likePost(p.id)}><svg width="40" height="40" fill={liked.has(p.id)?"white":"none"} stroke={liked.has(p.id)?"white":"white"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
<button onClick={()=>commentPost(p)}><svg width="40" height="40" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
<button onClick={()=>sharePost(p)}><svg width="40" height="40" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
</div>
<button onClick={()=>likePost('save-'+p.id)}><svg width="40" height="40" fill={liked.has('save-'+p.id)?"white":"none"} stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
</div>
<div className="px-3 text-sm font-bold">{p.caption}</div>
</div>)}</div>}

{tab==="search" && <div className="p-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full p-3 bg-zinc-800 rounded-full"/><div className="grid grid-cols-3 gap-1 mt-4">{filteredPosts.map((p:any)=><img key={p.id} src={getImg(p)} className="aspect-square object-cover"/>)}</div></div>}
{tab==="create" && <div className="p-4 space-y-4">
<h2 className="text-2xl font-bold">New post</h2>
<div className="w-full p-4 bg-zinc-800 rounded-xl border border-dashed border-zinc-600 text-center">
<input type="file" accept="image/*" id="fileInput" onChange={e=>setFile(e.target.files?.[0]||null)} className="hidden"/>
<label htmlFor="fileInput" className="text-white font-bold text-lg block w-full py-3 cursor-pointer">📁 Choose Photo</label>
{file && <p className="text-sm text-green-400 mt-2 truncate">{file.name}</p>}
{!file && <p className="text-sm text-zinc-400 mt-2">No file chosen</p>}
</div>
<input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a caption... ✍️" className="w-full p-4 bg-zinc-800 rounded-xl text-base"/>
<button onClick={postNow} className="w-full bg-white text-black p-4 rounded-xl font-bold text-lg">Share to ChitPix 🚀</button>
</div>}
{tab==="profile" && <div className="p-4 space-y-5">
<div className="flex gap-5 items-center">
<img src="https://i.pravatar.cc/150?u=me" className="w-24 h-24 rounded-full border-2 border-zinc-700"/>
<div className="flex gap-6">
<div className="text-center"><p className="text-2xl font-bold">{posts.length}</p><p className="text-base text-zinc-400">posts</p></div>
<div className="text-center"><p className="text-2xl font-bold">3</p><p className="text-base text-zinc-400">followers</p></div>
<div className="text-center"><p className="text-2xl font-bold">22</p><p className="text-base text-zinc-400">following</p></div>
</div>
</div>
<h2 className="text-xl font-bold">Kn Mahesh</h2>
<div className="flex gap-2">
<button className="flex-1 bg-zinc-800 p-3 rounded-xl font-bold text-base">Edit profile</button>
<button className="flex-1 bg-zinc-800 p-3 rounded-xl font-bold text-base">Share profile</button>
</div>
<div className="grid grid-cols-3 gap-1 pt-4 border-t border-zinc-800">
{posts.map((p:any)=><img key={p.id} src={getImg(p)} className="aspect-square object-cover"/>)}
</div>
<div className="text-center pt-20">
<p className="text-3xl font-bold">Create your first post</p>
<p className="text-zinc-500 text-lg mt-2">Share a photo to see it here</p>
</div>
</div>}

<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-700 flex justify-around items-center py-3 z-30">
<button onClick={()=>setTab("home")}><svg style={{width:'40px',height:'40px'}} fill={tab==="home"?"white":"none"} stroke={tab==="home"?"white":"white"} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></button>
<button onClick={()=>setTab("reels")}><svg style={{width:'40px',height:'40px'}} fill="none" stroke={tab==="reels"?"white":"white"} strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg></button>
<button onClick={()=>setTab("create")}><svg style={{width:'40px',height:'40px'}} fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>
<button onClick={()=>setTab("search")}><svg style={{width:'40px',height:'40px'}} fill="none" stroke={tab==="search"?"white":"white"} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
<button onClick={()=>setTab("profile")}><img src="https://i.pravatar.cc/100" style={{width:'40px',height:'40px', borderRadius:'50%', border: tab==="profile"?"2px solid white":"none"}}/></button>
</div>
</div>
)
                                                                                                                                                                                                                                                                           }
