"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Page(){
  const myUser="mahesh"
  const [myAvatar,setMyAvatar]=useState("")
  const [posts,setPosts]=useState<any[]>([])
  const [allUsers,setAllUsers]=useState<any[]>([])
  const [tab,setTab]=useState("home")
  const [following,setFollowing]=useState<string[]>([])
  const [liked,setLiked]=useState<number[]>([])
  const [saved,setSaved]=useState<number[]>([])
  const [comments,setComments]=useState<any>({})
  const [commentText,setCommentText]=useState("")
  const [openComment,setOpenComment]=useState<number|null>(null)
  const [showAdd,setShowAdd]=useState(false)
  const [newCap,setNewCap]=useState("")
  const [newImg,setNewImg]=useState("")
  const [zoom,setZoom]=useState("")
  const [search,setSearch]=useState("")
  const [msgUser,setMsgUser]=useState<any>(null)
  const [msgText,setMsgText]=useState("")
  const [msgs,setMsgs]=useState<any[]>([])
  const [editOpen,setEditOpen]=useState(false)
  const [editBio,setEditBio]=useState("My Bio")
  const [notifs,setNotifs]=useState<string[]>(["knmahesh30 liked your post","tom_ liked your story"])

  useEffect(()=>{ load() },[])
  async function load(){
    const p=await supabase.from("profiles").select("*").eq("username",myUser).single()
    if(p.data) setMyAvatar(p.data.avatar_url||"")
    const postsData=await supabase.from("posts").select("*").order("id",{ascending:false})
    if(postsData.data) setPosts(postsData.data.filter((x:any)=>x.image_url))
    const users=await supabase.from("profiles").select("*")
    if(users.data) setAllUsers(users.data)
    const f=await supabase.from("follows").select("*").eq("follower_username",myUser)
    if(f.data) setFollowing(f.data.map((a:any)=>a.following_username))
    const l=await supabase.from("likes").select("*").eq("username",myUser)
    if(l.data) setLiked(l.data.map((a:any)=>a.post_id))
  }

  const toggleFollow=async(un:string)=>{
    if(following.includes(un)){
      await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",un)
      setFollowing(following.filter(f=>f!==un))
    }else{
      await supabase.from("follows").insert({follower_username:myUser,following_username:un})
      setFollowing([...following,un])
      setNotifs([`You followed ${un}`,...notifs])
    }
  }
  const toggleLike=async(id:number)=>{
    if(liked.includes(id)){
      await supabase.from("likes").delete().eq("username",myUser).eq("post_id",id)
      setLiked(liked.filter(x=>x!==id))
    }else{
      await supabase.from("likes").insert({username:myUser,post_id:id})
      setLiked([...liked,id])
    }
  }
  const addComment=(id:number)=>{
    if(!commentText.trim()) return
    const c=comments[id]||[]
    setComments({...comments,[id]:[...c,{user:myUser,text:commentText}]})
    setCommentText("")
    setNotifs([`You commented on post ${id}`,...notifs])
  }

  return (
    <div style={{minHeight:"100vh",background:"white",maxWidth:480,margin:"0 auto",paddingBottom:80,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,borderBottom:"1px solid #eee",position:"sticky",top:0,background:"white",zIndex:10}}>
        <span onClick={()=>setShowAdd(true)} style={{fontSize:26,cursor:"pointer"}}>＋</span>
        <b style={{fontSize:22,fontWeight:900}}>chitpix<span style={{color:"#a020f0"}}>.com</span></b>
        <span onClick={()=>setTab("notif")} style={{fontSize:22,cursor:"pointer"}}>❤️</span>
      </div>

      {tab==="home" && (
        <div>
          <div style={{display:"flex",gap:12,padding:"10px",overflowX:"auto",borderBottom:"1px solid #efefef"}}>
            <div style={{minWidth:64,textAlign:"center"}}><div style={{width:60,height:60,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>M</div><div style={{fontSize:11,marginTop:4}}>Your story</div></div>
            {allUsers.map((u:any)=><div key={u.username} style={{minWidth:64,textAlign:"center"}}><div style={{width:60,height:60,borderRadius:"50%",padding:2,background:"linear-gradient(45deg,#feda75,#d62976,#4f5bd5)",margin:"0 auto"}}><img src={u.avatar_url||"https://i.pravatar.cc/100?u="+u.username} style={{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid white",objectFit:"cover"}}/></div><div style={{fontSize:11,marginTop:4}}>{u.username.slice(0,8)}</div></div>)}
          </div>
          {posts.map((p:any)=>(
            <div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
              <div style={{display:"flex",alignItems:"center",padding:10,gap:8}}><div style={{width:32,height:32,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{p.username[0].toUpperCase()}</div><b style={{fontSize:13}}>{p.username}</b><button onClick={()=>toggleFollow(p.username)} style={{marginLeft:"auto",padding:"5px 12px",borderRadius:6,border:"none",background:following.includes(p.username)?"#efefef":"#0095f6",color:following.includes(p.username)?"black":"white",fontWeight:700,fontSize:12}}>{following.includes(p.username)?"Following":"Follow"}</button></div>
              <img src={p.image_url} style={{width:"100%",display:"block"}} onClick={()=>setZoom(p.image_url)}/>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px"}}><div style={{display:"flex",gap:14}}><span onClick={()=>toggleLike(p.id)} style={{fontSize:22,cursor:"pointer"}}>{liked.includes(p.id)?"❤️":"🤍"}</span><span onClick={()=>setOpenComment(openComment===p.id?null:p.id)} style={{fontSize:20,cursor:"pointer"}}>💬</span><span onClick={()=>{const np:any={id:Date.now(),username:myUser,content:"Reposted: "+p.content,image_url:p.image_url}; setPosts([np,...posts])}} style={{fontSize:20,cursor:"pointer"}}>🔁</span><span onClick={()=>{navigator.clipboard.writeText(p.image_url); alert("Link copied!")}} style={{fontSize:18,cursor:"pointer"}}>✈️</span><span onClick={()=>{const a=document.createElement("a"); a.href=p.image_url; a.target="_blank"; a.click()}} style={{fontSize:16,cursor:"pointer"}}>⬇️</span></div><span onClick={()=>setSaved(saved.includes(p.id)?saved.filter(x=>x!==p.id):[...saved,p.id])} style={{fontSize:20,cursor:"pointer"}}>{saved.includes(p.id)?"🔖":"📑"}</span></div>
              <div style={{padding:"0 12px",fontSize:13}}><b>{liked.length+12} likes</b></div>
              <div style={{padding:"2px 12px 8px",fontSize:13}}><b>{p.username}</b> {p.content}</div>
              {openComment===p.id && (<div style={{padding:"0 12px 10px"}}><div style={{maxHeight:100,overflowY:"auto"}}>{(comments[p.id]||[]).map((c:any,i:number)=><div key={i} style={{fontSize:12,marginBottom:4}}><b>{c.user}</b> {c.text}</div>)}</div><div style={{display:"flex",gap:6,marginTop:6}}><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." style={{flex:1,padding:8,borderRadius:20,border:"1px solid #ddd",fontSize:12}}/><button onClick={()=>addComment(p.id)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:"#0095f6",color:"white",fontWeight:700}}>Post</button></div></div>)}
            </div>
          ))}
        </div>
      )}

      {tab==="reels" && (<div style={{height:"calc(100vh - 110px)",overflowY:"scroll",scrollSnapType:"y mandatory"}}>{posts.map((p:any)=>(<div key={p.id} style={{height:"calc(100vh - 110px)",scrollSnapAlign:"start",position:"relative",background:"black"}}><img src={p.image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",bottom:20,left:12,color:"white"}}><b>@{p.username}</b><div style={{fontSize:13,marginTop:4}}>{p.content}</div><div style={{marginTop:10,display:"flex",gap:16}}><span>❤️ {Math.floor(Math.random()*500)}</span><span>💬 {Math.floor(Math.random()*50)}</span><span>✈️</span></div></div></div>))}</div>)}
      {tab==="search" && (<div style={{padding:10}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",background:"#efefef"}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginTop:10}}>{allUsers.filter(u=>u.username.toLowerCase().includes(search.toLowerCase())).map((u:any)=><div key={u.username} onClick={()=>{setMsgUser(u); setTab("messages")}} style={{textAlign:"center",padding:10,border:"1px solid #eee",borderRadius:8}}><img src={u.avatar_url} style={{width:50,height:50,borderRadius:"50%"}}/><div style={{fontSize:12,marginTop:4}}>{u.username}</div><button style={{marginTop:4,padding:"4px 10px",borderRadius:6,border:"none",background:"#0095f6",color:"white",fontSize:11}}>View</button></div>)}<>{posts.map((p:any)=><img key={p.id} src={p.image_url} style={{aspectRatio:"1/1",objectFit:"cover"}} onClick={()=>setZoom(p.image_url)}/>)}</></div></div>)}
      {tab==="messages" && (<div style={{padding:10}}>{!msgUser?(<div>{allUsers.map((u:any)=><div key={u.username} onClick={()=>setMsgUser(u)} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderBottom:"1px solid #eee",cursor:"pointer"}}><img src={u.avatar_url} style={{width:40,height:40,borderRadius:"50%"}}/><div><div style={{fontWeight:600,fontSize:13}}>{u.username}</div><div style={{fontSize:11,color:"gray"}}>Tap to chat</div></div></div>)}</div>):(<div><div style={{display:"flex",alignItems:"center",gap:10,padding:"0 0 10px",borderBottom:"1px solid #eee"}}><span onClick={()=>setMsgUser(null)} style={{fontSize:20,cursor:"pointer"}}>←</span><img src={msgUser.avatar_url} style={{width:32,height:32,borderRadius:"50%"}}/><b>{msgUser.username}</b></div><div style={{height:300,overflowY:"auto",padding:"10px 0"}}>{msgs.filter((m:any)=>m.to===msgUser.username||m.from===msgUser.username).map((m:any,i:number)=><div key={i} style={{textAlign:m.from===myUser?"right":"left",marginBottom:8}}><span style={{display:"inline-block",padding:"8px 12px",borderRadius:18,background:m.from===myUser?"#0095f6":"#efefef",color:m.from===myUser?"white":"black",fontSize:13}}>{m.text}</span></div>)}</div><div style={{display:"flex",gap:6,position:"sticky",bottom:0,background:"white",paddingTop:10}}><input value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Message..." style={{flex:1,padding:10,borderRadius:20,border:"1px solid #ddd"}}/><button onClick={()=>{if(!msgText.trim()) return; setMsgs([...msgs,{from:myUser,to:msgUser.username,text:msgText}]); setMsgText("")}} style={{padding:"8px 16px",borderRadius:20,border:"none",background:"#0095f6",color:"white"}}>Send</button></div></div>)}</div>)}
      {tab==="notif" && (<div style={{padding:12}}><h3 style={{margin:0}}>Notifications</h3>{notifs.map((n,i)=><div key={i} style={{padding:10,borderBottom:"1px solid #eee",fontSize:13}}>{n} • {i+1}h ago</div>)}<h3 style={{marginTop:20}}>Saved</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>{posts.filter(p=>saved.includes(p.id)).map(p=><img key={p.id} src={p.image_url} style={{aspectRatio:"1/1",objectFit:"cover"}}/>)}</div></div>)}
      {tab==="profile" && (<div style={{padding:14}}><div style={{display:"flex",gap:16,alignItems:"center"}}><div onClick={()=>setEditOpen(true)} style={{width:80,height:80,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,cursor:"pointer"}}>{myAvatar?<img src={myAvatar} style={{width:"100%",height:"100%",borderRadius:"50%"}}/>:"M"}</div><div style={{display:"flex",flex:1,justifyContent:"space-around",textAlign:"center"}}><div><b>{posts.filter((x:any)=>x.username===myUser).length}</b><div style={{fontSize:12}}>Posts</div></div><div><b>{following.length}</b><div style={{fontSize:12}}>Followers</div></div><div><b>{allUsers.length}</b><div style={{fontSize:12}}>Following</div></div></div></div><div style={{marginTop:10}}><b>mahesh</b><div style={{fontSize:13}}>{editBio}</div></div><button onClick={()=>setEditOpen(true)} style={{width:"100%",marginTop:10,padding:8,borderRadius:8,border:"1px solid #ddd",background:"#efefef",fontWeight:600}}>Edit profile</button><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginTop:12}}>{posts.filter((x:any)=>x.username===myUser).map((p:any)=><img key={p.id} src={p.image_url} style={{aspectRatio:"1/1",objectFit:"cover"}} onClick={()=>setZoom(p.image_url)}/>)}</div></div>)}

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #ddd",display:"flex",justifyContent:"space-around",padding:"10px 0",zIndex:100}}>
        <span onClick={()=>setTab("home")} style={{fontSize:22,cursor:"pointer",opacity:tab==="home"?1:0.4}}>🏠</span>
        <span onClick={()=>setTab("reels")} style={{fontSize:22,cursor:"pointer",opacity:tab==="reels"?1:0.4}}>🎬</span>
        <span onClick={()=>setTab("search")} style={{fontSize:22,cursor:"pointer",opacity:tab==="search"?1:0.4}}>🔍</span>
        <span onClick={()=>setTab("messages")} style={{fontSize:22,cursor:"pointer",opacity:tab==="messages"?1:0.4}}>✈️</span>
        <span onClick={()=>setTab("profile")} style={{width:26,height:26,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,opacity:tab==="profile"?1:0.5,cursor:"pointer"}}>M</span>
      </div>

      {showAdd && (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:"white",borderRadius:14,padding:16,width:"100%",maxWidth:360}}><h3 style={{margin:"0 0 10px"}}>New Post</h3><input value={newCap} onChange={e=>setNewCap(e.target.value)} placeholder="Caption" style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:8}}/><input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Image URL https://..." style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:10}}/><div style={{display:"flex",gap:8}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #ddd",background:"white"}}>Cancel</button><button onClick={async()=>{if(!newImg.trim()){alert("Image URL petu bro!"); return} const r=await supabase.from("posts").insert({username:myUser,content:newCap,image_url:newImg,avatar_url:myAvatar}).select(); if(r.data){setPosts([r.data[0],...posts]); setNewImg(""); setNewCap(""); setShowAdd(false)}}} style={{flex:1,padding:10,borderRadius:8,background:"black",color:"white",border:"none"}}>Post</button></div></div></div>)}
      {editOpen && (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:"white",borderRadius:14,padding:16,width:"100%",maxWidth:360}}><h3>Edit Profile</h3><input value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:10}}/><div style={{display:"flex",gap:8}}><button onClick={()=>setEditOpen(false)} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #ddd",background:"white"}}>Cancel</button><button onClick={()=>{setEditOpen(false)}} style={{flex:1,padding:10,borderRadius:8,background:"black",color:"white",border:"none"}}>Save</button></div></div></div>)}
      {zoom && <div onClick={()=>setZoom("")} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={zoom} style={{maxWidth:"95%",maxHeight:"90%"}}/></div>}
    </div>
  )
                                                                                                            }
