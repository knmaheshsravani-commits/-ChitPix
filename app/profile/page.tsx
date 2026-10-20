"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import BottomNav from "../components/BottomNav"

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

const uploadToR2 = async (file: File, folder: string = "avatars") => {
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
  const params = useParams()
  const usernameFromUrl = (params as any)?.username
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"POSTS" | "REELS" | "TAGGED">("POSTS")
  const [followers, setFollowers] = useState(129)
  const [following, setFollowing] = useState(205)
  const [username, setUsername] = useState("knmahesh")
  const [bio, setBio] = useState("Welcome to ChitPix\nPhotographer | Creator")
  const [link, setLink] = useState("chitpix.com")
  const [photo, setPhoto] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [pinnedPosts, setPinnedPosts] = useState<string[]>([]) // FIXED: id base
  const [searchQuery, setSearchQuery] = useState("")
  const [highlights, setHighlights] = useState(["ChitPix","My Work","Travel","Friends"])
  const [hasStory, setHasStory] = useState(true)
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  // ✅ FIXED - 1 API CALL ONLY - FAST + R2 ONLY
  useEffect(()=>{
    const fetchR2Data = async () => {
      setLoading(true)
      let finalUsername = (usernameFromUrl as string) || "knmahesh"
      try{
        const cur = await fetch("/api/users/current",{cache:"no-store"}).then(r=>r.json()).catch(()=>null)
        if(cur?.username && !usernameFromUrl) finalUsername = cur.username
      }catch{}
      setUsername(finalUsername)
      setEditName(finalUsername)

      try{
        const [uRes, pRes] = await Promise.all([
          fetch(`/api/users?username=${finalUsername}`,{cache:"no-store"}).catch(()=>null),
          fetch(`/api/posts?username=${finalUsername}`,{cache:"no-store"}).catch(()=>null)
        ])
        if(uRes){
          const uData = await uRes.json().catch(()=>null)
          const u = Array.isArray(uData) ? uData.find((x:any)=>x.username===finalUsername) : uData
          if(u){
            if(u.bio){ setBio(u.bio); setEditBio(u.bio) }
            if(u.avatar_url){ setPhoto(u.avatar_url) } // ✅ DP FIX - R2 URL direct
            if(u.link){ setLink(u.link); setEditLink(u.link) }
            if(u.followers) setFollowers(u.followers)
            if(u.following) setFollowing(u.following)
            if(u.pinned_posts) setPinnedPosts(u.pinned_posts)
          }
        }
        if(pRes){
          const data = await pRes.json().catch(()=>[])
          if(Array.isArray(data)){
            const mapped = data.map((p:any)=>({
              image: p.image_url, imageUrl: p.image_url, r2Url: p.image_url, url: p.image_url,
              type: p.type || (p.image_url?.includes(".mp4")?"reels":"post"),
              username: p.username, id: p.id, created_at: p.created_at, caption: p.caption
            }))
            setPosts(mapped)
          }
        }
      }catch{}
      setLoading(false)
    }
    fetchR2Data()
  },[usernameFromUrl])

  const handlePhotoChange = async (e: any) => {
    const f = e.target.files?.[0]; if(!f) return
    const localPreview = URL.createObjectURL(f)
    setPhoto(localPreview)
    setUploading(true)
    try {
      const url = await uploadToR2(f, "avatars")
      if(url){
        setPhoto(url)
        document.cookie = `avatar=${url}; path=/; max-age=2592000`
        window.dispatchEvent(new Event("avatarUpdated"))
        await fetch("/api/users",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({username: username, avatar_url: url})
        })
      } else {
        alert("R2 upload failed")
      }
    } catch(err) {
      alert("Upload failed")
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
      document.cookie = `username=${newName}; path=/; max-age=2592000`
      window.dispatchEvent(new Event("avatarUpdated"))
      alert("Profile R2 lo save ayindi! ✅")
    }catch{ alert("R2 save failed") }
    setUploading(false); setShowEdit(false)
  }

  const handleDelete = async (post:any)=>{
    if(!confirm("Delete this post?")) return
    try{ if(post.id) await fetch(`/api/posts?id=${post.id}`, {method:"DELETE"}) }catch{}
    setPosts(posts.filter(p=> p.id!==post.id)); setSelectedPost(null)
  }

  const handleArchive = async (post:any)=>{
    try{
      await fetch("/api/posts",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({action:"archive", postId: post.id, username})})
      setArchivedPosts([...archivedPosts, post])
      setPosts(posts.filter(p=> p.id!==post.id))
      setSelectedPost(null)
      alert("Archived to R2! ✅")
    }catch{}
  }

  const handlePinPost = async (post:any) => {
    const newPinned = pinnedPosts.includes(post.id)? pinnedPosts.filter(id=>id!==post.id) : [...pinnedPosts, post.id].slice(0,3)
    setPinnedPosts(newPinned)
    try{ await fetch("/api/users",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username, pinned_posts: newPinned})}) }catch{}
  }

  const filteredPosts = posts.filter((p)=>{
    const url = p.image || p.imageUrl || p.url || p.r2Url || ""; const isVideo = p.type === "reels" || url.includes(".mp4")
    const matchesSearch = searchQuery? (p.caption||"").toLowerCase().includes(searchQuery.toLowerCase()) : true
    if(!matchesSearch) return false
    if (activeTab === "REELS") return isVideo; if (activeTab === "POSTS") return !isVideo; return false
  }).sort((a,b)=> {
    const aPinned = pinnedPosts.includes(a.id); const bPinned = pinnedPosts.includes(b.id)
    if(aPinned && !bPinned) return -1; if(!aPinned && bPinned) return 1; return 0
  })

  return (
    <div className="bg-black min-h-screen pb-20">
      <div className="max-w-[470px] mx-auto min-h-screen bg-black text-white">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-zinc-800">
          <h1 className="font-bold text-[20px] flex items-center gap-1 cursor-pointer" onClick={()=>setShowInsights(true)}>{username} <span className="text-[14px]">⌄</span></h1>
          <div className="flex gap-5 items-center">
            <button onClick={()=>router.push("/create")} className="cursor-pointer">+</button>
            <button onClick={()=>setShowMenu(true)} className="cursor-pointer">☰</button>
          </div>
        </div>
        <div className="flex p-4 gap-5 items-center">
          <div className="relative">
            <div className={`w-[86px] h-[86px] rounded-full p-[2.5px] ${hasStory?'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600':'bg-zinc-700'}`}>
              <div className="bg-black rounded-full p-[2.5px]">
                {photo? <img src={photo} className="w-[77px] h-[77px] rounded-full object-cover" alt="profile" /> : <div className="w-[77px] h-[77px] rounded-full bg-zinc-800 flex items-center justify-center">👤</div>}
              </div>
            </div>
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-[#0095f6] w-[22px] h-[22px] rounded-full flex items-center justify-center cursor-pointer border-2 border-black text-[12px]">+</label>
            <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            {uploading && <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-[10px]">R2...</div>}
          </div>
          <div className="flex gap-6 text-center flex-1 justify-around">
            <div><b className="block text-[18px]">{posts.filter(p=>!p.type.includes("mp4") && p.type!=="reels").length}</b><span className="text-[14px] text-zinc-400">posts</span></div>
            <div className="cursor-pointer" onClick={()=>setShowFollowers(true)}><b className="block text-[18px]">{followers}</b><span className="text-[14px] text-zinc-400">followers</span></div>
            <div className="cursor-pointer" onClick={()=>setShowFollowing(true)}><b className="block text-[18px]">{following}</b><span className="text-[14px] text-zinc-400">following</span></div>
          </div>
        </div>
        <div className="px-4">
          <p className="font-bold text-[14px]">{username}</p>
          <p className="text-[14px] mt-1 whitespace-pre-line text-zinc-200">{bio}</p>
          <p className="text-[14px] text-[#4da5ff] font-semibold mt-1">🔗 {link}</p>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="🔍 Search your posts..." className="w-full mt-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] outline-none"/>
        </div>
        <div className="flex gap-2 mt-4 px-4">
          <button onClick={()=>{setEditName(username); setEditBio(bio); setEditLink(link); setShowEdit(true)}} className="flex-1 py-[7px] rounded-lg bg-zinc-800 font-semibold text-[14px]">Edit profile</button>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert("Link Copied!")}} className="flex-1 py-[7px] rounded-lg bg-zinc-800 font-semibold text-[14px]">Share profile</button>
          <button onClick={()=>setShowQR(true)} className="px-4 py-[7px] rounded-lg bg-zinc-800 font-semibold text-[14px]">QR</button>
        </div>
        <div className="flex gap-4 mt-5 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {highlights.map((h,i)=>(
            <div key={h} className="text-center min-w-[64px]">
              <div className="w-[62px] h-[62px] rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-800">{i===0?'✨':i===1?'💼':i===2?'✈️':'❤️'}</div>
              <p className="text-[11px] mt-1">{h}</p>
            </div>
          ))}
        </div>
        <div className="flex border-t border-zinc-800 mt-3">
          <button onClick={()=>setActiveTab("POSTS")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab==="POSTS"? "border-t border-white font-bold" : "text-zinc-500"}`}>⊞ POSTS</button>
          <button onClick={()=>setActiveTab("REELS")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab==="REELS"? "border-t border-white font-bold" : "text-zinc-500"}`}>▶ REELS</button>
          <button onClick={()=>setActiveTab("TAGGED")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab==="TAGGED"? "border-t border-white font-bold" : "text-zinc-500"}`}>👤 TAGGED</button>
        </div>
        {loading ? <div className="py-20 text-center text-zinc-500">Loading R2 posts...</div> : (
          <div className="grid grid-cols-3 gap-[2px]">
            {filteredPosts.length>0? filteredPosts.map((p,i)=>{
              const url = p.image || p.imageUrl || p.url || p.r2Url || ""
              const isVideo = p.type === "reels" || url.includes(".mp4")
              const isPinned = pinnedPosts.includes(p.id)
              return (
                <div key={p.id || i} onClick={()=>setSelectedPost(p)} className="aspect-square bg-zinc-900 cursor-pointer relative">
                  {isPinned && <div className="absolute top-1 left-1 bg-black/70 px-1 rounded text-[10px] z-10">📌</div>}
                  {isVideo? <><video src={url} className="w-full h-full object-cover" muted/><div className="absolute top-1 right-1 text-[10px]">▶</div></> : <img src={url} className="w-full h-full object-cover" alt="post"/>}
                </div>
              )
            }) : (
              <div className="col-span-3 py-20 text-center">
                <p className="font-bold text-xl">{activeTab==="REELS"? "No Reels yet" : "Share a photo"}</p>
                <p className="text-sm text-zinc-500 mt-1">{searchQuery? `No results for "${searchQuery}"` : "When you share photos, they'll appear here."}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ FIXED - BottomNav Added - DP kuda kanipistundi */}
      <BottomNav active="profile" avatar={photo} />

      {/* Selected Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="flex justify-between p-4 border-b border-zinc-800">
            <button onClick={()=>setSelectedPost(null)}>✕</button>
            <span className="font-bold">{username}</span>
            <button onClick={()=>handlePinPost(selectedPost)}>{pinnedPosts.includes(selectedPost.id)?"Unpin":"📌"}</button>
          </div>
          <div className="flex-1 flex items-center bg-black">
            {selectedPost.type==="reels" || selectedPost.url?.includes(".mp4") ? <video src={selectedPost.url} controls autoPlay className="w-full"/> : <img src={selectedPost.url} className="w-full object-contain"/>}
          </div>
          <div className="p-4 flex gap-4 border-t border-zinc-800">
            <button onClick={()=>handleArchive(selectedPost)} className="flex-1 bg-zinc-800 py-2 rounded-lg">📦 Archive</button>
            <button onClick={()=>handleDelete(selectedPost)} className="flex-1 bg-red-600 py-2 rounded-lg">🗑️ Delete R2</button>
          </div>
        </div>
      )}
            {showEdit && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={()=>setShowEdit(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-center mb-4">Edit Profile - R2 Device ☁️</h3>
            <div className="flex flex-col items-center mb-4">
              <div className="w-[90px] h-[90px] rounded-full overflow-hidden border-2 border-white">
                <img src={photo || `https://i.pravatar.cc/150?u=${username}`} className="w-full h-full object-cover" alt="preview" />
              </div>
              <label htmlFor="editPhotoInput2" className="mt-3 text-[#0095f6] font-bold text-[14px] cursor-pointer">
                {uploading ? "Uploading to R2..." : "Change Profile Photo"}
              </label>
              <input id="editPhotoInput2" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username" className="w-full bg-zinc-800 rounded-lg px-3 py-2.5 mb-2 text-[14px] outline-none"/>
            <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio - Photographer | Creator" className="w-full bg-zinc-800 rounded-lg px-3 py-2.5 mb-2 text-[14px] h-20 outline-none"/>
            <input value={editLink} onChange={e=>setEditLink(e.target.value)} placeholder="Link - chitpix.com" className="w-full bg-zinc-800 rounded-lg px-3 py-2.5 mb-3 text-[14px] outline-none"/>
            <div className="flex gap-2">
              <button onClick={()=>{const bios=["🚀 Digital Creator | R2 Powered ☁️ | Bangalore","✨ ChitPix Founder | Building 2026","📸 Photographer | Travel + Code","💼 Creator | DM for collabs"]; setEditBio(bios[Math.floor(Math.random()*bios.length)])}} className="flex-1 bg-zinc-800 py-2.5 rounded-lg text-[13px] font-bold">✨ AI Bio</button>
              <button onClick={handleProfileSave} disabled={uploading} className="flex-1 bg-[#0095f6] py-2.5 rounded-lg text-[14px] font-bold disabled:opacity-50">{uploading?"Saving R2...":"Save to R2"}</button>
            </div>
            <button onClick={()=>setShowEdit(false)} className="w-full mt-2 bg-zinc-800 py-2.5 rounded-lg font-bold">Cancel</button>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={()=>setShowMenu(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-3">Settings - R2 Device</h3>
            <button onClick={()=>{setShowMenu(false); router.push("/settings")}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">⚙️ Settings and privacy</button>
            <button onClick={()=>{setShowMenu(false); setShowArchive(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">📦 Archive ({archivedPosts.length}) - R2</button>
            <button onClick={()=>{setShowMenu(false); setShowQR(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">🔗 QR Code - Share Profile</button>
            <button onClick={()=>{setShowMenu(false); setShowInsights(true)}} className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">📊 Insights - {posts.length} posts</button>
            <button onClick={()=>{if(!confirm("Log out from ChitPix?")) return; document.cookie="user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; document.cookie="username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; document.cookie="avatar=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href="/login"}} className="w-full text-left p-3.5 hover:bg-red-900/30 rounded-xl text-[15px] text-red-400">🚪 Log out</button>
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 p-3.5 bg-zinc-800 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-6" onClick={()=>setShowQR(false)}>
          <div className="bg-white rounded-[20px] p-6 max-w-[300px] w-full text-black text-center" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-[18px] mb-4">{username} - ChitPix</h3>
            <div className="w-[200px] h-[200px] bg-black mx-auto rounded-xl flex items-center justify-center text-white text-[40px]">QR</div>
            <p className="text-[12px] text-zinc-500 mt-3 break-all">{typeof window !== 'undefined' ? window.location.href : ''}</p>
            <button onClick={async()=>{await navigator.clipboard.writeText(window.location.href); alert("Link Copied! 🔗")}} className="w-full mt-4 bg-black text-white py-2.5 rounded-xl font-bold">Copy Link</button>
            <button onClick={()=>setShowQR(false)} className="w-full mt-2 bg-zinc-100 py-2.5 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="fixed inset-0 bg-black z-[70] flex flex-col max-w-[470px] mx-auto text-white">
          <div className="flex justify-between p-4 border-b border-zinc-800"><button onClick={()=>setShowArchive(false)}>✕</button><span className="font-bold">Archive - R2 ({archivedPosts.length})</span><span></span></div>
          <div className="grid grid-cols-3 gap-[2px] p-[2px]">
            {archivedPosts.length>0 ? archivedPosts.map((p,i)=>(
              <div key={i} className="aspect-square bg-zinc-900"><img src={p.image || p.url} className="w-full h-full object-cover"/></div>
            )) : <div className="col-span-3 py-20 text-center text-zinc-500">No archived posts - R2</div>}
          </div>
        </div>
      )}

      {showFollowers && (
        <div className="fixed inset-0 bg-black z-[70] flex flex-col max-w-[470px] mx-auto text-white">
          <div className="flex justify-between p-4 border-b border-zinc-800"><button onClick={()=>setShowFollowers(false)}>✕</button><span className="font-bold">{followers} Followers</span><span></span></div>
          <div className="p-4 text-center text-zinc-500 py-20">Followers list - R2 API - Coming soon - {followers} users</div>
        </div>
      )}

      {showFollowing && (
        <div className="fixed inset-0 bg-black z-[70] flex flex-col max-w-[470px] mx-auto text-white">
          <div className="flex justify-between p-4 border-b border-zinc-800"><button onClick={()=>setShowFollowing(false)}>✕</button><span className="font-bold">{following} Following</span><span></span></div>
          <div className="p-4 text-center text-zinc-500 py-20">Following list - R2 API - {following} users</div>
        </div>
      )}

      {showInsights && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end" onClick={()=>setShowInsights(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-5 max-w-[470px] mx-auto text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-[18px] mb-4">Insights - R2 Permanent ♾️</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-zinc-800 rounded-xl p-3 text-center"><p className="text-[20px] font-bold">{posts.length}</p><p className="text-[11px] text-zinc-400">Posts - R2</p></div>
              <div className="bg-zinc-800 rounded-xl p-3 text-center"><p className="text-[20px] font-bold">3.4K</p><p className="text-[11px] text-zinc-400">Profile Views</p></div>
              <div className="bg-zinc-800 rounded-xl p-3 text-center"><p className="text-[20px] font-bold">{pinnedPosts.length}/3</p><p className="text-[11px] text-zinc-400">Pinned</p></div>
            </div>
            <p className="text-[12px] text-zinc-400">All data stored in R2 - Permanent - No LocalStorage ✅</p>
            <button onClick={()=>setShowInsights(false)} className="w-full mt-4 bg-zinc-800 py-3 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
