"use client"
import { useState } from "react";

export default function Page() {
  const [liked, setLiked] = useState(false);
  const [tab, setTab] = useState("home");
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState(false);

  const stories = [
    { name: "rxtagur", img: "https://picsum.photos/200/200?random=2" },
    { name: "akhilesh", img: "https://picsum.photos/200/200?random=3" },
    { name: "abhichar", img: "https://picsum.photos/200/200?random=4" },
    { name: "your_story", img: "https://picsum.photos/200/200?random=5" },
    { name: "mahesh", img: "https://picsum.photos/200/200?random=6" },
    { name: "sankar", img: "https://picsum.photos/200/200?random=7" },
  ];

  const posts = [
    { user: "_sankar_001", img: "https://picsum.photos/600/600?random=50" },
    { user: "rxtagur", img: "https://picsum.photos/600/600?random=51" },
    { user: "akhilesh", img: "https://picsum.photos/600/600?random=52" },
  ];

  const filtered = posts.filter(p=>p.user.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[80px]">
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-20 border-b">
        <h1 className="text-[30px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf)", WebkitBackgroundClip:"text", color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4 text-[20px]">♡ ✈️</div>
      </div>

      {tab==="home" && (
        <>
          <div className="flex gap-4 p-4 overflow-x-auto bg-white border-b">
            {stories.map((s,i)=>(
              <div key={i} className="flex flex-col items-center min-w-[72px]">
                <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-[2px]"><img src={s.img} className="w-full h-full rounded-full object-cover" /></div>
                </div>
                <p className="text-[11px] mt-1 truncate w-[72px] text-center">{s.name}</p>
              </div>
            ))}
          </div>
          <div className="w-full">
            {posts.map((p,i)=>(
              <div key={i} className="max-w-[500px] mx-auto border-b pb-2">
                <div className="flex items-center gap-2 p-3"><img src={p.img} className="w-8 h-8 rounded-full" /><p className="font-bold text-[14px]">{p.user}</p></div>
                <img src={p.img} className="w-full h-[420px] object-cover" />
                <div className="px-3 py-2 flex gap-4 text-[20px]"><button onClick={()=>setLiked(!liked)}>{liked?"❤️":"🤍"}</button><span>💬</span><span>✈️</span></div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="search" && (
        <div className="p-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-gray-100 rounded-full px-4 py-3 outline-none text-[15px]" />
          <div className="grid grid-cols-3 gap-1 mt-4">
            {filtered.map((p,i)=><img key={i} src={p.img} className="w-full h-[130px] object-cover" />)}
          </div>
          {filtered.length===0 && <p className="text-center mt-10 text-gray-500">No users found</p>}
        </div>
      )}

      {tab==="reels" && (
        <div className="bg-black h-[calc(100vh-120px)] flex items-center justify-center">
          <video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted playsInline className="h-[80%] w-[90%] object-cover rounded-xl" />
        </div>
      )}

      {tab==="shop" && (
        <div className="p-10 text-center"><p className="text-[40px]">🛍️</p><p className="font-bold mt-2">Shop Coming Soon</p><p className="text-gray-500 text-[14px]">ChitPix Store lo shopping cheyachu soon!</p></div>
      )}

      {tab==="profile" && (
        <div className="p-4">
          <div className="flex gap-6 items-center">
            <img src="https://picsum.photos/200/200?random=10" className="w-[85px] h-[85px] rounded-full" />
            <div className="flex gap-6 text-center"><div><p className="font-bold">3</p><p className="text-[13px]">Posts</p></div><div><p className="font-bold">1.2k</p><p className="text-[13px]">Followers</p></div><div><p className="font-bold">180</p><p className="text-[13px]">Following</p></div></div>
          </div>
          <h2 className="font-bold mt-3">knmahesh_ravani</h2><p className="text-[13px] text-gray-600">ChitPix Creator 🚀 | Devanhalli</p>
          <div className="grid grid-cols-3 gap-1 mt-4">{posts.map((p,i)=><img key={i} src={p.img} className="w-full h-[120px] object-cover" />)}</div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 h-[62px] z-30">
        <button onClick={()=>setTab("home")}><span className={`text-[26px] ${tab==="home"?"font-black":""}`}>⌂</span></button>
        <button onClick={()=>setTab("search")}><span className={`text-[24px] ${tab==="search"?"font-black":""}`}>⌕</span></button>
        <button onClick={()=>setTab("reels")}><span className={`text-[24px] ${tab==="reels"?"font-black":""}`}>▶</span></button>
        <button onClick={()=>setTab("shop")}><span className={`text-[22px] ${tab==="shop"?"font-black":""}`}>🛍</span></button>
        <button onClick={()=>setTab("profile")}><div className={`w-[28px] h-[28px] rounded-full p-[2px] ${tab==="profile"?"bg-black":"bg-gray-300"}`}><img src="https://picsum.photos/100?random=10" className="w-full h-full rounded-full border-2 border-white" /></div></button>
      </div>
    </div>
  );
}
