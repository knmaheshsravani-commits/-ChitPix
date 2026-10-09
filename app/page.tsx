"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import BottomNav from "./components/BottomNav"
import { auth, db } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newImage, setNewImage] = useState("")
  const [caption, setCaption] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("User")
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(()=>{
    const unsubAuth = onAuthStateChanged(auth, (user)=>{
      if(!user){ router.push("/login") }
      else {
        setUsername(user.displayName || user.email?.split("@")[0] || "User")
        setPhoto(user.photoURL || "")
        setLoading(false)
      }
    })
    const q = query(collection(db, "posts"))
    const unsubPosts = onSnapshot(q, (snap)=>{
      const data = snap.docs.map(d=>({ id: d.id,...(d.data() as any) }))
      data.sort((a:any,b:any)=>{
        const at = a.createdAt?.seconds || 0
        const bt = b.createdAt?.seconds || 0
        return bt - at
      })
      setPosts(data)
    })
    return ()=>{ unsubAuth(); unsubPosts(); }
  },[])

  const handleLike = async (p:any)=>{
    try{
      const uid = auth.currentUser?.uid
      if(!uid) return
      const isLiked = p.likedBy?.includes(uid)
      await updateDoc(doc(db, "posts", p.id), {
        likedBy: isLiked? p.likedBy.filter((u:string)=>u!==uid) : [...(p.likedBy||[]), uid],
        likes: isLiked? Math.max(0,(p.likes||1)-1) : (p.likes||0)+1
      })
      if(!isLiked){ setShowHeart(p.id); setTimeout(()=>setShowHeart(null), 800) }
    }catch(e){ console.log(e) }
  }

  const handleDelete = async (id:string)=>{
    if(!confirm("Delete cheyala bro?")) return
    try{ await deleteDoc(doc(db, "posts", id)); setShowMenu(null) }
    catch(e:any){ alert(e.message) }
  }

  // ✅ 100% R2 UPLOAD - NO MORE FIREBASE STORAGE - BLACK BOX GONE
  const handleCreate = async ()=>{
    if(!newImage) return alert("Photo select chey!")
    setUploading(true)
    try{
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newImage, folder: "posts" })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || "Upload failed")

      await addDoc(collection(db, "posts"), {
        image: data.url,
        username,
        caption: caption||"✨",
        music:"Original audio",
        likes:0,
        likedBy:[],
        savedBy:[],
        avatar: photo||"",
        uid: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      })
      setNewImage(""); setCaption(""); setShowCreate(false)
    }catch(e:any){ alert("Upload fail: "+e.message) }
    finally{ setUploading(false) }
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">ChitPix loading...</div>

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e:any)=>{
        const f=e.target.files?.[0]; if(!f) return
        const r=new FileReader()
        r.onload=()=>{ setNewImage(r.result as string); setShowCreate(true) }
        r.readAsDataURL(f)
      }} />
      <div className="max-w-md mx-auto bg-white pb-[140px]">
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-50">
          <h1 className="font-black text-[24px] italic tracking-tighter">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>fileInputRef.current?.click()} className="w-8 h-8 bg-black text-white rounded-full font-bold flex items-center justify-center text-xl leading-none">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border bg-gray-200">
              {photo? <img src={photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{username?.[0]?.toUpperCase()||"U"}</div>}
            </Link>
          </div>
        </div>

        {posts.length===0? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-5xl">📸</p>
            <p className="mt-4 font-bold">No posts yet</p>
            <p className="text-sm">Click + to post your first photo</p>
          </div>
        ) : posts.map((p:any)=>(
          <div key={p.id} className="border-b bg-white">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border">
                {p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-gradient-to-br from-pink-500 to-orange-400 text-white">{p.username?.[0]?.toUpperCase()||"U"}</div>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[13px] leading-none">{p.username||"User"}</p>
                <p className="text-[10px] text-gray-500">{p.music||"Original audio"}</p>
              </div>
              <div className="relative">
                <button onClick={()=>setShowMenu(showMenu===p.id? null : p.id)} className="px-2 font-bold">•••</button>
                {showMenu===p.id && (
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg w-32 z-10 overflow-hidden">
                    {p.uid===auth.currentUser?.uid && <button onClick={()=>handleDelete(p.id)} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50">Delete</button>}
                    <button onClick={()=>setShowMenu(null)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full aspect-square bg-black relative flex items-center justify-center overflow-hidden" onDoubleClick={()=>handleLike(p)}>
              <img src={p.image} className="w-full h-full object-contain" alt="" />
              {showHeart===p.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[80px] animate-[ping_0.8s_ease-out]">❤️</span></div>}
            </div>
            <div className="px-3 py-3">
              <div className="flex gap-3 text-[22px]">
                <button onClick={()=>handleLike(p)}>{p.likedBy?.includes(auth.currentUser?.uid)? '❤️' : '🤍'}</button>
                <button>💬</button>
                <button>✈️</button>
              </div>
              <button onClick={()=>handleLike(p)} className="font-bold text-[14px] mt-1 block">{p.likes||0} likes</button>
              <p className="text-[13px] mt-1 leading-[16px]"><b>{p.username}</b> {p.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden animate-[scaleIn_0.2s]">
            <div className="flex justify-between items-center p-4 border-b">
              <button onClick={()=>{setShowCreate(false); setNewImage(""); setCaption("")}} className="text-sm">Cancel</button>
              <b className="text-sm">New post</b>
              <button onClick={handleCreate} disabled={uploading} className="text-blue-500 font-bold text-sm disabled:opacity-50">{uploading? "Uploading..." : "Share"}</button>
            </div>
            <img src={newImage} className="w-full aspect-square object-contain bg-black" alt="" />
            <div className="p-3">
              <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a caption..." className="w-full text-sm outline-none resize-none" rows={2} autoFocus />
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
                                                 }
