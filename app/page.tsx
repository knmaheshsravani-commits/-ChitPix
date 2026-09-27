"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [text,setText]=useState("")
  const [searchText,setSearchText]=useState("")
  const [likedIds,setLikedIds]=useState<number[]>([])
  const [profile,setProfile]=useState({username:"@knmahesh30", name:"Mahesh", bio:"Creator", avatar:""})
  const [showEdit,setShowEdit]=useState(false)
  const [editData,setEditData]=useState(profile)
  const [uploading,setUploading]=useState(false)

  async function load(){
    const d1 = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(d1.data) setPosts(d1.data)
    const d2 = await supabase.from("profiles").select("*").eq("id","me").single()
    if(d2.data){
      const p = {username:d2.data.username, name:d2.data.name, bio:d2.data.bio, avatar:d2.data.avatar_url||""}
      setProfile(p)
      setEditData(p)
    }
  }
  useEffect(()=>{load()},[])

  async function uploadImage(file:any){
    setUploading(true)
    const name = Date.now()+"_"+file.name
    await supabase.storage.from("chitpix").upload(name,file)
    const res = supabase.storage.from("chitpix").getPublicUrl(name)
    setUploading(false)
    return res.data.publicUrl
  }

  async function addPost(e:any){
    const file = e.target.files? e.target.files[0] : null
    let url = ""
    if(file){ url = await uploadImage(file) }
    if(!text.trim() &&!url) return
    await supabase.from("posts").insert({content:text, image_url:url, username:profile.username, likes:0})
    setText("")
    load()
    setTab("home")
  }

  async function saveProfile(){
    await supabase.from("profiles").upsert({id:"me", username:editData.username, name:editData.name, bio:editData.bio, avatar_url:editData.avatar})
    setProfile(editData)
    setShowEdit(false)
  }

  async function handleLike(id:any, likes:any){
    const isLiked = likedIds.includes(id)
    if(isLiked){
      setLikedIds(likedIds.filter((i)=>i!==id))
      await supabase.from("posts").update({likes: Math.max(0,likes-1)}).eq("id",id)
    } else {
      setLikedIds([...likedIds, id])
      await supabase.from("posts").update({likes: likes+1}).eq("id",id)
    }
    load()
  }

  async function handleShare(p:any){
    const txt = p.content + " - ChitPix"
    if((navigator as any).share){
      try{ await (navigator as any).share({title:"ChitPix", text:txt, url:window.location.href}) }catch{}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link Copied bro!")
    }
  }

  const filtered = posts.filter((p:any)=>{
    const s = searchText.toLowerCase()
    return p.content.toLowerCase().includes(s) || p.username.toLowerCase().includes(s)
  })

  return(
    <div style={{minHeight:"100vh", background:"white", color:"black", paddingBottom:60}}>
      <div style={{padding:12, borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", background:"white", position:"sticky", top:0, zIndex:10}}><b style={{color:"#9333ea"}}>ChitPix</b><label style={{background:"black", color:"white", width:28, height:28, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center"}}>+<input type="file" hidden accept="image/*" onChange={addPost}/></label></div>

      {tab==="home" && <div style={{padding:12, display:"flex", gap:8}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro? Photo kuda!" style={{flex:1, background:"#f4f4f5", padding:10, borderRadius:12, border:"none", fontSize:13}}/><label style={{background:"#f4f4f5", padding:"0 10px", borderRadius:12, display:"flex", alignItems:"center"}}>📷<input type="file" hidden accept="image/*" onChange={addPost}/></label><button onClick={()=>addPost({target:{files:[]}})} style={{background:"black", color:"white", padding:"0 14px", borderRadius:12, fontSize:13}}>Post</button></div>}

      {tab==="home" && posts.map((p:any)=><div key={p.id} style={{padding:14, borderBottom:"1px solid #eee"}}><b style={{fontSize:13}}>{p.username}</b><div style={{margin:"6px 0", fontSize:13}}>{p.content}</div>{p.image_url && <img src={p.image_url} style={{width:"100%", borderRadius:16}}/>}<div style={{marginTop:10, display:"flex", gap:14, fontSize:13}}><button onClick={()=>handleLike(p.id, p.likes||0)} style={{color: likedIds.includes(p.id)? "red" : "black"}}>❤️ {p.likes||0}</button><button>💬 Comment</button><button onClick={()=>handleShare(p)}>↗️ Share</button></div></div>)}

      {tab==="search" && <div style={{padding:12}}><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search..." style={{width:"100%", background:"#f4f4f5", padding:10, borderRadius:12, border:"none", fontSize:13}}/><div style={{marginTop:12}}>{filtered.map((p:any)=><div key={p.id} style={{padding:10, borderBottom:"1px solid #eee", fontSize:13}}><b>{p.username}</b> - {p.content}</div>)}</div></div>}

      {tab==="reels" && <div style={{padding:12}}><h3 style={{fontWeight:"bold", fontSize:14}}>Reels 🎬</h3><div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10}}>{posts.filter((p:any)=>p.image_url).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", height:200, objectFit:"cover", borderRadius:12}}/>)}</div></div>}

      {tab==="likes" && <div style={{padding:12}}><h3 style={{fontWeight:"bold", fontSize:14}}>Liked ❤️</h3>{posts.filter((p:any)=>likedIds.includes(p.id)).map((p:any)=><div key={p.id} style={{padding:10, borderBottom:"1px solid #eee", fontSize:13}}>{p.content}{p.image_url && <img src={p.image_url} style={{width:"100%", borderRadius:12, marginTop:6}}/>}</div>)}{likedIds.length===0 && <div style={{textAlign:"center", marginTop:20, fontSize:12, opacity:0.5}}>Inka like cheyaledu bro</div>}</div>}

      {tab==="profile" && <div style={{textAlign:"center", padding:20}}><div style={{width:80, height:80, margin:"0 auto", borderRadius:40, background:"#a855f7", display:"flex", alignItems:"center", justifyContent:"center", color:"white", overflow:"hidden"}}>{profile.avatar? <img src={profile.avatar} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : "M"}</div><h2 style={{fontWeight:"bold", marginTop:8, fontSize:14}}>{profile.username}</h2><p style={{fontSize:12, color:"#71717a"}}>{profile.name}</p><p style={{fontSize:12}}>{profile.bio}</p><button onClick={()=>{setEditData(profile); setShowEdit(true)}} style={{width:"100%", border:"1px solid #ddd", padding:8, borderRadius:12, fontWeight:"bold", fontSize:13, marginTop:12}}>Edit Profile</button><div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginTop:14}}>{posts.filter((p:any)=>p.image_url).map((p:any)=><img key={p.id} src={p.image_url} style={{height:90, objectFit:"cover", borderRadius:8}}/>)}</div></div>}

      {showEdit && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:30, display:"flex", alignItems:"flex-end"}}><div style={{background:"white", width:"100%", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20}}><h3 style={{fontWeight:"bold", fontSize:14}}>Edit Profile</h3><div style={{display:"flex", justifyContent:"center", margin:"12px 0"}}><label>{editData.avatar? <img src={editData.avatar} style={{width:80, height:80, borderRadius:40, objectFit:"cover"}}/> : <div style={{width:80, height:80, background:"#e4e4e7", borderRadius:40, display:"flex", alignItems:"center", justifyContent:"center"}}>📷</div>}<input type="file" hidden accept="image/*" onChange={async(e:any)=>{const f=e.target.files[0]; if(f){const u=await uploadImage(f); setEditData({...editData, avatar:u})}}}/></label></div><input value={editData.username} onChange={e=>setEditData({...editData, username:e.target.value})} style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:8, border:"none", fontSize:13}}/><input value={editData.name} onChange={e=>setEditData({...editData, name:e.target.value})} style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:8, border:"none", fontSize:13}}/><input value={editData.bio} onChange={e=>setEditData({...editData, bio:e.target.value})} style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:12, border:"none", fontSize:13}}/><div style={{display:"flex", gap:8}}><button onClick={()=>setShowEdit(false)} style={{flex:1, border:"1px solid #ddd", padding:10, borderRadius:12, fontSize:13}}>Cancel</button><button onClick={saveProfile} style={{flex:1, background:"black", color:"white", padding:10, borderRadius:12, fontSize:13}}>{uploading?"Uploading...":"Save"}</button></div></div></div>}

      <div style={{position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #eee", display:"flex", justifyContent:"space-around", padding:"6px 0", zIndex:20}}>
        <button onClick={()=>setTab("home")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="home"?1:0.4}}><span style={{fontSize:60}}>🏠</span><span style={{fontSize:9}}>Home</span></button>
        <button onClick={()=>setTab("search")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="search"?1:0.4}}><span style={{fontSize:60}}>🔍</span><span style={{fontSize:9}}>Search</span></button>
        <button onClick={()=>setTab("reels")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="reels"?1:0.4}}><span style={{fontSize:60}}>🎬</span><span style={{fontSize:9}}>Reels</span></button>
        <button onClick={()=>setTab("likes")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="likes"?1:0.4}}><span style={{fontSize:60}}>❤️</span><span style={{fontSize:9}}>Likes</span></button>
        <button onClick={()=>setTab("profile")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="profile"?1:0.4}}><span style={{fontSize:60}}>👤</span><span style={{fontSize:9}}>Profile</span></button>
      </div>
    </div>
  )
      }
