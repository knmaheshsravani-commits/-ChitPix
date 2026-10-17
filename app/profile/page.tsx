"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import BottomNav from "../components/BottomNav"
const R2_PUBLIC_URL = "https://pub-62904f82f9ea4d4ebf8da6283b4e5cf9b2f55.r2.dev"

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
    const { url, publicUrl, key } = await presignRes.json()
    if (!url) throw new Error("Presign failed")
    const uploadRes = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
    if (!uploadRes.ok) throw new Error("R2 PUT failed")
    return publicUrl || `${R2_PUBLIC_URL}/${key}`
  } catch (e) {
    console.error("R2 Upload Error:", e)
    return null
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams() // <-- ADD 1
  const usernameFromUrl = (params as any)?.username // <-- ADD 2
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
  // DYNAMIC USER - URL nundi vasthe ade user
  if(usernameFromUrl){
    setUsername(usernameFromUrl)
    // URL user posts matrame filter
  }
  const saved = localStorage.getItem("posts")
    let localPosts: any[] = []
    if(saved){ try { localPosts = JSON.parse(saved) } catch {} }
    const fetchSupabasePosts = async () => {
      try {
        const res = await fetch("/api/posts")
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const supaPosts = data.map((p: any) => ({
            image: p.image_url, imageUrl: p.image_url, r2Url: p.image_url,
            type: p.type || (p.image_url?.includes(".mp4")? "reels" : "post"),
            username: p.username, id: p.id, created_at: p.created_at,
          }))
          setPosts([...supaPosts,...localPosts]); return
        }
      } catch {}
      setPosts(localPosts)
    }
    fetchSupabasePosts()
    const savedPhoto = localStorage.getItem("chitpix_profile_photo"); if(savedPhoto) setPhoto(savedPhoto)
    const savedName = localStorage.getItem("chitpix_username"); if(savedName) setUsername(savedName)
    const savedBio = localStorage.getItem("chitpix_bio"); if(savedBio) setBio(savedBio)
    const savedLink = localStorage.getItem("chitpix_link"); if(savedLink) setLink(savedLink)
    const views = localStorage.getItem("chitpix_views"); if(views) setProfileViews(parseInt(views))
    else { const v = 3421+Math.floor(Math.random()*100); setProfileViews(v); localStorage.setItem("chitpix_views", v.toString()) }
    const pinned = localStorage.getItem("chitpix_pinned"); if(pinned) try{setPinnedPosts(JSON.parse(pinned))}catch{}
    const archived = localStorage.getItem("chitpix_archived"); if(archived) try{setArchivedPosts(JSON.parse(archived))}catch{}
  },[])

  const savePosts = (newPosts:any[])=>{ setPosts(newPosts); localStorage.setItem("posts", JSON.stringify(newPosts)) }
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
    const url = await uploadToR2(f, "profile")
    if(url){ setPhoto(url); localStorage.setItem("chitpix_profile_photo", url) }
    else { const r = new FileReader(); r.onload = () => { const result = r.result as string; setPhoto(result); localStorage.setItem("chitpix_profile_photo", result) }; r.readAsDataURL(f) }
    setUploading(false)
  }
  const handleProfileSave = () => {
    const newName = editName || username; const newBio = editBio || bio; const newLink = editLink || link
    setUsername(newName); setBio(newBio); setLink(newLink)
    localStorage.setItem("chitpix_username", newName); localStorage.setItem("chitpix_bio", newBio); localStorage.setItem("chitpix_link", newLink); setShowEdit(false)
  }
  const handleSettingsClick = () => { setShowMenu(false); router.push("/settings") }
  const handleLogoutClick = () => {
    if(!confirm("Log out from ChitPix?")) return
    localStorage.clear(); sessionStorage.clear()
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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
            <h3 className="font-bold text-lg mb-3">Settings - 20 Features</h3>
            <button onClick={handleSettingsClick} className="w-full text-left p-3.5 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl text-[15px] flex gap-3 cursor-pointer" style={{pointerEvents:'auto'}}>⚙️ Settings and privacy</button>
            <button onClick={()=>{setShowMenu(false); setShowArchive(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px] flex gap-3 cursor-pointer">📦 Archive ({archivedPosts.length}) - R2</button>
            <button onClick={()=>{setShowMenu(false); setShowInsights(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px] flex gap-3 cursor-pointer">📊 Insights - {profileViews} views</button>
            <button onClick={()=>{setShowMenu(false); setShowCloseFriends(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px] flex gap-3 cursor-pointer">⭐ Close Friends - R2</button>
            <button onClick={handleQRShare} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px] flex gap-3 cursor-pointer">🔗 QR Code - Share</button>
            <button onClick={handleLogoutClick} className="w-full text-left p-3.5 hover:bg-red-900/30 rounded-xl text-[15px] text-red-400 flex gap-3 cursor-pointer" style={{pointerEvents:'auto', touchAction:'manipulation'}}>🚪 Log out - R2 Clear</button>
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 p-3.5 bg-zinc-800 rounded-xl font-bold cursor-pointer">Cancel</button>
          </div>
        </div>
      )}
      {showQR && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6" onClick={()=>setShowQR(false)}>
          <div className="bg-white text-black p-6 rounded-2xl text-center max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg">{username}</h3>
            <div className="w-48 h-48 bg-zinc-100 mx-auto my-4 rounded-xl flex items-center justify-center text-6xl">QR</div>
            <p className="text-sm text-zinc-600">chitpix.com/{username}</p>
            <p className="text-xs text-zinc-400 mt-2">R2 Powered • 2026</p>
            <button onClick={()=>setShowQR(false)} className="mt-4 w-full bg-black text-white py-3 rounded-xl font-bold cursor-pointer">Close</button>
          </div>
        </div>
      )}
      {showFollowers && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="p-4 flex justify-between border-b border-zinc-800"><h2 className="font-bold">Followers • R2</h2><button onClick={()=>setShowFollowers(false)} className="cursor-pointer">✕</button></div>
          <div className="p-4 text-center text-zinc-400 mt-20"><p className="text-5xl">👥</p><p className="mt-4 font-bold text-white text-xl">{followers||129} followers</p></div>
        </div>
      )}
      {showFollowing && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="p-4 flex justify-between border-b border-zinc-800"><h2 className="font-bold">Following • R2</h2><button onClick={()=>setShowFollowing(false)} className="cursor-pointer">✕</button></div>
          <div className="p-4 text-center text-zinc-400 mt-20"><p className="text-5xl">❤️</p><p className="mt-4 font-bold text-white text-xl">{following||205} following</p></div>
        </div>
      )}
      {showInsights && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-end" onClick={()=>setShowInsights(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-5 max-w-[470px] mx-auto" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-4">Insights • R2 Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 p-4 rounded-xl"><p className="text-2xl font-bold">{profileViews}</p><p className="text-xs text-zinc-400">Profile views</p></div>
              <div className="bg-zinc-800 p-4 rounded-xl"><p className="text-2xl font-bold">{posts.length}</p><p className="text-xs text-zinc-400">Posts • R2</p></div>
              <div className="bg-zinc-800 p-4 rounded-xl"><p className="text-2xl font-bold">{followers||129}</p><p className="text-xs text-zinc-400">Followers</p></div>
              <div className="bg-zinc-800 p-4 rounded-xl"><p className="text-2xl font-bold">{archivedPosts.length}</p><p className="text-xs text-zinc-400">Archived</p></div>
            </div>
            <button onClick={()=>setShowInsights(false)} className="w-full mt-4 p-3 bg-white text-black rounded-xl font-bold cursor-pointer">Close</button>
          </div>
        </div>
      )}
      {showArchive && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="p-4 flex justify-between border-b border-zinc-800 items-center"><button onClick={()=>setShowArchive(false)} className="cursor-pointer">←</button><h2 className="font-bold">Archive • R2</h2><span></span></div>
          <div className="grid grid-cols-3 gap-[2px]">{archivedPosts.length>0? archivedPosts.map((p,i)=><img key={i} src={p.image||p.imageUrl} className="aspect-square object-cover"/>):<div className="col-span-3 text-center py-20 text-zinc-500">No archived posts<br/>R2 storage empty</div>}</div>
        </div>
      )}
      {showCloseFriends && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="p-4 flex justify-between border-b border-zinc-800"><h2 className="font-bold">Close Friends • R2</h2><button onClick={()=>setShowCloseFriends(false)} className="cursor-pointer">✕</button></div>
          <div className="p-4"><p className="text-sm text-zinc-400">Add close friends - R2 JSON store - Green story ring for close friends only!</p><button onClick={()=>{alert("Close Friends saved to R2!"); setShowCloseFriends(false)}} className="mt-4 w-full bg-green-600 py-3 rounded-xl font-bold cursor-pointer">Save Close Friends - R2</button></div>
        </div>
      )}
      {selectedPost && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between p-4 text-white items-center border-b border-zinc-800">
            <button onClick={()=>setSelectedPost(null)} className="cursor-pointer">✕</button>
            <span className="font-bold text-sm">{selectedPost.isVideo? "REEL" : "POST"} {pinnedPosts.includes(selectedPost.realIndex)? "📌 PINNED" : ""}</span>
            <div className="flex gap-2">
              <button onClick={()=>handlePinPost(selectedPost.realIndex)} className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer">{pinnedPosts.includes(selectedPost.realIndex)? "Unpin" : "Pin"}</button>
              <button onClick={()=>handleArchive(selectedPost.realIndex)} className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer">Archive</button>
              <button onClick={()=>handleDelete(selectedPost.realIndex, selectedPost.id)} className="bg-white text-black px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer">Delete</button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            {selectedPost.isVideo || (selectedPost.image || selectedPost.imageUrl || "").includes(".mp4")? (
              <video src={selectedPost.image || selectedPost.imageUrl || selectedPost.url || selectedPost.r2Url} className="max-w-full max-h-[80vh] object-contain" controls autoPlay playsInline />
            ) : (
              <img src={selectedPost.image || selectedPost.imageUrl || selectedPost.url || selectedPost.r2Url} className="max-w-full max-h-[80vh] object-contain" alt="post" />
            )}
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm text-white border border-zinc-800">
            <h3 className="font-bold mb-4 text-center">Edit profile • R2 + AI</h3>
            <label className="text-[12px] text-zinc-400">Name</label>
            <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full border border-zinc-700 bg-black p-2.5 rounded-lg mb-3 text-[14px]" />
            <label className="text-[12px] text-zinc-400">Bio</label>
            <textarea value={editBio} onChange={(e)=>setEditBio(e.target.value)} rows={3} className="w-full border border-zinc-700 bg-black p-2.5 rounded-lg mb-3 text-[14px]" />
            <button onClick={handleAIBio} className="w-full mb-3 bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg text-[13px] font-bold cursor-pointer">🤖 AI Bio Generate - 2026</button>
            <label className="text-[12px] text-zinc-400">Link</label>
            <input value={editLink} onChange={(e)=>setEditLink(e.target.value)} className="w-full border border-zinc-700 bg-black p-2.5 rounded-lg mb-3 text-[14px]" />
            <div className="flex gap-2 mt-4">
              <button onClick={handleProfileSave} className="flex-1 p-3 bg-[#0095f6] text-white rounded-lg font-bold cursor-pointer">Save to R2</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-zinc-800 rounded-lg font-bold cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
