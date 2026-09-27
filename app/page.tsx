"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [stories,setStories]=useState<any[]>([])
  const [text,setText]=useState("")
  const [searchText,setSearchText]=useState("")
  const [likedIds,setLikedIds]=useState<number[]>([])
  const [username,setUsername]=useState("@knmahesh30")
      const [profile,setProfile]=useState<any>({username:"@knmahesh30", name:"Mahesh", avatar_url:"", bio:""})
  const [editData,setEditData]=useState<any>({username:"@knmahesh30", name:"Mahesh", avatar_url:"", bio:""})
const [showEdit,setShowEdit]=useState(false)
const [uploading,setUploading]=useState(false)
  const [commentText,setCommentText]=useState("") 
    const [commentOpen,setCommentOpen]=useState<any>(null)
  const [comments,setComments]=useState<any[]>([])
  const [viewStory,setViewStory]=useState<any>(null)
  const [flowerAnim,setFlowerAnim]=useState<number|null>(null)
  const [showLogin,setShowLogin]=useState(false)
  const [loginName,setLoginName]=useState("")

  async function load(){
  const d1 = await supabase.from("posts").select("*").order("created_at",{ascending:false})
  if(d1.data) setPosts(d1.data)
   
    const d2 = await supabase.from("profiles").select("*").eq("username","@knmahesh30").single()
if(d2.data){ setProfile(d2.data); setEditData(d2.data) }

  const d3 = await supabase.from("comments").select("*").order("created_at",{ascending:false})
  if(d3.data) setComments(d3.data)

  const d4 = await supabase.from("stories").select("*").order("created_at",{ascending:false})
  if(d4.data) setStories(d4.data)

  const saved = localStorage.getItem("chitpix_user")
  if(saved){ setUsername(saved) } else { setShowLogin(true) }
  }

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
    await supabase.from("posts").insert({content:text, image_url:url, username:username, likes:0, flowers:0})
    setText(""); load(); setTab("home")
  }
  async function addStory(e:any){
  const file = e.target.files? e.target.files[0] : null
  if(!file) return
  const url = await uploadImage(file)

  console.log("Uploaded URL:", url) // check avuthundo

  const { error } = await supabase.from("stories").insert({
    image_url: url,
    username: username || "@mahesh123", // NUVVU ADD CHEYALSINA LINE IDI!
    created_at: new Date().toISOString()
  })

  if(error){
    console.log(error)
    alert("Error bro: " + error.message)
    return
  }

  load()
  alert("Story added bro! 🟣")
  }
  async function saveProfile(){
  try{
    let finalData:any = {...editData}
    if((editData as any).avatar_url && (editData as any).avatar_url.startsWith("blob:")){
      const res = await fetch((editData as any).avatar_url)
      const blob = await res.blob()
      const fileName = 'avatar_${Date.now()}.jpg'
      const { error: upErr } = await supabase.storage.from("chitpix").upload(fileName, blob)
      if(upErr){ alert("Upload error: "+upErr.message); return }
      const { data } = supabase.storage.from("chitpix").getPublicUrl(fileName)
      finalData.avatar_url = data.publicUrl
    }
    await supabase.from("profiles").upsert({username:"@knmahesh30",...finalData})
    
    setProfile(finalData);
    setShowEdit(false);
    load();
    alert("Profile saved bro! ✅")
  }catch(e){ console.log(e); }
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
  async function handleFlower(id:any, flowers:any){
    setFlowerAnim(id)
    setTimeout(()=>setFlowerAnim(null),1000)
    await supabase.from("posts").update({flowers: (flowers||0)+1}).eq("id",id)
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
  async function addComment(postId:number){
    if(!commentText.trim()) return
    await supabase.from("comments").insert({post_id:postId, content:commentText, username:username})
    setCommentText(""); load()
  }
  function doLogin(){
    if(!loginName.trim()) return
    const u = "@"+loginName.replace("@","")
    setUsername(u); localStorage.setItem("chitpix_user", u)
    setProfile({...profile, username:u}); setShowLogin(false)
  }

  const filtered = posts.filter((p:any)=>{
    const s = searchText.toLowerCase()
    return p.content?.toLowerCase().includes(s) || p.username?.toLowerCase().includes(s)
  })

  return(
    <div style={{minHeight:"100vh", background:"white", color:"black", paddingBottom:60, fontFamily:"system-ui"}}>
      <div style={{padding:12, borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", position:"sticky", top:0, background:"white", zIndex:10}}><b style={{color:"#9333ea", fontSize:14}}>ChitPix 🌸</b><div style={{display:"flex", gap:8, alignItems:"center"}}><span style={{fontSize:10, opacity:0.6}}>{username}</span><label style={{background:"black", color:"white", width:26, height:26, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12}}>+<input type="file" hidden accept="image/*" onChange={addPost}/></label></div></div>

      {tab==="home" && <div style={{display:"flex", gap:12, padding:10, borderBottom:"1px solid #eee", overflowX:"auto"}}><label style={{display:"flex", flexDirection:"column", alignItems:"center", minWidth:50}}><div style={{width:48, height:48, borderRadius:24, background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", border:"2px dashed #9333ea", fontSize:18}}>+</div><span style={{fontSize:8, marginTop:4}}>Add Story</span><input type="file" hidden accept="image/*" onChange={addStory}/></label>{stories.map((s:any)=><div key={s.id} onClick={()=>setViewStory(s)} style={{display:"flex", flexDirection:"column", alignItems:"center", minWidth:50}}><img src={s.image_url} style={{width:48, height:48, borderRadius:24, objectFit:"cover", border:"2px solid #9333ea"}}/><span style={{fontSize:8, marginTop:4}}>{s.username.slice(0,8)}</span></div>)}</div>}

      {tab==="home" && <div style={{padding:12, display:"flex", gap:8}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro? Photo kuda!" style={{flex:1, background:"#f4f4f5", padding:10, borderRadius:12, border:"none", fontSize:13}}/><label style={{background:"#f4f4f5", padding:"0 10px", borderRadius:12, display:"flex", alignItems:"center"}}>📷<input type="file" hidden accept="image/*" onChange={addPost}/></label><button onClick={()=>addPost({target:{files:[]}})} style={{background:"black", color:"white", padding:"0 14px", borderRadius:12, fontSize:13, fontWeight:"bold"}}>Post</button></div>}

      {tab==="home" && posts.map((p:any)=><div key={p.id} style={{padding:12, borderBottom:"1px solid #eee", position:"relative"}}><b style={{fontSize:12}}>{p.username}</b>{p.content && <div style={{margin:"6px 0", fontSize:13}}>{p.content}</div>}{p.image_url && <img src={p.image_url} style={{width:"100%", borderRadius:14, marginTop:6}}/>}{flowerAnim===p.id && <div style={{position:"absolute", top:40, left:"50%", fontSize:30, animation:"bounce 1s"}}>🌸🌷🌺💐</div>}<div style={{marginTop:8, display:"flex", gap:14, fontSize:13}}><button onClick={()=>handleLike(p.id, p.likes||0)} style={{color: likedIds.includes(p.id)?"red":"black", border:"none", background:"none"}}>❤️ {p.likes||0}</button><button onClick={()=>handleFlower(p.id, p.flowers||0)} style={{border:"none", background:"none"}}>🌸 {p.flowers||0}</button><button onClick={()=>setCommentOpen(commentOpen===p.id? null : p.id)} style={{border:"none", background:"none"}}>💬 {comments.filter((c:any)=>c.post_id===p.id).length}</button><button onClick={()=>handleShare(p)} style={{border:"none", background:"none"}}>↗️ Share</button></div>{commentOpen===p.id && <div style={{marginTop:10, background:"#f9f9f9", borderRadius:12, padding:8}}>{comments.filter((c:any)=>c.post_id===p.id).map((c:any)=><div key={c.id} style={{fontSize:12, padding:"4px 0"}}><b>{c.username}</b> {c.content}</div>)}<div style={{display:"flex", gap:6, marginTop:6}}><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Comment chey..." style={{flex:1, padding:8, borderRadius:8, border:"1px solid #ddd", fontSize:12}}/><button onClick={()=>addComment(p.id)} style={{background:"black", color:"white", padding:"0 10px", borderRadius:8, fontSize:12}}>Send</button></div></div>}</div>)}

      {tab==="search" && <div style={{padding:12}}><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search..." style={{width:"100%", background:"#f4f4f5", padding:10, borderRadius:12, border:"none", fontSize:13}}/><div style={{marginTop:12}}>{filtered.map((p:any)=><div key={p.id} style={{padding:10, borderBottom:"1px solid #eee", fontSize:13}}><b>{p.username}</b> - {p.content}</div>)}</div></div>}
      {tab==="reels" && <div style={{padding:12}}><h3 style={{fontWeight:"bold", fontSize:14}}>Reels 🎬</h3><div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10}}>{posts.filter((p:any)=>p.image_url).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", height:200, objectFit:"cover", borderRadius:12}}/>)}</div></div>}
      {tab==="likes" && <div style={{padding:12}}><h3 style={{fontWeight:"bold", fontSize:14}}>Liked ❤️</h3>{posts.filter((p:any)=>likedIds.includes(p.id)).map((p:any)=><div key={p.id} style={{padding:10, borderBottom:"1px solid #eee"}}>{p.content && <div style={{fontSize:13}}>{p.content}</div>}{p.image_url && <img src={p.image_url} style={{width:"100%", borderRadius:12, marginTop:6}}/>}</div>)}{likedIds.length===0 && <div style={{textAlign:"center", marginTop:20, fontSize:12, opacity:0.5}}>Inka like cheyaledu</div>}</div>}
      {tab==="profile" && <div style={{textAlign:"center", padding:20}}><div style={{width:70, height:70, margin:"0 auto", borderRadius:35, background:"#a855f7", color:"white", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", fontWeight:"bold"}}>{profile.avatar? <img src={profile.avatar} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : "M"}</div><h2 style={{fontWeight:"bold", marginTop:8, fontSize:13}}>{profile.username}</h2><p style={{fontSize:11, color:"#71717a"}}>{profile.name}</p><button onClick={()=>{setEditData(profile); setShowEdit(true)}} style={{width:"100%", border:"1px solid #ddd", padding:8, borderRadius:12, fontWeight:"bold", fontSize:12, marginTop:12}}>Edit Profile</button><div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginTop:12}}>{posts.filter((p:any)=>p.image_url).map((p:any)=><img key={p.id} src={p.image_url} style={{height:80, objectFit:"cover", borderRadius:8}}/>)}</div></div>}

      {viewStory && <div onClick={()=>setViewStory(null)} style={{position:"fixed", inset:0, background:"black", zIndex:40, display:"flex", alignItems:"center", justifyContent:"center"}}><div style={{position:"absolute", top:20, left:12, color:"white", fontSize:13}}><b>{viewStory.username}</b></div><img src={viewStory.image_url} style={{maxWidth:"100%", maxHeight:"90vh"}}/><button onClick={()=>setViewStory(null)} style={{position:"absolute", top:15, right:15, color:"white", background:"rgba(0,0,0,0.5)", borderRadius:20, width:30, height:30, border:"none"}}>X</button></div>}

      {showEdit && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:30, display:"flex", alignItems:"flex-end"}}><div style={{background:"white", width:"100%", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20}}><h3 style={{fontWeight:"bold", fontSize:13}}>Edit Profile</h3><div style={{display:"flex", justifyContent:"center", margin:"12px 0"}}><label>{editData.avatar? <img src={editData.avatar} style={{width:70, height:70, borderRadius:35, objectFit:"cover"}}/> : <div style={{width:70, height:70, background:"#e4e4e7", borderRadius:35, display:"flex", alignItems:"center", justifyContent:"center"}}>📷</div>}<input type="file" hidden accept="image/*" onChange={async(e:any)=>{const f=e.target.files[0]; if(f){const u=await uploadImage(f); setEditData({...editData, avatar:u})}}}/></label></div><input value={editData.username} onChange={e=>setEditData({...editData, username:e.target.value})} style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:8, border:"none", fontSize:12}}/><input value={editData.name} onChange={e=>setEditData({...editData, name:e.target.value})} style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:8, border:"none", fontSize:12}}/><input value={editData.bio} onChange={e=>setEditData({...editData, bio:e.target.value})} style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:12, border:"none", fontSize:12}}/><div style={{display:"flex", gap:8}}><button onClick={()=>setShowEdit(false)} style={{flex:1, border:"1px solid #ddd", padding:10, borderRadius:12, fontSize:12}}>Cancel</button><button onClick={saveProfile} style={{flex:1, background:"black", color:"white", padding:10, borderRadius:12, fontSize:12}}>{uploading?"Uploading...":"Save"}</button></div></div></div>}

      {showLogin && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}><div style={{background:"white", width:"100%", maxWidth:300, borderRadius:20, padding:20, textAlign:"center"}}><h2 style={{fontWeight:"bold", fontSize:18, color:"#9333ea"}}>ChitPix 🌸</h2><p style={{fontSize:12, opacity:0.6, margin:"6px 0 14px"}}>Nee username pettu bro!</p><input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="mahesh30" style={{width:"100%", padding:12, background:"#f4f4f5", borderRadius:12, border:"none", fontSize:14}}/><button onClick={doLogin} style={{width:"100%", background:"black", color:"white", padding:12, borderRadius:12, marginTop:10, fontWeight:"bold", fontSize:14}}>Login - ChitPix Loki Ra!</button></div></div>}

      <div style={{position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #eee", display:"flex", justifyContent:"space-around", padding:"4px 0", zIndex:20}}>
        <button onClick={()=>setTab("home")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="home"?1:0.35, border:"none", background:"none"}}><span style={{fontSize:52}}>🏠</span><span style={{fontSize:8, marginTop:2}}>Home</span></button>
        <button onClick={()=>setTab("search")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="search"?1:0.35, border:"none", background:"none"}}><span style={{fontSize:52}}>🔍</span><span style={{fontSize:8, marginTop:2}}>Search</span></button>
        <button onClick={()=>setTab("reels")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="reels"?1:0.35, border:"none", background:"none"}}><span style={{fontSize:52}}>🎬</span><span style={{fontSize:8, marginTop:2}}>Reels</span></button>
        <button onClick={()=>setTab("likes")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="likes"?1:0.35, border:"none", background:"none"}}><span style={{fontSize:52}}>❤️</span><span style={{fontSize:8, marginTop:2}}>Likes</span></button>
        <button onClick={()=>setTab("profile")} style={{display:"flex", flexDirection:"column", alignItems:"center", opacity: tab==="profile"?1:0.35, border:"none", background:"none"}}><span style={{fontSize:52}}>👤</span><span style={{fontSize:8, marginTop:2}}>Profile</span></button>
      </div>
    </div>
  )
  }
