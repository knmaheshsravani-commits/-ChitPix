"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import BottomNav from "./components/BottomNav"
import { auth, db, storage } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"

const compressImage = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 800;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = (h * MAX) / w;
          w = MAX;
        } else {
          w = (w * MAX) / h;
          h = MAX;
        }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
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
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [stories, setStories] = useState<any[]>([])
  const [showStory, setShowStory] = useState<any>(null)
  const [showHeart, setShowHeart] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(()=>{
    // ✅ LOGIN CHECK - login lekapothe login page ki pampu
    const unsubAuth = onAuthStateChanged(auth, (user)=>{
      if(!user){
        router.push("/login")
      } else {
        setUsername(user.email?.split("@")[0] || "User")
        setPhoto(user.photoURL || "")
        setLoading(false)
      }
    })

    // ✅ REAL FIREBASE POSTS - andari phone lo same kanipistayi
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const unsubPosts = onSnapshot(q, (snap)=>{
      const data = snap.docs.map(d=>({ id: d.id,...d.data() }))
      setPosts(data as any)
    })

    return ()=>{ unsubAuth(); unsubPosts(); }
  },[])

  const handleLike = async (p:any)=>{
    const postRef = doc(db, "posts", p.id)
    await updateDoc(postRef, {
      likedBy: p.likedBy?.includes(auth.currentUser?.uid)? p.likedBy.filter((u:string)=>u!==auth.currentUser?.uid) : [...(p.likedBy||[]), auth.currentUser?.uid],
      likes: p.likedBy?.includes(auth.currentUser?.uid)? (p.likes||1)-1 : (p.likes||0)+1
    })
    if(!p.likedBy?.includes(auth.currentUser?.uid)){
      setShowHeart(p.id)
      setTimeout(()=>setShowHeart(null), 900)
    }
  }

  const handleSave = async (p:any)=>{
    const postRef = doc(db, "posts", p.id)
    await updateDoc(postRef, {
      savedBy: p.savedBy?.includes(auth.currentUser?.uid)? p.savedBy.filter((u:string)=>u!==auth.currentUser?.uid) : [...(p.savedBy||[]), auth.currentUser?.uid]
    })
  }

  const handleCreate = async ()=>{
    if(!newImage){
      alert("Photo select chey BRO!")
      return
    }
    try{
      // Upload to Firebase Storage
      const storageRef = ref(storage, `posts/${Date.now()}_${auth.currentUser?.uid}.jpg`)
      const snap = await uploadString(storageRef, newImage, 'data_url')
      const url = await getDownloadURL(snap.ref)

      await addDoc(collection(db, "posts"), {
        image: url,
        username,
        music:"Original audio",
        caption,
        likes:0,
        comments:0,
        shares:0,
        likedBy:[],
        savedBy:[],
        time:"Just now",
        avatar: photo,
        uid: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      })
      setNewImage("")
      setCaption("")
      setShowCreate(false)
    } catch(e:any){
      alert("Upload failed: "+e.message)
    }
  }

  const handleDelete = async (p:any)=>{
    if(confirm("Delete post?")){
      await deleteDoc(doc(db, "posts", p.id))
      setShowMenu(null)
    }
  }

  if(loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading ChitPix...</div>

  const hasStory = false;
  const ICON_SIZE = 23;

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e:any)=>{
          const f=e.target.files[0]
          if(f){
            const r=new FileReader()
            r.onload=async ()=>{
              const compressed = await compressImage(r.result as string);
              setNewImage(compressed);
              setShowCreate(true);
            }
            r.readAsDataURL(f)
          }
        }}
      />

      <div className="max-w-md mx-auto bg-white pb-[140px]">
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-[100]">
          <h1 className="font-black text-[24px] tracking-tight italic">ChitPix</h1>
          <div className="flex gap-4 items-center">
            <Link href="/messages" className="w-[32px] h-[32px] flex items-center justify-center">
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </Link>
            <button onClick={()=>fileInputRef.current?.click()} className="w-[32px] h-[32px] bg-black rounded-full text-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <Link href="/profile" className="w-[32px] h-[32px] rounded-full bg-gray-200 overflow-hidden block border">
              {photo? <img src={photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[13px]">{username[0].toUpperCase()}</div>}
            </Link>
          </div>
        </div>

        {posts.length===0 && (
          <div className="p-10 text-center text-gray-500">No posts yet - Be first to post! Click +</div>
        )}

        {posts.map((p:any)=>(
          <div key={p.id} className="border-b relative bg-white">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border">
                {p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[12px] bg-gradient-to-br from-pink-500 to-orange-400 text-white">{p.username[0].toUpperCase()}</div>}
              </div>
              <div className="flex-1 leading-tight">
                <p className="font-semibold text-[13.5px]">{p.username}</p>
                <p className="text-[11px] text-gray-600">♫ {p.music}</p>
              </div>
              <button onClick={()=>setShowMenu(showMenu===p.id? null : p.id)} className="w-8 h-8 flex items-center justify-center">•••</button>
            </div>

            {showMenu===p.id && (
              <div className="absolute right-3 top-12 bg-white border rounded-2xl shadow-2xl z-30 w-56 overflow-hidden">
                {p.uid===auth.currentUser?.uid && <button onClick={()=>handleDelete(p)} className="w-full text-left px-4 py-3.5 text-[14px] text-red-500 font-bold">Delete post</button>}
                <button onClick={()=>setShowMenu(null)} className="w-full py-3 text-[14px] bg-gray-100 font-medium">Cancel</button>
              </div>
            )}

            <div className="bg-white w-full aspect-square overflow-hidden relative flex items-center justify-center" onDoubleClick={()=>handleLike(p)}>
              <img src={p.image} alt="" className="w-full h-full object-contain" />
              {showHeart===p.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[80px] animate-[heartPop_0.9s_ease-out]">❤️</span></div>}
            </div>

            <div className="px-3 py-3">
              <div className="flex items-center gap-4">
                <button onClick={()=>handleLike(p)} className="flex items-center gap-1.5">
                  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill={p.likedBy?.includes(auth.currentUser?.uid)? "#ff3040" : "none"} stroke={p.likedBy?.includes(auth.currentUser?.uid)? "#ff3040" : "black"} strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  <span className="text-[13px] font-semibold">{p.likes||0}</span>
                </button>
                <button onClick={()=>handleSave(p)} className="ml-auto"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill={p.savedBy?.includes(auth.currentUser?.uid)? "black" : "none"} stroke="black" strokeWidth="1.6"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></button>
              </div>
              <p className="text-[13.5px] mt-2"><b>{p.username}</b> {p.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-[22px] sm:rounded-[22px] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <button onClick={()=>{setShowCreate(false); setNewImage("");}} className="text-[14px]">Cancel</button>
              <b>New post</b>
              <button onClick={handleCreate} className="text-[14px] font-bold text-blue-500">Share</button>
            </div>
            <div className="bg-black w-full aspect-square flex items-center justify-center"><img src={newImage} className="w-full h-full object-contain" alt="" /></div>
            <div className="p-3"><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write caption..." className="w-full min-h-[80px] text-[14px] outline-none" /></div>
          </div>
        </div>
      )}

      <BottomNav />
      <style jsx>{`@keyframes heartPop{0%{transform:scale(0);opacity:0}15%{transform:scale(1.2);opacity:1}30%{transform:scale(0.95)}45%,80%{transform:scale(1);opacity:1}100%{transform:scale(0);opacity:0}}`}</style>
    </div>
  )
        }
