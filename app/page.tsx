"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [stories,setStories]=useState<any[]>([])
  const [text,setText]=useState("")
  const [likedIds,setLikedIds]=useState<number[]>([])
  const [profile,setProfile]=useState<any>({username:"@knmahesh30", name:"Mahesh Reddy", avatar_url:"", bio:"I love ChitPix.com 🌸 | Creator"})
  const [editData,setEditData]=useState<any>({name:"Mahesh Reddy", bio:"I love ChitPix.com 🌸 | Creator", avatar_url:""})
  const [showEdit,setShowEdit]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [viewStory,setViewStory]=useState<any>(null)
  const [commentOpen,setCommentOpen]=useState<any>(null)
  const [commentText,setCommentText]=useState("")
  const [comments,setComments]=useState<any[]>([])

  async function load(){
    const p1 = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(p1.data) setPosts(p1.data)
    const p2 = await supabase.from("profiles").select("*").eq("username","@knmahesh30").limit(1)
    if(p2.data && p2.data[0]){ setProfile(p2.data[0]); setEditData({name:p2.data[0].name, bio:p2.data[0].bio, avatar_url:p2.data[0].avatar_url}) }
    const p3 = await supabase.from("stories").select("*").order("created_at",{ascending:false})
    if(p3.data) setStories(p3.data)
    const p4 = await supabase.from("comments").select("*").order("created_at",{ascending:false})
    if(p4.data) setComments(p4.data)
  }
  useEffect(()=>{ load() }, [])

  async function uploadImage(file: File){
    setUploading(true)
    const name = Date.now()+"_"+file.name.replace(/\s/g,"_")
    const { error } = await supabase.storage.from("chitpix").upload(name, file)
    if(error){ alert("Storage Public chey bro! "+error.message); setUploading(false); return "" }
    const url = supabase.storage.from("chitpix").getPublicUrl(name).data.publicUrl
    setUploading(false)
    return url
  }

  async function addPost(){
    if(!text.trim()) return
    await supabase.from("posts").insert({content:text, username:"@knmahesh30", likes:0})
    setText(""); load()
  }
  async function addStory(e:any){
    const file=e.target.files?.[0]; if(!file) return
    const url=await uploadImage(file)
    if(!url) return
    await supabase.from("stories").insert({image_url:url, username:"@knmahesh30"})
    load(); alert("Story Added ✅")
  }
  async function saveProfile(){
    let finalUrl = editData.avatar_url
    if(finalUrl && finalUrl.startsWith("blob:")){
      const res = await fetch(finalUrl)
      const blob = await res.blob()
      finalUrl = await uploadImage(new File([blob], "avatar.jpg", {type: blob.type}))
    }
    const { error } = await supabase.from("profiles").upsert({username:"@knmahesh30", name:editData.name, bio:editData.bio, avatar_url:finalUrl})
    if(error){ alert(error.message); return }
    setProfile({...profile, name:editData.name, bio:editData.bio, avatar_url:finalUrl})
    setShowEdit(false)
    load()
    alert("Profile Saved 100% ✅ Refresh chesina povadu!")
  }

  return(
    <div style={{minHeight:"100vh", background:"white", maxWidth:480, margin:"0 auto", paddingBottom:70, fontFamily:"-apple-system, system-ui"}}>
      {/* HEADER FIXED */}
      <div style={{padding:"14px 16px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"white", zIndex:20}}>
        <b style={{color:"#9333ea", fontSize:20, letterSpacing:-0.5}}>ChitPix.com 🌸</b>
        <div style={{display:"flex", gap:12}}><span>🔔</span><span>❤️</span></div>
      </div>

      {tab==="home" && (
        <>
          <div style={{display:"flex", gap:12, padding:12, overflowX:"auto", borderBottom:"1px solid #eee"}}>
            <label style={{minWidth:58, textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:28, background:"#f3e8ff", display:"flex", alignItems:"center", justifyContent:"center", border:"2px dashed #9333ea", fontSize:22}}>+</div>
              <div style={{fontSize:10, marginTop:4}}>Add</div>
              <input type="file" hidden accept="image/*" onChange={addStory}/>
            </label>
            {stories.map((s:any)=><div key={s.id} onClick={()=>setViewStory(s)} style={{minWidth:58, textAlign:"center"}}><img src={s.image_url} style={{width:56,height:56,borderRadius:28,border:"2px solid #9333ea",objectFit:"cover"}}/><div style={{fontSize:10, marginTop:4}}>{s.username.slice(0,7)}</div></div>)}
          </div>
          <div style={{padding:12, display:"flex", gap:8}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="What's new bro?" style={{flex:1, background:"#f4f4f5", padding:"12px 14px", borderRadius:14, border:"none", outline:"none"}}/><button onClick={addPost} disabled={uploading} style={{background:"black", color:"white", padding:"0 18px", borderRadius:14, border:"none", fontWeight:"bold"}}>Post</button></div>
          {posts.map((p:any)=><div key={p.id} style={{padding:"12px 16px", borderBottom:"1px solid #f0f0f0"}}><b style={{fontSize:13}}>{p.username}</b><div style={{fontSize:14, marginTop:2}}>{p.content}</div><div style={{display:"flex", gap:16, marginTop:10}}><span>🤍 {p.likes||0}</span><span onClick={()=>setCommentOpen(commentOpen===p.id?null:p.id)}>💬 {comments.filter((c:any)=>c.post_id===p.id).length}</span><span>✈️</span></div>{commentOpen===p.id && <div style={{marginTop:10, background:"#fafafa", padding:8, borderRadius:10}}>{comments.filter((c:any)=>c.post_id===p.id).map((c:any,i:number)=><div key={i} style={{fontSize:12, marginBottom:4}}><b>{c.username}</b> {c.content}</div>)}<div style={{display:"flex", gap:6, marginTop:6}}><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." style={{flex:1, padding:8, borderRadius:10, border:"1px solid #ddd"}}/><button onClick={async()=>{ if(!commentText.trim()) return; await supabase.from("comments").insert({post_id:p.id, content:commentText, username:"@knmahesh30"}); setCommentText(""); load()}} style={{background:"black", color:"white", border:"none", padding:"8px 12px", borderRadius:10}}>Post</button></div></div>}</div>)}
        </>
      )}

      {/* PROFILE 100% WORKING */}
      {tab==="profile" && (
        <div style={{padding:16}}>
          <div style={{display:"flex", gap:16, alignItems:"center"}}>
            <div style={{width:80,height:80,borderRadius:40,overflow:"hidden",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:"bold",border:"3px solid #9333ea"}}>
              {profile.avatar_url? <img src={profile.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "M"}
            </div>
            <div style={{display:"flex", gap:18, textAlign:"center"}}>
              <div><b style={{display:"block"}}>{posts.length}</b><span style={{fontSize:12}}>Posts</span></div>
              <div><b style={{display:"block"}}>1.2K</b><span style={{fontSize:12}}>Followers</span></div>
              <div><b style={{display:"block"}}>98</b><span style={{fontSize:12}}>Following</span></div>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <b style={{fontSize:14}}>{profile.name}</b>
            <div style={{fontSize:13, color:"#444", whiteSpace:"pre-wrap"}}>{profile.bio}</div>
            <div style={{fontSize:12, color:"#9333ea", marginTop:2}}>{profile.username}</div>
          </div>
          <div style={{display:"flex", gap:8, marginTop:14}}>
            <button onClick={()=>setShowEdit(true)} style={{flex:1, padding:"10px", borderRadius:10, border:"1px solid #ddd", background:"#f5f5f5", fontWeight:"bold"}}>Edit profile</button>
            <button onClick={()=>{ navigator.clipboard.writeText(window.location.href); alert("Link copied!") }} style={{flex:1, padding:"10px", borderRadius:10, border:"1px solid #ddd", background:"white", fontWeight:"bold"}}>Share profile</button>
          </div>
          {/* POSTS GRID */}
          <div style={{marginTop:18, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2}}>
            {posts.map((p:any)=><div key={p.id} style={{aspectRatio:"1", background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, padding:6, overflow:"hidden"}}>{p.content.slice(0,40)}</div>)}
          </div>
          {posts.length===0 && <div style={{textAlign:"center", marginTop:30, color:"#999"}}>No posts yet - Go to Home and Post!</div>}
        </div>
      )}

      {tab==="search" && <div style={{padding:20, textAlign:"center", color:"#888", marginTop:40}}>Search Coming Soon 🔍</div>}

      {/* EDIT MODAL FIXED - WHITE BOX POINELEDHU */}
      {showEdit && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
          <div style={{background:"white", width:"100%", maxWidth:360, borderRadius:20, padding:20}}>
            <h3 style={{fontWeight:"bold", fontSize:16, marginBottom:14}}>Edit Profile ✅</h3>

            <div style={{textAlign:"center", marginBottom:16}}>
              <label style={{cursor:"pointer"}}>
                <div style={{width:80,height:80,borderRadius:40,margin:"0 auto",overflow:"hidden",background:"#eee",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {editData.avatar_url? <img src={editData.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:28}}>📷</span>}
                </div>
                <div style={{fontSize:12, color:"#9333ea", marginTop:6, fontWeight:"bold"}}>{uploading?"Uploading...":"Change Photo"}</div>
                <input type="file" hidden accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) setEditData({...editData, avatar_url: URL.createObjectURL(f)}) }}/>
              </label>
            </div>

            <label style={{fontSize:12, fontWeight:"bold"}}>Name</label>
            <input value={editData.name} onChange={e=>setEditData({...editData, name:e.target.value})} placeholder="Your name" style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #ddd", marginTop:4, marginBottom:12, color:"black", background:"white", outline:"none", fontSize:14}}/>

            <label style={{fontSize:12, fontWeight:"bold"}}>Bio</label>
            <input value={editData.bio} onChange={e=>setEditData({...editData, bio:e.target.value})} placeholder="Your bio 🌸" style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #ddd", marginTop:4, marginBottom:16, color:"black", background:"white", outline:"none", fontSize:14}}/>

            <div style={{display:"flex", gap:10}}>
              <button onClick={()=>setShowEdit(false)} style={{flex:1, padding:12, borderRadius:12, border:"1px solid #ddd", background:"white"}}>Cancel</button>
              <button onClick={saveProfile} disabled={uploading} style={{flex:1, padding:12, borderRadius:12, background:"black", color:"white", border:"none", fontWeight:"bold"}}>{uploading?"Saving...":"Save ✅"}</button>
            </div>
          </div>
        </div>
      )}

      {viewStory && <div onClick={()=>setViewStory(null)} style={{position:"fixed", inset:0, background:"black", zIndex:60, display:"flex", alignItems:"center", justifyContent:"center"}}><img src={viewStory.image_url} style={{maxWidth:"100%", maxHeight:"100%"}}/></div>}

      <div style={{position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"white", borderTop:"1px solid #ddd", display:"flex", justifyContent:"space-around", padding:"12px 0", zIndex:10}}>
        <button onClick={()=>setTab("home")} style={{border:"none", background:"none", fontSize:24}}>🏠</button>
        <button onClick={()=>setTab("home")} style={{border:"none", background:"none", fontSize:24}}>🎬</button>
        <button onClick={()=>setTab("search")} style={{border:"none", background:"none", fontSize:24}}>🔍</button>
        <button onClick={()=>setTab("home")} style={{border:"none", background:"none", fontSize:24}}>✈️</button>
        <button onClick={()=>setTab("profile")} style={{border:"none", background:"none", width:30,height:30,borderRadius:15,backgroundColor:tab==="profile"?"#9333ea":"black",color:"white",fontWeight:"bold"}}>M</button>
      </div>
    </div>
  )
          }
