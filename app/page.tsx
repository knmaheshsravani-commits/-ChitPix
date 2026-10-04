"use client"
import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

export default function Page(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [comments,setComments]=useState<any[]>([])
  const [following,setFollowing]=useState<string[]>([])
  const [commentOpen,setCommentOpen]=useState<any>(null)
  const [commentText,setCommentText]=useState("")
  const [searchText,setSearchText]=useState("")
  const [showHeart,setShowHeart]=useState<any>(null)
  const [mutedReels,setMutedReels]=useState<any>({})
  const [myUser,setMyUser]=useState("mahesh")
  const [editOpen,setEditOpen]=useState(false)
  const [bio,setBio]=useState("Chitradurga | Photography 📸")
  const [newUsername,setNewUsername]=useState("mahesh")
  const [newBio,setNewBio]=useState("Chitradurga | Photography 📸")
  const [showAddPost,setShowAddPost]=useState(false)
  const [newPostContent,setNewPostContent]=useState("")
  const [newPostImage,setNewPostImage]=useState("")

  useEffect(()=>{ load() },[])

  async function load(){
    const {data:p}=await supabase.from("posts").select("*").order("id",{ascending:false})
    if(p) setPosts(p)
    const {data:c}=await supabase.from("comments").select("*").order("id",{ascending:false})
    if(c) setComments(c)
    const {data:f}=await supabase.from("follows").select("*")
    if(f){
      const mine=f.filter((x:any)=>x.follower_username===myUser).map((x:any)=>x.following_username)
      setFollowing(mine)
    }
  }

  async function handleLike(id:number, likes:number){
    const newLikes=(likes||0)+1
    await supabase.from("posts").update({likes:newLikes}).eq("id",id)
    setPosts(posts.map((p:any)=>p.id===id?{...p,likes:newLikes}:p))
    setShowHeart(id)
    setTimeout(()=>setShowHeart(null),800)
  }

  async function addComment(post_id:any){
    if(!commentText.trim()) return
    const {data}=await supabase.from("comments").insert({post_id, username:myUser, content:commentText}).select()
    if(data){ setComments([...data,...comments]); setCommentText("") }
  }

  async function toggleFollow(userToFollow:string){
    if(userToFollow===myUser) return
    const {data}=await supabase.from("follows").select("*").eq("follower_username",myUser).eq("following_username",userToFollow)
    if(data && data.length>0){
      await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",userToFollow)
      setFollowing(following.filter((f:any)=>f!==userToFollow))
    }else{
      await supabase.from("follows").insert({follower_username:myUser, following_username:userToFollow})
      setFollowing([...following, userToFollow])
    }
  }

  function viewProfileOf(username:string){
    setSearchText(username.replace("@",""))
    setTab("search")
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
    }catch{ window.open(url,"_blank") }
  }

  async function handleAddPost(){
    if(!newPostImage.trim()){ alert("Image URL pettali bro!"); return }
    const {data}=await supabase.from("posts").insert({username:myUser, content:newPostContent, image_url:newPostImage, likes:0}).select()
    if(data){ setPosts([...data, ...posts]); setNewPostContent(""); setNewPostImage(""); setShowAddPost(false); setTab("home") }
  } 
  return(
    <div style={{minHeight:"100vh", background:"#fff", color:"#000", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:70}}>
      <div style={{padding:"12px 14px", borderBottom:"1px solid #efefef", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"white", zIndex:10}}>
        <b style={{fontSize:22}}>ChitPix</b>
        <div style={{display:"flex", gap:10}}>
          <button onClick={()=>setShowAddPost(true)} style={{border:"1px solid #dbdbdb", background:"white", borderRadius:6, padding:"4px 10px"}}>+</button>
          <span style={{fontSize:12, background:"#f0f0f0", padding:"5px 10px", borderRadius:20}}>@{myUser}</span>
        </div>
      </div>

      {tab==="home" && <div style={{padding:10, display:"flex", gap:14, overflowX:"auto", borderBottom:"1px solid #efefef"}}>
        <div style={{minWidth:64, textAlign:"center"}}><div style={{width:56, height:56, borderRadius:"50%", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding:2, margin:"0 auto"}}><div style={{background:"white", width:"100%", height:"100%", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>➕</div></div><div style={{fontSize:11, marginTop:4}}>Your story</div></div>
        {following.map((u:any)=><div key={u} onClick={()=>viewProfileOf(u)} style={{minWidth:64, textAlign:"center", cursor:"pointer"}}><div style={{width:56, height:56, borderRadius:"50%", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976)", padding:2, margin:"0 auto"}}><div style={{background:"white", width:"100%", height:"100%", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{u[0]?.toUpperCase()}</div></div><div style={{fontSize:11, marginTop:4}}>{u}</div></div>)}
      </div>}

      {tab==="home" && posts.map((p:any)=><div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
        <div style={{display:"flex", justifyContent:"space-between", padding:"10px 12px", alignItems:"center"}}>
          <div style={{display:"flex", gap:8, alignItems:"center", cursor:"pointer"}} onClick={()=>viewProfileOf(p.username)}><div style={{width:32, height:32, borderRadius:"50%", background:"#eee", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{p.username?.[0]?.toUpperCase()}</div><div><div style={{fontSize:13, fontWeight:600}}>{p.username}</div><div style={{fontSize:10, color:"#777"}}>Chitradurga</div></div></div>
          <div style={{display:"flex", gap:8, alignItems:"center"}}><button onClick={()=>toggleFollow(p.username)} style={{fontSize:11, border:"1px solid #dbdbdb", borderRadius:6, padding:"5px 12px", background:following.includes(p.username)?"black":"#0095f6", color:"white", fontWeight:600}}>{following.includes(p.username)?"Following":"Follow"}</button><span onClick={()=>handleDownload(p.image_url)} style={{cursor:"pointer"}}>⬇️</span></div>
        </div>
        <div style={{position:"relative", background:"#000"}} onDoubleClick={()=>handleLike(p.id, p.likes||0)}>
          {p.image_url?.toLowerCase().includes(".mp4")?<video src={p.image_url} style={{width:"100%", display:"block"}} controls/>:<img src={p.image_url} style={{width:"100%", display:"block"}} alt="post"/>}
          {showHeart===p.id && <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, animation:"pop 0.8s"}}>❤️</div>}
        </div>
        <div style={{padding:"10px 12px", display:"flex", gap:14, fontSize:20}}><span onClick={()=>handleLike(p.id, p.likes||0)} style={{cursor:"pointer"}}>❤️ {p.likes||0}</span><span onClick={()=>setCommentOpen(p.id)} style={{cursor:"pointer"}}>💬 {comments.filter((c:any)=>c.post_id==p.id).length}</span><span onClick={()=>handleDownload(p.image_url)} style={{cursor:"pointer"}}>📤</span></div>
        <div style={{padding:"0 12px 12px", fontSize:14}}><b>{p.username}</b> {p.content}<div onClick={()=>setCommentOpen(p.id)} style={{color:"#8e8e8e", marginTop:4, cursor:"pointer"}}>View all {comments.filter((c:any)=>c.post_id==p.id).length} comments</div></div>
      </div>)}

            {tab==="search" && <div style={{padding:12}}><input value={searchText} onChange={(e:any)=>setSearchText(e.target.value)} placeholder="Search" style={{width:"100%", padding:10, background:"#efefef", borderRadius:10, border:"none"}}/><div style={{marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2}}>{posts.filter((p:any)=>p.username?.toLowerCase().includes(searchText.toLowerCase())).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", height:120, objectFit:"cover"}}/>)}</div></div>}

            {tab==="reels" && <div style={{background:"black", paddingBottom:70}}>{posts.map((p:any)=>{const isMuted=mutedReels[p.id]??true; return <div key={p.id} style={{position:"relative", height:"calc(100vh - 140px)", borderBottom:"1px solid #222", background:"#000"}}><video src={p.image_url} autoPlay loop muted={isMuted} playsInline onClick={()=>setMutedReels({...mutedReels,[p.id]:!isMuted})} style={{width:"100%", height:"100%", objectFit:"cover"}}/><div style={{position:"absolute", top:10, right:10, display:"flex", flexDirection:"column", alignItems:"center", gap:18, color:"white"}}><div onClick={()=>handleLike(p.id,p.likes||0)} style={{textAlign:"center", cursor:"pointer"}}><div style={{fontSize:28}}>❤️</div><div style={{fontSize:12}}>{p.likes||1}</div></div><div onClick={()=>setCommentOpen(p.id)} style={{textAlign:"center", cursor:"pointer"}}><div style={{fontSize:26}}>💬</div><div style={{fontSize:12}}>{comments.filter((c:any)=>String(c.post_id)===String(p.id)).length || 0}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:24}}>📤</div><div style={{fontSize:12}}>88.3K</div></div><div style={{textAlign:"center"}}><div style={{fontSize:22}}>🔖</div><div style={{fontSize:12}}>17.7K</div></div><div onClick={()=>handleDownload(p.image_url)} style={{width:36, height:36, borderRadius:"50%", border:"1px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer"}}>⬇️</div></div><div style={{position:"absolute", bottom:14, left:12, right:70, color:"white"}}><div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:32, height:32, borderRadius:"50%", background:"linear-gradient(45deg,#feda75,#d62976)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{p.username?.[0]?.toUpperCase()||"K"}</div><b>{p.username||"knmahesh30"}</b><button onClick={()=>toggleFollow(p.username)} style={{marginLeft:8, fontSize:11, padding:"4px 12px", borderRadius:6, border:"1px solid white", background:following.includes(p.username)?"white":"transparent", color:following.includes(p.username)?"black":"white", fontWeight:600}}>{following.includes(p.username)?"Following":"Follow"}</button></div><div style={{fontSize:13, marginTop:6}}>Reel • {p.content||""}</div></div><button onClick={()=>setMutedReels({...mutedReels,[p.id]:!isMuted})} style={{position:"absolute", top:14, right:70, background:"rgba(0,0,0,0.5)", color:"white", border:"none", borderRadius:20, padding:"5px 8px", fontSize:12}}>{isMuted?"🔇":"🔊"}</button></div>})}</div>}
            

      {tab==="likes" && <div style={{padding:12}}><h3 style={{fontSize:16}}>Following ({following.length})</h3>{following.length===0&&<div style={{color:"#777", marginTop:20, textAlign:"center"}}>No following yet. Go follow people!</div>}{following.map((u:any)=><div key={u} style={{padding:"12px 0", borderBottom:"1px solid #efefef", display:"flex", justifyContent:"space-between", alignItems:"center"}}><div style={{display:"flex", gap:10, alignItems:"center"}}><div style={{width:40, height:40, borderRadius:"50%", background:"#eee", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{u[0].toUpperCase()}</div><b>{u}</b></div><button onClick={()=>toggleFollow(u)} style={{border:"1px solid #dbdbdb", borderRadius:6, padding:"6px 14px", background:"white", fontWeight:600}}>Unfollow</button></div>)}</div>}

      {tab==="profile" && <div style={{padding:14}}><div style={{display:"flex", gap:20, alignItems:"center"}}><div style={{width:80, height:80, borderRadius:"50%", background:"#ddd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700}}>{myUser[0].toUpperCase()}</div><div style={{display:"flex", gap:20}}><div style={{textAlign:"center"}}><b>{posts.filter((p:any)=>p.username===myUser).length}</b><div style={{fontSize:12}}>Posts</div></div><div style={{textAlign:"center"}}><b>{following.length}</b><div style={{fontSize:12}}>Following</div></div><div style={{textAlign:"center"}}><b>{posts.reduce((s:any,p:any)=>s+(p.likes||0),0)}</b><div style={{fontSize:12}}>Likes</div></div></div></div><div style={{marginTop:12}}><b>{myUser}</b><div style={{fontSize:13, color:"#444", marginTop:2}}>{bio}</div></div><button onClick={()=>{setNewUsername(myUser); setNewBio(bio); setEditOpen(true)}} style={{marginTop:12, width:"100%", padding:8, borderRadius:6, border:"1px solid #dbdbdb", background:"white", fontWeight:600}}>Edit Profile</button><div style={{marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2}}>{posts.filter((p:any)=>p.username===myUser).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", height:110, objectFit:"cover"}} alt="my post"/>)}</div></div>}

      <div style={{position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"white", borderTop:"1px solid #dbdbdb", display:"flex", justifyContent:"space-around", padding:"8px 0 14px", zIndex:50}}>
        <span onClick={()=>setTab("home")} style={{fontSize:24, cursor:"pointer", opacity:tab==="home"?1:0.35}}>⌂</span>
        <span onClick={()=>setTab("search")} style={{fontSize:22, cursor:"pointer", opacity:tab==="search"?1:0.35}}>⌕</span>
        <span onClick={()=>setTab("reels")} style={{fontSize:22, cursor:"pointer", opacity:tab==="reels"?1:0.35}}>▶</span>
        <span onClick={()=>setTab("likes")} style={{fontSize:22, cursor:"pointer", opacity:tab==="likes"?1:0.35}}>♡</span>
        <span onClick={()=>setTab("profile")} style={{width:26, height:26, borderRadius:"50%", background:tab==="profile"?"black":"#ddd", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, cursor:"pointer", border:tab==="profile"?"2px solid black":"1px solid #dbdbdb"}}>{myUser[0].toUpperCase()}</span>
      </div>

      {commentOpen && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"flex-end"}} onClick={()=>setCommentOpen(null)}><div onClick={(e)=>e.stopPropagation()} style={{background:"white", width:"100%", maxHeight:"65vh", borderTopLeftRadius:20, borderTopRightRadius:20, padding:12, paddingBottom:20, marginBottom:60, overflowY:"auto"}}><div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}><b>Comments</b><button onClick={()=>setCommentOpen(null)} style={{border:"none", background:"none", fontSize:18, cursor:"pointer"}}>✕</button></div><div style={{maxHeight:"35vh", overflowY:"auto", marginBottom:10}}>{comments.filter((c:any)=>c.post_id==commentOpen).map((c:any)=><div key={c.id} style={{display:"flex", gap:8, marginBottom:10, fontSize:13}}><b>{c.username}</b><span>{c.content}</span></div>)}{comments.filter((c:any)=>c.post_id==commentOpen).length===0&&<div style={{color:"#777", fontSize:12, textAlign:"center", marginTop:20}}>No comments yet. Be first! 👇</div>}</div><div style={{display:"flex", gap:8, borderTop:"1px solid #eee", paddingTop:8}}><input value={commentText} onChange={(e:any)=>setCommentText(e.target.value)} placeholder="Add a comment..." style={{flex:1, border:"1px solid #ddd", borderRadius:20, padding:"8px 14px", outline:"none"}}/><button onClick={()=>addComment(commentOpen)} style={{background:"#0095f6", color:"white", border:"none", borderRadius:20, padding:"8px 16px", fontWeight:700, cursor:"pointer"}}>Post</button></div></div></div>}

      {editOpen && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}><div style={{background:"white", width:"100%", maxWidth:360, borderRadius:16, padding:16}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:12}}><b>Edit Profile</b><button onClick={()=>setEditOpen(false)} style={{border:"none", background:"none", fontSize:18}}>✕</button></div><div style={{fontSize:12, marginBottom:4}}>Username</div><input value={newUsername} onChange={(e:any)=>setNewUsername(e.target.value)} style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10}}/><div style={{fontSize:12, marginBottom:4}}>Bio</div><textarea value={newBio} onChange={(e:any)=>setNewBio(e.target.value)} style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", minHeight:60}}/><button onClick={()=>{setMyUser(newUsername); setBio(newBio); setEditOpen(false)}} style={{marginTop:12, width:"100%", padding:10, borderRadius:8, border:"none", background:"black", color:"white", fontWeight:700}}>Save</button></div></div>}

      {showAddPost && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}><div style={{background:"white", width:"100%", maxWidth:360, borderRadius:16, padding:16}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:12}}><b>New Post</b><button onClick={()=>setShowAddPost(false)} style={{border:"none", background:"none", fontSize:18}}>✕</button></div><input value={newPostImage} onChange={(e:any)=>setNewPostImage(e.target.value)} placeholder="Image URL (mp4 for reels)" style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10}}/><textarea value={newPostContent} onChange={(e:any)=>setNewPostContent(e.target.value)} placeholder="Caption..." style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", minHeight:60}}/><button onClick={handleAddPost} style={{marginTop:12, width:"100%", padding:10, borderRadius:8, border:"none", background:"#0095f6", color:"white", fontWeight:700}}>Share</button></div></div>}

      <style>{`@keyframes pop{0%{transform:scale(0)}50%{transform:scale(1.4)}100%{transform:scale(1)}}`}</style>
    </div>
  )
        }
