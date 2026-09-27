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
  const [profile,setProfile]=useState({username:"@knmahesh30", name:"Mahesh - ChitPix Creator", bio:"Creator ❤️", avatar:""})
  const [showEdit,setShowEdit]=useState(false)
  const [editData,setEditData]=useState(profile)
  const [uploading,setUploading]=useState(false)

  async function load(){
    const {data} = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(data) setPosts(data)
    const {data:pf} = await supabase.from("profiles").select("*").eq("id","me").single()
    if(pf) { const p={username:pf.username, name:pf.name, bio:pf.bio, avatar:pf.avatar_url||""}; setProfile(p); setEditData(p) }
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
  async function handleLike(id:number, likes:number){
    const isLiked = likedIds.includes(id)
    if(isLiked){
      setLikedIds(likedIds.filter(i=>i!==id))
      await supabase.from("posts").update({likes: Math.max(0,likes-1)}).eq("id",id)
    } else {
      setLikedIds([...likedIds, id])
      await supabase.from("posts").update({likes:likes+1}).eq("id",id)
    }
    load()
  }
  async function handleShare(p:any){
    const shareText = `${p.content} - ChitPix`
    if(navigator.share){
      try{ await navigator.share({title:"ChitPix", text:shareText, url:window.location.href}) }catch{}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link Copied bro! Share chey!")
    }
  }

  const filteredPosts = posts.filter(p=> p.content.toLowerCase().includes(searchText.toLowerCase()) || p.username.toLowerCase().includes(searchText.toLowerCase()))

  return(
    <div style={{minHeight:"100vh", background:"white", color:"black", paddingBottom:"60px", fontFamily:"sans-serif"}}>
      <div style={{padding:"12px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", position:"sticky", top:0, background:"white", zIndex:10}}><b style={{color:"#9333ea"}}>ChitPix</b><label style={{background:"black", color:"white", width:"28px", height:"28px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px"}}>+<input type="file" hidden accept="image/*" onChange={addPost}/></label></div>

      {tab==="home" && <div style={{padding:"12px", display:"flex", gap:"8px"}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Photo 📷 add!" style={{flex:1, background:"#f4f4f5", padding:"10px", borderRadius:"12px", border:"none", fontSize:"13px"}}/><label style={{background:"#f4f4f5", padding:"0 10px", borderRadius:"12px", display:"flex", alignItems:"center", fontSize:"13px"}}>📷<input type="file" hidden accept="image/*" onChange={addPost}/></label><button onClick={()=>addPost({target:{files:[]}} as any)} style={{background:"black", color:"white", padding:"0 14px", borderRadius:"12px", fontSize:"13px", fontWeight:"bold"}}>Post</button></div>}

      {tab==="home" && posts.map(p=><div key={p.id} style={{padding:"14px", borderBottom:"1px solid #eee"}}><b style={{fontSize:"13px"}}>{p.username}</b><div style={{margin:"6px 0", fontSize:"13px"}}>{p.content}</div>{p.image_url && <img src={p.image_url} style={{width:"100%", borderRadius:"16px", marginTop:"6px"}}/>}<div style={{marginTop:"10px", display:"flex", gap:"14px", fontSize:"13px"}}><button onClick={()=>handleLike(p.id, p.likes||0)} style={{fontWeight: likedIds.includes(p.id)?"bold":"normal", color: likedIds.includes(p.id)?"red":"black"}}>❤️ {p.likes||0}</button><button>💬 Comment</button><button onClick={()=>handleShare(p)}>↗️ Share</button></div></div>)}
