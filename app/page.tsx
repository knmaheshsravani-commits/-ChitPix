"use client"
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState({
    name: "_sankar_001",
    fullName: "Sankar Mahesh",
    bio: "Devanhalli | ChitPix Creator 🚀 | Travel ✈️ | Code 💻",
    link: "chitpix-p6.vercel.app",
    city: "Devanhalli, Karnataka",
  });
  const [temp, setTemp] = useState(profile);

  const stories = [
    { name: "rxtagur", img: "https://picsum.photos/200/200?random=2" },
    { name: "akhilesh", img: "https://picsum.photos/200/200?random=3" },
    { name: "abhichar", img: "https://picsum.photos/200/200?random=4" },
    { name: "your_story", img: "https://picsum.photos/200/200?random=5" },
    { name: "mahesh", img: "https://picsum.photos/200/200?random=6" },
    { name: "sankar", img: "https://picsum.photos/200/200?random=7" },
  ];
  const posts = [
    { id: 1, user: "_sankar_001", img: "https://picsum.photos/800/1000?random=50" },
    { id: 2, user: "rxtagur", img: "https://picsum.photos/800/1000?random=51" },
    { id: 3, user: "akhilesh", img: "https://picsum.photos/800/1000?random=52" },
  ];

  const filtered = posts.filter(p => p.user.toLowerCase().includes(search.toLowerCase()));
  const toggleLike = (id: number) => setLiked(prev => prev.includes(id)? prev.filter(x=>x!==id) : [...prev, id]);
  const saveProfile = () => { setProfile(temp); setShowEdit(false); }

  return (
    <div className="min-h-screen bg-white text-black pb-[90px]">
      <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-white z-20 border-b">
        <h1 className="text-[28px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)", WebkitBackgroundClip:"text", color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-3 text-[20px]">♡ ✈</div>
      </div>

      {tab==="home" && (
        <>
          <div className="flex gap-4 p-3 overflow-x-auto border-b">
            {stories.map((s,i)=>(
              <div key={i} className="flex-col items-center min-w-[75px] flex">
                <div className="w-[75px] h-[75px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-[3px]"><img src={s.img} className="w-full h-full rounded-full object-cover"/></div>
                </div>
                <p className="text-[12px] mt-1">{s.name}</p>
              </div>
            ))}
          </div>
          {filtered.map((p)=>(
            <div key={p.id} className="border-b pb-2 w-full">
              <div className="flex items-center gap-2 px-3 py-2"><img src={p.img} className="w-8 h-8 rounded-full"/><p className="font-bold text-[14px]">{p.user}</p></div>
              <img src={p.img} className="w-full aspect-[4/5] object-cover"/>
              <div className="flex gap-5 px-3 py-3 items-center">
                <button onClick={()=>toggleLike(p.id)} className="flex items-center gap-1"><span className="text-[26px]">{liked.includes(p.id)?"❤️":"🤍"}</span><span className="text-[13px] font-bold">14.5K</span></button>
                <button onClick={()=>setShowComments(true)} className="flex items-center gap-1"><span className="text-[24px]">💬</span><span className="text-[13px] font-bold">324</span></button>
                <span className="text-[24px] ml-auto">🔖</span>
              </div>
            </div>
          ))}
        </>
      )}

      {tab==="search" && (
        <div className="p-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search user..." className="w-full border-2 p-3 rounded-full"/>
          <div className="mt-4 grid grid-cols-2 gap-2">{filtered.map(p=><img key={p.id} src={p.img} className="w-full aspect-square object-cover rounded"/>)}</div>
        </div>
      )}
      {tab==="reels" && <div className="bg-black h-[80vh] flex items-center justify-center"><video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted playsInline className="h-full"/></div>}

      {tab==="profile" && (
        <div className="p-4">
          <div className="flex gap-5 items-center">
            <img src="https://picsum.photos/200/200?random=10" className="w-[85px] h-[85px] rounded-full border"/>
            <div className="flex gap-7">
              <div className="text-center"><p className="font-bold text-[18px]">12</p><p className="text-[13px]">Posts</p></div>
              <div className="text-center"><p className="font-bold text-[18px]">1.2K</p><p className="text-[13px]">Followers</p></div>
              <div className="text-center"><p className="font-bold text-[18px]">300</p><p className="text-[13px]">Following</p></div>
            </div>
          </div>
          <div className="mt-3">
            <p className="font-bold">{profile.fullName}</p>
            <p className="text-[14px] whitespace-pre-line">{profile.bio}</p>
            <p className="text-[14px] text-blue-600">🔗 {profile.link}</p>
            <p className="text-[13px] text-gray-500">📍 {profile.city}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>{setTemp(profile); setShowEdit(true)}} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-[14px]">Edit Profile</button>
            <button className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-[14px]">Share Profile</button>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-5">{posts.map(p=><img key={p.id} src={p.img} className="aspect-square object-cover"/>)}</div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-white z-[70] p-4 overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3">
            <button onClick={()=>setShowEdit(false)} className="text-[16px]">Cancel</button>
            <p className="font-bold">Edit Profile</p>
            <button onClick={saveProfile} className="text-blue-600 font-bold">Done</button>
          </div>
          <div className="mt-6 space-y-4">
            <div><p className="text-[13px] text-gray-500">Name</p><input value={temp.fullName} onChange={e=>setTemp({...temp, fullName:e.target.value})} className="w-full border-b py-2 outline-none"/></div>
            <div><p className="text-[13px] text-gray-500">Username</p><input value={temp.name} onChange={e=>setTemp({...temp, name:e.target.value})} className="w-full border-b py-2 outline-none"/></div>
            <div><p className="text-[13px] text-gray-500">Bio</p><textarea value={temp.bio} onChange={e=>setTemp({...temp, bio:e.target.value})} className="w-full border p-2 rounded mt-1 h-[80px]"/></div>
            <div><p className="text-[13px] text-gray-500">Link</p><input value={temp.link} onChange={e=>setTemp({...temp, link:e.target.value})} className="w-full border-b py-2 outline-none"/></div>
            <div><p className="text-[13px] text-gray-500">City</p><input value={temp.city} onChange={e=>setTemp({...temp, city:e.target.value})} className="w-full border-b py-2 outline-none"/></div>
          </div>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={()=>setShowComments(false)}>
          <div className="bg-white w-full rounded-t-[20px] p-4 h-[50vh]"><p className="font-bold text-center border-b pb-2">Comments</p><p className="mt-3"><b>rxtagur</b> Mass bro 🔥</p></div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[1.5px] border-gray-300 flex justify-around items-center h-[75px] z-50 pb-2">
        <button onClick={()=>setTab("home")} className="p-3"><svg width="34" height="34" viewBox="0 0 24 24" fill={tab==="home"?"black":"none"} stroke="black" strokeWidth="2.5"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1v-9.5z"/></svg></button>
        <button onClick={()=>setTab("reels")} className="p-3"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="black"/></svg></button>
        <button onClick={()=>alert("Create Post Coming Soon!")} className="p-3"><div className="w-[34px] h-[34px] border-[2.5px] border-black rounded-xl flex items-center justify-center text-[24px]">+</div></button>
        <button onClick={()=>setTab("search")} className="p-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5l5 5" strokeWidth="2.5"/></svg></button>
        <button onClick={()=>setTab("profile")} className="p-3"><img src="https://picsum.photos/200/200?random=10" className={`w-[34px] h-[34px] rounded-full ${tab==="profile"?"ring-[2.5px] ring-black":""}`}/></button>
      </div>
    </div>
  );
        }
