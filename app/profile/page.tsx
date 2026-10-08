"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ProfilePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [followers, setFollowers] = useState(128)
  const [following, setFollowing] = useState(205)
  const [isFollowing, setIsFollowing] = useState(false)
  const [username, setUsername] = useState("ChitPix User")
  const [bio, setBio] = useState("Welcome to ChitPix ✨")
  const [link, setLink] = useState("chitpix.com")
  const [photo, setPhoto] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")
  const [activeTab, setActiveTab] = useState("posts")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved) setPosts(JSON.parse(saved))
    const admin = localStorage.getItem("isAdmin")
    if(admin) setIsAdmin(true)
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
      alert("Post Deleted ✅")
    }
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    setFollowers(f=> isFollowing? f-1 : f+1)
  }
  const handleSave = () => {
    setUsername(editName || username)
    setBio(editBio || bio)
    setLink(editLink || link)
    setShowEdit(false)
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        {/* HEADER - ADMIN BUTTON FIX */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="font-bold text-xl">{username}</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>{setIsAdmin(!isAdmin); localStorage.setItem("isAdmin", isAdmin?"":"true")}} className="text-xs bg-black text-white px-2 py-1 rounded">
              {isAdmin? "Admin ON" : "Admin"}
            </button>
            <span>☰</span>
          </div>
        </div>

        <div className="flex p-4 gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-purple-600">
              <div className="bg-white rounded-full p-0.5">
                {photo? <img src={photo} className="w-[72px] h-[72px] rounded-full object-cover" /> : <div className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center text-3xl">👤</div>}
              </div>
            </div>
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm cursor-pointer">+</label>
            <input id="photoInput" type="file" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setPhoto(r.result as string); r.readAsDataURL(f)}}} className="hidden" />
          </div>
          <div className="flex gap-6 text-center flex-1 justify-around">
            <div><b className="block text-lg">{posts.length}</b><span className="text-sm">Posts</span></div>
            <div><b className="block text-lg">{followers}</b><span className="text-sm">Followers</span></div>
            <div><b className="block text-lg">{following}</b><span className="text-sm">Following</span></div>
          </div>
        </div>

        <div className="px-4 mt-2">
          <p className="font-bold">{username} ✓</p>
          <p className="text-sm mt-1">{bio}</p>
          <p className="text-sm text-blue-600 font-semibold">🔗 {link}</p>
        </div>

        <div className="flex gap-2 mt-4 px-4">
          <button onClick={()=>setShowEdit(true)} className="flex-1 py-1.5 rounded-lg bg-gray-100 font-semibold text-sm">Edit Profile</button>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert("Link Copied!")}} className="flex-1 py-1.5 rounded-lg bg-gray-100 font-semibold text-sm">Share Profile</button>
        </div>

        {/* HIGHLIGHTS CLICKABLE */}
        <div className="flex gap-4 mt-6 overflow-x-auto px-4">
          {['ChitPix','My Work','Travel','Friends'].map((h)=>(
            <div key={h} className="text-center min-w-[60px] cursor-pointer" onClick={()=> alert(h + ' Story Coming Soon! ✨')}>
              <div className="w-14 h-14 rounded-full border p-0.5 mx-auto bg-gradient-to-tr from-yellow-400 to-purple-600">
                <div className="bg-white rounded-full w-full h-full flex items-center justify-center text-xl">✨</div>
              </div>
              <p className="text-[11px] mt-1">{h}</p>
            </div>
          ))}
        </div>

        <div className="flex border-t mt-4">
          <button onClick={()=>setActiveTab('posts')} className={`flex-1 py-3 text-sm ${activeTab==='posts'?'border-t-2 border-black font-bold':''}`}>POSTS</button>
          <button className="flex-1 py-3 text-sm text-gray-400">REELS</button>
          <button className="flex-1 py-3 text-sm text-gray-400">SAVED</button>
        </div>

        <div className="grid grid-cols-3 gap-0.5">
          {posts.length>0? posts.map((p,i)=>(
            <div key={i} onClick={()=>setSelectedPost({...p, realIndex: i})} className="aspect-square bg-gray-100 cursor-pointer">
              <img src={p.image || p.imageUrl} className="w-full h-full object-cover" />
            </div>
          )) : (
            <div className="col-span-3 py-20 text-center">
              <p className="text-4xl">📷</p><p className="font-bold mt-2">No Posts Yet</p>
              <Link href="/" className="text-blue-500 text-sm font-semibold">Share first photo</Link>
            </div>
          )}
        </div>
      </div>

      {/* POST VIEW + DELETE */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 flex flex-col z-50">
          <div className="flex justify-between p-4 text-white">
            <button onClick={()=>setSelectedPost(null)}>✕ Close</button>
            <button onClick={()=>handleDelete(selectedPost.realIndex)} className="bg-red-600 px-3 py-1 rounded text-sm font-bold">🗑️ Delete Post</button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src={selectedPost.image || selectedPost.imageUrl} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold mb-3">Edit Profile</h3>
            <input value={editName} onChange={(e)=>setEditName(e.target.value)} placeholder="Name" className="w-full border p-2 rounded mb-2" />
            <textarea value={editBio} onChange={(e)=>setEditBio(e.target.value)} rows={3} placeholder="Bio" className="w-full border p-2 rounded mb-2" />
            <input value={editLink} onChange={(e)=>setEditLink(e.target.value)} placeholder="Link" className="w-full border p-2 rounded mb-2" />
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className="flex-1 p-3 bg-black text-white rounded-lg font-bold">Save</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-gray-100 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
            }
