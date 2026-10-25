// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import BottomNav from "../components/BottomNav"
import { supabase } from "../../lib/supabase"

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p:any){
  let url = p?.image_url || p?.url || p?.image || p?.r2Url || p?.publicUrl || p?.key || p?.imageUrl || ""
  if(!url) return ""
  if(typeof p === "string") url = p
  if(url.startsWith("http") && url.includes("r2.dev")) return url
  const file = url.split("/").pop() || ""
  if(url.includes("avatars/")) return `${R2_PUBLIC_URL.replace(/\/$/, '')}/avatars/${file}`
  if(url.includes("stories/") || url.includes("highlights/")) return `${R2_PUBLIC_URL.replace(/\/$/, '')}/stories/${file}`
  return `${R2_PUBLIC_URL.replace(/\/$/, '')}/posts/${file}`
}

const uploadToR2 = async (file: File, folder: string = "avatars") => {
  try {
    const presignRes = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: `${folder}/${Date.now()}_${file.name}`, contentType: file.type, fileSize: file.size }),
    })
    const { url, publicUrl, key } = await presignRes.json()
    if (!url) throw new Error("Presign failed")
    const uploadRes = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
    if (!uploadRes.ok) throw new Error("R2 PUT failed")
    return publicUrl || `${R2_PUBLIC_URL}/${key}`
  } catch (e) { return null }
}

