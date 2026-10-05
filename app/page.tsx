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
  const [editOpen,setEditOpen]=useState(false)
  const [editBio,setEditBio]=useState("My Bio")
  const [editName,setEditName]=useState("mahesh")
  const [editAvatar,setEditAvatar]=useState("")
  const [editFile,setEditFile]=useState<any>(null)
  const [showAdd,setShowAdd]=useState(false)
  const [newCap,setNewCap]=useState("")
  const [newImg,setNewImg]=useState("")
  const [zoom,setZoom]=useState("")

  useEffect(()=>{ load() },[])
  async function load(){
    const p=await supabase.from("profiles").select("*").eq("username",myUser).single()
    if(p.data){ setMyAvatar(p.data.avatar_url||""); setEditAvatar(p.data.avatar_url||""); setEditBio(p.data.bio||"My Bio"); setEditName(p.data.username) }
    const postsData=await supabase.from("posts").select("*").order("id",{ascending:false})
    if(postsData.data) setPosts(postsData.data)
    const users=await supabase.from("profiles").select("*")
    if(users.data) setAllUsers(users.data)
    const f=await supabase.from("follows").select("*").eq("follower_username",myUser)
    if(f.data) setFollowing(f.data.map((a:any)=>a.following_username))
    const l=await supabase.from("likes").select("*").eq("username",myUser)
    if(l.data) setLiked(l.data.map((a:any)=>a.post_id))
  }

  const iconStyle={fontSize:24,cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}

  return (
    <div style={{minHeight:"100vh",background:"white",maxWidth:480,margin:"0 auto",paddingBottom:80,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:14,borderBottom:"1px solid #eee",position:"sticky",top:0,background:"white",zIndex:10}}>
        <span onClick={()=>setShowAdd(true)} style={{fontSize:28,color:"black",cursor:"pointer"}}>+</span>
        <b style={{fontFamily:"cursive",fontSize:28,color:"black"}}>Instagram</b>
        <span>❤️</span>
      </div>

      {tab==="home" && (
        <div>
          <div style={{display:"flex",gap:14,padding:"12px 10px",overflowX:"auto",borderBottom:"1px solid #efefef"}}>
            <div style={{minWidth:66,textAlign:"center"}}>
              <div style={{width:62,height:62,borderRadius:"50%",background:"black",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:24}}>M</div>
              <div style={{fontSize:12,marginTop:6,color:"black"}}>Your story</div>
            </div>
            {allUsers.map((u:any)=>(
              <div key={u.username} style={{minWidth:66,textAlign:"center"}}>
                <div style={{width:62,height:62,borderRadius:"50%",padding:2.5,background:"linear-gradient(45deg,#feda75,#d62976,#4f5bd5)",margin:"0 auto"}}>
                  <img src={u.avatar_url||"https://i.pravatar.cc/100?u="+u.username} style={{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid white",objectFit:"cover"}}/>
                </div>
                <div style={{fontSize:11,color:"black",marginTop:4}}>{u.username.slice(0,8)}</div>
              </div>
            ))}
          </div>

          {posts.filter((p:any)=>p.image_url).map((p:any)=>(
            <div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
              <div style={{display:"flex",alignItems:"center",padding:"10px 12px",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{p.username[0]}</div>
                <b style={{color:"black",fontSize:14}}>{p.username}</b>
                <button onClick={async()=>{
                  if(following.includes(p.username)){
                    await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",p.username)
                    setFollowing(following.filter(f=>f!==p.username))
                  }else{
                    await supabase.from("follows").insert({follower_username:myUser,following_username:p.username})
                    const a=following.slice(); a.push(p.username); setFollowing(a)
                  }
                }} style={{marginLeft:"auto",padding:"6px 14px",borderRadius:8,border:"none",background:following.includes(p.username)?"#efefef":"#0095f6",color:following.includes(p.username)?"black":"white",fontWeight:700}}>{following.includes(p.username)?"Following":"Follow"}</button>
              </div>
              <img src={p.image_url} style={{width:"100%"}} onClick={()=>setZoom(p.image_url)} />
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",alignItems:"center"}}>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <span onClick={async()=>{ if(liked.includes(p.id)){ await supabase.from("likes").delete().eq("username",myUser).eq("post_id",p.id); setLiked(liked.filter(x=>x!==p.id)) }else{ await supabase.from("likes").insert({username:myUser,post_id:p.id}); const a=liked.slice(); a.push(p.id); setLiked(a) } }} style={iconStyle}>{liked.includes(p.id)?"❤️":"🤍"}</span>
                  <span style={iconStyle}>💬</span>
                  <span onClick={()=>{ const np={id:Date.now(),username:p.username,content:"Reposted: "+p.content,image_url:p.image_url}; const a=[np].concat(posts); setPosts(a); alert("Reposted!") }} style={iconStyle}>🔁</span>
                  <span onClick={()=>{ navigator.clipboard.writeText(p.image_url); alert("Link copied!") }} style={iconStyle}>✈️</span>
                  <span onClick={()=>{ const a=document.createElement("a"); a.href=p.image_url; a.target="_blank"; a.click() }} style={iconStyle}>⬇️</span>
                </div>
                <span onClick={()=>{ if(saved.includes(p.id)) setSaved(saved.filter(x=>x!==p.id)); else { const a=saved.slice(); a.push(p.id); setSaved(a) } }} style={iconStyle}>{saved.includes(p.id)?"🔖":"📑"}</span>
              </div>
              <div style={{padding:"0 12px 10px",color:"black",fontSize:14}}><b>{p.username}</b> {p.content}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="reels" && (
        <div style={{background:"black",minHeight:"80vh"}}>
          {posts.filter((p:any)=>p.image_url).map((p:any)=>(
            <div key={p.id} style={{position:"relative",height:"75vh",marginBottom:10}}>
              <img src={p.image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",right:12,bottom:80,display:"flex",flexDirection:"column",gap:20}}>
                <div onClick={async()=>{ if(liked.includes(p.id)){ await supabase.from("likes").delete().eq("username",myUser).eq("post_id",p.id); setLiked(liked.filter(x=>x!==p.id)) }else{ await supabase.from("likes").insert({username:myUser,post_id:p.id}); const a=liked.slice(); a.push(p.id); setLiked(a) } }} style={{fontSize:28,color:"white",cursor:"pointer"}}>{liked.includes(p.id)?"❤️":"🤍"}</div>
                <div style={{fontSize:26,color:"white",cursor:"pointer"}}>💬</div>
                <div onClick={()=>{ navigator.clipboard.writeText(p.image_url); alert("Link copied!") }} style={{fontSize:26,color:"white",cursor:"pointer"}}>✈️</div>
                <div onClick={()=>{ const a=document.createElement("a"); a.href=p.image_url; a.target="_blank"; a.click() }} style={{fontSize:26,color:"white",cursor:"pointer"}}>⬇️</div>
              </div>
              <div style={{position:"absolute",bottom:20,left:14,color:"white"}}><b>{p.username}</b> {p.content}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="profile" && (
        <div style={{padding:14}}>
          <div style={{display:"flex",gap:20,alignItems:"center"}}>
            <div onClick={()=>setEditOpen(true)} style={{position:"relative",cursor:"pointer"}}>
              {myAvatar? <img src={myAvatar} style={{width:86,height:86,borderRadius:"50%",objectFit:"cover"}}/> : <div style={{width:86,height:86,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>M</div>}
              <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,background:"#0095f6",color:"white",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid white"}}>+</div>
            </div>
            <div style={{display:"flex",flex:1,justifyContent:"space-around",textAlign:"center"}}>
              <div><b style={{color:"black",display:"block"}}>{posts.filter((x:any)=>x.username===myUser).length}</b><span style={{color:"black",fontSize:13}}>posts</span></div>
              <div><b style={{color:"black",display:"block"}}>{following.length}</b><span style={{color:"black",fontSize:13}}>followers</span></div>
              <div><b style={{color:"black",display:"block"}}>{allUsers.length}</b><span style={{color:"black",fontSize:13}}>following</span></div>
            </div>
          </div>
          <div style={{marginTop:12}}><b style={{color:"black"}}>{editName}</b><div style={{color:"black"}}>{editBio}</div></div>
          <button onClick={()=>setEditOpen(true)} style={{width:"100%",marginTop:12,padding:10,borderRadius:8,border:"none",background:"#efefef",color:"black",fontWeight:600}}>Edit profile</button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginTop:14}}>
            {posts.filter((x:any)=>x.username===myUser && x.image_url).map((p:any)=><img key={p.id} src={p.image_url} style={{aspectRatio:"1/1",objectFit:"cover",width:"100%"}} onClick={()=>setZoom(p.image_url)}/>)}
          </div>
        </div>
      )}

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #eee",display:"flex",justifyContent:"space-around",padding:"10px 0",zIndex:100}}>
  <span onClick={()=>setTab("home")} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"8px 18px",borderRadius:20,background:tab==="home"?"#efefef":"transparent"}}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill={tab==="home"?"black":"none"} stroke="black" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </span>
  <span onClick={()=>setTab("reels")} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"8px 18px",borderRadius:20,background:tab==="reels"?"#efefef":"transparent"}}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><polygon points="23 7 13.5 15.5 8.5 11.5 1 17.5 1 7 23 7"/><polygon points="23 7 13.5 15.5 8.5 11.5 1 17.5 1 7 23 7" transform="translate(0 -2)"/><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
  </span>
  <span onClick={()=>setTab("search")} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"8px 18px",borderRadius:20,background:tab==="search"?"#efefef":"transparent"}}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  </span>
  <span onClick={()=>setTab("messages")} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"8px 18px",borderRadius:20,background:tab==="messages"?"#efefef":"transparent"}}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  </span>
  <span onClick={()=>setTab("profile")} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="profile"?"#efefef":"transparent"}}>{myAvatar? <img src={myAvatar} style={{width:26,height:26,borderRadius:"50%",objectFit:"cover"}}/> : <div style={{width:26,height:26,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>M</div>}</span>
</div>

      {editOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:16,padding:20,width:"100%",maxWidth:360}}>
            <h3 style={{color:"black"}}>Edit Profile</h3>
            <div style={{textAlign:"center",marginBottom:10}}>
              <label style={{cursor:"pointer"}}>
                <img src={editAvatar||myAvatar||"https://i.pravatar.cc/100"} style={{width:90,height:90,borderRadius:"50%",objectFit:"cover"}}/>
                <div style={{color:"#0095f6",fontSize:13,marginTop:6}}>Change Photo</div>
                <input type="file" hidden accept="image/*" onChange={(e:any)=>{ const f=e.target.files[0]; if(!f) return; setEditFile(f); setEditAvatar(URL.createObjectURL(f)) }}/>
              </label>
            </div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username" style={{width:"100%",padding:12,marginBottom:10,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <input value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" style={{width:"100%",padding:12,marginBottom:12,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setEditOpen(false)} style={{flex:1,padding:12,borderRadius:8,border:"1px solid #ddd",background:"white",color:"black"}}>Cancel</button>
              <button onClick={async()=>{ let finalUrl=myAvatar; if(editFile){ const fname=myUser+"_"+Date.now()+".jpg"; await supabase.storage.from("chitpix").upload(fname,editFile); const u=supabase.storage.from("chitpix").getPublicUrl(fname); finalUrl=u.data.publicUrl } await supabase.from("profiles").update({username:editName,bio:editBio,avatar_url:finalUrl}).eq("username",myUser); setMyAvatar(finalUrl); setEditOpen(false); load() }} style={{flex:1,padding:12,borderRadius:8,background:"black",color:"white",border:"none"}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:14,padding:20,width:"100%",maxWidth:360}}>
            <h3 style={{color:"black"}}>New Post</h3>
            <input value={newCap} onChange={e=>setNewCap(e.target.value)} placeholder="Caption" style={{width:"100%",padding:10,marginBottom:8,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Image URL - compulsory" style={{width:"100%",padding:10,marginBottom:12,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:10,borderRadius:8,background:"white",border:"1px solid #ddd",color:"black"}}>Cancel</button>
              <button onClick={async()=>{ if(!newImg.trim()){alert("Image URL pettu bro!"); return} const r=await supabase.from("posts").insert({username:myUser,content:newCap,image_url:newImg,avatar_url:myAvatar}).select(); if(r.data){ const a=[r.data[0]].concat(posts); setPosts(a); setNewImg(""); setNewCap(""); setShowAdd(false) } }} style={{flex:1,padding:10,borderRadius:8,background:"black",color:"white",border:"none"}}>Post</button>
            </div>
          </div>
        </div>
      )}

      {zoom && <div onClick={()=>setZoom("")} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={zoom} style={{maxWidth:"95%",maxHeight:"90%"}}/></div>}
    </div>
  )
              }
