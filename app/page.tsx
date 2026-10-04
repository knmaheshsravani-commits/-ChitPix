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
  const [profile,setProfile]=useState<any>({username:"@knmahesh30", name:"Mahesh", avatar_url:"", bio:"I love ChitPix 🌸"})
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
  const [followersCount,setFollowersCount]=useState(0)
  const [followingCount,setFollowingCount]=useState(0)

  async function load(){
    const d1 = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(d1.data) setPosts(d1.data)
    const d2 = await supabase.from("profiles").select("*").eq("username","@knmahesh30")
    if(d2.data && d2.data.length > 0){ setProfile(d2.data[0]); setEditData(d2.data[0]) }
    const d3 = await supabase.from("comments").select("*").order("created_at",{ascending:false})
    if(d3.data) setComments(d3.data)
    const d4 = await supabase.from("stories").select("*").order("created_at",{ascending:false})
    if(d4.data) setStories(d4.data)
    const saved = localStorage.getItem("chitpix_user")
    if(saved){ setUsername(saved) } else { setShowLogin(true) }
    const myUser = localStorage.getItem("chitpix_user") || "@knmahesh30"
    const f1 = await supabase.from("follows").select("*").eq("following_username", "@knmahesh30")
    if(f1.data) setFollowersCount(f1.data.length)
    const f2 = await supabase.from("follows").select("*").eq("follower_username", myUser)
    if(f2.data) setFollowingCount(f2.data.length)
  }
  useEffect(()=>{ load() }, [])

  async function uploadImage(file:any){
    setUploading(true)
    const name = Date.now()+"_"+file.name.replace(/\s/g,"_")
    await supabase.storage.from("chitpix").upload(name, file, { contentType: file.type, cacheControl: "3600" })
    const res = supabase.storage.from("chitpix").getPublicUrl(name)
    setUploading(false)
    return res.data.publicUrl
  }
  async function addPost(e:any){
    const file = e.target.files? e.target.files[0] : null
    let url = ""
    if(file){ url = await uploadImage(file) }
    if(!text.trim() &&!url) return
    await supabase.from("posts").insert({content:text, image_url:url, username: username || "@knmahesh30", likes: 0})
    setText(""); load(); setTab("home")
  }
  async function addReel(e:any){
    const file = e.target.files?.[0]
    if(!file) return
    alert("Reel uploading...")
    const url = await uploadImage(file)
    await supabase.from("posts").insert({ content: "Reel", image_url: url, username: username || "@knmahesh30", likes: 0 })
    load(); alert("Reel added!")
  }
  async function addStory(e:any){
    const file = e.target.files? e.target.files[0] : null
    if(!file) return
    const url = await uploadImage(file)
    const { error } = await supabase.from("stories").insert({ image_url: url, username: username || "@knmahesh30", created_at: new Date().toISOString() })
    if(error){ alert("Error: "+error.message); return }
    load(); alert("Story added! 🟣")
  }
  async function saveProfile(){
    try{
      let finalUrl = editData.avatar_url
      if(finalUrl && finalUrl.startsWith("blob:")){
        const r = await fetch(finalUrl)
        const b = await r.blob()
        finalUrl = await uploadImage(new File([b], `avatar_${Date.now()}.jpg`, {type:b.type}))
      }
      const finalData = {...editData, avatar_url: finalUrl}
      await supabase.from("profiles").upsert({username:"@knmahesh30",...finalData})
      setProfile(finalData as any); setShowEdit(false); alert("Saved! ✅"); load()
    }catch(e:any){ alert("Error: "+e.message) }
  }
  async function handleProfileShare(){
    const link = window.location.origin
    const txt = `Chudu na ChitPix Profile! 🌸 ${profile.username} - ${link}`
    if((navigator as any).share){ try{ await (navigator as any).share({title:"ChitPix", text:txt, url:link}) }catch{} }
    else { await navigator.clipboard.writeText(txt); alert("Profile Link Copied! ✅") }
  }
  async function handleLike(id:any, likes:any){
    const isLiked = likedIds.includes(id)
    if(isLiked){ setLikedIds(likedIds.filter((i)=>i!==id)); await supabase.from("posts").update({likes: Math.max(0,likes-1)}).eq("id",id) }
    else { setLikedIds([...likedIds, id]); await supabase.from("posts").update({likes: likes+1}).eq("id",id) }
    load()
  }
  async function handleFlower(id:any, flowers:any){
    setFlowerAnim(id); setTimeout(()=>setFlowerAnim(null),1000)
    await supabase.from("posts").update({flowers: (flowers||0)+1}).eq("id",id); load()
  }
  async function handleShare(p:any){
    if((navigator as any).share){ try{ await (navigator as any).share({title:"ChitPix", text:p.content, url:window.location.href}) }catch{} }
    else { await navigator.clipboard.writeText(window.location.href); alert("Link Copied!") }
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

  async function handleFollow(userToFollow:string){
    const myUser = localStorage.getItem("chitpix_user") || "@knmahesh30"
    if(userToFollow===myUser){ alert("Nee account ne follow cheyalevu 😅"); return }
    const check = await supabase.from("follows").select("*").eq("follower_username", myUser).eq("following_username", userToFollow)
    if(check.data && check.data.length>0){
      await supabase.from("follows").delete().eq("follower_username", myUser).eq("following_username", userToFollow)
      alert("Unfollowed!")
    } else {
      await supabase.from("follows").insert({follower_username:myUser, following_username:userToFollow})
      alert("Followed! ✅")
    }
    load()
  }

  async function handleDownload(url:string){
    try{
      const a=document.createElement("a")
      a.href=url
      a.download="chitpix_"+Date.now()+".jpg"
      a.target="_blank"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }catch{
      window.open(url,"_blank")
    }
  }

  const filtered = posts.filter((p:any)=>{
    const s = searchText.toLowerCase()
    return p.content?.toLowerCase().includes(s) || p.username?.toLowerCase().includes(s)
  })

  return(
    <div style={{minHeight:"100vh", background:"white", color:"black", paddingBottom:70, fontFamily:"system-ui"}}>
      <div style={{padding:12, borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", position:"sticky", top:0, background:"white", zIndex:10}}><b style={{color:"#9333ea"}}>ChitPix 🌸</b><span style={{fontSize:10, opacity:0.6}}>{username}</span></div>

      {tab==="home" && <div style={{display:"flex", gap:12, padding:10, borderBottom:"1px solid #eee", overflowX:"auto"}}><label style={{display:"flex", flexDirection:"column", alignItems:"center", minWidth:50}}><div style={{width:48, height:48, borderRadius:24, background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", border:"2px dashed #9333ea"}}>+</div><span style={{fontSize:8}}>Add Story</span><input type="file" hidden accept="image/*" onChange={addStory}/></label>{stories.map((s:any)=><div key={s.id} onClick={()=>setViewStory(s)} style={{display:"flex", flexDirection:"column", alignItems:"center", minWidth:50}}><img src={s.image_url} style={{width:48, height:48, borderRadius:24, border:"2px solid #9333ea"}}/><span style={{fontSize:8}}>{s.username.slice(0,8)}</span></div>)}</div>}

      {tab==="home" && <div style={{padding:12, display:"flex", gap:8}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro?" style={{flex:1, background:"#f4f4f5", padding:10, borderRadius:12, border:"none"}}/><button onClick={()=>addPost({target:{files:[]}})} style={{background:"black", color:"white", padding:"0 14px", borderRadius:12}}>Post</button></div>}

      {tab==="home" && posts.map((p:any)=><div key={p.id} style={{padding:12, borderBottom:"1px solid #eee"}}><b style={{fontSize:12}}>{p.username}</b><div style={{fontSize:13}}>{p.content}</div>{p.image_url && <img src={p.image_url} style={{width:"100%", borderRadius:14, marginTop:6}}/>}<div style={{display:"flex", gap:14, marginTop:8}}><button onClick={()=>handleLike(p.id, p.likes||0)} style={{border:"none", background:"none"}}>❤️ {p.likes||0}</button><button onClick={()=>handleFlower(p.id, p.flowers||0)} style={{border:"none", background:"none"}}>🌸 {p.flowers||0}</button><button onClick={()=>setCommentOpen(commentOpen===p.id?null:p.id)} style={{border:"none", background:"none"}}>💬</button><button onClick={()=>handleShare(p)} style={{border:"none", background:"none"}}>↗️</button></div></div>)}

      {tab==="search" && <div style={{padding:12}}><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search..." style={{width:"100%", background:"#f4f4f5", padding:10, borderRadius:12, border:"none"}}/><div style={{marginTop:12}}>{filtered.map((p:any)=><div key={p.id} style={{padding:10, borderBottom:"1px solid #eee"}}><b>{p.username}</b> - {p.content}</div>)}</div></div>}

      {tab==="reels" && <div style={{background:"black", minHeight:"90vh"}}>
  {posts.filter((p:any)=>p.image_url).slice(0,10).map((p:any)=><div key={p.id} style={{position:"relative", height:"91vh", background:"black", overflow:"hidden", borderBottom:"1px solid #222"}}>
    {/* Video/Image - Full Scene */}
    {p.image_url.includes(".mp4") ? 
      <video src={p.image_url} autoPlay loop muted playsInline style={{width:"100%", height:"100%", objectFit:"cover"}}/> :
      <img src={p.image_url} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
    }
    {/* Top Bar - Reels Friends - Like Screenshot */}
    <div style={{position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)", zIndex:2}}>
      <div style={{display:"flex", alignItems:"center", gap:18, color:"white", fontSize:18, fontWeight:"bold"}}>
        <span style={{fontSize:24}}>+</span>
        <span>Reels</span>
        <span style={{opacity:0.7}}>Friends</span>
      </div>
      <div style={{display:"flex", gap:2}}>
        <div style={{width:14, height:14, background:"white", borderRadius:7, opacity:0.9}}></div>
        <div style={{width:14, height:14, background:"white", borderRadius:7, opacity:0.6}}></div>
        <div style={{width:14, height:14, background:"white", borderRadius:7, opacity:0.3}}></div>
      </div>
    </div>

    {/* Right Side Icons - EXACT Screenshot Style */}
    <div style={{position:"absolute", right:10, bottom:120, display:"flex", flexDirection:"column", gap:18, alignItems:"center", zIndex:2}}>
      <button onClick={()=>handleLike(p.id, p.likes||0)} style={{background:"none", border:"none", color:"white", textAlign:"center"}}>
        <div style={{fontSize:26}}>{likedIds.includes(p.id) ? "❤️" : "♡"}</div>
        <div style={{fontSize:13, fontWeight:"600", marginTop:2}}>{p.likes ? (p.likes>1000 ? (p.likes/1000).toFixed(0)+'K' : p.likes) : '250K'}</div>
      </button>
      <button onClick={()=>{setCommentOpen(p.id); setTab("home")}} style={{background:"none", border:"none", color:"white", textAlign:"center"}}>
        <div style={{fontSize:26}}>💬</div>
        <div style={{fontSize:13, fontWeight:"600", marginTop:2}}>{comments.filter((c:any)=>c.post_id===p.id).length || '3,311'}</div>
      </button>
      <button onClick={()=>handleShare(p)} style={{background:"none", border:"none", color:"white", textAlign:"center"}}>
        <div style={{fontSize:26}}>↻</div>
        <div style={{fontSize:13, fontWeight:"600", marginTop:2}}>2,241</div>
      </button>
      <button onClick={()=>handleShare(p)} style={{background:"none", border:"none", color:"white", textAlign:"center"}}>
        <div style={{fontSize:26}}>✈️</div>
        <div style={{fontSize:13, fontWeight:"600", marginTop:2}}>235K</div>
      </button>
      <button onClick={()=>handleDownload(p.image_url)} style={{background:"none", border:"none", color:"white", textAlign:"center"}}>
        <div style={{fontSize:24}}>🔖</div>
        <div style={{fontSize:13, fontWeight:"600", marginTop:2}}>20.2K</div>
      </button>
      <div style={{width:32, height:32, borderRadius:6, border:"2px solid white", overflow:"hidden", marginTop:6}}>
        <img src={p.image_url} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
      </div>
    </div>

    {/* Bottom User Info - Screenshot Style */}
    <div style={{position:"absolute", left:12, right:80, bottom:20, color:"white", zIndex:2}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div style={{width:32, height:32, borderRadius:16, background:"#333", overflow:"hidden"}}><img src={p.image_url} style={{width:"100%", height:"100%", objectFit:"cover"}}/></div>
        <b style={{fontSize:15}}>{p.username?.slice(0,15) || 'kochiatmosph...'}</b>
        <button onClick={()=>handleFollow(p.username)} style={{border:"1.5px solid white", color:"white", background:"transparent", padding:"4px 16px", borderRadius:8, fontSize:14, fontWeight:"600"}}>Follow</button>
      </div>
      <div style={{fontSize:15, marginTop:8, lineHeight:"18px"}}>{p.content || 'Part 2 ...'}</div>
    </div>

    {/* Bottom Progress */}
    <div style={{position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.3)"}}><div style={{width:"30%", height:"100%", background:"white"}}></div></div>
  </div>)}
</div>}

      {tab==="likes" && <div style={{padding:12}}><h3 style={{fontWeight:"bold"}}>Liked ❤️</h3>{posts.filter((p:any)=>likedIds.includes(p.id)).map((p:any)=><div key={p.id} style={{padding:10, borderBottom:"1px solid #eee"}}>{p.content}</div>)}</div>}

      {tab==="profile" && <div style={{textAlign:"center", padding:20}}>
        <div style={{width:90, height:90, borderRadius:"50%", overflow:"hidden", margin:"0 auto", border:"3px solid #a855f7"}}>
          <img src={profile?.avatar_url || "https://via.placeholder.com/90"} style={{width:"100%", height:"100%", objectFit:"cover"}} alt="profile"/>
        </div>
        <h3 style={{marginTop:10, fontWeight:"bold"}}>{profile?.username}</h3>
        <p style={{fontSize:13}}>{profile?.name}</p>
        <p style={{fontSize:12, opacity:0.6}}>{profile?.bio}</p>
        <div style={{display:"flex", justifyContent:"center", gap:20, marginTop:14}}>
          <div><b>{posts.filter((p:any)=>p.username===profile?.username).length}</b><div style={{fontSize:11, opacity:0.6}}>Posts</div></div>
          <div><b>{followersCount}</b><div style={{fontSize:11, opacity:0.6}}>Followers</div></div>
          <div><b>{followingCount}</b><div style={{fontSize:11, opacity:0.6}}>Following</div></div>
        </div>
        <div style={{display:"flex", gap:8, marginTop:15}}>
          <button onClick={()=>setShowEdit(true)} style={{flex:1, padding:10, borderRadius:20, border:"1px solid #ccc", background:"white", fontWeight:"bold"}}>Edit Profile</button>
          <button onClick={handleProfileShare} style={{flex:1, padding:10, borderRadius:20, background:"black", color:"white", fontWeight:"bold"}}>Share Profile ↗️</button>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginTop:20}}>
          {posts.filter((p:any)=>p.username===profile?.username || p.username==="@knmahesh30").map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", aspectRatio:"1", objectFit:"cover"}}/>)}
        </div>
      </div>}

      {viewStory && <div onClick={()=>setViewStory(null)} style={{position:"fixed", inset:0, background:"black", zIndex:40, display:"flex", alignItems:"center", justifyContent:"center"}}><img src={viewStory.image_url} style={{maxWidth:"100%", maxHeight:"90vh"}}/><button onClick={()=>setViewStory(null)} style={{position:"absolute", top:15, right:15, color:"white", background:"rgba(0,0,0,0.5)", borderRadius:20, width:30, height:30, border:"none"}}>X</button></div>}

      {showEdit && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:30, display:"flex", alignItems:"flex-end"}}><div style={{background:"white", width:"100%", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20}}><h3 style={{fontWeight:"bold"}}>Edit Profile</h3><div style={{display:"flex", justifyContent:"center", margin:"12px 0"}}><label>{editData.avatar_url? <img src={editData.avatar_url} style={{width:70, height:70, borderRadius:35, objectFit:"cover"}}/> : <div style={{width:70, height:70, background:"#e4e4e7", borderRadius:35, display:"flex", alignItems:"center", justifyContent:"center"}}>📷</div>}<input type="file" hidden accept="image/*" onChange={async(e:any)=>{const f=e.target.files[0]; if(f){const u=URL.createObjectURL(f); setEditData({...editData, avatar_url:u}); const realUrl=await uploadImage(f); setEditData((prev:any)=>({...prev, avatar_url:realUrl}))}}}/></label></div><input value={editData.name} onChange={e=>setEditData({...editData, name:e.target.value})} placeholder="Name" style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:8, border:"none"}}/><input value={editData.bio} onChange={e=>setEditData({...editData, bio:e.target.value})} placeholder="Bio" style={{width:"100%", padding:10, background:"#f4f4f5", borderRadius:12, marginBottom:12, border:"none"}}/><div style={{display:"flex", gap:8}}><button onClick={()=>setShowEdit(false)} style={{flex:1, border:"1px solid #ddd", padding:10, borderRadius:12}}>Cancel</button><button onClick={saveProfile} style={{flex:1, background:"black", color:"white", padding:10, borderRadius:12}}>{uploading?"Uploading...":"Save ✅"}</button></div></div></div>}

      {showLogin && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}><div style={{background:"white", width:"100%", maxWidth:300, borderRadius:20, padding:20, textAlign:"center"}}><h2 style={{fontWeight:"bold", color:"#9333ea"}}>ChitPix 🌸</h2><input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="mahesh30" style={{width:"100%", padding:12, background:"#f4f4f5", borderRadius:12, border:"none", marginTop:10}}/><button onClick={doLogin} style={{width:"100%", background:"black", color:"white", padding:12, borderRadius:12, marginTop:10, fontWeight:"bold"}}>Login</button></div></div>}

      <div style={{position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #eee", display:"flex", justifyContent:"space-around", padding:"6px 0"}}>
        <button onClick={()=>setTab("home")} style={{opacity:tab==="home"?1:0.4, border:"none", background:"none"}}>🏠</button>
        <button onClick={()=>setTab("search")} style={{opacity:tab==="search"?1:0.4, border:"none", background:"none"}}>🔍</button>
        <button onClick={()=>setTab("reels")} style={{opacity:tab==="reels"?1:0.4, border:"none", background:"none"}}>🎬</button>
        <button onClick={()=>setTab("likes")} style={{opacity:tab==="likes"?1:0.4, border:"none", background:"none"}}>❤️</button>
        <button onClick={()=>setTab("profile")} style={{opacity:tab==="profile"?1:0.4, border:"none", background:"none"}}>👤</button>
      </div>
    </div>
  )
       }