// INLINE HIGHLIGHTS - NO IMPORT ERROR - R2 ONLY
function HighlightsInline({username, onSelect}:any){
  const [items,setItems] = useState([{id:"1", title:"New", cover:`https://i.pravatar.cc/100?u=${username}`, stories:[{image:`https://picsum.photos/400/700?random=1`, caption:"Welcome", price:350}]}])
  return (
    <div className="flex gap-4 px-4 mt-4 overflow-x-auto">
      <div className="flex flex-col items-center gap-1 min-w-[64px]"><div className="w-[64px] h-[64px] rounded-full bg-zinc-800 border flex items-center justify-center text-[24px]">+</div><span className="text-[11px]">New</span></div>
      {items.map((h:any)=><div key={h.id} onClick={()=>onSelect(h)} className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer"><div className="w-[64px] h-[64px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><div className="bg-black rounded-full p-[2px]"><img src={h.cover} className="w-[56px] h-[56px] rounded-full object-cover" alt=""/></div></div><span className="text-[11px]">{h.title}</span></div>)}
    </div>
  )
}

// INLINE STORY VIEWER - NO IMPORT ERROR
function StoryViewerInline({users, onClose}:any){
  const s = users?.[0]?.stories?.[0]; if(!s) return null
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-[470px] mx-auto">
      <div className="flex justify-between p-4 text-white"><span className="font-bold">{users[0]?.title||users[0]?.username}</span><button onClick={onClose}>✕</button></div>
      <div className="flex-1 flex items-center justify-center bg-zinc-950 relative"><img src={fixR2Url(s)} className="w-full h-full object-contain" alt=""/><div className="absolute bottom-20 left-4"><p className="text-white font-bold">{s.caption}</p><p className="text-white">₹{s.price||350}</p></div></div>
      <button onClick={onClose} className="m-4 bg-white text-black py-3 rounded-xl font-bold">Close R2</button>
    </div>
  )
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
  const [pinnedPosts, setPinnedPosts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hasStory, setHasStory] = useState(true)
  const [archivedPosts, setArchivedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null)

  useEffect(()=>{
    const fetchR2Data = async () => {
      setLoading(true)
      try{
        const { data: { user } } = await supabase.auth.getUser()
        if(!user) { setLoading(false); return }
        const myId = user.id
        let finalUsername = (usernameFromUrl as string) || user.email?.split('@')[0] || "knmahesh"
        const isOwnProfile = !usernameFromUrl
        if(isOwnProfile){
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', myId).single()
          if(profile){
            setUsername(profile.username)
            setEditName(profile.username)
            if(profile.bio){ setBio(profile.bio); setEditBio(profile.bio) }
            if(profile.avatar_url){ setPhoto(fixR2Url({url:profile.avatar_url})) }
            if(profile.link){ setLink(profile.link); setEditLink(profile.link) }
          }
          const { data: myPosts } = await supabase.from('posts').select('*').eq('user_id', myId).order('created_at', { ascending: false })
          if(myPosts){
            const mapped = myPosts.map((p:any)=>({
              image: fixR2Url(p), imageUrl: fixR2Url(p), r2Url: fixR2Url(p), url: fixR2Url(p),
              type: p.type || (p.image_url?.includes(".mp4")?"reels":"post"),
              username: profile?.username || finalUsername, id: p.id, created_at: p.created_at, caption: p.caption
            })).filter((p:any)=>p.image)
            setPosts(mapped)
          }
        }
      }catch(e){ console.error(e) }
      setLoading(false)
    }
    fetchR2Data()
  }, [usernameFromUrl])
    const handlePhotoChange = async (e: any) => {
    const f = e.target.files?.[0]; if(!f) return
    const localPreview = URL.createObjectURL(f)
    setPhoto(localPreview)
    setUploading(true)
    try {
      const url = await uploadToR2(f, "avatars")
      if(url){
        const fixed = fixR2Url({url})
        setPhoto(fixed)
        document.cookie = `avatar=${fixed}; path=/; max-age=2592000`
        window.dispatchEvent(new Event("avatarUpdated"))
        const { data: { user } } = await supabase.auth.getUser()
        if(user){ await supabase.from('profiles').update({ avatar_url: fixed }).eq('id', user.id) }
      }
    } catch{}
    setUploading(false)
  }

  const handleProfileSave = async () => {
    const newName = editName || username; const newBio = editBio || bio; const newLink = editLink || link
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if(user){ await supabase.from('profiles').update({ username: newName, bio: newBio, avatar_url: photo }).eq('id', user.id) }
      setUsername(newName); setBio(newBio); setLink(newLink)
      document.cookie = `username=${newName}; path=/; max-age=2592000`
      window.dispatchEvent(new Event("avatarUpdated"))
      alert("Profile R2 lo save ayindi! ✅")
    }catch{ alert("R2 save failed") }
    setUploading(false); setShowEdit(false)
  }

  const handleDelete = async (post:any)=>{
    if(!confirm("Delete this post?")) return
    try{ 
      const { data: { user } } = await supabase.auth.getUser()
      if(user) await supabase.from('posts').delete().eq('id', post.id).eq('user_id', user.id)
    }catch{}
    setPosts(posts.filter(p=> p.id!==post.id)); setSelectedPost(null)
  }

  const handleArchive = async (post:any)=>{
    try{
      setArchivedPosts([...archivedPosts, post])
      setPosts(posts.filter(p=> p.id!==post.id))
      setSelectedPost(null)
      alert("Archived to R2! ✅")
    }catch{}
  }

  const handlePinPost = async (post:any) => {
    const newPinned = pinnedPosts.includes(post.id)? pinnedPosts.filter(id=>id!==post.id) : [...pinnedPosts, post.id].slice(0,3)
    setPinnedPosts(newPinned)
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
            <button onClick={()=>router.push("/create")} className="cursor-pointer text-[22px]">+</button>
            <button onClick={()=>setShowMenu(true)} className="cursor-pointer text-[20px]">☰</button>
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
            <div><b className="block text-[18px]">{posts.filter(p=>!p.type?.includes("mp4") && p.type!=="reels").length}</b><span className="text-[14px] text-zinc-400">posts</span></div>
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

        <div className="mt-2 bg-black">
          <HighlightsInline username={username} onSelect={(h:any)=>{
            const storiesForViewer = (h.stories||[]).length>0 ? h.stories : [{image:h.cover, price:350, caption:h.title}]
            setSelectedHighlight({ username: username, avatar: photo, stories: storiesForViewer.map((s:any)=>({image:fixR2Url(s)||s.image, price:s.price||350, caption:s.caption||h.title, id:s.id||h.id})), title: h.title })
          }} />
        </div>

        <div className="flex border-t border-zinc-800 mt-1">
          <button onClick={()=>setActiveTab("POSTS")} className={`flex-1 py-3 text-[12px] tracking-widest ${activeTab==="POSTS"? "border-t border-white font-bold" : "text-zinc-500"}`}>⊞ POSTS R2</button>
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

      <BottomNav active="profile" avatar={photo} />

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

      {selectedHighlight && (
        <StoryViewerInline users={[selectedHighlight]} startIndex={0} onClose={()=>setSelectedHighlight(null)} />
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
              <label htmlFor="editPhotoInput2" className="mt-3 text-[#0095f6] font-bold text-[14px] cursor-pointer">{uploading ? "Uploading to R2..." : "Change Profile Photo"}</label>
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
            <button onClick={()=>{setShowArchive(true); setShowMenu(false)}} className="w-full text-left py-3 border-b border-zinc-800">📦 Archive R2</button>
            <button onClick={()=>{setShowQR(true); setShowMenu(false)}} className="w-full text-left py-3 border-b border-zinc-800">🔳 QR Code</button>
            <button onClick={()=>{setShowInsights(true); setShowMenu(false)}} className="w-full text-left py-3 border-b border-zinc-800">📊 Insights R2</button>
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 bg-zinc-800 py-2.5 rounded-lg font-bold">Close</button>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-6" onClick={()=>setShowQR(false)}>
          <div className="bg-white rounded-2xl p-6 text-center max-w-[320px] w-full text-black" onClick={e=>e.stopPropagation()}>
            <p className="font-bold text-[16px]">@{username} QR - R2</p>
            <div className="w-[200px] h-[200px] bg-zinc-100 mx-auto mt-4 flex items-center justify-center text-[10px]">QR: {`https://chitpix.com/${username}`}</div>
            <button onClick={()=>setShowQR(false)} className="w-full mt-4 bg-black text-white py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}

      {showFollowers && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end" onClick={()=>setShowFollowers(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white h-[60%] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-center mb-4">{followers} Followers - R2</h3>
            <button onClick={()=>setShowFollowers(false)} className="w-full mt-3 bg-zinc-800 py-2.5 rounded-lg">Close</button>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end" onClick={()=>setShowFollowing(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white h-[60%] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-center mb-4">{following} Following - R2</h3>
            <button onClick={()=>setShowFollowing(false)} className="w-full mt-3 bg-zinc-800 py-2.5 rounded-lg">Close</button>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end" onClick={()=>setShowArchive(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white h-[60%] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-center mb-4">Archive - {archivedPosts.length} R2</h3>
            <div className="grid grid-cols-3 gap-1">
              {archivedPosts.map((p,i)=><img key={i} src={p.url||p.image} className="aspect-square object-cover" alt=""/>)}
            </div>
            <button onClick={()=>setShowArchive(false)} className="w-full mt-3 bg-zinc-800 py-2.5 rounded-lg">Close</button>
          </div>
        </div>
      )}

      {showInsights && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end" onClick={()=>setShowInsights(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-center mb-4">Insights - R2 Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 p-3 rounded-xl"><p className="text-[20px] font-bold">{posts.length}</p><p className="text-[11px] text-zinc-400">R2 Posts</p></div>
              <div className="bg-zinc-800 p-3 rounded-xl"><p className="text-[20px] font-bold">{followers}</p><p className="text-[11px] text-zinc-400">Followers</p></div>
              <div className="bg-zinc-800 p-3 rounded-xl"><p className="text-[20px] font-bold">{archivedPosts.length}</p><p className="text-[11px] text-zinc-400">Archived</p></div>
              <div className="bg-zinc-800 p-3 rounded-xl"><p className="text-[20px] font-bold">R2</p><p className="text-[11px] text-zinc-400">Storage</p></div>
            </div>
            <button onClick={()=>setShowInsights(false)} className="w-full mt-4 bg-zinc-800 py-2.5 rounded-lg font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  )
          }
