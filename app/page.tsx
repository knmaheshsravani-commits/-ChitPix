"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Home, Search, Clapperboard, User, Heart, MessageCircle, Send, Plus, LogOut, Image as ImageIcon } from "lucide-react"

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
const [following,setFollowing]=useState<Set<string>>(new Set())

useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUser(data.user);getPosts()})},[])

async function getPosts(){const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});if(data)setPosts(data)}
async function signup(){const {data,error}=await supabase.auth.signUp({email,password:pass});if(error)alert(error.message);else setUser(data.user)}
async function login(){const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});if(error)alert(error.message);else setUser(data.user)}
async function logout(){await supabase.auth.signOut();setUser(null)}

function likePost(id:string){if(liked.has(id)){const n=new Set(liked);n.delete(id);setLiked(n);setPosts(posts.map((p:any)=>p.id===id?{...p,likes:(p.likes||0)-1}:p))}else{const n=new Set(liked);n.add(id);setLiked(n);setPosts(posts.map((p:any)=>p.id===id?{...p,likes:(p.likes||0)+1}:p))}}
function followUser(id:string){if(following.has(id)){const n=new Set(following);n.delete(id);setFollowing(n)}else{const n=new Set(following);n.add(id);setFollowing(n)}}
function sharePost(url:string){if(navigator.share){navigator.share({title:"ChitPix",url})}else{navigator.clipboard.writeText(url);alert("Link copied!")}}

async function postNow(){if(!file)return alert("File select chey!");const fileName=Date.now()+"_"+file.name;const {error}=await supabase.storage.from("posts").upload(fileName,file);if(error)return alert(error.message);const {data:{publicUrl}}=supabase.storage.from("posts").getPublicUrl(fileName);await supabase.from("posts").insert({image_url:publicUrl,caption,user_id:user.id});setCaption("");setFile(null);setTab("home");getPosts()}

if(!user)return(<div className="min-h-screen bg-black text-white flex items-center justify-center p-6"><div className="w-full max-w-sm border border-zinc-800 p-6 rounded-2xl"><h1 className="text-3xl font-bold text-center mb-6">ChitPix</h1><input placeholder="Email" className="w-full p-3 mb-3 bg-zinc-900 border border-zinc-800 rounded-xl" onChange={e=>setEmail(e.target.value)}/><input placeholder="Password" type="password" className="w-full p-3 mb-3 bg-zinc-900 border border-zinc-800 rounded-xl" onChange={e=>setPass(e.target.value)}/><button onClick={login} className="w-full bg-white text-black p-3 rounded-xl font-bold mb-2">Log In</button><button onClick={signup} className="w-full bg-zinc-900 p-3 rounded-xl border border-zinc-800">Sign Up</button><p className="text-center text-xs text-zinc-500 mt-6">Created by K N Mahesh Ravani</p></div></div>)

return(<div className="min-h-screen bg-black text-white pb-28"><div className="sticky top-0 bg-black border-b border-zinc-800 p-4 flex justify-between items-center z-10"><h1 className="text-xl font-bold">ChitPix</h1><button onClick={logout}><LogOut size={20}/></button></div>

{tab==="home"&&<div className="max-w-[500px] mx-auto">{posts.map((p:any)=><div key={p.id} className="border-b border-zinc-800"><div className="p-4 flex justify-between"><span className="font-bold">user</span><button onClick={()=>followUser(p.user_id)} className="text-sm text-blue-500">{following.has(p.user_id)?"Following":"Follow"}</button></div>{p.image_url?.includes(".mp4")?<video src={p.image_url} controls className="w-full"/>:<img src={p.image_url} className="w-full"/>}<div className="p-4 flex gap-4"><button onClick={()=>likePost(p.id)}><Heart size={26} className={liked.has(p.id)?"fill-red-500 text-red-500":""}/></button><MessageCircle size={26}/><button onClick={()=>sharePost(p.image_url)}><Send size={26}/></button></div><div className="px-4 pb-2 font-bold text-sm">{p.likes||0} likes</div><div className="px-4 pb-4 text-sm">{p.caption}</div></div>)}<div className="text-center text-xs text-zinc-600 p-8">Created by K N Mahesh Ravani - ChitPix © 2026</div></div>}

{tab==="search"&&<div className="p-4"><input placeholder="Search..." className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-full"/></div>}
{tab==="reels"&&<div className="p-2">{posts.map((p:any)=><div key={p.id} className="mb-2"><video src={p.image_url} className="w-full h-[80vh] object-cover rounded-xl" controls/></div>)}</div>}
{tab==="profile"&&<div className="p-6"><div className="w-24 h-24 bg-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center"><User size={48}/></div><h2 className="text-center font-bold">{user.email}</h2><p className="text-center text-xs text-zinc-500 mt-4">Created by K N Mahesh Ravani</p></div>}
{tab==="create"&&<div className="p-6 max-w-[500px] mx-auto"><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-4"/><input placeholder="Write a caption..." value={caption} onChange={e=>setCaption(e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl mb-4"/><button onClick={postNow} className="w-full bg-white text-black p-3 rounded-xl font-bold flex justify-center gap-2"><ImageIcon size={20}/> Post Now</button></div>}

<div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-zinc-800 flex justify-around py-4"><button onClick={()=>setTab("home")} className={tab==="home"?"text-white":"text-zinc-500"}><Home size={26}/></button><button onClick={()=>setTab("search")} className={tab==="search"?"text-white":"text-zinc-500"}><Search size={26}/></button><button onClick={()=>setTab("create")} className="bg-white text-black p-2 rounded-full"><Plus size={24}/></button><button onClick={()=>setTab("reels")} className={tab==="reels"?"text-white":"text-zinc-500"}><Clapperboard size={26}/></button><button onClick={()=>setTab("profile")} className={tab==="profile"?"text-white":"text-zinc-500"}><User size={26}/></button></div></div>)}
