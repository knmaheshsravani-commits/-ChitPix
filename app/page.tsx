"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [tab,setTab]=useState("home")
  const [posts,setPosts]=useState<any[]>([])
  const [stories,setStories]=useState<any[]>([])
  const [text,setText]=useState("")
  const [searchText,setSearchText]=useState("")
  const [likedIds,setLikedIds]=useState<number[]>([])
  const [username,setUsername]=useState("@knmahesh30")
  const [profile,setProfile]=useState<any>({username:"@knmahesh30", name:"Mahesh", avatar_url:"", bio:"I love ChitPix 🌸"})
  const [editData,setEditData]=useState<any>({username:"@knmahesh30", name:"Mahesh", avatar_url:"", bio:""})
  const [showEdit,setShowEdit]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [commentText,setCommentText]=useState("")
  const [commentOpen,setCommentOpen]=useState<any>(null)
  const [comments,setComments]=useState<any[]>([])
  const [viewStory,setViewStory]=useState<any>(null)
  const [showLogin,setShowLogin]=useState(false)
  const [loginName,setLoginName]=useState("")
  const [followersCount,setFollowersCount]=useState(0)
  const [followingCount,setFollowingCount]=useState(0)
  const [following, setFollowing] = useState<string[]>([])
  const [mutedReels, setMutedReels] = useState<{[k:string]:boolean}>({})
  const [playingReels, setPlayingReels] = useState<{[k:string]:boolean}>({})
  const [showHeart, setShowHeart] = useState<string|null>(null)

  async function load(){
    const d1 = await supabase.from("posts").select("*").order("created_at",{ascending:false})
    if(d1.data) setPosts(d1.data)
    const d2 = await supabase.from("profiles").select("*").eq("username","@knmahesh30")
    if(d2.data && d2.data.length > 0){ setProfile(d2.data[0]); setEditData(d2.data[0]) }
    const d3 = await supabase.from("comments").select("*").order("created_at",{ascending:false})
    if(d3.data) setComments(d3.data)
    const d4 = await supabase.from("stories").select("*").order("created_at",{ascending:false})
    if(d4.data) setStories(d4.data)
    const saved = localStorage.getItem("chitpix_user")
    if(saved){ setUsername(saved) } else { setShowLogin(true) }
    const myUser = localStorage.getItem("chitpix_user") || "@knmahesh30"
    const f1 = await supabase.from("follows").select("*").eq("following_username", myUser)
    if(f1.data) setFollowersCount(f1.data.length)
    const f2 = await supabase.from("follows").select("*").eq("follower_username", myUser)
    if(f2.data){ setFollowingCount(f2.data.length); setFollowing(f2.data.map((f:any)=>f.following_username)) }
  }
  useEffect(()=>{ load() }, [])

  async function uploadImage(file:any){
    setUploading(true)
    const name = Date.now()+"_"+file.name.replace(/\s/g,"_")
    await supabase.storage.from("chitpix").upload(name, file, { contentType: file.type, cacheControl: "3600" })
    const res = supabase.storage.from("chitpix").getPublicUrl(name)
    setUploading(false)
    return res.data.publicUrl
  }
  async function addPost(e:any){
    const file = e.target.files? e.target.files[0] : null
    let url = ""
    if(file){ url = await uploadImage(file) }
    if(!text.trim() &&!url) return
    await supabase.from("posts").insert({content:text, image_url:url, username: username || "@knmahesh30", likes: 0})
    setText(""); load(); setTab("home")
  }
  async function addStory(e:any){
    const file = e.target.files? e.target.files[0] : null
    if(!file) return
    const url = await uploadImage(file)
    await supabase.from("stories").insert({ image_url: url, username: username || "@knmahesh30", created_at: new Date().toISOString() })
    load(); alert("Story added! 🟣")
  }
  async function saveProfile(){
    try{
      let finalUrl = editData.avatar_url
      if(finalUrl && finalUrl.startsWith("blob:")){
        const r = await fetch(finalUrl)
        const b = await r.blob()
        finalUrl = await uploadImage(new File([b], `avatar_${Date.now()}.jpg`, {type:b.type}))
      }
      const finalData = {...editData, avatar_url: finalUrl}
      await supabase.from("profiles").upsert({username:"@knmahesh30",...finalData})
      setProfile(finalData as any); setShowEdit(false); alert("Saved! ✅"); load()
    }catch(e:any){ alert("Error: "+e.message) }
  }
  async function handleLike(id:any, likes:any){
    const isLiked = likedIds.includes(id)
    if(isLiked){ setLikedIds(likedIds.filter((i)=>i!==id)); await supabase.from("posts").update({likes: Math.max(0,likes-1)}).eq("id",id) }
    else { setLikedIds([...likedIds, id]); await supabase.from("posts").update({likes: likes+1}).eq("id",id) }
    load()
  }
  async function handleShare(p:any){
    if((navigator as any).share){ try{ await (navigator as any).share({title:"ChitPix", text:p.content, url:window.location.href}) }catch{} }
    else { await navigator.clipboard.writeText(window.location.href); alert("Link Copied!") }
  }
  async function addComment(postId:number){
    if(!commentText.trim()) return
    await supabase.from("comments").insert({post_id:postId, content:commentText, username:username})
    setCommentText(""); load()
  }
  function doLogin(){
    if(!loginName.trim()) return
    const u = "@"+loginName.replace("@","")
    setUsername(u); localStorage.setItem("chitpix_user", u)
    setProfile({...profile, username:u}); setShowLogin(false)
  }
  async function handleFollow(userToFollow:string){
    const myUser = localStorage.getItem("chitpix_user") || "@knmahesh30"
    if(userToFollow===myUser) return
    const check = await supabase.from("follows").select("*").eq("follower_username", myUser).eq("following_username", userToFollow)
    if(check.data && check.data.length>0){
      await supabase.from("follows").delete().eq("follower_username", myUser).eq("following_username", userToFollow)
    } else {
      await supabase.from("follows").insert({follower_username:myUser, following_username:userToFollow})
    }
    load()
  }
  async function handleDownload(url:string){
    window.open(url,"_blank")
  }

  const filtered = posts.filter((p:any)=>{
    const s = searchText.toLowerCase()
    return p.content?.toLowerCase().includes(s) || p.username?.toLowerCase().includes(s)
  })

  return(
    <div style={{minHeight:"100vh", background:"white", color:"black", paddingBottom:70, fontFamily:"system-ui", maxWidth:480, margin:"0 auto"}}>
      {/* TOP HEADER - FIXED */}
      <div style={{padding:"12px 14px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center",
