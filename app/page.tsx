"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import BottomNav from "./components/BottomNav"
import { auth, db, storage } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
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
    // FIX: No orderBy - crash radu
    const q = query(collection(db, "posts"))
    const unsubPosts = onSnapshot(q, (snap)=>{
      const data = snap.docs.map(d=>({ id: d.id,...(d.data() as any) }))
      // Safe sorting
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
      const isLiked = p.likedBy?.includes(auth.currentUser?.uid)
      await updateDoc(doc(db, "posts", p.id), {
        likedBy: isLiked? p.likedBy.filter((u:string)=>u!==auth.currentUser?.uid) : [...(p.likedBy||[]), auth.currentUser?.uid],
        likes: isLiked? Math.max(0,(p.likes||1)-1) : (p.likes||0)+1
      })
      if(!isLiked){ setShowHeart(p.id); setTimeout(()=>setShowHeart(null), 800) }
    }catch(e){ console.log(e) }
  }

  const handleCreate = async ()=>{
    if(!newImage) return alert("Photo select chey!")
    setUploading(true)
    try{
      const storageRef = ref(storage, `posts/${Date.now()}_${auth.currentUser?.uid}.jpg`)
      const snap = await uploadString(storageRef, newImage, 'data_url')
      const url = await getDownloadURL(snap.ref)
      await addDoc(collection(db, "posts"), {
        image: url, username, caption: caption||"✨", music:"Original audio",
        likes:0, likedBy:[], savedBy:[], avatar: photo||"", uid: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      })
      setNewImage(""); setCaption(""); setShowCreate(false)
    }catch(e:any){ alert("Upload fail: "+e.message) }
    finally{ setUploading(false) }
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center font-bold">ChitPix loading...</div>

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e:any)=>{
        const f=e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>{ setNewImage(r.result as string); setShowCreate(true); }; r.readAsDataURL(f) }
      }} />
      <div className="max-w-md mx-auto bg-white pb-[140px]">
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-50">
          <h1 className="font-black text-[24px] italic">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>fileInputRef.current?.click()} className="w-8 h-8 bg-black text-white rounded-full font-bold">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border bg-gray-200">
              {photo? <img src={photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{username?.[0]?.toUpperCase()||"U"}</div>}
            </Link>
          </div>
        </div>

        {posts.length===0? (
          <div className="p-10 text-center text-gray-500"><p className="text-5xl">📸</p><p className="mt-4 font-bold">No posts yet</p><p className="text-sm">Click + to post</p></div>
        ) : posts.map((p:any)=>(
          <div key={p.id} className="border-b bg-white">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border">
                {p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-gradient-to-br from-pink-500 to-orange-400 text-white">{p.username?.[0]?.toUpperCase()||"U"}</div>}
              </div>
              <div className="flex-1"><p className="font-semibold text-[13px]">{p.username||"User"}</p></div>
              <button onClick={()=>setShowMenu(showMenu===p.id? null : p.id)}>•••</button>
            </div>
            <div className="w-full aspect-square bg-black relative flex items-center justify-center" onDoubleClick={()=>handleLike(p)}>
              <img src={p.image} className="w-full h-full object-contain" alt="" />
              {showHeart===p.id && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[70px]">❤️</span></div>}
            </div>
            <div className="px-3 py-3">
              <button onClick={()=>handleLike(p)} className="font-bold text-[14px]">{p.likedBy?.includes(auth.currentUser?.uid)? '❤️' : '🤍'} {p.likes||0} likes</button>
              <p className="text-[13px] mt-1"><b>{p.username}</b> {p.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <div className="flex justify-between p-4 border-b"><button onClick={()=>{setShowCreate(false); setNewImage("");}}>Cancel</button><b>New post</b><button onClick={handleCreate} className="text-blue-500 font-bold">{uploading? "..." : "Share"}</button></div>
            <img src={newImage} className="w-full aspect-square object-contain bg-black" alt="" />
            <div className="p-3"><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="w-full text-sm outline-none" rows={2} /></div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
              }
