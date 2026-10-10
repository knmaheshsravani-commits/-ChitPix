"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import BottomNav from "../components/BottomNav"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// ================= R2 CONFIG - Ikkada ne keys pettu bro =================
const R2_ACCOUNT_ID = "YOUR_ACCOUNT_ID" // Cloudflare Dashboard -> R2 -> Account ID
const R2_ACCESS_KEY = "YOUR_R2_ACCESS_KEY_ID"
const R2_SECRET_KEY = "YOUR_R2_SECRET_ACCESS_KEY"
const R2_BUCKET = "chitpix"
const R2_PUBLIC_URL = "https://pub-YOUR-ID.r2.dev" // R2 bucket public URL

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
})

const uploadToR2 = async (file: File | string, fileName: string) => {
  try {
    let body: any
    let contentType = "image/jpeg"
    if (typeof file === "string") {
      const res = await fetch(file)
      const blob = await res.blob()
      body = await blob.arrayBuffer()
      contentType = blob.type || "image/jpeg"
    } else {
      body = await file.arrayBuffer()
      contentType = file.type
    }
    const cmd = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      Body: new Uint8Array(body),
      ContentType: contentType,
    })
    await s3Client.send(cmd)
    return `${R2_PUBLIC_URL}/${fileName}`
  } catch (e) {
    console.error("R2 Upload Error:", e)
    alert("R2 Upload failed - keys check chey bro")
    return null
  }
}
// =========================================================================

