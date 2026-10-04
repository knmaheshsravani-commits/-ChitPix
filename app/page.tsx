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
  const [commentText, setCommentText] = useState<any>({})
  const [comments, setComments] = useState<any>({})
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

  useEffect(()=>{ loadData() },[])
  async function loadData(){
    const prof = await supabase.from("profiles").select("*").eq("username",myUser).single()
    if(prof.data){ setMyAvatar(prof.data.avatar_url||""); setEditAvatar(prof.data.avatar_url||""); setEditBio(prof.data.bio||"My Bio"); setEditUsername(prof.data.username) }
    const p = await supabase.from("posts").select("*").order("id",{ascending:false})
    if(p.data) setPosts(p.data)
    const users = await supabase.from("profiles").select("*")
    if(users.data) setAllUsers(users.data)
    const f = await supabase.from("follows").select("*").eq("follower_username",myUser)
    if(f.data) setFollowing(f.data.map((x:any)=>x.following_username))
    const l = await supabase.from("likes").select("*").eq("username",myUser)
    if(l.data) setLiked(l.data.map((x:any)=>x.post_id))
  }
  async function handleAvatarChange(e:any){
    const file=e.target.files[0]
    if(!file) return
    setEditAvatarFile(file)
    setEditAvatar(URL.createObjectURL(file))
  }
  async function handleSaveProfile(){
    let finalAvatar=myAvatar
    if(editAvatarFile){
      const fileName=myUser+"_"+Date.now()+".jpg"
      await supabase.storage.from("chitpix").upload(fileName,editAvatarFile)
      const urlData=supabase.storage.from("chitpix").getPublicUrl(fileName)
      finalAvatar=urlData.data.publicUrl
    }
    await supabase.from("profiles").update({username:editUsername,bio:editBio,avatar_url:finalAvatar}).eq("username",myUser)
    setMyAvatar(finalAvatar)
    setEditOpen(false)
    loadData()
  }
  async function toggleFollow(u:string){
    if(following.includes(u)){
      await supabase.from("follows").delete().eq("follower_username",myUser).eq("following_username",u)
      setFollowing(following.filter((f)=>f!==u))
    }else{
      await supabase.from("follows").insert({follower_username:myUser,following_username:u})
      const arr=following.slice()
      arr.push(u)
      setFollowing(arr)
    }
  }
  async function toggleLike(id:number){
    if(liked.includes(id)){
      await supabase.from("likes").delete().eq("username",myUser).eq("post_id",id)
      setLiked(liked.filter((x)=>x!==id))
    }else{
      await supabase.from("likes").insert({username:myUser,post_id:id})
      const arr=liked.slice()
      arr.push(id)
      setLiked(arr)
    }
  }
  function toggleSave(id:number){
    if(saved.includes(id)) setSaved(saved.filter((x)=>x!==id))
    else{
      const arr=saved.slice()
      arr.push(id)
      setSaved(arr)
    }
  }
  function handleAddComment(postId:number){
    const txt=commentText[postId]
    if(!txt) return
    if(txt.trim()==="") return
    const prev=comments[postId]||[]
    const newArr=prev.slice()
    newArr.push(myUser+": "+txt)
    const newObj=Object.assign({},comments)
    newObj[postId]=newArr
    setComments(newObj)
    const newText=Object.assign({},commentText)
    newText[postId]=""
    setCommentText(newText)
  }
  async function handleAddPost(){
    if(!newPostImage.trim()){ alert("Image URL pettu"); return }
    const res=await supabase.from("posts").insert({username:myUser,content:newPostContent,image_url:newPostImage,avatar_url:myAvatar}).select()
    if(res.data){
      const arr=[res.data[0]].concat(posts)
      setPosts(arr)
      setNewPostImage("")
      setNewPostContent("")
      setShowAddPost(false)
    }
  }
  function handleSharePost(p:any){
    navigator.clipboard.writeText(p.image_url)
    alert("Link copied!")
    setShareOpen(null)
  }
  function handleDownload(url:string){
    const a=document.createElement("a")
    a.href=url
    a.download="chitpix.jpg"
    a.target="_blank"
    a.click()
  }
  function handleRepost(p:any){
    const newP={id:Date.now(),username:p.username,content:"Reposted: "+p.content,image_url:p.image_url,avatar_url:p.avatar_url}
    const arr=[newP].concat(posts)
    setPosts(arr)
    alert("Reposted!")
  }

  return (
    <div style={{minHeight:"100vh",background:"white",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:80,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px",position:"sticky",top:0,background:"white",zIndex:20,borderBottom:"1px solid #efefef"}}>
        <span onClick={()=>setShowAddPost(true)} style={{fontSize:28,cursor:"pointer",color:"black"}}>+</span>
        <b style={{fontFamily:"cursive",fontSize:28,color:"black"}}>Instagram</b>
        <span>❤️</span>
      </div>

      {tab==="home" && (
        <div>
          <div style={{display:"flex",gap:14,padding:"12px 10px",overflowX:"auto",borderBottom:"1px solid #efefef"}}>
            <div style={{minWidth:66,textAlign:"center"}}><div style={{width:62,height:62,borderRadius:"50%",background:"black",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:24}}>M</div><div style={{fontSize:12,marginTop:6,color:"black"}}>Your story</div></div>
            {allUsers.map((u:any)=>(
              <div key={u.username} style={{minWidth:66,textAlign:"center"}}>
                <div style={{width:62,height:62,borderRadius:"50%",padding:2.5,background:"linear-gradient(45deg,#feda75,#d62976,#4f5bd5)",margin:"0 auto"}}>
                  <img src={u.avatar_url||"https://i.pravatar.cc/100?u="+u.username} style={{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid white",objectFit:"cover"}}/>
                </div>
                <div style={{fontSize:11,color:"black",marginTop:4}}>{u.username.slice(0,8)}</div>
              </div>
            ))}
          </div>
          {posts.map((p:any)=>(
            <div key={p.id} style={{borderBottom:"8px solid #fafafa"}}>
              <div style={{display:"flex",alignItems:"center",padding:"10px 12px",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{p.username[0]}</div>
                <b style={{fontSize:14,color:"black"}}>{p.username}</b>
                <button onClick={()=>toggleFollow(p.username)} style={{marginLeft:"auto",padding:"6px 14px",borderRadius:8,background:following.includes(p.username)?"#efefef":"#0095f6",color:following.includes(p.username)?"black":"white",border:"none",fontWeight:700,fontSize:13}}>{following.includes(p.username)?"Following":"Follow"}</button>
              </div>
              <img src={p.image_url} style={{width:"100%",display:"block"}} onClick={()=>setZoomImg(p.image_url)}/>
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px"}}>
                <div style={{display:"flex",gap:18,alignItems:"center"}}>
                  <span onClick={()=>toggleLike(p.id)} style={{fontSize:24,cursor:"pointer"}}>{liked.includes(p.id)?"❤️":"🤍"}</span>
                  <span onClick={()=>setShowComments(showComments===p.id?null:p.id)} style={{fontSize:24,cursor:"pointer"}}>💬</span>
                  <span onClick={()=>handleRepost(p)} style={{fontSize:24,cursor:"pointer"}}>🔁</span>
                  <span onClick={()=>setShareOpen(p)} style={{fontSize:24,cursor:"pointer"}}>✈️</span>
                  <span onClick={()=>handleDownload(p.image_url)} style={{fontSize:24,cursor:"pointer"}}>⬇️</span>
                </div>
                <span onClick={()=>toggleSave(p.id)} style={{fontSize:24,cursor:"pointer"}}>{saved.includes(p.id)?"🔖":"📑"}</span>
              </div>
              <div style={{padding:"0 12px 8px",color:"black",fontSize:14}}><b>{p.username}</b> {p.content}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="profile" && (
        <div style={{background:"white",minHeight:"80vh"}}>
          <div style={{padding:"18px 14px"}}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <div onClick={()=>setEditOpen(true)} style={{cursor:"pointer",position:"relative"}}>
                {myAvatar? <img src={myAvatar} style={{width:86,height:86,borderRadius:"50%",objectFit:"cover"}}/> : <div style={{width:86,height:86,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>M</div>}
                <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,background:"#0095f6",color:"white",borderRadius:"50%",border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center"}}>+</div>
              </div>
              <div style={{display:"flex",flex:1,justifyContent:"space-around"}}>
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
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>{posts.filter((x:any)=>x.username===myUser).map((p:any)=><img key={p.id} src={p.image_url} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover"}} onClick={()=>setZoomImg(p.image_url)}/>)}</div>
        </div>
      )}

      {tab==="reels" && (
        <div style={{background:"black",minHeight:"100vh"}}>
          <div style={{display:"flex",gap:20,padding:"12px 14px",color:"white",fontSize:18}}><b>Reels</b></div>
          {posts.map((p:any)=>(
            <div key={p.id} style={{position:"relative",height:"75vh",marginBottom:10}}>
              <img src={p.image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",right:12,bottom:80,display:"flex",flexDirection:"column",gap:20,alignItems:"center"}}>
                <div onClick={()=>toggleLike(p.id)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:28,color:"white"}}>{liked.includes(p.id)?"❤️":"🤍"}</div></div>
                <div onClick={()=>setShareOpen(p)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:26,color:"white"}}>✈️</div></div>
                <div onClick={()=>handleDownload(p.image_url)} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:26,color:"white"}}>⬇️</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="messages" && (
        <div style={{background:"white",minHeight:"80vh",padding:14}}>
          <div style={{display:"flex",background:"#efefef",borderRadius:20,padding:"12px 14px",alignItems:"center",gap:10}}>
            <span>🔍</span>
            <input value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder="Search" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"black"}}/>
          </div>
          {allUsers.filter((u:any)=>u.username.toLowerCase().includes(searchText.toLowerCase())).map((u:any)=>(
            <div key={u.username} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f0f0f0"}}>
              <img src={u.avatar_url||"https://i.pravatar.cc/100?u="+u.username} style={{width:48,height:48,borderRadius:"50%"}}/>
              <div><b style={{color:"black",fontSize:14}}>{u.username}</b></div>
              <button onClick={()=>setShareOpen(u)} style={{marginLeft:"auto",background:"#efefef",border:"none",borderRadius:20,padding:"8px 12px",color:"black"}}>Share</button>
            </div>
          ))}
        </div>
      )}

      {tab==="search" && (
        <div style={{padding:20}}>
          <input value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder="Search" style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid #ddd",color:"black",background:"white"}}/>
        </div>
      )}

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #efefef",display:"flex",justifyContent:"space-around",padding:"10px 0",zIndex:100}}>
        <span onClick={()=>setTab("home")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="home"?"#efefef":"transparent"}}>🏠</span>
        <span onClick={()=>setTab("reels")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="reels"?"#efefef":"transparent"}}>🎬</span>
        <span onClick={()=>setTab("messages")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="messages"?"#efefef":"transparent"}}>✈️</span>
        <span onClick={()=>setTab("search")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="search"?"#efefef":"transparent"}}>🔍</span>
        <span onClick={()=>setTab("profile")} style={{cursor:"pointer",padding:"6px 18px",borderRadius:20,background:tab==="profile"?"#efefef":"transparent"}}>{myAvatar? <img src={myAvatar} style={{width:28,height:28,borderRadius:"50%"}}/> : <div style={{width:28,height:28,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>M</div>}</span>
      </div>

      {editOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:16,padding:20,width:"100%",maxWidth:360}}>
            <h3 style={{color:"black"}}>Edit Profile</h3>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
              <label style={{cursor:"pointer"}}>
                <img src={editAvatar||myAvatar||"https://i.pravatar.cc/100"} style={{width:90,height:90,borderRadius:"50%",objectFit:"cover"}}/>
                <div style={{textAlign:"center",color:"#0095f6",fontSize:13,marginTop:6}}>Change Photo</div>
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange}/>
              </label>
            </div>
            <div style={{fontSize:12,color:"black"}}>Username</div>
            <input value={editUsername} onChange={(e)=>setEditUsername(e.target.value)} style={{width:"100%",padding:12,marginBottom:10,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <div style={{fontSize:12,color:"black"}}>Bio</div>
            <input value={editBio} onChange={(e)=>setEditBio(e.target.value)} style={{width:"100%",padding:12,marginBottom:12,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setEditOpen(false)} style={{flex:1,padding:12,borderRadius:8,border:"1px solid #ddd",background:"white",color:"black"}}>Cancel</button>
              <button onClick={handleSaveProfile} style={{flex:1,padding:12,borderRadius:8,background:"black",color:"white",border:"none"}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddPost && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:14,padding:20,width:"100%",maxWidth:360}}>
            <h3 style={{color:"black"}}>New Post</h3>
            <input value={newPostContent} onChange={(e)=>setNewPostContent(e.target.value)} placeholder="Caption" style={{width:"100%",padding:10,marginBottom:8,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <input value={newPostImage} onChange={(e)=>setNewPostImage(e.target.value)} placeholder="Image URL" style={{width:"100%",padding:10,marginBottom:12,borderRadius:8,border:"1px solid #ddd",color:"black",background:"white"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowAddPost(false)} style={{flex:1,padding:10,borderRadius:8,background:"white",border:"1px solid #ddd",color:"black"}}>Cancel</button>
              <button onClick={handleAddPost} style={{flex:1,padding:10,borderRadius:8,background:"black",color:"white",border:"none"}}>Post</button>
            </div>
          </div>
        </div>
      )}

      {zoomImg && <div onClick={()=>setZoomImg("")} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={zoomImg} style={{maxWidth:"95%",maxHeight:"90%"}}/></div>}
    </div>
  )
        }
