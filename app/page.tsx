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
useEffect(()=>{supabase.auth.getUser().then(d=>{setUser(d.data.user); getPosts()})},[])
async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data) setPosts(data.filter((p:any)=> (p.image || p.image_url) ))}
async function login(){const {error}=await supabase.auth.signInWithPassword({email,password:pass}); if(error) alert(error.message); else{const {data}=await supabase.auth.getUser(); setUser(data.user); getPosts()}}
async function logout(){await supabase.auth.signOut(); setUser(null)}
async function signup(){const {error}=await supabase.auth.signUp({email,password:pass}); if(error) alert(error.message); else alert("Email check chey!")}
function likePost(id:string){const n=new Set(liked); liked.has(id)?n.delete(id):n.add(id); setLiked(n)}
async function postNow(){if(!file) return alert("Photo select chey!");const name=Date.now()+"-"+file.name;const {error}=await supabase.storage.from("posts").upload(name,file);if(error) return alert(error.message);const {data}=supabase.storage.from("posts").getPublicUrl(name);await supabase.from("posts").insert({image:data.publicUrl,image_url:data.publicUrl,caption,user_id:user.id,username:user.email.split("@")[0]});setCaption(""); setFile(null); setTab("home"); getPosts()}
const getImg = (p:any) => p?.image || p?.image_url || ""
if(!user) return(<div className="min-h-screen bg-black text-white flex items-center justify-center p-6"><div className="w-full max-w-[350px] border border-zinc-800 p-8 text-center"><h1 className="text-4xl font-serif mb-6">ChitPix</h1><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 bg-zinc-900 border border-zinc-700 text-sm"/><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full p-2 mb-4 bg-zinc-900 border border-zinc-700 text-sm"/><button onClick={login} className="w-full bg-blue-500 py-1.5 rounded text-sm font-semibold mb-2">Log in</button><button onClick={signup} className="w-full border border-zinc-700 py-1.5 rounded text-sm">Sign up</button></div></div>)
return(
<div className="min-h-screen bg-black text-white">
<div className="sticky top-0 z-20 bg-black border-b border-zinc-800 flex justify-between items-center px-4 py-3"><h1 className="text-xl font-serif">ChitPix</h1><div className="flex gap-3"><button onClick={()=>setTab("create")} className="w-8 h-8 bg-white text-black rounded-full font-bold flex items-center justify-center text-lg">+</button><button onClick={logout} className="text-xs bg-zinc-800 px-3 py-1 rounded-full">Logout</button></div></div>
<div className="max-w-[470px] mx-auto pb-28">
{tab==="home" && posts.map((p:any)=><div key={p.id} className="border-b border-zinc-800 pb-2"><div className="flex items-center gap-2 p-3"><img src={getImg(p)} className="w-8 h-8 rounded-full object-cover bg-zinc-800"/>{p.username||"mahesh123"}</div><div className="w-full aspect-square bg-zinc-900"><img src={getImg(p)} className="w-full h-full object-cover"/></div><div className="flex gap-5 p-3.5 text-[28px]"><span onClick={()=>likePost(p.id)}>{liked.has(p.id)?"❤️":"♡"}</span><span>💬</span><span>✈️</span><span className="ml-auto">🔖</span></div><div className="px-3 text-[13px]"><span className="font-bold">{23 + (liked.has(p.id)?1:0)} likes</span><div className="mt-1"><span className="font-bold mr-2">{p.username||"mahesh123"}</span>{p.caption}</div></div></div>)}
{tab==="create" && (<div className="p-6"><h2 className="text-xl mb-4">Create Post</h2><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-3 text-sm"/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full bg-zinc-900 border border-zinc-700 p-2 mb-3 text-sm"/><button onClick={postNow} className="w-full bg-blue-500 py-2 rounded font-semibold">Share</button></div>)}
</div>
<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around items-center py-5 pb-8 z-50">
<button onClick={()=>setTab("home")}><svg className="w-8 h-8" fill={tab==="home"?"white":"none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2.5L3 10.5V21h6v-6h6v6h6v-10.5l-9-8z"/></svg></button>
<button onClick={()=>setTab("reels")}><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg></button>
<button onClick={()=>setTab("create")}><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
<button onClick={()=>setTab("search")}><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/></svg></button>
<button className={`w-8 h-8 rounded-full border-2 ${tab==="profile"?"border-white":"border-zinc-600"} overflow-hidden`} onClick={()=>setTab("profile")}><img src="https://i.pravatar.cc/100" className="w-full h-full object-cover"/></button>
</div>
</div>
)
}
