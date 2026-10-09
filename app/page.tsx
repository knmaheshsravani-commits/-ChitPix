"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import BottomNav from "./components/BottomNav"
import { auth, db, storage } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"

const compressImage = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 1080;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = (h * MAX) / w; w = MAX; }
        else { w = (w * MAX) / h; h = MAX; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(base64);
  });
};

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newImage, setNewImage] = useState("")
  const [caption, setCaption] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("User")
  const [showMenu, setShowMenu] = useState<any>(null)
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
    // ✅ FIX: orderBy teesesanu - ippudu 100% posts vastayi
    const q = query(collection(db, "posts"))
    const unsubPosts = onSnapshot(q, (snap)=>{
      const data = snap.docs.map(d=>({ id: d.id,...d.data() } as any))
      // Client side sorting - newest first
      data.sort((a,b)=> (b.createdAt?.seconds || b.id) - (a.createdAt?.seconds || a.id))
      setPosts(data)
    }, (err)=>{ console.error(err); })
    return ()=>{ unsubAuth(); unsubPosts(); }
  },[])

  const handleLike = async (p:any)=>{
    const isLiked = p.likedBy?.includes(auth.currentUser?.uid)
    await updateDoc(doc(db, "posts", p.id), {
      likedBy: isLiked? p.likedBy.filter((u:string)=>u!==auth.currentUser?.uid) : [...(p.likedBy||[]), auth.currentUser?.uid],
      likes: isLiked? Math.max(0,(p.likes||1)-1) : (p.likes||0)+1
    })
    if(!isLiked){ setShowHeart(p.id); setTimeout(()=>setShowHeart(null), 900) }
  }

  const handleSave = async (p:any)=>{
    const isSaved = p.savedBy?.includes(auth.currentUser?.uid)
    await updateDoc(doc(db, "posts", p.id), {
      savedBy: isSaved? p.savedBy.filter((u:string)=>u!==auth.currentUser?.uid) : [...(p.savedBy||[]), auth.currentUser?.uid]
    })
  }

  const handleCreate = async ()=>{
    if(!newImage) return alert("Photo select chey BRO!")
    setUploading(true)
    try{
      const storageRef = ref(storage, `posts/${Date.now()}_${auth.currentUser?.uid}.jpg`)
      const snap = await uploadString(storageRef, newImage, 'data_url')
      const url = await getDownloadURL(snap.ref)
      await addDoc(collection(db, "posts"), {
        image: url,
        username, caption: caption || "✨",
        music:"Original audio", likes:0, likedBy:[], savedBy:[],
        time:"Just now", avatar: photo || "",
        uid: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      })
      setNewImage(""); setCaption(""); setShowCreate(false)
    } catch(e:any){ alert("Upload failed: "+e.message+"\n\nFirebase Storage Rules check chey bro!") }
    finally{ setUploading(false) }
  }

  const handleDelete = async (p:any)=>{
    if(confirm("Delete?")){ await deleteDoc(doc(db, "posts", p.id)); setShowMenu(null) }
  }

  if(loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold">ChitPix loading...</div>

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e:any)=>{
          const f=e.target.files?.[0]
          if(f){ const r=new FileReader(); r.onload=async ()=>{ const c = await compressImage(r.result as string); setNewImage(c); setShowCreate(true); }; r.readAsDataURL(f) }
        }}
      />
      <div className="max-w-md mx-auto bg-white pb-[140px]">
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-[100]">
          <h1 className="font-black text-[24px] italic">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <Link href="/messages" className="w-8 h-8 flex items-center justify-center">✈️</Link>
            <button onClick={()=>fileInputRef.current?.click()} className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center font-bold">+</button>
            <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border bg-gray-200">
              {photo? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{username[0]?.toUpperCase()}</div>}
            </Link>
          </div>
        </div>

        {posts.length===0? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-5xl">📸</p>
            <p className="mt-4 font-bold">No posts yet</p>
            <p className="text-sm">Be first to post! Click +</p>
            <button onClick={()=>fileInputRef.current?.click()} className="mt-5 bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm">Create Post</button>
          </div>
        ) : posts.map((p:any)=>(
          <div key={p.id} className="border-b bg-white">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border bg-gray-200">{p.avatar? <img src={p.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-gradient-to-br from-pink-500 to-orange-400 text-white">{p.username[0]?.toUpperCase()}</div>}</div>
              <div className="flex-1 leading-tight"><p className="font-semibold text-[13.5px]">{p.username}</p><p className="text-[11px] text-gray-500">♫ {p.music}</p></div>
              <button onClick={()=>setShowMenu(showMenu===p.id? null : p.id)}>•••</button>
            </div>
            {showMenu===p.id && (<div className="absolute right-3 mt-10 bg-white border rounded-2xl shadow-2xl z-30 w-48 overflow-hidden"><>{p.uid===auth.currentUser?.uid && <button onClick={()=>handleDelete(p)} className="w-full text-left px-4 py-3 text-sm text-red-500 font-bold">Delete post</button>}<button onClick={()=>setShowMenu(null)} className="w-full py-3 text-sm bg-gray-100">Cancel</button></></div>)}
            <div className="w-full aspect-square bg-black relative flex items-center justify-center overflow-hidden" onDoubleClick={()=>handleLike(p)}>
              <img src={p.image} alt="" className="w-full h-full object-contain" />
              {showHeart===p.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[80px] animate-[pop_0.9s_ease]">❤️</span></div>}
            </div>
            <div className="px-3 py-3">
              <div className="flex gap-4 text-xl">
                <button onClick={()=>handleLike(p)}>{p.likedBy?.includes(auth.currentUser?.uid)? '❤️' : '🤍'} <span className="text-[13px] font-semibold ml-1">{p.likes||0}</span></button>
                <button className="ml-auto" onClick={()=>handleSave(p)}>{p.savedBy?.includes(auth.currentUser?.uid)? '🔖' : '📑'}</button>
              </div>
              <p className="text-[13.5px] mt-2"><b>{p.username}</b> {p.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-[22px] sm:rounded-[22px] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b"><button onClick={()=>{setShowCreate(false); setNewImage("");}}>Cancel</button><b>New post</b><button onClick={handleCreate} disabled={uploading} className="font-bold text-blue-500 disabled:opacity-50">{uploading? "Posting..." : "Share"}</button></div>
            <div className="bg-black w-full aspect-square flex items-center justify-center"><img src={newImage} className="w-full h-full object-contain" alt="" /></div>
            <div className="p-3"><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write caption..." className="w-full min-h-[80px] text-[14px] outline-none" /></div>
          </div>
        </div>
      )}
      <BottomNav />
      <style>{`@keyframes pop{0%{transform:scale(0);opacity:0}15%{transform:scale(1.2);opacity:1}30%{transform:scale(0.95)}45%,80%{transform:scale(1);opacity:1}100%{transform:scale(0);opacity:0}}`}</style>
    </div>
  )
      }
