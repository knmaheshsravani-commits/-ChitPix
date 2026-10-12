"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
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

  useEffect(()=>{
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
    const userStr = localStorage.getItem("user") || localStorage.getItem("firebase:user")
    if (userStr){ try { const u = JSON.parse(userStr); if (u.email) setCurrentUserEmail(u.email); if (u.displayName) setUsername(u.displayName); if (u.photoURL) setPhoto(u.photoURL) } catch {} }
    const adminEmails = ["knmaheshsravani@gmail.com", "sravani.mahesh@gmail.com"]
    const savedUser = localStorage.getItem("userEmail") || currentUserEmail
    if (adminEmails.includes(savedUser) || localStorage.getItem("isAdmin") === "true") { if (adminEmails.includes(savedUser)) setIsAdmin(true) }
    const savedPhoto = localStorage.getItem("chitpix_profile_photo"); if(savedPhoto) setPhoto(savedPhoto)
    const savedName = localStorage.getItem("chitpix_username"); if(savedName) setUsername(savedName)
    const savedBio = localStorage.getItem("chitpix_bio"); if(savedBio) setBio(savedBio)
    const savedLink = localStorage.getItem("chitpix_link"); if(savedLink) setLink(savedLink)
    const f = localStorage.getItem("followers"); if(f) setFollowers(parseInt(f) || 0)
    const fl = localStorage.getItem("following"); if(fl) setFollowing(parseInt(fl) || 0)
  },[])

  const savePosts = (newPosts:any[])=>{ setPosts(newPosts); localStorage.setItem("posts", JSON.stringify(newPosts)) }
  const handleDelete = async (index:number, postId?:string)=>{
    if(!confirm("Delete this post?")) return
    if(postId){ try{ await fetch(`/api/posts?id=${postId}`, {method:"DELETE"}) }catch{} }
    savePosts(posts.filter((_,i)=> i!== index)); setSelectedPost(null)
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
  const filteredPosts = posts.filter((p)=>{
    const url = p.image || p.imageUrl || p.url || p.r2Url || ""; const isVideo = p.type === "reels" || p.type === "video" || url.includes(".mp4")
    if (activeTab === "REELS") return isVideo; if (activeTab === "POSTS") return!isVideo; return false
  })

  return (
    <div className="h-[100dvh] overflow-y-auto bg-black pb-20 scrollbar-hide">
      <div className="max-w-[470px] mx-auto min-h-screen bg-black text-white">
        {/* HEADER - NEW ICONS */}
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-zinc-800">
          <h1 className="font-bold text-[20px] flex items-center gap-1">{username} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white"><path d="M6 9l6 6 6-6"/></svg></h1>
          <div className="flex gap-5 items-center">
            <button><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            <button onClick={()=>setShowMenu(true)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          </div>
        </div>

        <div className="flex p-4 gap-5 items-center">
          <div className="relative">
            <div className="w-[86px] h-[86px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="bg-black rounded-full p-[2.5px]">
                {photo? <img src={photo} className="w-[77px] h-[77px] rounded-full object-cover" alt="profile" /> : <div className="w-[77px] h-[77px] rounded-full bg-zinc-800 flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></svg></div>}
              </div>
            </div>
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-[#0095f6] text-white w-[22px] h-[22px] rounded-full flex items-center justify-center cursor-pointer border-2 border-black"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></label>
            <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div className="flex gap-6 text-center flex-1 justify-around">
            <div><b className="block text-[18px] font-bold">{posts.length}</b><span className="text-[14px] text-zinc-400">posts</span></div>
            <div><b className="block text-[18px] font-bold">{followers}</b><span className="text-[14px] text-zinc-400">followers</span></div>
            <div><b className="block text-[18px] font-bold">{following || 205}</b><span className="text-[14px] text-zinc-400">following</span></div>
          </div>
        </div>

        <div className="px-4">
          <p className="font-bold text-[14px] flex items-center gap-1">{username} {isAdmin && <svg width="14" height="14" viewBox="0 0 24 24" fill="#0095f6"><circle cx="12" cy="12" r="12"/><path d="M8 12l2.5 2.5 5-5" stroke="white" strokeWidth="1.8" fill="none"/></svg>}</p>
          <p className="text-[14px] mt-1 whitespace-pre-line leading-[18px] text-zinc-200">{bio}</p>
          <p className="text-[14px] text-[#4da5ff] font-semibold mt-1 flex gap-1 items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4da5ff" strokeWidth="2"><path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"/><path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"/></svg> {link}</p>
        </div>

        <div className="flex gap-2 mt-4 px-4">
          <button onClick={()=>{setEditName(username); setEditBio(bio); setEditLink(link); setShowEdit(true)}} className="flex-1 py-[6px] rounded-lg bg-zinc-800 font-semibold text-[14px]">Edit profile</button>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert("Link Copied!")}} className="flex-1 py-[6px] rounded-lg bg-zinc-800 font-semibold text-[14px]">Share profile</button>
        </div>

        <div className="flex gap-4 mt-5 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {[
            {name:'ChitPix'}, {name:'My Work'}, {name:'Travel'}, {name:'Friends'}, {name:'New'}
          ].map((h)=>(
            <div key={h.name} className="text-center min-w-[64px] cursor-pointer">
              <div className="w-[62px] h-[62px] rounded-full border border-zinc-700 p-[3px] mx-auto">
                <div className="bg-zinc-800 rounded-full w-full h-full flex items-center justify-center">
                  {h.name==='New'? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></svg>}
                </div>
              </div>
              <p className="text-[12px] mt-1.5 truncate">{h.name}</p>
            </div>
          ))}
        </div>

        {/* TABS - NEW ICONS */}
        <div className="flex border-t border-zinc-800 mt-3">
          <button onClick={()=>setActiveTab("POSTS")} className={`flex-1 py-3 text-[12px] tracking-widest flex justify-center items-center gap-1 ${activeTab==="POSTS"? "border-t border-white font-bold text-white" : "text-zinc-500"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={activeTab==="POSTS"? "white":"none"} stroke={activeTab==="POSTS"? "white":"#71717a"} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> POSTS
          </button>
          <button onClick={()=>setActiveTab("REELS")} className={`flex-1 py-3 text-[12px] tracking-widest flex justify-center items-center gap-1 ${activeTab==="REELS"? "border-t border-white font-bold text-white" : "text-zinc-500"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={activeTab==="POSTS"?"#71717a":"white"} strokeWidth="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg> REELS
          </button>
          <button onClick={()=>setActiveTab("TAGGED")} className={`flex-1 py-3 text-[12px] tracking-widest flex justify-center items-center gap-1 ${activeTab==="TAGGED"? "border-t border-white font-bold text-white" : "text-zinc-500"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={activeTab==="TAGGED"? "white":"#71717a"} strokeWidth="1.8"><path d="M20 21l-4.5-4.5"/><circle cx="10" cy="10" r="6"/></svg> TAGGED
          </button>
        </div>

        <div className="grid grid-cols-3 gap-[2px] pb-10">
          {filteredPosts.length>0? filteredPosts.map((p,i)=>{
            const url = p.image || p.imageUrl || p.url || p.r2Url || ""
            const isVideo = p.type === "reels" || url.includes(".mp4")
            return (
              <div key={i} onClick={()=>setSelectedPost({...p, realIndex: i, isVideo})} className="aspect-square bg-zinc-900 cursor-pointer relative overflow-hidden">
                {isVideo? (
                  <>
                    <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <div className="absolute top-1 right-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                  </>
                ) : (
                  <img src={url} alt="post" className="w-full h-full object-cover" loading="lazy" onError={(e:any)=>{ e.target.src='https://via.placeholder.com/300/111/fff?text=ChitPix' }} />
                )}
              </div>
            )
          }) : (
            <div className="col-span-3 py-20 text-center">
              <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mx-auto"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1"/></svg></div>
              <p className="font-bold mt-4 text-xl">{activeTab==="REELS"? "No Reels yet" : "Share a photo"}</p>
              <p className="text-sm text-zinc-500 mt-1 px-10">{activeTab==="REELS"? "When you share reels, they'll appear here." : "When you share photos, they'll appear on your profile."}</p>
              <Link href={activeTab==="REELS"? "/reels" : "/"} className="text-[#0095f6] text-sm font-semibold mt-3 inline-block">{activeTab==="REELS"? "Share your first reel" : "Share your first photo"}</Link>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={()=>setShowMenu(false)}>
          <div className="bg-zinc-900 w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto text-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-3">Settings</h3>
            <button className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px] flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0.33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 15a1.65 1.65 0 0 0-1-1.51V13a2 2 0 0 1 0-4v-.49c.3-.25.64-.46 1-1.51a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 13 3.67a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 9a1.65 1.65 0 0 0 1 1.51V11a2 2 0 0 1 0 4v.49c-.3.25-.64.46-1 1.51z"/></svg> Settings and privacy</button>
            <button className="w-full text-left p-3.5 hover:bg-zinc-800 rounded-xl text-[15px]">Log out</button>
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 p-3.5 bg-zinc-800 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between p-4 text-white items-center border-b border-zinc-800">
            <button onClick={()=>setSelectedPost(null)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            <span className="font-bold text-sm">{selectedPost.isVideo? "REEL" : "POST"}</span>
            <button onClick={()=>handleDelete(selectedPost.realIndex, selectedPost.id)} className="bg-white text-black px-3 py-1 rounded-full text-[12px] font-bold">Delete</button>
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
            <h3 className="font-bold mb-4 text-center">Edit profile</h3>
            <label className="text-[12px] text-zinc-400">Name</label>
            <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full border border-zinc-700 bg-black p-2.5 rounded-lg mb-3 text-[14px]" />
            <label className="text-[12px] text-zinc-400">Bio</label>
            <textarea value={editBio} onChange={(e)=>setEditBio(e.target.value)} rows={3} className="w-full border border-zinc-700 bg-black p-2.5 rounded-lg mb-3 text-[14px]" />
            <label className="text-[12px] text-zinc-400">Link</label>
            <input value={editLink} onChange={(e)=>setEditLink(e.target.value)} className="w-full border border-zinc-700 bg-black p-2.5 rounded-lg mb-3 text-[14px]" />
            <div className="flex gap-2 mt-4">
              <button onClick={handleProfileSave} className="flex-1 p-3 bg-[#0095f6] text-white rounded-lg font-bold">Save</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-zinc-800 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
      }
