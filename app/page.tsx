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
  const [saved, setSaved] = useState<number[]>([])
  const [showComments, setShowComments] = useState<number|null>(null)
  const [commentText, setCommentText] = useState<{[key:number]:string}>({})
  const [comments, setComments] = useState<{[key:number]:string[]}>({})
  const [editOpen, setEditOpen] = useState(false)
  const [showAddPost, setShowAddPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState("")
  const [editUsername, setEditUsername] = useState("mahesh")
  const [editBio, setEditBio] = useState("My Bio")
  const [editAvatar, setEditAvatar] = useState("")
  const [editAvatarFile, setEditAvatarFile] = useState<any>(null)
  const [zoomImg, setZoomImg] = useState("")
  const [shareOpen, setShareOpen] = useState<any>(null)

  useEffect(()=>{ loadAll() },[])
  async function loadAll(){
    const {data:prof}=await supabase.from("profiles").select("*").eq("username",myUser).single()
    if(prof){ setMyAvatar(prof.avatar_url||""); setEditAvatar(prof.avatar_url||""); setEditBio(prof.bio||"My Bio"); setEditUsername(prof.username) }
    const {data:p}=await supabase.from("posts").select("*").order("id",{ascending:false})
    if(p) setPosts(p)
    const {data:users}=await supabase.from("profiles").select("*")
    if(users) setAllUsers(users)
    const {data:f}=await supabase.from("follows").select("*").eq("follower_username",myUser)
    if(f) setFollowing(f.map((x:any)=>x.following_username))
    const {data:l}=await supabase.from("likes").select("*").eq("username",myUser)
    if(l) setLiked(l.map((x:any)=>x.post_id))
  }
  async function handleAvatarChange(e:any){ const file=e.target.files[0]; if(!file) return; setEditAvatarFile(file); setEditAvatar(URL.createObjectURL(file)) }
  async function handleSaveProfile(){
    let finalAvatar=myAvatar
    if(editAvatarFile){
      const fileName=`${myUser}_${Date.now()}.jpg`
      await supabase.storage.from("chitpix").upload(fileName,editAvatarFile)
      const {data}=supabase.storage.from("chitpix").getPublicUrl(fileName); finalAvatar=data.publicUrl
    }
    await supabase.from("profiles").update({username:editUsername,bio:editBio,avatar_url:finalAvatar}).eq("username",myUser)
    setMyAvatar(finalAvatar); setEditOpen(false); loadAll()
  }
  async function toggleFollow(u:string){
    if(following.includes(u)){ await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",u); setFollowing(following.filter(f=>f!==u)) }
    else{ await supabase.from("follows").insert({follower_username:myUser,following_username:u}); setFollowing([...following,u]) }
  }
  async function toggleLike(id:number){
    if(liked.includes(id)){ await supabase.from("likes").delete().eq("username",myUser).eq("post_id",id); setLiked(liked.filter(x=>x!==id)) }
    else{ await supabase.from("likes").insert({username:myUser,post_id:id}); setLiked([...liked,id]) }
  }
  function toggleSave(id:number){ if(saved.includes(id)) setSaved(saved.filter(x=>x!==id)); else setSaved([...saved,id]) }
  function handleAddComment(postId:number){
    const txt=commentText[postId]; if(!txt?.trim()) return
    const prev=comments[postId]||[]; setComments({...comments,[postId]:[...prev,`${myUser}: ${txt}`]}); setCommentText({...commentText,[postId]:""})
  }
  async function handleAddPost(){
    if(!newPostImage.trim()){alert("Image URL pettu"); return}
    const {data}=await supabase.from("posts").insert({username:myUser,content:newPostContent,image_url:newPostImage,avatar_url:myAvatar}).select()
    if(data){ setPosts([data[0],...posts]); setNewPostImage(""); setNewPostContent(""); setShowAddPost(false) }
  }
  function handleSharePost(p:any){
    if(navigator.share){ navigator.share({title:"ChitPix",text:p.content,url:p.image_url}) }
    else{ navigator.clipboard.writeText(p.image_url); alert("Link copied!") }
    setShareOpen(null)
  }
  function handleDownload(url:string){ const a=document.createElement("a"); a.href=url; a.download="chitpix.jpg"; a.target="_blank"; a.click() }
  function handleRepost(p:any){ const newP={...p,id:Date.now(),content:"Reposted: "+p.content}; setPosts([newP,...posts]); alert("Reposted!") }

  const iconStyle={width:26,height:26,cursor:"pointer",display:"inline-block"}

  return(
    <div style={{minHeight:"100vh",background:"white",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:80,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px",position:"sticky",top:0,background:"white",zIndex:20,borderBottom:"1px solid #efefef"}}>
        <span onClick={()=>setShowAddPost(true)} style={{fontSize:28,cursor:"pointer",color:"black"}}>+</span>
        <b style={{fontFamily:"cursive",fontSize:28,color:"black"}}>Instagram</b>
        <span style={{cursor:"pointer"}}>❤️</span>
      </div>

      {tab==="home" && (
        <div>
          <div style={{display:"flex",gap:14,padding:"12px 10px",overflowX:"auto",borderBottom:"1px solid #efefef"}}>
            <div style={{minWidth:66,textAlign:"center"}}><div style={{width:62,height:62,borderRadius:"50%",background:"black",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:24}}>M</div><div style={{fontSize:12,marginTop:6,color:"black"}}>Your story</div></div>
            {allUsers.map((u:any)=><div key={u.username} style={{minWidth:66,textAlign:"center"}}><div style={{width:62,height:62,borderRadius:"50%",padding:2.5,background:"linear-gradient(45deg,#feda75,#d62976,#4f5bd5)",margin:"0 auto"}}><img src={u.avatar_url||`https://i.pravatar.cc/100?u=${u.username}`} style={{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid white",objectFit:"cover"}}/></div><div style={{fontSize:11,color:"black",marginTop:4}}>{u.username.slice(0,8)}</div></div>)}
          </div>
          {posts.map((p:any)=>{
            const isLiked=liked.includes(p.id); const isSaved=saved.includes(p.id)
            return(
              <div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
                <div style={{display:"flex",alignItems:"center",padding:"10px 12px",gap:10}}><div style={{width:34,height:34,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{p.username[0]}</div><b style={{fontSize:14,color:"black"}}>{p.username}</b><button onClick={()=>toggleFollow(p.username)} style={{marginLeft:"auto",padding:"6px 14px",borderRadius:8,background:following.includes(p.username)?"#efefef":"#0095f6",color:following.includes(p.username)?"black":"white",border:"none",fontWeight:700,fontSize:13}}>{following.includes(p.username)?"Following":"Follow"}</button></div>
                <img src={p.image_url} style={{width:"100%",display:"block"}} onClick={()=>setZoomImg(p.image_url)}/>
                {/* 5 ICONS SAME SIZE + ALL WORKING */}
                <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:18,alignItems:"center"}}>
                    <span style={iconStyle} onClick={()=>toggleLike(p.id)}>{isLiked?"❤️":"🤍"}</span>
                    <span style={iconStyle} onClick={()=>setShowComments(showComments===p.id?null:p.id)}>💬</span>
                    <span style={iconStyle} onClick={()=>handleRepost(p)}>🔁</span>
                    <span style={iconStyle} onClick={()=>setShareOpen(p)}>✈️</span>
                    <span style={iconStyle} onClick={()=>handleDownload(p.image_url)}>⬇️</span>
                  </div>
                  <span style={iconStyle} onClick={()=>toggleSave(p.id)}>{isSaved?"🔖":"📑"}</span>
                </div>
                <div style={{padding:"0 12px 8px",color:"black",fontSize:14}}><b>{p.username}</b> {p.content}</div>
                {(comments[p.id]||[]).map((c,i)=><div key={i} style={{padding:"2px 12px",fontSize:13,color:"black"}}>{c}</div>)}
                {showComments===p.id && <div style={{display:"flex",gap:8,padding:"8px 12px"}}><input value={commentText[p.id]||""} onChange={e=>setCommentText({...commentText,[p.id]:e.target.value})} placeholder="Add comment..." style={{flex:1,padding:"8px",borderRadius:20,border:"1px solid #ddd",color:"black",background:"white"}}/><button onClick={()=>handleAddComment(p.id)} style={{color:"#0095f6",background:"none",border:"none",fontWeight:700}}>Post</button></div>}
              </div>
            )
          })}
        </div>
      )}

      {tab==="reels" && (
        <div style={{background:"black",minHeight:"100vh"}}>
          <div style={{display:"flex",gap:20,padding:"12px 14px",color:"white",fontSize:18}}><b>Reels</b><span style={{opacity:0.6}}>Friends</span></div>
          {posts.map((p:any)=>{
            const isLiked=liked.includes(p.id)
            return(
              <div key={p.id} style={{position:"relative",height:"75vh",marginBottom:10}}>
                <img src={p.image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",right:12,bottom:80,display:"flex",flexDirection:"column",gap:20,alignItems:"center"}}>
                  <div onClick={()=>toggleLike(p.id)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:28,color:"white"}}>{isLiked?"❤️":"🤍"}</div><div style={{color:"white",fontSize:12}}>55.9K</div></div>
                  <div onClick={()=>setShowComments(showComments===p.id?null:p.id)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:26,color:"white"}}>💬</div><div style={{color:"white",fontSize:12}}>181</div></div>
                  <div onClick={()=>setShareOpen(p)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:26,color:"white"}}>✈️</div><div style={{color:"white",fontSize:12}}>34K</div></div>
                  <div onClick={()=>handleDownload(p.image_url)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:26,color:"white"}}>⬇️</div><div style={{color:"white",fontSize:12}}>Save</div></div>
                  <div onClick={()=>toggleSave(p.id)} style={{fontSize:24}}>{saved.includes(p.id)?"🔖":"📑"}</div>
                </div>
                <div style={{position:"absolute",bottom:20,left:14,right:80,color:"white"}}><b>{p.username}</b> <span style={{fontSize:13}}>{p.content}</span></div>
                {showComments===p.id && <div style={{position:"absolute",bottom:0,left:0,right:0,background:"white",padding:10,display:"flex",gap:8}}><input value={commentText[p.id]||""} onChange={e=>setCommentText({...commentText,[p.id]:e.target.value})} placeholder="Comment..." style={{flex:1,padding:8,borderRadius:20,border:"1px solid #ddd",color:"black"}}/><button onClick={()=>handleAddComment(p.id)} style={{color:"#0095f6",fontWeight:700,background:"none",border:"none"}}>Post</button></div>}
              </div>
            )
          })}
        </div>
      )}

      {tab==="messages" && (
        <div style={{background:"white",minHeight:"80vh",padding:14}}>
          <div style={{display:"flex",background:"#efefef",borderRadius:20,padding:"12px 14px",alignItems:"center",gap:10}}>
            <span>🔍</span><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search or ask Meta AI" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"black"}}/>
          </div>
          <div style={{textAlign:"right",color:"#0095f6",marginTop:12,fontWeight:600}}>Requests</div>
          <div style={{marginTop:20}}>
            {allUsers.filter((u:any)=>u.username.toLowerCase().includes(searchText.toLowerCase())).map((u:any)=>(
              <div key={u.username} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f0f0f0"}}>
                <img src={u.avatar_url||`https://i.pravatar.cc/100?u=${u.username}`} style={{width:48,height:48,borderRadius:"50%"}}/>
                <div><b style={{color:"black",fontSize:14}}>{u.username}</b><div style={{fontSize:12,color:"#666"}}>Active now</div></div>
                <button onClick={()=>{alert("Message to "+u.username);}} style={{marginLeft:"auto",background:"#0095f6",color:"white",border:"none",borderRadius:20,padding:"8px 16px",fontWeight:600}}>Message</button>
                <button onClick={()=>setShareOpen({username:u.username})} style={{background:"#efefef",border:"none",borderRadius:20,padding:"8px 12px"}}>Share</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="search" && <div style={{padding:20}}><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search" style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid #ddd",color:"black",background:"white"}}/>{allUsers.filter((u:any)=>u.username.includes(searchText)).map((u:any)=><div key={u.username} style={{display:"flex",gap:10,padding:"10px 0",color:"black"}}><img src={u.avatar_url||`https://i.pravatar.cc/100?u=${u.username}`} style={{width:40,height:40,borderRadius:"50%"}}/><b>{u.username}</b><button onClick={()=>toggleFollow(u.username)} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:8,background:following.includes(u.username)?"#efefef":"#0095f6",color:following.includes(u.username)?"black":"white",border:"none"}}>{following.includes(u.username)?"Following":"Follow"}</button></div>)}</div>}

      {tab==="profile" && (
        <div style={{background:"white",minHeight:"80vh"}}>
          <div style={{padding:"18px 14px"}}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <div onClick={()=>setEditOpen(true)} style={{cursor:"pointer",position:"relative"}}>
                {myAvatar? <img src={myAvatar} style={{width:86,height:86,borderRadius:"50%",objectFit:"cover"}}/> : <div style={{width:86,height:86,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>M</div>}
                <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,background:"#0095f6",color:"white",borderRadius:"50%",border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center"}}>+</div>
              </div>
              <div style={{display:"flex",gap:0,flex:1,justifyContent:"space-around"}}>
                <div style={{textAlign:"center"}}><b style={{display:"block",color:"black",fontSize:18}}>{posts.filter((x:any)=>x.username===myUser).length}</b><span style={{fontSize:13,color:"black"}}>posts</span></div>
                <div style={{textAlign:"center"}}><b style={{display:"block",color:"black",fontSize:18}}>{following.length}</b><span style={{fontSize:13,color:"black"}}>followers</span></div>
                <div style={{textAlign:"center"}}><b style={{display:"block",color:"black",fontSize:18}}>{allUsers.length}</b><span style={{fontSize:13,color:"black"}}>following</span></div>
              </div>
            </div>
            <div style={{marginTop:14}}><b style={{color:"black"}}>{editUsername}</b><div style={{color:"black",fontSize:14}}>{editBio}</div></div>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>setEditOpen(true)} style={{flex:1,padding:"10px 0",borderRadius:8,background:"#efefef",border:"none",fontWeight:600,color:"black"}}>Edit profile</button>
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert("Profile link copied!");}} style={{flex:1,padding:"10px 0",borderRadius:8,background:"#efefef",border:"none",fontWeight:600,color:"black"}}>Share profile</button>
            </div>
          </div>
          <div style={{display:"flex",borderTop:"1px solid #efefef",borderBottom:"1px solid #efefef"}}>
            <div style={{flex:1,textAlign:"center",padding:"12px 0",borderBottom:"1.5px solid black"}}>▦</div><div style={{flex:1,textAlign:"center",padding:"12px 0",opacity:0.4}}>▶</div><div style={{flex:1,textAlign:"center",padding:"12px 0",opacity:0.4}}>↻</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>{posts.filter((x:any)=>x.username===myUser).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover"}} onClick={()=>setZoomImg(p.image_url)}/>)}</div>
        </div>
      )}

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #efefef",display:"flex",justifyContent:"space-around",padding:"10px 0",zIndex:100}}>
        <span onClick={()=>setTab("home")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="home"?"#efefef":"transparent"}}>🏠</span>
        <span onClick={()=>setTab("reels")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="reels"?"#efefef":"transparent"}}>🎬</span>
        <span onClick={()=>setTab("messages")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="messages"?"#efefef":"transparent"}}>✈️</span>
        <span onClick={()=>setTab("search")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="search"?"#efefef":"transparent"}}>🔍</span>
        <span onClick={()=>setTab("profile")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="profile"?"#efefef":"transparent"}}>{myAvatar? <img src={myAvatar} style={{width:28,height:28,borderRadius:"50%"}}/> : <div style={{width:28,height:28,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>M</div>}</span>
      </div>

      {shareOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:400,display:"flex",alignItems:"flex-end"}}>
          <div style={{background:"white",width:"100%",borderRadius:"16px 16px 0 0",padding:20}}>
            <div style={{width:40,height:4,background:"#ddd",borderRadius:2,margin:"0 auto 16px"}}></div>
            <h3 style={{color:"black",marginBottom:12}}>Share</h3>
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12}}>
              <button onClick={()=>handleSharePost(shareOpen)} style={{minWidth:60,padding:"10px",borderRadius:10,background:"#efefef",border:"none",color:"black"}}>🔗 Copy</button>
              <button onClick={()=>handleDownload(shareOpen.image_url||"")} style={{minWidth:60,padding:"10px",borderRadius:10,background:"#efefef",border:"none",color:"black"}}>⬇️ Download</button>
              <button onClick={()=>{navigator.clipboard.writeText("https://wa.me/?text="+shareOpen.image_url); alert("WhatsApp share copied!");}} style={{minWidth:60,padding:"10px",borderRadius:10,background:"#efefef",border:"none",color:"black"}}>💬 WhatsApp</button>
            </div>
            <button onClick={()=>setShareOpen(null)} style={{width:"100%",padding:12,marginTop:10,borderRadius:10,border:"1px solid #ddd",background:"white",color:"black"}}>Cancel</button>
          </div>
        </div>
      )}

      {editOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:16,padding:20,width:"100%",maxWidth:360}}>
            <h3 style={{color:"black"}}>Edit Profile - Life Long Save</h3>
            <div style={{display:"flex",justifyContent:"
