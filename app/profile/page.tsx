"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import BottomNav from "../components/BottomNav"

const R2_PUBLIC_URL = "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

const uploadToR2 = async (file: File, folder: string = "posts") => {
  try {
    const presignRes = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: `${folder}/${Date.now()}_${file.name}`,
        contentType: file.type,
        fileSize: file.size,
      }),
    })
    const data = await presignRes.json()
    const { url, publicUrl, key } = data
    if (!url) throw new Error("Presign failed " + JSON.stringify(data))
    const uploadRes = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
    if (!uploadRes.ok) throw new Error("R2 PUT failed " + uploadRes.status)
    return publicUrl || `${R2_PUBLIC_URL}/${key}`
  } catch (e) {
    console.error("R2 Upload Error:", e)
    return null
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const usernameFromUrl = (params as any)?.username
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"POSTS" | "REELS" | "TAGGED">("POSTS")
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [username, setUsername] = useState("ChitPix User")
  const [bio, setBio] = useState("Welcome to ChitPix\nPhotographer | Creator")
  const [link, setLink] = useState("chitpix.com")
  const [photo, setPhoto] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showCloseFriends, setShowCloseFriends] = useState(false)
  const [pinnedPosts, setPinnedPosts] = useState<number[]>([])
  const [profileViews, setProfileViews] = useState(3421)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlights, setHighlights] = useState(["ChitPix","My Work","Travel","Friends"])
  const [hasStory, setHasStory] = useState(true)
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])

  useEffect(()=>{
    const fetchR2Data = async () => {
      let finalUsername = ""
      if(usernameFromUrl){
        finalUsername = usernameFromUrl as string
      } else {
        try{
          const cur = await fetch("/api/users/current",{cache:"no-store"}).then(r=>r.json()).catch(()=>null)
          if(cur?.username) finalUsername = cur.username
        }catch{}
        if(!finalUsername){
          finalUsername = localStorage.getItem("chitpix_username") || "ChitPix User"
        }
      }
      setUsername(finalUsername)
      setEditName(finalUsername)

      try{
        const uRes = await fetch(`/api/users?username=${finalUsername}`,{cache:"no-store"})
        const uData = await uRes.json()
        const u = Array.isArray(uData) ? uData.find((x:any)=>x.username===finalUsername) : uData
        if(u){
          if(u.bio){ setBio(u.bio); setEditBio(u.bio) }
          if(u.avatar_url){ setPhoto(u.avatar_url) }
          if(u.link){ setLink(u.link); setEditLink(u.link) }
          if(u.followers) setFollowers(u.followers)
          if(u.following) setFollowing(u.following)
        } else {
          const lp = localStorage.getItem("chitpix_profile_photo")
          if(lp && lp.startsWith("https://")) setPhoto(lp)
        }
      }catch{}

      try{
        const res = await fetch("/api/posts",{cache:"no-store"})
        const data = await res.json()
        if(Array.isArray(data) && data.length>0){
          const mapped = data.map((p:any)=>({
            image: p.image_url, imageUrl: p.image_url, r2Url: p.image_url, url: p.image_url,
            type: p.type || (p.image_url?.includes(".mp4")?"reels":"post"),
            username: p.username, id: p.id, created_at: p.created_at, caption: p.caption
          }))
          const filtered = finalUsername && finalUsername!=="ChitPix User" ? mapped.filter((m:any)=> m.username===finalUsername) : mapped
          setPosts(filtered.length>0 ? filtered : mapped)
        }
      }catch{}

      setProfileViews(prev => prev + Math.floor(Math.random()*10))
      const pinned = localStorage.getItem("chitpix_pinned"); if(pinned) try{setPinnedPosts(JSON.parse(pinned))}catch{}
      const archived = localStorage.getItem("chitpix_archived"); if(archived) try{setArchivedPosts(JSON.parse(archived))}catch{}
    }
    fetchR2Data()
  },[usernameFromUrl])

  const savePosts = (newPosts:any[])=>{ setPosts(newPosts) }
  const handleDelete = async (index:number, postId?:string)=>{
    if(!confirm("Delete this post?")) return
    if(postId){ try{ await fetch(`/api/posts?id=${postId}`, {method:"DELETE"}) }catch{} }
    savePosts(posts.filter((_,i)=> i!== index)); setSelectedPost(null)
  }
  const handleArchive = (index:number)=>{
    const postToArchive = posts[index]
    const newArchived = [...archivedPosts, postToArchive]
    setArchivedPosts(newArchived); localStorage.setItem("chitpix_archived", JSON.stringify(newArchived))
    savePosts(posts.filter((_,i)=> i!== index)); setSelectedPost(null)
    alert("Archived! Check Archive in menu")
  }
  const handlePhotoChange = async (e: any) => {
    const f = e.target.files?.[0]; if(!f) return; setUploading(true)
    const url = await uploadToR2(f, "avatars")
    if(url){
      setPhoto(url)
      localStorage.setItem("chitpix_profile_photo", url)
      localStorage.setItem("chitpix_avatar", url)
      document.cookie = `avatar=${url}; path=/; max-age=2592000`
      try{
        await fetch("/api/users",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({username, avatar_url: url, bio, link})
        })
        alert("Profile pic R2 lo permanent fix ayindi! ✅")
      }catch{}
    } else {
      alert("R2 upload failed - try again")
    }
    setUploading(false)
   }
    const handleProfileSave = async () => {
    const newName = editName || username; const newBio = editBio || bio; const newLink = editLink || link
    setUploading(true)
    try{
      await fetch("/api/users",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({username: newName, bio: newBio, link: newLink, avatar_url: photo})
      })
      setUsername(newName); setBio(newBio); setLink(newLink)
      localStorage.setItem("chitpix_username", newName)
      localStorage.setItem("chitpix_bio", newBio)
      localStorage.setItem("chitpix_link", newLink)
      document.cookie = `username=${newName}; path=/; max-age=2592000`
    }catch{}
    setUploading(false); setShowEdit(false)
  }

  const handleSettingsClick = () => { setShowMenu(false); router.push("/settings") }
  const handleLogoutClick = () => {
    if(!confirm("Log out from ChitPix?")) return
    localStorage.clear(); sessionStorage.clear()
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setShowMenu(false); window.location.href="/login"
  }
  const handleShareProfile = async () => {
    const url = window.location.href
    if(navigator.share){ try{ await navigator.share({title:`${username} on ChitPix`, url}) }catch{} }
    else { await navigator.clipboard.writeText(url); alert("Link Copied! 🔗 " + url) }
  }
  const handleQRShare = () => { setShowMenu(false); setShowQR(true) }
  const handleAIBio = () => {
    const bios = ["🚀 Digital Creator | R2 Powered ☁️ | Bangalore","✨ ChitPix Founder | Building 2026 future","📸 Photographer | Travel + Code + ❤️","💼 Creator | DM for collabs | ChitPix.com"]
    setEditBio(bios[Math.floor(Math.random()*bios.length)])
  }
  const handlePinPost = (index:number) => {
    const newPinned = pinnedPosts.includes(index)? pinnedPosts.filter(i=>i!==index) : [...pinnedPosts, index].slice(0,3)
    setPinnedPosts(newPinned); localStorage.setItem("chitpix_pinned", JSON.stringify(newPinned))
  }
  const filteredPosts = posts.filter((p)=>{
    const url = p.image || p.imageUrl || p.url || p.r2Url || ""; const isVideo = p.type === "reels" || url.includes(".mp4")
    const matchesSearch = searchQuery? (p.caption||"").toLowerCase().includes(searchQuery.toLowerCase()) : true
    if(!matchesSearch) return false
    if (activeTab === "REELS") return isVideo; if (activeTab === "POSTS") return!isVideo; return false
  }).sort((a,b)=> {
    const aIndex = posts.indexOf(a); const bIndex = posts.indexOf(b)
    if(pinnedPosts.includes(aIndex) &&!pinnedPosts.includes(bIndex)) return -1
    if(!pinnedPosts.includes(aIndex) && pinnedPosts.includes(bIndex)) return 1
    return 0
  })

  return (
    <div className="h-[100dvh] overflow-y-auto bg-black pb-20 scrollbar-hide">
      <div className="max-w-[470px] mx-auto min-h-screen bg-black text-white">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-zinc-800">
          <h1 className="font-bold text-[20px] flex items-center gap-1 cursor-pointer" onClick={()=>setShowInsights(true)}>{username} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white"><path d="M6 9l6 6 6-6"/></svg></h1>
          <div className="flex gap-5 items-center">
            <button onClick={()=>router.push("/create")} className="active:scale-90 cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            <button onClick={()=>setShowMenu(true)} className="active:scale-90 cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          </div>
        </div>
        <div className="flex p-4 gap-5 items-center">
          <div className="relative">
            <div className={`w-[86px] h-[86px] rounded-full p-[2.5px] ${hasStory?'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600':'bg-zinc-700'}`}>
              <div className="bg-black rounded-full p-[2.5px]">
                {photo? <img src={photo} className="w-[77px] h-[77px] rounded-full object-cover" alt="profile" /> : <div className="w-[77px] h-[77px] rounded-full bg-zinc-800 flex items-center justify-center">👤</div>}
              </div>
            </div>
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-[#0095f6] w-[22px] h-[22px] rounded-full flex items-center justify-center cursor-pointer border-2 border-black">+</label>
            <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            {uploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-[10px]">R2...</div>}
          </div>
          <div className="flex gap-6 text-center flex-1 justify-around">
            <div className="cursor-pointer" onClick={()=>setShowInsights(true)}><b className="block text-[18px]">{posts.length}</b><span className="text-[14px] text-zinc-400">posts</span></div>
            <div className="cursor-pointer" onClick={()=>setShowFollowers(true)}><b className="block text-[18px]">{followers||129}</b><span className="text-[14px] text-zinc-400">followers</span></div>
            <div className="cursor-pointer" onClick={()=>setShowFollowing(true)}><b className="block text-[18px]">{following||205}</b><span className="text-[14px] text-zinc-400">following</span></div>
          </div>
        </div>
        <div className="px-4">
          <p className="font-bold text-[14px]">{username}</p>
          <p className="text-[14px] mt-1 whitespace-pre-line text-zinc-200">{bio}</p>
          <p className="text-[14px] text-[#4da5ff] font-semibold mt-1">🔗 {link}</p>
          <p className="text-[11px] text-zinc-500 mt-1">👁️ {profileViews} views • R2 Connected</p>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="🔍 Search your posts..." className="w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[13px] outline-none"/>
        </div>
        <div className="flex gap-2 mt-4 px-4">
          <button onClick={()=>{setEditName(username); setEditBio(bio); setEditLink(link); setShowEdit(true)}} className="flex-1 py-[6px] rounded-lg bg-zinc-800 font-semibold text-[14px] cursor-pointer">Edit profile</button>
          <button onClick={handleShareProfile} className="flex-1 py-[6px] rounded-lg bg-zinc-800 font-semibold text-[14px] cursor-pointer">Share profile</button>
          <button onClick={handleQRShare} className="px-3 py-[6px] rounded-lg bg-zinc-800 font-semibold text-[14px] cursor-pointer">QR</button>
        </div>
        <div className="flex gap-4 mt-5 overflow-x-auto px-4 pb-2">
          {highlights.map((h,i)=>(
            <div key={h} className="text-center min-w-[64px] cursor-pointer" onClick={()=>setHighlights(highlights.filter((_,idx)=>idx!==i))}>
              <div className="w-[62px] h-[62px] rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-800">{i===0?'✨':i===1?'💼':i===2?'✈️':'❤️'}</div>
              <p className="text-[12px] mt-1.5">{h}</p>
            </div>
          ))}
          <div className="text-center min-w-[64px] cursor-pointer" onClick={()=>{const name=prompt("Highlight name?"); if(name)setHighlights([...highlights,name])}}>
            <div className="w-[62px] h-[62px] rounded-full border border-zinc-700 flex items-center justify-center">+</div>
            <p className="text-[12px] mt-1.5">New</p>
          </div>
        </div>
        <div className="flex border-t border-zinc-800 mt-3">
          <button onClick={()=>setActiveTab("POSTS")} className={`flex-1 py-3 text-[12px] tracking-widest cursor-pointer ${activeTab==="POSTS"? "border-t border-white font-bold" : "text-zinc-500"}`}>⊞ POSTS</button>
          <button onClick={()=>setActiveTab("REELS")} className={`flex-1 py-3 text-[12px] tracking-widest cursor-pointer ${activeTab==="REELS"? "border-t border-white font-bold" : "text-zinc-500"}`}>▶ REELS</button>
          <button onClick={()=>setActiveTab("TAGGED")} className={`flex-1 py-3 text-[12px] tracking-widest cursor-pointer ${activeTab==="TAGGED"? "border-t border-white font-bold" : "text-zinc-500"}`}>👤 TAGGED</button>
        </div>
        <div className="grid grid-cols-3 gap-[2px] pb-10">
          {filteredPosts.length>0? filteredPosts.map((p,i)=>{
            const url = p.image || p.imageUrl || p.url || p.r2Url || ""
            const isVideo = p.type === "reels" || url.includes(".mp4")
            const realIndex = posts.indexOf(p)
            const isPinned = pinnedPosts.includes(realIndex)
            return (
              <div key={i} onClick={()=>setSelectedPost({...p, realIndex, isVideo})} className="aspect-square bg-zinc-900 cursor-pointer relative">
                {isPinned && <div className="absolute top-1 left-1 bg-black/70 px-1 rounded text-[10px] z-10">📌</div>}
                {isVideo? <><video src={url} className="w-full h-full object-cover" muted/><div className="absolute top-1 right-1 text-[10px]">▶</div></> : <img src={url} className="w-full h-full object-cover" alt="post"/>}
              </div>
            )
          }) : (
            <div className="col-span-3 py-20 text-center">
              <p className="font-bold text-xl">{activeTab==="REELS"? "No Reels yet" : "Share a photo"}</p>
              <p className="text-sm text-zinc-500 mt-1">{searchQuery? `No results for "${searchQuery}"` : "When you share photos, they'll appear here."}</p>
              <Link href={activeTab==="REELS"? "/reels" : "/"} className="text-[#0095f6] text-sm font-semibold mt-3 inline-block">Share your first {activeTab==="REELS"? "reel" : "photo"}</Link>
            </div>
          )}
        </div>
      </div>
      {showMenu && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={()=>setShowMenu(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-3">Settings - R2</h3>
            <button onClick={handleSettingsClick} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">⚙️ Settings and privacy</button>
            <button onClick={()=>{setShowMenu(false); setShowArchive(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">📦 Archive ({archivedPosts.length}) - R2</button>
            <button onClick={handleQRShare} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">🔗 QR Code</button>
            <button onClick={handleLogoutClick} className="w-full text-left p-3.5 hover:bg-red-900/30 rounded-xl text-[15px] text-red-400">🚪 Log out</button>
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 p-3.5 bg-zinc-800 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={()=>setShowEdit(false)}>
          <div className="bg-zinc-900 w-full max-w-[470px] mx-auto rounded-t-[20px] sm:rounded-[20px] p-4 max-h-[85vh] overflow-y-auto pb-[120px] sm:pb-6 text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-center mb-2">Edit Profile - R2 Permanent</h3>
            <p className="text-[11px] text-zinc-500 mb-2 text-center">{photo ? "✅ R2 Live" : "❌ No photo yet"}</p>
            <label htmlFor="editPhotoInput" className="w-full mb-3 bg-[#0095f6] rounded-lg py-3 text-[14px] font-bold flex items-center justify-center cursor-pointer">📸 Upload New DP - R2 Permanent</label>
            <input id="editPhotoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Name" className="w-full bg-zinc-800 rounded-lg px-3 py-3 mb-2 text-[13px] outline-none"/>
            <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" className="w-full bg-zinc-800 rounded-lg px-3 py-2 mb-2 text-[13px] h-20 outline-none"/>
            <input value={editLink} onChange={e=>setEditLink(e.target.value)} placeholder="Link" className="w-full bg-zinc-800 rounded-lg px-3 py-3 mb-3 text-[13px] outline-none"/>
            <button onClick={handleAIBio} className="w-full mb-3 bg-zinc-800 rounded-lg py-2.5 text-[12px]">✨ AI Bio Generate</button>
            <button onClick={handleProfileSave} className="w-full bg-white text-black rounded-full py-3 font-bold mb-2">{uploading?"Saving R2...":"Save - R2 Permanent ✅"}</button>
            <button onClick={()=>setShowEdit(false)} className="w-full bg-zinc-800 rounded-full py-3 font-bold">Cancel</button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
          }
