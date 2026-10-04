"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Page(){
  const [myUser] = useState("mahesh")
  const [myAvatar, setMyAvatar] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [tab, setTab] = useState("home")
  const [searchText, setSearchText] = useState("")
  const [following, setFollowing] = useState<string[]>([])
  const [liked, setLiked] = useState<number[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [showAddPost, setShowAddPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState("")
  const [editUsername, setEditUsername] = useState(myUser)
  const [editBio, setEditBio] = useState("My Bio")
  const [editAvatar, setEditAvatar] = useState("")
  const [editAvatarFile, setEditAvatarFile] = useState<any>(null)
  const [zoomImg, setZoomImg] = useState("")
  const [viewUser, setViewUser] = useState<any>(null)

  useEffect(()=>{ loadAll() },[])

  async function loadAll(){
    const { data: prof } = await supabase.from("profiles").select("*").eq("username", myUser).single()
    if(prof){ setMyAvatar(prof.avatar_url || ""); setEditAvatar(prof.avatar_url || ""); setEditBio(prof.bio || "My Bio"); setEditUsername(prof.username) }
    const { data: p } = await supabase.from("posts").select("*").order("id", {ascending:false})
    if(p) setPosts(p)
    const { data: users } = await supabase.from("profiles").select("*")
    if(users) setAllUsers(users)
    const { data: f } = await supabase.from("follows").select("*").eq("follower_username", myUser)
    if(f) setFollowing(f.map((x:any)=>x.following_username))
    const { data: l } = await supabase.from("likes").select("*").eq("username", myUser)
    if(l) setLiked(l.map((x:any)=>x.post_id))
  }

  async function handleAvatarChange(e:any){
    const file = e.target.files[0]; if(!file) return
    setEditAvatarFile(file); setEditAvatar(URL.createObjectURL(file))
  }

  async function handleSaveProfile(){
    let finalAvatar = myAvatar
    if(editAvatarFile){
      const fileName = `${myUser}_${Date.now()}.jpg`
      await supabase.storage.from("chitpix").upload(fileName, editAvatarFile)
      const { data } = supabase.storage.from("chitpix").getPublicUrl(fileName)
      finalAvatar = data.publicUrl
    }
    await supabase.from("profiles").update({ username: editUsername, bio: editBio, avatar_url: finalAvatar }).eq("username", myUser)
    setMyAvatar(finalAvatar); setEditOpen(false); loadAll()
  }

  async function toggleFollow(u:string){
    if(following.includes(u)){
      await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",u)
      setFollowing(following.filter(f=>f!==u))
    } else {
      await supabase.from("follows").insert({follower_username:myUser, following_username:u})
      setFollowing([...following, u])
    }
  }

  async function toggleLike(postId:number){
    if(liked.includes(postId)){
      await supabase.from("likes").delete().eq("username",myUser).eq("post_id",postId)
      setLiked(liked.filter(id=>id!==postId))
    } else {
      await supabase.from("likes").insert({username:myUser, post_id:postId})
      setLiked([...liked, postId])
    }
  }

  function viewProfileOf(username:string){
    const u = allUsers.find((x:any)=>x.username===username)
    if(u){ setViewUser(u); setTab("search") }
    setSearchText(username)
  }

  async function handleAddPost(){
    if(!newPostImage.trim()){ alert("Image URL pettali!"); return }
    const { data } = await supabase.from("posts").insert({username:myUser, content:newPostContent, image_url:newPostImage, avatar_url:myAvatar}).select()
    if(data){ setPosts([data[0],...posts]); setNewPostContent(""); setNewPostImage(""); setShowAddPost(false) }
  }

  const filteredUsers = allUsers.filter((u:any)=> u.username.toLowerCase().includes(searchText.toLowerCase().replace("@","")))

  return(
    <div style={{minHeight:"100vh", background:"#fff", color:"#000", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:70}}>
      <div style={{padding:"12px 14px", borderBottom:"1px solid #efefef", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"white", zIndex:10}}>
        <b style={{fontSize:22}}>ChitPix</b>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <button onClick={()=>setShowAddPost(true)} style={{border:"1px solid #dbdbdb", background:"white", padding:"5px 12px", borderRadius:8, cursor:"pointer"}}>+ Post</button>
          <span style={{fontSize:12, background:"#f0f0f0", padding:"5px 10px", borderRadius:20}}>@{myUser}</span>
        </div>
      </div>

      {tab==="home" && <>
        <div style={{padding:10, display:"flex", gap:14, overflowX:"auto", borderBottom:"1px solid #f5f5f5"}}>
          {following.map((u:any)=><div key={u} onClick={()=>viewProfileOf(u)} style={{minWidth:64, textAlign:"center", cursor:"pointer"}}>
            <div style={{width:56, height:56, borderRadius:"50%", background:"#ddd", margin:"0 auto", border:"2px solid #ff0066", padding:2}}><div style={{width:"100%", height:"100%", borderRadius:"50%", background:"#eee"}}></div></div><div style={{fontSize:11, marginTop:4}}>{u}</div>
          </div>)}
        </div>
        {posts.map((p:any)=><div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
          <div style={{display:"flex", justifyContent:"space-between", padding:"10px 12px", alignItems:"center"}}>
            <div style={{display:"flex", gap:8, alignItems:"center", cursor:"pointer"}} onClick={()=>viewProfileOf(p.username)}>
              <img src={p.avatar_url || "https://via.placeholder.com/40"} style={{width:32, height:32, borderRadius:"50%", objectFit:"cover"}} />
              <b style={{fontSize:14}}>{p.username}</b>
            </div>
            <button onClick={()=>toggleFollow(p.username)} style={{fontSize:12, border:"1px solid #dbdbdb", padding:"4px 10px", borderRadius:6, background: following.includes(p.username)? "black" : "white", color: following.includes(p.username)? "white" : "black", cursor:"pointer"}}>{following.includes(p.username)? "Following" : "Follow"}</button>
          </div>
          <div style={{background:"#000"}}><img src={p.image_url} onClick={()=>setZoomImg(p.image_url)} style={{width:"100%", display:"block"}} /></div>
          <div style={{padding:"10px 12px", display:"flex", gap:14}}>
            <span onClick={()=>toggleLike(p.id)} style={{fontSize:22, cursor:"pointer"}}>{liked.includes(p.id)? "❤️" : "🤍"}</span><span>💬</span><span>✈️</span>
          </div>
          <div style={{padding:"0 12px 12px", fontSize:14}}><b>{p.username}</b> {p.content}</div>
        </div>)}
      </>}

      {tab==="search" && <div style={{padding:12}}>
        <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search users..." style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #ddd", background:"#f5f5f5"}} />
        {viewUser && <div style={{marginTop:20, textAlign:"center", border:"1px solid #efefef", borderRadius:12, padding:20}}><img src={viewUser.avatar_url || "https://via.placeholder.com/80"} style={{width:80, height:80, borderRadius:"50%", objectFit:"cover"}}/><h3>{viewUser.username}</h3><p style={{fontSize:13, color:"#666"}}>{viewUser.bio || "No bio"}</p><button onClick={()=>toggleFollow(viewUser.username)} style={{marginTop:10, padding:"6px 16px", borderRadius:8, background: following.includes(viewUser.username)?"black":"white", color: following.includes(viewUser.username)?"white":"black", border:"1px solid #ddd"}}>{following.includes(viewUser.username)?"Following":"Follow"}</button><button onClick={()=>setViewUser(null)} style={{marginLeft:8, padding:"6px 12px", borderRadius:8, border:"1px solid #ddd", background:"white"}}>Back</button></div>}
        <div style={{marginTop:12}}>{filteredUsers.map((u:any)=><div key={u.username} style={{display:"flex", justifyContent:"space-between", padding:"10px 0", alignItems:"center", borderBottom:"1px solid #fafafa"}}><div style={{display:"flex", gap:10, alignItems:"center", cursor:"pointer"}} onClick={()=>{setViewUser(u); setSearchText(u.username)}}><img src={u.avatar_url || "https://via.placeholder.com/40"} style={{width:40, height:40, borderRadius:"50%", objectFit:"cover"}}/><div><div style={{fontSize:14, fontWeight:600}}>{u.username}</div><div style={{fontSize:12, color:"#888"}}>{u.bio || ""}</div></div></div><button onClick={()=>toggleFollow(u.username)} style={{fontSize:12, padding:"4px 10px", borderRadius:6, border:"1px solid #ddd", background: following.includes(u.username)?"black":"white", color: following.includes(u.username)?"white":"black"}}>{following.includes(u.username)?"Following":"Follow"}</button></div>)}</div>
      </div>}

      {tab==="reels" && <div>{posts.map((p:any)=><div key={p.id} style={{height:"75vh", background:"#000", position:"relative", marginBottom:2}}><img src={p.image_url} style={{width:"100%", height:"100%", objectFit:"cover"}}/><div style={{position:"absolute", bottom:10, left:10, color:"white"}}><b>@{p.username}</b><div style={{fontSize:13}}>{p.content}</div></div></div>)}</div>}

      {tab==="likes" && <div style={{padding:12}}><h3>Liked Posts</h3>{posts.filter((p:any)=>liked.includes(p.id)).length===0? <p style={{color:"#888", fontSize:14}}>No likes yet</p> : posts.filter((p:any)=>liked.includes(p.id)).map((p:any)=><div key={p.id} style={{marginBottom:10, border:"1px solid #efefef", borderRadius:10, overflow:"hidden"}}><img src={p.image_url} style={{width:"100%"}}/><div style={{padding:8, fontSize:13}}><b>{p.username}</b> {p.content}</div></div>)}</div>}

      {tab==="profile" && <div style={{padding:14}}><div style={{display:"flex", gap:20, alignItems:"center"}}><img src={myAvatar || "https://via.placeholder.com/80"} style={{width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"1px solid #ddd"}} /><div><h3 style={{margin:0}}>{myUser}</h3><p style={{fontSize:13, color:"#666", margin:"4px 0"}}>{editBio}</p><button onClick={()=>{setEditAvatar(myAvatar); setEditOpen(true)}} style={{border:"1px solid #dbdbdb", padding:"5px 12px", borderRadius:6, background:"white", cursor:"pointer"}}>Edit Profile</button></div></div><div style={{marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2}}>{posts.filter((p:any)=>p.username.toLowerCase()===myUser.toLowerCase()).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", aspectRatio:"1/1", objectFit:"cover"}} onClick={()=>setZoomImg(p.image_url)} />)}</div></div>}

      <div style={{position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"white", borderTop:"1px solid #efefef", display:"flex", justifyContent:"space-around", padding:"12px 0", zIndex:100}}>
        <span onClick={()=>setTab("home")} style={{cursor:"pointer"}}><svg width="24" height="24" viewBox="0 0 24 24" fill={tab==="home"? "black" : "none"} stroke="black" strokeWidth={tab==="home"? "2.5" : "1.6"}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg></span>
        <span onClick={()=>setTab("search")} style={{cursor:"pointer"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={tab==="search"? "2.5" : "1.6"}><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg></span>
        <span onClick={()=>setTab("reels")} style={{cursor:"pointer"}}><svg width="24" height="24" viewBox="0 0 24 24" fill={tab==="reels"? "black" : "none"} stroke="black" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill={tab==="reels"? "white" : "black"} stroke="none"/></svg></span>
        <span onClick={()=>setTab("likes")} style={{cursor:"pointer"}}><svg width="24" height="24" viewBox="0 0 24 24" fill={tab==="likes"? "black" : "none"} stroke="black" strokeWidth={tab==="likes"? "2.5" : "1.6"}><path d="M12 20l-1.5-1.4C5 14 2 11.2 2 7.7 2 4.5 4.5 2 7.7 2c1.8 0 3.5.8 4.3 2.1C12.8 2.8 14.5 2 16.3 2 19.5 2 22 4.5 22 7.7c0 3.5-3 6.3-8.5 10.9L12 20z"/></svg></span>
        <span onClick={()=>setTab("profile")} style={{width:26, height:26, borderRadius:"50%", cursor:"pointer", overflow:"hidden", border: tab==="profile"? "2px solid black" : "1px solid #ddd", padding: tab==="profile"? "1px" : "0"}}><img src={myAvatar || "https://via.placeholder.com/26"} style={{width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%"}} /></span>
      </div>

      {editOpen && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
        <div style={{background:"white", borderRadius:12, padding:20, width:"100%", maxWidth:360}}>
          <h3>Edit Profile</h3>
          <div style={{display:"flex", justifyContent:"center", marginBottom:15}}>
            <label style={{cursor:"pointer", position:"relative"}}>
              <img src={editAvatar || myAvatar || "https://via.placeholder.com/80"} style={{width:90, height:90, borderRadius:"50%", objectFit:"cover", border:"2px solid #ddd"}} />
              <div style={{position:"absolute", bottom:0, right:0, background:"black", color:"white", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center"}}>📷</div>
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <input value={editUsername} onChange={e=>setEditUsername(e.target.value)} placeholder="Username" style={{width:"100%", padding:10, marginBottom:10, borderRadius:8, border:"1px solid #ddd"}} />
          <input value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" style={{width:"100%", padding:10, marginBottom:15, borderRadius:8, border:"1px solid #ddd"}} />
          <div style={{display:"flex", gap:10}}><button onClick={()=>setEditOpen(false)} style={{flex:1, padding:10, borderRadius:8, border:"1px solid #ddd", background:"white"}}>Cancel</button><button onClick={handleSaveProfile} style={{flex:1, padding:10, borderRadius:8, background:"black", color:"white", border:"none"}}>Save</button></div>
        </div>
      </div>}

      {zoomImg && <div onClick={()=>setZoomImg("")} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center"}}><img src={zoomImg} style={{maxWidth:"95%", maxHeight:"90%", objectFit:"contain"}} /><span style={{position:"absolute", top:15, right:20, color:"white", fontSize:24}}>✕</span></div>}
      {showAddPost && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}><div style={{background:"white", borderRadius:12, padding:20, width:"100%", maxWidth:360}}><h3>New Post</h3><input value={newPostContent} onChange={e=>setNewPostContent(e.target.value)} placeholder="Caption..." style={{width:"100%", padding:10, marginBottom:10, borderRadius:8, border:"1px solid #ddd"}} /><input value={newPostImage} onChange={e=>setNewPostImage(e.target.value)} placeholder="Image URL" style={{width:"100%", padding:10, marginBottom:15, borderRadius:8, border:"1px solid #ddd"}} /><div style={{display:"flex", gap:10}}><button onClick={()=>setShowAddPost(false)} style={{flex:1, padding:10, borderRadius:8, border:"1px solid #ddd", background:"white"}}>Cancel</button><button onClick={handleAddPost} style={{flex:1, padding:10, borderRadius:8, background:"black", color:"white", border:"none"}}>Post</button></div></div></div>}
    </div>
  )
              }
