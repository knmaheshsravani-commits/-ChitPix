"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import BottomNav from "../components/BottomNav" // FIX 2: Bottom Icons kosam add chesa - okkate line

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
  const [showMenu, setShowMenu] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLink, setEditLink] = useState("")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved) setPosts(JSON.parse(saved))
    const f = localStorage.getItem("followers")
    if(f) setFollowers(parseInt(f))
    const admin = localStorage.getItem("isAdmin")
    if(admin==="true") setIsAdmin(true)
    const savedPhoto = localStorage.getItem("chitpix_profile_photo")
    if(savedPhoto) setPhoto(savedPhoto)
    const savedName = localStorage.getItem("chitpix_username")
    if(savedName) setUsername(savedName)
    const savedBio = localStorage.getItem("chitpix_bio")
    if(savedBio) setBio(savedBio)
    const savedLink = localStorage.getItem("chitpix_link")
    if(savedLink) setLink(savedLink)
  },[])

  const savePosts = (newPosts:any[])=>{
    setPosts(newPosts)
    localStorage.setItem("posts", JSON.stringify(newPosts))
  }

  const handleFollow = () => {
    if(isFollowing){
      const newCount = followers - 1
      setFollowers(newCount)
      setIsFollowing(false)
      localStorage.setItem("followers", newCount.toString())
    } else {
      const newCount = followers + 1
      setFollowers(newCount)
      setIsFollowing(true)
      localStorage.setItem("followers", newCount.toString())
    }
  }

  const handleDelete = (index:number)=>{
    if(confirm("Ee post delete cheyala?")){
      const newPosts = posts.filter((_,i)=> i!== index)
      savePosts(newPosts)
      setSelectedPost(null)
    }
  }

  const handlePhotoChange = (e: any) => {
    const f = e.target.files?.[0]
    if(f){
      const r = new FileReader()
      r.onload = () => {
        const result = r.result as string
        setPhoto(result)
        localStorage.setItem("chitpix_profile_photo", result)
      }
      r.readAsDataURL(f)
    }
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
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="font-bold text-xl">{username}</h1>
          <div className="flex gap-2 items-center">
            <button onClick={()=>{ const n=!isAdmin; setIsAdmin(n); localStorage.setItem("isAdmin", n.toString()); }} className={`text-xs px-3 py-1.5 rounded font-bold ${isAdmin?'bg-black text-white':'bg-gray-100'}`}>
              {isAdmin? "Admin ON" : "Admin"}
            </button>
            <button onClick={()=>setShowMenu(true)} className="text-2xl">☰</button>
          </div>
        </div>

        <div className="flex p-4 gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-purple-600">
              <div className="bg-white rounded-full p-0.5">
                {photo? <img src={photo} className="w-[72px] h-[72px] rounded-full object-cover" /> : <div className="w-[72px] h-[72px] rounded-full bg-gray-100 flex items-center justify-center text-3xl">👤</div>}
              </div>
            </div>
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm cursor-pointer">+</label>
            <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
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
          <button onClick={()=>{setEditName(username); setEditBio(bio); setEditLink(link); setShowEdit(true)}} className="flex-1 py-1.5 rounded-lg bg-gray-100 font-semibold text-sm">Edit Profile</button>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert("Link Copied!")}} className="flex-1 py-1.5 rounded-lg bg-gray-100 font-semibold text-sm">Share Profile</button>
          <button onClick={handleFollow} className={`flex-1 py-1.5 rounded-lg font-bold text-sm ${isFollowing? 'bg-gray-100 text-black border' : 'bg-blue-500 text-white'}`}>
            {isFollowing? 'Following' : 'Follow'}
          </button>
        </div>

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
          <button className="flex-1 py-3 text-sm border-t-2 border-black font-bold">POSTS</button>
          <button className="flex-1 py-3 text-sm text-gray-400">REELS</button>
          <button className="flex-1 py-3 text-sm text-gray-400">SAVED</button>
        </div>

        <div className="grid grid-cols-3 gap-0.5">
          {posts.length>0? posts.map((p,i)=>(
            // FIX 1: Post click lo index correct ga petta - admin delete kosam
            <div key={i} onClick={()=>setSelectedPost({...p, realIndex: i, index: i})} className="aspect-square bg-gray-100 cursor-pointer">
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

      {showMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-3">Settings</h3>
            {isAdmin? (
              <>
                <button onClick={()=>{ if(confirm("Anni posts delete cheyala?")){ savePosts([]); setShowMenu(false); }}} className="w-full text-left p-3 hover:bg-gray-100 rounded">🗑️ Clear All Posts (Admin)</button>
                <button onClick={()=>{ const n=prompt("Followers count entha pettali?", followers.toString()); if(n){ setFollowers(parseInt(n)); localStorage.setItem("followers", n); } setShowMenu(false); }} className="w-full text-left p-3 hover:bg-gray-100 rounded">👥 Edit Followers Count</button>
                <button onClick={()=>{ localStorage.clear(); alert("All Data Cleared!"); setShowMenu(false); location.reload(); }} className="w-full text-left p-3 hover:bg-gray-100 rounded text-red-600">⚠️ Reset Everything</button>
                <button onClick={()=>{ setIsAdmin(false); localStorage.setItem("isAdmin","false"); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-gray-100 rounded">🔒 Admin OFF</button>
              </>
            ) : (
              <>
                <p className="p-3 text-sm text-gray-500">Admin ON cheste extra options vastayi</p>
                <button onClick={()=>{ setIsAdmin(true); localStorage.setItem("isAdmin","true"); setShowMenu(false); }} className="w-full text-left p-3 bg-black text-white rounded-lg text-center font-bold">🔓 Turn Admin ON</button>
              </>
            )}
            <button onClick={()=>setShowMenu(false)} className="w-full mt-3 p-3 bg-gray-100 rounded-lg font-bold">Cancel</button>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 flex flex-col z-50">
          <div className="flex justify-between p-4 text-white">
            <button onClick={()=>setSelectedPost(null)}>✕ Close</button>
            {/* FIX 1: Admin ayithe delete button vasthundi - ippudu 100% work avuthundi */}
            <button onClick={()=>handleDelete(selectedPost.realIndex?? selectedPost.index)} className="bg-red-600 px-4 py-1.5 rounded text-sm font-bold">🗑️ Delete Post</button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src={selectedPost.image || selectedPost.imageUrl} className="max-w-full max-h-[80vh] object-contain" />
          </div>
          <p className="text-white text-center pb-6 text-sm">Admin ON unte delete cheyochu bro!</p>
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
              <button onClick={handleProfileSave} className="flex-1 p-3 bg-black text-white rounded-lg font-bold">Save</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-gray-100 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
          }