export default function ProfilePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [username, setUsername] = useState("ChitPix User")
  const [bio, setBio] = useState("Welcome to ChitPix ✨\nPhotographer | Creator")
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
    if(saved) {
      try { setPosts(JSON.parse(saved)) } catch {}
    }
    const userStr = localStorage.getItem("user") || localStorage.getItem("firebase:user")
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        if (u.email) setCurrentUserEmail(u.email)
        if (u.displayName) setUsername(u.displayName)
        if (u.photoURL) setPhoto(u.photoURL)
      } catch {}
    }
    const adminEmails = ["knmaheshsravani@gmail.com", "sravani.mahesh@gmail.com"]
    const savedUser = localStorage.getItem("userEmail") || currentUserEmail
    if (adminEmails.includes(savedUser) || localStorage.getItem("isAdmin") === "true") {
      if (adminEmails.includes(savedUser)) setIsAdmin(true)
    }
    const savedPhoto = localStorage.getItem("chitpix_profile_photo")
    if(savedPhoto) setPhoto(savedPhoto)
    const savedName = localStorage.getItem("chitpix_username")
    if(savedName) setUsername(savedName)
    const savedBio = localStorage.getItem("chitpix_bio")
    if(savedBio) setBio(savedBio)
    const savedLink = localStorage.getItem("chitpix_link")
    if(savedLink) setLink(savedLink)
    const f = localStorage.getItem("followers")
    if(f) setFollowers(parseInt(f) || 0)
    const fl = localStorage.getItem("following")
    if(fl) setFollowing(parseInt(fl) || 0)
  },[])

  const savePosts = (newPosts:any[])=>{
    setPosts(newPosts)
    localStorage.setItem("posts", JSON.stringify(newPosts))
  }

  const handleDelete = (index:number)=>{
    if(confirm("Ee post delete cheyala?")){
      const newPosts = posts.filter((_,i)=> i!== index)
      savePosts(newPosts)
      setSelectedPost(null)
    }
  }

  const handlePhotoChange = async (e: any) => {
    const f = e.target.files?.[0]
    if(!f) return
    setUploading(true)
    const fileName = `profile/${Date.now()}_${f.name}`
    const url = await uploadToR2(f, fileName)
    if(url){
      setPhoto(url)
      localStorage.setItem("chitpix_profile_photo", url)
    } else {
      // Fallback base64 if R2 fail
      const r = new FileReader()
      r.onload = () => {
        const result = r.result as string
        setPhoto(result)
        localStorage.setItem("chitpix_profile_photo", result)
      }
      r.readAsDataURL(f)
    }
    setUploading(false)
  }

  const handleProfileSave = () => {
    const newName = editName || username
    const newBio = editBio || bio
    const newLink = editLink || link
    setUsername(newName)
    setBio(newBio)
    setLink(newLink)
    localStorage.setItem("chitpix_username", newName)
    localStorage.setItem("chitpix_bio", newBio)
    localStorage.setItem("chitpix_link", newLink)
    setShowEdit(false)
  }

  return (
    <div className="h-[100dvh] overflow-y-auto bg-white pb-20 scrollbar-hide">
      <div className="max-w-[470px] mx-auto min-h-screen bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sticky top-0 bg-white z-10 border-b">
          <h1 className="font-bold text-[20px] flex items-center gap-1">{username} <span className="text-[12px]">⌄</span></h1>
          <div className="flex gap-4 items-center">
            <button className="text-xl">⊕</button>
            <button onClick={()=>setShowMenu(true)} className="text-[22px]">☰</button>
          </div>
        </div>

        {/* Profile Info - SAME AS YOUR CODE */}
        <div className="flex p-4 gap-5 items-center">
          <div className="relative">
            <div className="w-[86px] h-[86px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="bg-white rounded-full p-[2.5px]">
                {photo? <img src={photo} className="w-[77px] h-[77px] rounded-full object-cover" alt="profile" /> : <div className="w-[77px] h-[77px] rounded-full bg-gray-100 flex items-center justify-center text-3xl">👤</div>}
              </div>
            </div>
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-blue-500 text-white w-[22px] h-[22px] rounded-full flex items-center justify-center text-[14px] cursor-pointer border-2 border-white">{uploading? "..." : "+"}</label>
            <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div className="flex gap-6 text-center flex-1 justify-around">
            <div><b className="block text-[18px] font-bold">{posts.length}</b><span className="text-[14px]">posts</span></div>
            <div><b className="block text-[18px] font-bold">{followers}</b><span className="text-[14px]">followers</span></div>
            <div><b className="block text-[18px] font-bold">{following || 205}</b><span className="text-[14px]">following</span></div>
          </div>
        </div>

        {/* Bio - SAME */}
        <div className="px-4">
          <p className="font-bold text-[14px] flex items-center gap-1">{username} {isAdmin && <span className="text-blue-500 text-[14px]">✓</span>}</p>
          <p className="text-[14px] mt-1 whitespace-pre-line leading-[18px]">{bio}</p>
          <p className="text-[14px] text-[#00376b] font-semibold mt-1 flex gap-1">🔗 {link}</p>
        </div>

        <div className="flex gap-2 mt-4 px-4">
          <button onClick={()=>{setEditName(username); setEditBio(bio); setEditLink(link); setShowEdit(true)}} className="flex-1 py-[6px] rounded-lg bg-[#efefef] font-semibold text-[14px]">Edit profile</button>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert("Link Copied!")}} className="flex-1 py-[6px] rounded-lg bg-[#efefef] font-semibold text-[14px]">Share profile</button>
        </div>

        <div className="flex gap-4 mt-5 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {[
            {name:'ChitPix', icon:'📸'},
            {name:'My Work', icon:'💼'},
            {name:'Travel', icon:'✈️'},
            {name:'Friends', icon:'❤️'},
            {name:'New', icon:'+'}
          ].map((h)=>(
            <div key={h.name} className="text-center min-w-[64px] cursor-pointer">
              <div className="w-[62px] h-[62px] rounded-full border border-gray-200 p-[3px] mx-auto">
                <div className="bg-[#efefef] rounded-full w-full h-full flex items-center justify-center text-[22px]">{h.icon}</div>
              </div>
              <p className="text-[12px] mt-1.5 truncate">{h.name}</p>
            </div>
          ))}
        </div>

        <div className="flex border-t mt-3">
          <button className="flex-1 py-3 text-[12px] border-t border-black font-bold tracking-widest flex justify-center">⊞ POSTS</button>
          <button className="flex-1 py-3 text-[12px] text-gray-400 tracking-widest flex justify-center">🎬 REELS</button>
          <button className="flex-1 py-3 text-[12px] text-gray-400 tracking-widest flex justify-center">🔖 TAGGED</button>
        </div>

        {/* Posts Grid - FIXED with R2 + Scroll */}
        <div className="grid grid-cols-3 gap-[2px] pb-10">
          {posts.length>0? posts.map((p,i)=>(
            <div key={i} onClick={()=>setSelectedPost({...p, realIndex: i})} className="aspect-square bg-gray-100 cursor-pointer relative group overflow-hidden">
              <img
                src={p.image || p.imageUrl || p.url || p.r2Url}
                alt="post"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e:any)=>{ e.target.src='https://via.placeholder.com/300?text=ChitPix' }}
              />
            </div>
          )) : (
            <div className="col-span-3 py-20 text-center">
              <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto text-3xl">📷</div>
              <p className="font-bold mt-4 text-xl">Share a photo</p>
              <p className="text-sm text-gray-500 mt-1 px-10">When you share photos, they'll appear on your profile.</p>
              <Link href="/" className="text-blue-500 text-sm font-semibold mt-3 inline-block">Share your first photo</Link>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={()=>setShowMenu(false)}>
          <div className="bg-white w-full rounded-t-[20px] p-4 max-w-[470px] mx-auto" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-3">Settings</h3>
            {isAdmin && (
              <>
                <button onClick={()=>{ if(confirm("Anni posts delete cheyala?")){ savePosts([]); setShowMenu(false); }}} className="w-full text-left p-3.5 hover:bg-gray-100 rounded-xl text-[15px]">🗑️ Clear All Posts</button>
                <button onClick={()=>{ localStorage.clear(); alert("All Data Cleared!"); setShowMenu(false); location.reload(); }} className="w-full text-left p-3.5 hover:bg-gray-100 rounded-xl text-red-600 text-[15px]">⚠️ Reset Everything</button>
              </>
            )}
            <button className="w-full text-left p-3.5 hover:bg-gray-100 rounded-xl text-[15px]">⚙️ Settings and privacy</button>
            <button className="w-full text-left p-3.5 hover:bg-gray-100 rounded-xl text-[15px]">🔒 Log out</button>
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 p-3.5 bg-gray-100 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between p-4 text-white items-center">
            <button onClick={()=>setSelectedPost(null)} className="text-xl">✕</button>
            <span className="font-bold text-sm">POST</span>
            {isAdmin && <button onClick={()=>handleDelete(selectedPost.realIndex)} className="bg-white text-black px-3 py-1 rounded-full text-[12px] font-bold">Delete</button>}
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <img src={selectedPost.image || selectedPost.imageUrl || selectedPost.url || selectedPost.r2Url} className="max-w-full max-h-[80vh] object-contain" alt="post" />
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold mb-4 text-center">Edit profile</h3>
            <label className="text-[12px] text-gray-500">Name</label>
            <input value={editName} onChange={(e)=>setEditName(e.target.value)} placeholder="Name" className="w-full border border-gray-300 p-2.5 rounded-lg mb-3 text-[14px]" />
            <label className="text-[12px] text-gray-500">Bio</label>
            <textarea value={editBio} onChange={(e)=>setEditBio(e.target.value)} rows={3} placeholder="Bio" className="w-full border border-gray-300 p-2.5 rounded-lg mb-3 text-[14px]" />
            <label className="text-[12px] text-gray-500">Link</label>
            <input value={editLink} onChange={(e)=>setEditLink(e.target.value)} placeholder="Link" className="w-full border border-gray-300 p-2.5 rounded-lg mb-3 text-[14px]" />
            <div className="flex gap-2 mt-4">
              <button onClick={handleProfileSave} className="flex-1 p-3 bg-[#0095f6] text-white rounded-lg font-bold text-[14px]">Save</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-[#efefef] rounded-lg font-bold text-[14px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
      }
