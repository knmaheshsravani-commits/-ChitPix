"use client"
import { useState, useEffect } from "react"
export default function Page() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [comments, setComments] = useState([{user:"rxtagur", text:"Mass bro 🔥"}]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [profile, setProfile] = useState({
    name: "_sankar_001", fullName: "Sankar Mahesh",
    bio: "Devanhalli | ChitPix Creator 🚀 | Travel | Code",
    link: "chitpix-p6.vercel.app", city: "Devanhalli, Karnataka"
  });
  const [temp, setTemp] = useState(profile);
  useEffect(()=>{
    const u = localStorage.getItem("chitpix_user");
    if(!u){ window.location.href="/login"; }
    else{ setCurrentUser(u); setProfile(prev=>({...prev, name: u})); setTemp(prev=>({...prev, name: u})); }
  },[]);
  const stories = [
    { name: "rxtagur", img: "https://picsum.photos/200/200?1" },
    { name: "akhilesh", img: "https://picsum.photos/200/200?2" },
    { name: "abhichar", img: "https://picsum.photos/200/200?3" },
    { name: "your_story", img: "https://picsum.photos/200/200?4" },
    { name: "mahesh", img: "https://picsum.photos/200/200?5" },
    { name: "sankar", img: "https://picsum.photos/200/200?6" },
  ];
  const posts = [
    { id: 1, user: "_sankar_001", img: "https://picsum.photos/600/600?1" },
    { id: 2, user: "rxtagur", img: "https://picsum.photos/600/600?2" },
    { id: 3, user: "akhilesh", img: "https://picsum.photos/600/600?3" },
  ];
  const filtered = posts.filter(p => p.user.toLowerCase().includes(search.toLowerCase()));
  const toggleLike = (id:number)=> setLiked(prev=> prev.includes(id)? prev.filter(x=>x!==id) : [...prev, id]);
  const saveProfile = () => { setProfile(temp); setShowEdit(false); }
  const logout = () => { localStorage.removeItem("chitpix_user"); window.location.href="/login"; }
  const shareProfile = async () => {
    const txt = `Check my ChitPix @${profile.name} - ${window.location.href}`;
    if(navigator.share){ await navigator.share({title:"ChitPix", text:txt}); }
    else{ await navigator.clipboard.writeText(txt); alert("Link copied!"); }
  }
  return (
    <div className="min-h-screen bg-white max-w-[420px] mx-auto">
      {tab==="home" && <div>
        <div className="flex gap-3 p-3 overflow-x-auto border-b">
          {stories.map((s,i)=><div key={i} className="text-center"><img src={s.img} className="w-[60px] h-[60px] rounded-full border-2 border-pink-500"/><p className="text-[11px]">{s.name}</p></div>)}
        </div>
        {filtered.map(post=>(
          <div key={post.id} className="border-b pb-2">
            <p className="font-bold p-3">{post.user}</p>
            <img src={post.img} className="w-full"/>
            <div className="flex gap-4 p-3">
              <button onClick={()=>toggleLike(post.id)}>{liked.includes(post.id)? "❤️" : "🤍"}</button>
              <button onClick={()=>setShowComments(true)}>💬</button>
            </div>
          </div>
        ))}
      </div>}
      {tab==="profile" && <div className="p-4">
        <h1 className="font-bold text-xl">{profile.name}</h1>
        <p>{profile.fullName}</p>
        <p className="text-[13px] text-gray-600">{profile.bio}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={()=>setShowEdit(true)} className="flex-1 bg-gray-100 py-1.5 rounded">Edit Profile</button>
          <button onClick={shareProfile} className="flex-1 bg-gray-100 py-1.5 rounded">Share Profile</button>
          <button onClick={logout} className="bg-red-100 px-3 py-1.5 rounded">Logout</button>
        </div>
      </div>}

      <div className="fixed bottom-0 w-full max-w-[420px] flex justify-around bg-white border-t py-3">
        <button onClick={()=>setTab("home")}>🏠</button>
        <button onClick={()=>setTab("search")}>🔍</button>
        <button onClick={()=>setTab("profile")}>👤</button>
      </div>

      {showComments && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end" onClick={()=>setShowComments(false)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white w-full rounded-t-[20px] h-[55vh] flex flex-col">
            <p className="font-bold text-center border-b py-3">Comments</p>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {comments.map((c,i)=><p key={i} className="text-[14px]"><b>{c.user}</b> {c.text}</p>)}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded-full px-4 py-2.5 text-[14px] outline-none"/>
              <button onClick={()=>{
                if(newComment.trim()){ setComments([...comments, {user: currentUser || "_sankar_001", text: newComment}]); setNewComment(""); }
              }} className="text-blue-600 font-bold text-[14px] px-3">Post</button>
            </div>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={()=>setShowEdit(false)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white w-full rounded-xl p-4">
            <p className="font-bold mb-3">Edit Profile</p>
            <input value={temp.fullName} onChange={e=>setTemp({...temp, fullName:e.target.value})} className="w-full border p-2 rounded mb-2"/>
            <input value={temp.bio} onChange={e=>setTemp({...temp, bio:e.target.value})} className="w-full border p-2 rounded mb-2"/>
            <button onClick={saveProfile} className="w-full bg-blue-600 text-white py-2 rounded">Save</button>
          </div>
        </div>
      )}
    </div>
  )
}
