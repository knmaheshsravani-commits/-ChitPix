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
  const [playingReels,setPlayingReels]=useState<any>({})
  const [mutedReels,setMutedReels]=useState<any>({})
  const [myUser,setMyUser]=useState("mahesh")
  const [editOpen,setEditOpen]=useState(false)
  const [bio,setBio]=useState("Chitradurga | Photography 📸")
  const [newUsername,setNewUsername]=useState("mahesh")

  useEffect(()=>{load()},[])

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
    const newLikes=likes+1
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
    } else {
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
    }catch{
      window.open(url,"_blank")
    }
  }

  return(
    <div style={{minHeight:"100vh", background:"#fff", color:"#000", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:70, fontFamily:"-apple-system, system-ui"}}>
      {/* HEADER */}
      <div style={{padding:"12px 14px", borderBottom:"1px solid #efefef", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"white", zIndex:10}}>
        <b style={{fontSize:22, fontFamily:"cursive"}}>ChitPix</b>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <span style={{fontSize:12, background:"#f0f0f0", padding:"5px 10px", borderRadius:20}}>@{myUser}</span>
          <span onClick={()=>setEditOpen(true)} style={{fontSize:20, cursor:"pointer"}}>⚙️</span>
        </div>
      </div>

      {/* STORIES */}
      {tab==="home" && <div style={{padding:10, display:"flex", gap:14, overflowX:"auto", borderBottom:"1px solid #efefef"}}>
        <div style={{minWidth:64, textAlign:"center"}}><div style={{width:56, height:56, borderRadius:"50%", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding:2, margin:"0 auto"}}><div style={{background:"white", width:"100%", height:"100%", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>➕</div></div><div style={{fontSize:11, marginTop:4}}>Your story</div></div>
        {following.map((u:any)=><div key={u} onClick={()=>viewProfileOf(u)} style={{minWidth:64, textAlign:"center", cursor:"pointer"}}><div style={{width:56, height:56, borderRadius:"50%", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976)", padding:2, margin:"0 auto"}}><div style={{background:"white", width:"100%", height:"100%", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{u[0]?.toUpperCase()}</div></div><div style={{fontSize:11, marginTop:4}}>{u}</div></div>)}
      </div>}

      {/* HOME FEED */}
      {tab==="home" && posts.map((p:any)=><div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
        <div style={{display:"flex", justifyContent:"space-between", padding:"10px 12px", alignItems:"center"}}>
          <div style={{display:"flex", gap:8, alignItems:"center"}} onClick={()=>viewProfileOf(p.username)}><div style={{width:32, height:32, borderRadius:"50%", background:"#ddd", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{p.username?.[0]?.toUpperCase()}</div><div><div style={{fontSize:13, fontWeight:600}}>{p.username}</div><div style={{fontSize:10, color:"#777"}}>Chitradurga</div></div></div>
          <div style={{display:"flex", gap:10, alignItems:"center"}}><button onClick={()=>toggleFollow(p.username)} style={{fontSize:12, border:"1px solid #dbdbdb", borderRadius:6, padding:"5px 12px", background:following.includes(p.username)?"#000":"#0095f6", color:"white", fontWeight:600}}>{following.includes(p.username)?"Following":"Follow"}</button><span onClick={()=>handleDownload(p.image_url)} style={{cursor:"pointer"}}>⬇️</span></div>
        </div>
        <div style={{position:"relative", background:"#000"}} onDoubleClick={()=>handleLike(p.id, p.likes||0)}>
          {p.image_url?.toLowerCase().endsWith(".mp4")||p.image_url?.includes("video")?<video src={p.image_url} style={{width:"100%", maxHeight:500, objectFit:"cover"}} controls/>:<img src={p.image_url} style={{width:"100%", display:"block"}} alt="post"/>}
          {showHeart===p.id && <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, animation:"pop 0.8s"}}>❤️</div>}
        </div>
        <div style={{padding:"10px 12px", display:"flex", gap:14, fontSize:22}}><span onClick={()=>handleLike(p.id, p.likes||0)} style={{cursor:"pointer"}}>{posts.find((x:any)=>x.id===p.id)?.likes? "❤️" : "🤍"} </span><span onClick={()=>setCommentOpen(p.id)} style={{cursor:"pointer"}}>💬</span><span onClick={()=>handleDownload(p.image_url)} style={{cursor:"pointer"}}>📤</span></div>
        <div style={{padding:"0 12px 12px", fontSize:14}}><div style={{fontWeight:600}}>{p.likes||0} likes</div><div><b>{p.username}</b> {p.content}</div><div onClick={()=>setCommentOpen(p.id)} style={{color:"#8e8e8e", marginTop:4, cursor:"pointer"}}>View {comments.filter((c:any)=>c.post_id==p.id).length} comments</div></div>
      </div>)}

      {/* SEARCH */}
      {tab==="search" && <div style={{padding:12}}><input value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder="Search" style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"none", background:"#efefef", outline:"none"}}/><div style={{marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2}}>{posts.filter((p:any)=>p.username?.toLowerCase().includes(searchText.toLowerCase())||p.content?.toLowerCase().includes(searchText.toLowerCase())).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", height:120, objectFit:"cover"}}/> )}</div></div>}

      {/* REELS */}
      {tab==="reels" && <div style={{background:"black"}}>{posts.filter((p:any)=>p.image_url).map((p:any)=>{const isMuted=mutedReels[p.id]??true; const isPlaying=playingReels[p.id]??true; return <div key={p.id} style={{position:"relative", height:"calc(100vh - 120px)", borderBottom:"1px solid #222", background:"#000"}} onClick={(e:any)=>{if(e.target.closest("button")) return; const v=document.getElementById("reel_"+p.id) as any; if(v){ if(isPlaying) v.pause(); else v.play(); } setPlayingReels({...playingReels,[p.id]:!isPlaying})}}><video id={"reel_"+p.id} src={p.image_url} autoPlay loop muted={isMuted} playsInline style={{width:"100%", height:"100%", objectFit:"cover"}}/><button onClick={()=>setMutedReels({...mutedReels,[p.id]:!isMuted})} style={{position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.5)", color:"white", border:"none", borderRadius:20, padding:"6px 10px", fontSize:16}}>{isMuted?"🔇":"🔊"}</button><div style={{position:"absolute", bottom:16, left:12, color:"white", right:50}}><div style={{fontWeight:700}}>@{p.username} {following.includes(p.username)?"• Following":""}</div><div style={{fontSize:14, marginTop:4}}>{p.content}</div><div style={{marginTop:6}}>❤️ {p.likes||0} 💬 {comments.filter((c:any)=>c.post_id==p.id).length}</div></div></div>})}</div>}

      {/* LIKES / FOLLOWING */}
      {tab==="likes" && <div style={{padding:12}}><h3 style={{fontSize:16}}>Following ({following.length})</h3>{following.length===0&&<div style={{color:"#777", marginTop:20}}>No following yet</div>}{following.map((u:any)=><div key={u} style={{padding:"12px 0", borderBottom:"1px solid #efefef", display:"flex", justifyContent:"space-between", alignItems:"center"}}><div style={{display:"flex", gap:10, alignItems:"center"}}><div style={{width:40, height:40, borderRadius:"50%", background:"#ddd", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>{u[0].toUpperCase()}</div><b>{u}</b></div><button onClick={()=>toggleFollow(u)} style={{border:"1px solid #dbdbdb", borderRadius:6, padding:"6px 14px", background:"white", fontWeight:600}}>Unfollow</button></div>)}</div>}

      {/* PROFILE */}
      {tab==="profile" && <div style={{padding:14}}><div style={{display:"flex", gap:20, alignItems:"center"}}><div style={{width:80, height:80, borderRadius:"50%", background:"#ddd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700}}>{myUser[0].toUpperCase()}</div><div style={{display:"flex", gap:20}}><div style={{textAlign:"center"}}><b>{posts.filter((p:any)=>p.username===myUser).length}</b><div style={{fontSize:12}}>Posts</div></div><div style={{textAlign:"center"}}><b>{following.length}</b><div style={{fontSize:12}}>Following</div></div><div style={{textAlign:"center"}}><b>{posts.reduce((s:any,p:any)=>s+(p.likes||0),0)}</b><div style={{fontSize:12}}>Likes</div></div></div></div><div style={{marginTop:12}}><b>{myUser}</b><div style={{fontSize:13, color:"#444", marginTop:2}}>{bio}</div></div><button onClick={()=>setEditOpen(true)} style={{marginTop:12, width:"100%", padding:8, borderRadius:6, border:"1px solid #dbdbdb", background:"white", fontWeight:600}}>Edit Profile</button><div style={{marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2}}>{posts.filter((p:any)=>p.username===myUser).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%", height:110, objectFit:"cover"}}/>)}</div></div>}

      {/* NEW BOTTOM NAV DESIGN */}
      <div style={{position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"white", borderTop:"1px solid #dbdbdb", display:"flex", justifyContent:"space-around", padding:"8px 0 14px", zIndex:50}}>
        <span onClick={()=>setTab("home")} style={{fontSize:24, cursor:"pointer", opacity:tab==="home"?1:0.4, fontWeight:tab==="home"?900:400}}>⌂</span>
        <span onClick={()=>setTab("search")} style={{fontSize:22, cursor:"pointer", opacity:tab==="search"?1:0.4}}>⌕</span>
        <span onClick={()=>setTab("reels")} style={{fontSize:22, cursor:"pointer", opacity:tab==="reels"?1:0.4}}>▶</span>
        <span onClick={()=>setTab("likes")} style={{fontSize:22, cursor:"pointer", opacity:tab==="likes"?1:0.4}}>♡</span>
        <span onClick={()=>setTab("profile")} style={{width:26, height:26, borderRadius:"50%", background:tab==="profile"?"black":"#ddd", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, cursor:"pointer", border:tab==="profile"?"2px solid black":"1px solid #dbdbdb"}}>{myUser[0].toUpperCase()}</span>
      </div>

      {/* COMMENTS - FIXED BOTTOM NAV PAINA */}
      {commentOpen && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"flex-end"}} onClick={()=>setCommentOpen(null)}><div onClick={(e)=>e.stopPropagation()} style={{background:"white", width:"100%", maxHeight:"65vh", borderTopLeftRadius:20, borderTopRightRadius:20, padding:12, paddingBottom:20, marginBottom:60, overflowY:"auto"}}><div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}><b>Comments</b><button onClick={()=>setCommentOpen(null)} style={{border:"none", background:"none", fontSize:18, cursor:"pointer"}}>✕</button></div><div style={{maxHeight:"35vh", overflowY:"auto", marginBottom:10}}>{comments.filter((c:any)=>c.post_id==commentOpen).map((c:any)=><div key={c.id} style={{display:"flex", gap:8, marginBottom:8, fontSize:13}}><b>{c.username}</b><span>{c.content}</span></div>)}{comments.filter((c:any)=>c.post_id==commentOpen).length===0&&<div style={{color:"#777", fontSize:12, textAlign:"center", marginTop:20}}>No comments yet. Be first! 👇</div>}</div><div style={{display:"flex", gap:8, borderTop:"1px solid #eee", paddingTop:8}}><input value={commentText} onChange={(e)=>setCommentText(e.target.value)} placeholder="Add a comment..." style={{flex:1, border:"1px solid #ddd", borderRadius:20, padding:"8px 14px", outline:"none"}}/><button onClick={()=>addComment(commentOpen)} style={{background:"#0095f6", color:"white", border:"none", borderRadius:20, padding:"8px 16px", fontWeight:700, cursor:"pointer"}}>Post</button></div></div></div>}

      {/* EDIT PROFILE */}
      {editOpen && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}><div style={{background:"white", width:"100%", maxWidth:360, borderRadius:16, padding:16}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:12}}><b>Edit Profile</b><button onClick={()=>setEditOpen(false)} style={{border:"none", background:"none", fontSize:18}}>✕</button></div><div style={{fontSize:12, marginBottom:4}}>Username</div><input value={newUsername} onChange={(e)=>setNewUsername(e.target.value)} style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10}}/><div style={{fontSize:12, marginBottom:4}}>Bio</div><textarea value={bio} onChange={(e)=>setBio(e.target.value)} style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", minHeight:60}}/><button onClick={()=>{setMyUser(newUsername); setEditOpen(false)}} style={{marginTop:12, width:"100%", padding:10, borderRadius:8, border:"none", background:"black", color:"white", fontWeight:700}}>Save</button></div></div>}

      <style>{`@keyframes pop{0%{transform:scale(0)}50%{transform:scale(1.4)}100%{transform:scale(1)}}`}</style>
    </div>
  )
          }
