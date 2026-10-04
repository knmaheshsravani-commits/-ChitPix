"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Page(){
  const [myUser, setMyUser] = useState("mahesh")
  const [myAvatar, setMyAvatar] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [tab, setTab] = useState("home")
  const [searchText, setSearchText] = useState("")
  const [following, setFollowing] = useState<string[]>([])
  const [commentOpen, setCommentOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [showAddPost, setShowAddPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState("")
  const [editUsername, setEditUsername] = useState(myUser)
  const [editBio, setEditBio] = useState("")
  const [editAvatar, setEditAvatar] = useState("")
  const [editAvatarFile, setEditAvatarFile] = useState<any>(null)
  const [zoomImg, setZoomImg] = useState("")

  useEffect(()=>{ loadAll() },[])

  async function loadAll(){
    const { data: prof } = await supabase.from("profiles").select("*").eq("username", myUser).single()
    if(prof){ setMyAvatar(prof.avatar_url || ""); setEditAvatar(prof.avatar_url || ""); setEditBio(prof.bio || ""); setEditUsername(prof.username) }
    const { data: p } = await supabase.from("posts").select("*").order("id", {ascending:false})
    if(p) setPosts(p)
    const { data: f } = await supabase.from("follows").select("*").eq("follower_username", myUser)
    if(f) setFollowing(f.map((x:any)=>x.following_username))
  }

  async function handleAvatarChange(e:any){
    const file = e.target.files[0]; if(!file) return
    setEditAvatarFile(file); setEditAvatar(URL.createObjectURL(file))
  }

  async function handleSaveProfile(){
    let finalAvatar = myAvatar
    if(editAvatarFile){
      const fileName = `${myUser}_${Date.now()}.jpg`
      await supabase.storage.from("avatars").upload(fileName, editAvatarFile, { upsert: true })
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
      finalAvatar = data.publicUrl
    }
    await supabase.from("profiles").update({ username: editUsername, bio: editBio, avatar_url: finalAvatar }).eq("username", myUser)
    setMyUser(editUsername); setMyAvatar(finalAvatar); setEditOpen(false); loadAll()
  }

  async function toggleFollow(u:string){
    if(following.includes(u)){
      await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",u)
      setFollowing(following.filter((f:any)=>f!==u))
    } else {
      await supabase.from("follows").insert({follower_username:myUser, following_username:u})
      setFollowing([...following, u])
    }
  }

  function viewProfileOf(username:string){
    setSearchText(username.replace("@","")); setTab("search")
  }

  async function handleAddPost(){
    if(!newPostImage.trim()){ alert("Image URL pettali bro!"); return }
    const { data } = await supabase.from("posts").insert({username:myUser, content:newPostContent, image_url:newPostImage}).select()
    if(data){ setPosts([data[0],...posts]); setNewPostContent(""); setNewPostImage(""); setShowAddPost(false) }
  }

  return(
    <div style={{minHeight:"100vh", background:"#fff", color:"#000", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:70}}>
      <div style={{padding:"12px 14px", borderBottom:"1px solid #efefef", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <b style={{fontSize:22}}>ChitPix</b>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <button onClick={()=>setShowAddPost(true)} style={{border:"1px solid #dbdbdb", background:"white", padding:"5px 12px", borderRadius:8}}> + Post</button>
          <span style={{fontSize:12, background:"#f0f0f0", padding:"5px 10px", borderRadius:20}}>@{myUser}</span>
        </div>
      </div>

      {tab==="home" && <div style={{padding:10, display:"flex", gap:14, overflowX:"auto", borderBottom:"1px solid #f5f5f5"}}>
        {following.map((u:any)=><div key={u} onClick={()=>viewProfileOf(u)} style={{minWidth:64, textAlign:"center"}}>
          <div style={{width:56, height:56, borderRadius:"50%", background:"#ddd", margin:"0 auto"}}></div><div style={{fontSize:11}}>{u}</div>
        </div>)}
      </div>}

      {tab==="home" && posts.map((p:any)=><div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
        <div style={{display:"flex", justifyContent:"space-between", padding:"10px 12px", alignItems:"center"}}>
          <div style={{display:"flex", gap:8, alignItems:"center", cursor:"pointer"}} onClick={()=>viewProfileOf(p.username)}>
            <img src={p.avatar_url || myAvatar || "https://via.placeholder.com/40"} style={{width:32, height:32, borderRadius:"50%", objectFit:"cover"}} />
            <b style={{fontSize:14}}>{p.username}</b>
          </div>
          <button onClick={()=>toggleFollow(p.username)} style={{fontSize:12, border:"1px solid #dbdbdb", padding:"4px 8px", borderRadius:6, background: following.includes(p.username)? "black" : "white", color: following.includes(p.username)? "white" : "black"}}>{following.includes(p.username)? "Following" : "Follow"}</button>
        </div>
        <div style={{position:"relative", background:"#000", overflow:"hidden"}} onDoubleClick={()=>setZoomImg(p.image_url)}>
          <img src={p.image_url} onClick={()=>setZoomImg(p.image_url)} style={{width:"100%", display:"block", touchAction:"pan-y", cursor:"zoom-in"}} />
        </div>
        <div style={{padding:"10px 12px", display:"flex", gap:14, fontSize:20}}><span>❤️</span><span>💬</span></div>
        <div style={{padding:"0 12px 12px", fontSize:14}}><b>{p.username}</b> {p.content}</div>
      </div>)}

      {tab==="profile" && <div style={{padding:14}}><div style={{display:"flex", gap:20, alignItems:"center"}}>
        <img src={myAvatar || "https://via.placeholder.com/80"} style={{width:80, height:80, borderRadius:"50%", objectFit:"cover"}} />
        <div><h3 style={{margin:0}}>{myUser}</h3><p style={{fontSize:13, color:"#666"}}>{editBio || "My Bio"}</p><button onClick={()=>{setEditAvatar(myAvatar); setEditOpen(true)}} style={{border:"1px solid #dbdbdb", padding:"5px 12px", borderRadius:6, background:"white"}}>Edit Profile</button></div>
      </div></div>}

      <div style={{position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"white", borderTop:"1px solid #efefef", display:"flex", justifyContent:"space-around", padding:"10px 0"}}>
        <span onClick={()=>setTab("home")} style={{fontSize:24, cursor:"pointer", opacity:tab==="home"?1:0.4}}>🏠</span>
        <span onClick={()=>setTab("search")} style={{fontSize:22, cursor:"pointer", opacity:tab==="search"?1:0.4}}>🔍</span>
        <span onClick={()=>setTab("reels")} style={{fontSize:22, cursor:"pointer", opacity:tab==="reels"?1:0.4}}>🎬</span>
        <span onClick={()=>setTab("likes")} style={{fontSize:22, cursor:"pointer", opacity:tab==="likes"?1:0.4}}>❤️</span>
        <span onClick={()=>setTab("profile")} style={{width:26, height:26, borderRadius:"50%", background:"#ddd", cursor:"pointer", overflow:"hidden"}}><img src={myAvatar || "https://via.placeholder.com/26"} style={{width:"100%", height:"100%", objectFit:"cover"}} /></span>
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

      {zoomImg && <div onClick={()=>setZoomImg("")} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <img src={zoomImg} style={{maxWidth:"95%", maxHeight:"90%", objectFit:"contain"}} />
        <span style={{position:"absolute", top:15, right:20, color:"white", fontSize:24, cursor:"pointer"}}>✕</span>
      </div>}

      {showAddPost && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
        <div style={{background:"white", borderRadius:12, padding:20, width:"100%", maxWidth:360}}>
          <h3>New Post</h3>
          <input value={newPostContent} onChange={e=>setNewPostContent(e.target.value)} placeholder="Caption..." style={{width:"100%", padding:10, marginBottom:10, borderRadius:8, border:"1px solid #ddd"}} />
          <input value={newPostImage} onChange={e=>setNewPostImage(e.target.value)} placeholder="Image URL" style={{width:"100%", padding:10, marginBottom:15, borderRadius:8, border:"1px solid #ddd"}} />
          <div style={{display:"flex", gap:10}}><button onClick={()=>setShowAddPost(false)} style={{flex:1, padding:10, borderRadius:8, border:"1px solid #ddd", background:"white"}}>Cancel</button><button onClick={handleAddPost} style={{flex:1, padding:10, borderRadius:8, background:"black", color:"white", border:"none"}}>Post</button></div>
        </div>
      </div>}
    </div>
  )
                                                   }
