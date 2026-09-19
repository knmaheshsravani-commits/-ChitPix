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
async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data) setPosts(data.filter((p:any)=> (p.image || p.image_url) ))}
async function login(){const {error}=await supabase.auth.signInWithPassword({email,password:pass}); if(error) alert(error.message); else{const {data}=await supabase.auth.getUser(); setUser(data.user); getPosts()}}
async function logout(){await supabase.auth.signOut(); setUser(null)}
async function signup(){const {error}=await supabase.auth.signUp({email,password:pass}); if(error) alert(error.message); else alert("Email check chey!")}
function likePost(id:string){const n=new Set(liked); liked.has(id)?n.delete(id):n.add(id); setLiked(n)}
async function postNow(){if(!file) return alert("Photo select chey!");const name=Date.now()+"-"+file.name;const {error}=await supabase.storage.from("posts").upload(name,file);if(error) return alert(error.message);const {data}=supabase.storage.from("posts").getPublicUrl(name);await supabase.from("posts").insert({image:data.publicUrl,image_url:data.publicUrl,caption,user_id:user.id,username:user.email.split("@")[0]});setCaption(""); setFile(null); setTab("home"); getPosts()}
const getImg = (p:any) => p?.image || p?.image_url || ""
const filteredPosts = posts.filter(p => (p.caption||"").toLowerCase().includes(search.toLowerCase()) || (p.username||"").toLowerCase().includes(search.toLowerCase()))
if(!user) return(<div className="min-h-screen bg-black text-white flex items-center justify-center p-6"><div className="w-full max-w-[350px] border border-zinc-800 p-8 text-center"><h1 className="text-4xl font-serif mb-6">ChitPix</h1><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 bg-zinc-900 border border-zinc-700 text-sm"/><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full p-2 mb-4 bg-zinc-900 border border-zinc-700 text-sm"/><button onClick={login} className="w-full bg-blue-500 py-1.5 rounded text-sm font-semibold mb-2">Log in</button><button onClick={signup} className="w-full border border-zinc-700 py-1.5 rounded text-sm">Sign up</button></div></div>)
return(
<div className="min-h-screen bg-black text-white">
<div className="sticky top-0 z-20 bg-black border-b border-zinc-800 flex justify-between items-center px-4 py-3"><h1 className="text-xl font-serif">ChitPix</h1><div className="flex gap-3"><button onClick={()=>setTab("create")} className="w-8 h-8 bg-white text-black rounded-full font-bold flex items-center justify-center text-lg">+</button><button onClick={logout} className="text-xs bg-zinc-800 px-3 py-1 rounded-full">Logout</button></div></div>
<div className="w-full pb-32">
{tab==="home" && filteredPosts.map((p:any)=><div key={p.id} className="border-b border-zinc-800 pb-3 w-full"><div className="flex items-center gap-2 p-3"><img src={getImg(p)} className="w-8 h-8 rounded-full object-cover bg-zinc-800"/><span className="font-semibold text-[13px]">{p.username||"mahesh123"}</span></div><div className="w-full bg-zinc-900"><img src={getImg(p)} className="w-full h-auto object-cover"/></div><div className="flex gap-5 p-4 items-center"><button onClick={()=>likePost(p.id)}><svg style={{width:'34px',height:'34px'}} fill={liked.has(p.id)?"white":"none"} stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button><button><svg style={{width:'34px',height:'34px'}} fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button><button><svg style={{width:'34px',height:'34px'}} fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></button><button className="ml-auto"><svg style={{width:'34px',height:'34px'}} fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button></div><div className="px-3 text-[13px]"><span className="font-bold">{24 + (liked.has(p.id)?1:0)} likes</span><div className="mt-1"><span className="font-bold mr-2">{p.username||"mahesh123"}</span>{p.caption}</div></div></div>)}
<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-700 flex justify-around items-center pt-4 pb-8 z-50">
<button onClick={()=>setTab("home")}><svg style={{width:'40px',height:'40px'}} fill={tab==="home"?"white":"none"} stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 2.5L3 10.5V21h6v-6h6v6h6v-10.5l-9-8z"/></svg></button>
<button onClick={()=>setTab("reels")}><svg style={{width:'40px',height:'40px'}} fill="none" stroke={tab==="reels"?"white":"#888"} strokeWidth="2.2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8l6 4-6 4V8z" fill={tab==="reels"?"white":"#888"}/></svg></button>
<button onClick={()=>setTab("create")}><svg style={{width:'40px',height:'40px'}} fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
<button onClick={()=>setTab("search")}><svg style={{width:'40px',height:'40px'}} fill="none" stroke={tab==="search"?"white":"#888"} strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/></svg></button>
<button onClick={()=>setTab("profile")}><img src="https://i.pravatar.cc/100" style={{width:'40px',height:'40px'}} className="rounded-full border-2 border-white object-cover"/></button>
</div>
</div>
)
                                                                                            }
