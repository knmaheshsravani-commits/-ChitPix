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
  const [editOpen, setEditOpen] = useState(false)
  const [showAddPost, setShowAddPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState("")
  const [editUsername, setEditUsername] = useState(myUser)
  const [editBio, setEditBio] = useState("My Bio")
  const [editAvatar, setEditAvatar] = useState("")
  const [editAvatarFile, setEditAvatarFile] = useState<any>(null)
  const [zoomImg, setZoomImg] = useState("")
  const [showUserList, setShowUserList] = useState(false)

  useEffect(()=>{ loadAll() },[])
  async function loadAll(){
    const { data: prof } = await supabase.from("profiles").select("*").eq("username", myUser).single()
    if(prof){ setMyAvatar(prof.avatar_url || ""); setEditAvatar(prof.avatar_url || ""); setEditBio(prof.bio || ""); setEditUsername(prof.username) }
    const { data: p } = await supabase.from("posts").select("*").order("id",{ascending:false})
    if(p) setPosts(p.filter((x:any)=>x.image_url))
    const { data: users } = await supabase.from("profiles").select("*")
    if(users) setAllUsers(users)
    const { data: f } = await supabase.from("follows").select("*").eq("follower_username", myUser)
    if(f) setFollowing(f.map((x:any)=>x.following_username))
    const { data: l } = await supabase.from("likes").select("*").eq("username", myUser)
    if(l) setLiked(l.map((x:any)=>x.post_id))
  }
  async function handleAvatarChange(e:any){
    const file=e.target.files[0]; if(!file) return
    setEditAvatarFile(file); setEditAvatar(URL.createObjectURL(file))
  }
  async function handleSaveProfile(){
    let finalAvatar=myAvatar
    if(editAvatarFile){
      const fileName=`${myUser}_${Date.now()}.jpg`
      const {error}=await supabase.storage.from("chitpix").upload(fileName,editAvatarFile)
      if(error){alert(error.message); return}
      const {data}=supabase.storage.from("chitpix").getPublicUrl(fileName)
      finalAvatar=data.publicUrl
    }
    await supabase.from("profiles").update({username:editUsername,bio:editBio,avatar_url:finalAvatar}).eq("username",myUser)
    setMyAvatar(finalAvatar); setEditOpen(false); loadAll()
  }
  async function toggleFollow(u:string){
    if(following.includes(u)){
      await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",u)
      setFollowing(following.filter(f=>f!==u))
    }else{
      await supabase.from("follows").insert({follower_username:myUser,following_username:u})
      setFollowing([...following,u])
    }
  }
  async function toggleLike(id:number){
    if(liked.includes(id)){
      await supabase.from("likes").delete().eq("username",myUser).eq("post_id",id)
      setLiked(liked.filter(x=>x!==id))
    }else{
      await supabase.from("likes").insert({username:myUser,post_id:id})
      setLiked([...liked,id])
    }
  }
  function toggleSave(id:number){
    if(saved.includes(id)) setSaved(saved.filter(x=>x!==id))
    else setSaved([...saved,id])
  }
  async function handleAddPost(){
    if(!newPostImage.trim()){alert("Image URL pettu"); return}
    const {data}=await supabase.from("posts").insert({username:myUser,content:newPostContent,image_url:newPostImage,avatar_url:myAvatar}).select()
    if(data){setPosts([data[0],...posts]); setNewPostImage(""); setNewPostContent(""); setShowAddPost(false); setShowUserList(false)}
  }

  return(
    <div style={{minHeight:"100vh",background:"white",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:72,fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,Roboto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",position:"sticky",top:0,background:"white",zIndex:20,borderBottom:"1px solid #efefef"}}>
        <span onClick={()=>setShowUserList(true)} style={{fontSize:32,cursor:"pointer",fontWeight:300,lineHeight:1}}>+</span>
        <b style={{fontFamily:"cursive",fontSize:26,fontWeight:700}}>Instagram</b>
        <span onClick={()=>setTab("likes")} style={{position:"relative",cursor:"pointer"}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M12 19l-1.5-1.4C5 13 2 10.2 2 6.7 2 3.5 4.5 1 7.7 1c1.8 0 3.5.8 4.3 2.1C12.8 1.8 14.5 1 16.3 1 19.5 1 22 3.5 22 6.7c0 3.5-3 6.3-8.5 10.9L12 19z"/></svg>
          <span style={{position:"absolute",top:-2,right:-2,width:10,height:10,background:"red",borderRadius:"50%",border:"2px solid white"}}></span>
        </span>
      </div>
            {tab==="home" && (
        <div>
          <div style={{display:"flex",gap:14,padding:"12px 10px",overflowX:"auto",borderBottom:"1px solid #efefef"}}>
            <div style={{minWidth:66,textAlign:"center",position:"relative"}}>
              <div style={{width:62,height:62,borderRadius:"50%",background:"black",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:26}}>M</div>
              <span style={{position:"absolute",bottom:22,right:4,width:20,height:20,background:"black",color:"white",borderRadius:"50%",border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>+</span>
              <div style={{fontSize:12,marginTop:6}}>Your story</div>
            </div>
            {allUsers.map((u:any)=>(
              <div key={u.username} style={{minWidth:66,textAlign:"center"}}>
                <div style={{width:62,height:62,borderRadius:"50%",padding:2.5,background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)",margin:"0 auto"}}>
                  <img src={u.avatar_url || `https://i.pravatar.cc/100?u=${u.username}`} style={{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid white",objectFit:"cover"}}/>
                </div>
                <div style={{fontSize:12,marginTop:6,maxWidth:66,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.username}</div>
              </div>
            ))}
          </div>

          {posts.map((p:any)=>{
            const user=allUsers.find((x:any)=>x.username===p.username)
            const isLiked=liked.includes(p.id)
            const isSaved=saved.includes(p.id)
            return (
              <div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
                <div style={{display:"flex",alignItems:"center",padding:"10px 12px",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:"50%",padding:2,background:"linear-gradient(45deg,#feda75,#d62976,#4f5bd5)"}}>
                    <img src={user?.avatar_url || p.avatar_url || `https://i.pravatar.cc/100?u=${p.username}`} style={{width:"100%",height:"100%",borderRadius:"50%",border:"1.5px solid white",objectFit:"cover"}}/>
                  </div>
                  <div style={{lineHeight:"15px"}}><div style={{fontWeight:700,fontSize:15}}>{p.username}</div><div style={{fontSize:12,color:"#666"}}>Suggested for you</div></div>
                  <button onClick={()=>toggleFollow(p.username)} style={{marginLeft:"auto",padding:"7px 18px",borderRadius:8,background:following.includes(p.username)? "#efefef":"#0095f6",color:following.includes(p.username)? "black":"white",border:"none",fontWeight:700,fontSize:14}}>{following.includes(p.username)? "Following":"Follow"}</button>
                  <span style={{marginLeft:10,fontSize:20}}>≡</span>
                </div>
                <img src={p.image_url} style={{width:"100%",display:"block",background:"#000"}} onClick={()=>setZoomImg(p.image_url)}/>
                                {/* SUPER NEW DESIGN - SAME SIZE 28px */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px"}}>
                  <div style={{display:"flex",gap:22,alignItems:"center"}}>
                    <span onClick={()=>toggleLike(p.id)} style={{cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={isLiked? "black":"none"} stroke="black" strokeWidth="1.5"><path d="M12 19l-1.5-1.4C5 13 2 10.2 2 6.7 2 3.5 4.5 1 7.7 1c1.8 0 3.5.8 4.3 2.1C12.8 1.8 14.5 1 16.3 1 19.5 1 22 3.5 22 6.7c0 3.5-3 6.3-8.5 10.9L12 19z"/></svg>
                    </span>
                    <span style={{cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><path d="M21 5.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.1-5.3A8.5 8.5 0 0 1 21 5.5z" strokeLinejoin="round"/></svg>
                    </span>
                    <span style={{cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    </span>
                    <span style={{cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </span>
                  </div>
                  <span onClick={()=>toggleSave(p.id)} style={{cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={isSaved? "black":"none"} stroke="black" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </span>
                </div>
                <div style={{padding:"0 12px 12px"}}>
                  <div style={{fontSize:15}}><b>{p.username}</b> {p.content || "absolute peak 🔥😭"}</div>
                  <div style={{fontSize:13,color:"#888",marginTop:4}}>3 days ago</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showUserList && (
        <div style={{position:"fixed",inset:0,background:"white",zIndex:200,overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",padding:"12px 14px",borderBottom:"1px solid #efefef",position:"sticky",top:0,background:"white"}}>
            <span onClick={()=>setShowUserList(false)} style={{fontSize:24,cursor:"pointer"}}>✕</span>
            <b style={{marginLeft:16,fontSize:18}}>Create</b>
            <button onClick={()=>{setShowUserList(false); setShowAddPost(true)}} style={{marginLeft:"auto",color:"#0095f6",background:"none",border:"none",fontWeight:700,fontSize:16}}>Next</button>
          </div>
          <div style={{padding:12}}>
            {allUsers.map((u:any)=>(
              <div key={u.username} style={{display:"flex",alignItems:"center",padding:"12px 0",gap:12}}>
                <img src={u.avatar_url || `https://i.pravatar.cc/100?u=${u.username}`} style={{width:54,height:54,borderRadius:"50%",objectFit:"cover"}}/>
                <div><div style={{fontWeight:700,fontSize:16}}>{u.username}</div><div style={{fontSize:13,color:"#666"}}>Suggested for you</div></div>
                <button onClick={()=>toggleFollow(u.username)} style={{marginLeft:"auto",padding:"8px 22px",borderRadius:8,background:following.includes(u.username)? "#efefef":"#0095f6",color:following.includes(u.username)? "black":"white",border:"none",fontWeight:700}}>{following.includes(u.username)? "Following":"Follow"}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="search" && <div style={{padding:12}}><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"none",background:"#efefef"}}/>{allUsers.filter((u:any)=>u.username.toLowerCase().includes(searchText.toLowerCase())).map((u:any)=><div key={u.username} style={{display:"flex",alignItems:"center",padding:"12px 0",gap:12}}><img src={u.avatar_url || `https://i.pravatar.cc/100?u=${u.username}`} style={{width:44,height:44,borderRadius:"50%"}}/><div><div style={{fontWeight:600}}>{u.username}</div><div style={{fontSize:12,color:"#888"}}>{u.bio || ""}</div></div><button onClick={()=>toggleFollow(u.username)} style={{marginLeft:"auto",padding:"6px 16px",borderRadius:8,background:following.includes(u.username)? "#efefef":"#0095f6",color:following.includes(u.username)? "black":"white",border:"none",fontWeight:700}}>{following.includes(u.username)? "Following":"Follow"}</button></div>)}</div>}
            {tab==="profile" && <div style={{padding:14}}><div style={{display:"flex",gap:16,alignItems:"center"}}><img src={myAvatar || "https://i.pravatar.cc/100"} style={{width:80,height:80,borderRadius:"50%",border:"1px solid #ddd",objectFit:"cover"}}/><div><h3 style={{margin:0}}>@{myUser}</h3><p style={{fontSize:13,color:"#666",margin:"4px 0"}}>{editBio}</p><button onClick={()=>setEditOpen(true)} style={{border:"1px solid #dbdbdb",padding:"6px 14px",borderRadius:8,background:"white",fontWeight:600,marginTop:6}}>Edit Profile</button></div></div><div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>{posts.filter((p:any)=>p.username===myUser).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover"}} onClick={()=>setZoomImg(p.image_url)}/>)}</div></div>}

      {tab==="likes" && <div style={{padding:12}}><h3>Liked</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>{posts.filter((p:any)=>liked.includes(p.id)).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover"}}/>)}</div></div>}

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #efefef",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 12px",zIndex:100}}>
        <span onClick={()=>{setTab("home"); setShowUserList(false)}} style={{cursor:"pointer",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",background:tab==="home"? "#efefef":"transparent",borderRadius:20}}><svg width="26" height="26" viewBox="0 0 24 24" fill={tab==="home"? "black":"none"} stroke="black" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg></span>
        <span style={{cursor:"pointer",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="black"/></svg></span>
        <span style={{cursor:"pointer",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></span>
        <span onClick={()=>setTab("search")} style={{cursor:"pointer",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/></svg></span>
        <span onClick={()=>setTab("profile")} style={{cursor:"pointer",width:36,height:36,borderRadius:"50%",border:tab==="profile"? "2px solid black":"1px solid #ccc",overflow:"hidden",position:"relative"}}><img src={myAvatar || "https://i.pravatar.cc/100"} style={{width:"100%",height:"100%",objectFit:"cover"}}/><span style={{position:"absolute",bottom:0,right:0,width:9,height:9,background:"red",borderRadius:"50%",border:"1.5px solid white"}}></span></span>
      </div>

      {editOpen && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:"white",borderRadius:14,padding:20,width:"100%",maxWidth:360}}><h3>Edit Profile</h3><div style={{display:"flex",justifyContent:"center",marginBottom:14}}><label style={{cursor:"pointer",position:"relative"}}><img src={editAvatar || myAvatar || "https://i.pravatar.cc/100"} style={{width:90,height:90,borderRadius:"50%",objectFit:"cover"}}/><div style={{position:"absolute",bottom:0,right:0,background:"black",color:"white",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>📷</div><input type="file" hidden accept="image/*" onChange={handleAvatarChange}/></label></div><input value={editUsername} onChange={e=>setEditUsername(e.target.value)} placeholder="Username" style={{width:"100%",padding:10,marginBottom:10,borderRadius:8,border:"1px solid #ddd"}}/><input value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" style={{width:"100%",padding:10,marginBottom:14,borderRadius:8,border:"1px solid #ddd"}}/><div style={{display:"flex",gap:10}}><button onClick={()=>setEditOpen(false)} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #ddd",background:"white"}}>Cancel</button><button onClick={handleSaveProfile} style={{flex:1,padding:10,borderRadius:8,background:"black",color:"white",border:"none"}}>Save</button></div></div></div>}
      {zoomImg && <div onClick={()=>setZoomImg("")} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={zoomImg} style={{maxWidth:"95%",maxHeight:"90%"}}/><span style={{position:"absolute",top:14,right:18,color:"white",fontSize:28}}>✕</span></div>}
      {showAddPost && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:"white",borderRadius:14,padding:20,width:"100%",maxWidth:360}}><h3>New Post</h3><input value={newPostContent} onChange={e=>setNewPostContent(e.target.value)} placeholder="Caption..." style={{width:"100%",padding:10,marginBottom:10,borderRadius:8,border:"1px solid #ddd"}}/><input value={newPostImage} onChange={e=>setNewPostImage(e.target.value)} placeholder="Image URL" style={{width:"100%",padding:10,marginBottom:14,borderRadius:8,border:"1px solid #ddd"}}/><div style={{display:"flex",gap:10}}><button onClick={()=>setShowAddPost(false)} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #ddd",background:"white"}}>Cancel</button><button onClick={handleAddPost} style={{flex:1,padding:10,borderRadius:8,background:"black",color:"white",border:"none"}}>Post</button></div></div></div>}
    </div>
  )
      }
