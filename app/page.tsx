"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [tab,setTab]=useState("profile")
  const [posts,setPosts]=useState<any[]>([])
  const [text,setText]=useState("")
  const [profile,setProfile]=useState({username:"@knmahesh30", name:"Mahesh - ChitPix Creator", bio:"Creator ❤️", avatar:""})
  const [showEdit,setShowEdit]=useState(false)
  const [editData,setEditData]=useState(profile)
  const [uploading,setUploading]=useState(false)

  async function load(){
    const {data} = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(data) setPosts(data)
    const {data:pf} = await supabase.from("profiles").select("*").eq("id","me").single()
    if(pf) setProfile({username:pf.username, name:pf.name, bio:pf.bio, avatar:pf.avatar_url||""})
  }
  useEffect(()=>{load()},[])

  async function uploadImage(file:File){
    setUploading(true)
    const name=Date.now()+"_"+file.name
    await supabase.storage.from("chitpix").upload(name,file)
    const {data}=supabase.storage.from("chitpix").getPublicUrl(name)
    setUploading(false); return data.publicUrl
  }
  async function addPost(e:any){
    const file=e.target.files?.[0]
    let url=""
    if(file){ const u=await uploadImage(file); if(u) url=u }
    if(!text.trim() &&!url) return
    await supabase.from("posts").insert({content:text,image_url:url,username:profile.username,likes:0})
    setText(""); load(); setTab("home")
  }
  async function saveProfile(){
    await supabase.from("profiles").upsert({id:"me",username:editData.username,name:editData.name,bio:editData.bio,avatar_url:editData.avatar})
    setProfile(editData); setShowEdit(false)
  }

  return(
    <div className="min-h-screen bg-white text-black pb-20">
      <div className="p-3 border-b flex justify-between"><b className="text-purple-500">ChitPix</b><label className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">+<input type="file" hidden accept="image/*" onChange={addPost}/></label></div>
      <div className="p-3 flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro? Photo 📷 kuda!" className="flex-1 bg-zinc-100 p-3 rounded-xl"/><label className="bg-zinc-100 px-3 rounded-xl flex items-center cursor-pointer">📷<input type="file" hidden accept="image/*" onChange={addPost}/></label><button onClick={()=>addPost({target:{files:[]}} as any)} className="bg-black text-white px-4 rounded-xl">Post</button></div>

      {tab==="home" && posts.map(p=><div key={p.id} className="p-4 border-b"><b className="text-sm">{p.username}</b><div className="my-2">{p.content}</div>{p.image_url && <img src={p.image_url} className="w-full rounded-2xl"/>}<div className="mt-2 text-sm">❤️ {p.likes||0} Likes • 💬 Comment • ↗️ Share</div></div>)}

      {tab==="profile" && <div className="text-center p-6"><div className="w-20 h-20 mx-auto rounded-full bg-purple-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">{profile.avatar? <img src={profile.avatar} className="w-full h-full object-cover"/>:"M"}</div><h2 className="font-bold mt-2">{profile.username}</h2><p className="text-sm text-zinc-500">{profile.name}</p><p className="text-sm">{profile.bio}</p><div className="flex justify-around border-y my-4 py-3"><div><b>{posts.length}</b><div className="text-xs text-zinc-500">Posts</div></div><div><b>1.2k</b><div className="text-xs text-zinc-500">Followers</div></div></div><button onClick={()=>{setEditData(profile); setShowEdit(true)}} className="w-full border py-2 rounded-xl font-bold">Edit Profile</button><div className="grid grid-cols-3 gap-1 mt-4">{posts.filter(p=>p.image_url).map(p=><img key={p.id} src={p.image_url} className="h-24 object-cover rounded-lg"/>)}</div></div>}

      {showEdit && <div className="fixed inset-0 bg-black/50 z-30 flex items-end"><div className="bg-white w-full rounded-t-3xl p-6"><h3 className="font-bold mb-3">Edit Profile - Photo Add Chey!</h3><div className="flex justify-center mb-4"><label className="cursor-pointer">{editData.avatar? <img src={editData.avatar} className="w-20 h-20 rounded-full object-cover"/>:<div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center">📷 Add Photo</div>}<input type="file" hidden accept="image/*" onChange={async(e)=>{const f=e.target.files?.[0]; if(f){const u=await uploadImage(f); if(u) setEditData({...editData,avatar:u})}}}/></label></div><input value={editData.username} onChange={e=>setEditData({...editData,username:e.target.value})} className="w-full p-3 bg-zinc-100 rounded-xl mb-2"/><input value={editData.name} onChange={e=>setEditData({...editData,name:e.target.value})} className="w-full p-3 bg-zinc-100 rounded-xl mb-2"/><input value={editData.bio} onChange={e=>setEditData({...editData,bio:e.target.value})} className="w-full p-3 bg-zinc-100 rounded-xl mb-3"/><div className="flex gap-2"><button onClick={()=>setShowEdit(false)} className="flex-1 border py-3 rounded-xl">Cancel</button><button onClick={saveProfile} className="flex-1 bg-black text-white py-3 rounded-xl">{uploading?"Uploading...":"Save"}</button></div></div></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2"><button onClick={()=>setTab("home")} className="flex flex-col items-center">🏠<span className="text-[50px]">Home</span></button><button className="flex flex-col items-center opacity-50">🔍<span className="text-[50px]">Search</span></button><button className="flex flex-col items-center opacity-50">🎬<span className="text-[50px]">Reels</span></button><button className="flex flex-col items-center opacity-50">❤️<span className="text-[50px]">Likes</span></button><button onClick={()=>setTab("profile")} className="flex flex-col items-center">👤<span className="text-[50px]">Profile</span></button></div>
    </div>
  )
}
