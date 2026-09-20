"use client"
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState(false);
  const [search, setSearch] = useState("");

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

  const filtered = posts.filter(p => p.user.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-black pb-[70px]">
      <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-white z-20 border-b">
        <h1 className="text-[28px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)",WebkitBackgroundClip:"text",color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-3 text-[20px]">♡ ✈️</div>
      </div>

      {tab==="home" && (
        <>
          <div className="flex gap-4 p-3 overflow-x-auto border-b">
            {stories.map((s,i)=>(
              <div key={i} className="flex flex-col items-center min-w-[68px]">
                <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-[2px]"><img src={s.img} className="w-full h-full rounded-full object-cover"/></div>
                </div>
                <p className="text-[11px] mt-1">{s.name}</p>
              </div>
            ))}
          </div>
          {posts.map((p,i)=>(
            <div key={i} className="border-b pb-2 w-full">
              <div className="flex items-center gap-2 p-3"><img src={p.img} className="w-8 h-8 rounded-full"/><p className="font-bold text-[13px]">{p.user}</p></div>
              <img src={p.img} className="w-full aspect-[4/5] object-cover"/>
              <div className="flex gap-5 px-3 py-3 items-center">
                <div className="flex items-center gap-1"><span onClick={()=>setLiked(!liked)} className="text-[26px] cursor-pointer">{liked?"❤️":"🤍"}</span><span className="text-[15px] font-bold">14.5K</span></div>
                <div className="flex items-center gap-1"><span className="text-[24px]">💬</span><span className="text-[15px] font-bold">324</span></div>
                <div className="flex items-center gap-1"><span className="text-[24px]">🔄</span><span className="text-[15px] font-bold">356</span></div>
                <div className="flex items-center gap-1"><span className="text-[24px]">✈️</span><span className="text-[15px] font-bold">41.8K</span></div>
                <span className="text-[24px] ml-auto">🔖</span>
              </div>
              <div className="px-3 pb-2 text-[13px] text-gray-500">11 September</div>
            </div>
          ))}
        </>
      )}

      {tab==="search" && (
        <div className="p-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full bg-gray-100 rounded-full px-4 py-3 text-[15px] outline-none"/><div className="grid grid-cols-3 gap-1 mt-4">{filtered.map((p,i)=><img key={i} src={p.img} className="h-[120px] w-full object-cover"/>)}</div></div>
      )}
      {tab==="reels" && (<div className="bg-black h-[80vh] flex items-center justify-center"><video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted playsInline className="h-[75%] w-[90%] object-cover rounded-xl"/></div>)}
      {tab==="shop" && (<div className="p-10 text-center"><div className="text-[50px]">🛍️</div><p className="font-bold mt-2">Shop</p></div>)}
      {tab==="profile" && (<div className="p-4"><div className="flex gap-5 items-center"><img src="https://picsum.photos/200/200?random=10" className="w-[80px] h-[80px] rounded-full"/><div className="flex gap-5 text-center"><div><p className="font-bold">3</p><p className="text-[12px]">Posts</p></div><div><p className="font-bold">1.2k</p><p className="text-[12px]">Followers</p></div><div><p className="font-bold">180</p><p className="text-[12px]">Following</p></div></div></div><div className="grid grid-cols-3 gap-1 mt-4">{posts.map((p,i)=><img key={i} src={p.img} className="h-[120px] w-full object-cover"/>)}</div></div>)}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around items-center h-[60px] z-50">
        <button onClick={()=>setTab("home")} className="p-2">
          {tab==="home"? <svg width="28" height="28" fill="black" viewBox="0 0 24 24"><path d="M12 2.8L2 12v9h6v-6h8v6h6v-9L12 2.8z"/></svg> : <svg width="28" height="28" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3L3 11v9h6v-6h6v6h6v-9L12 3z"/></svg>}
        </button>
        <button onClick={()=>setTab("reels")} className="p-2">
          <svg width="28" height="28" fill="none" stroke="black" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 8l6 4-6 4V8z" fill="black" stroke="none"/></svg>
        </button>
        <button onClick={()=>setTab("search")} className="p-2">
          <svg width="26" height="26" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l7-7 11-7 7-11-11z"/></svg>
        </button>
        <button onClick={()=>setTab("search")} className="p-2">
          <svg width="28" height="28" fill="none" stroke="black" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
        </button>
        <button onClick={()=>setTab("profile")} className="p-2">
          <img src="https://picsum.photos/200/200?random=10" className={`w-[28px] h-[28px] rounded-full ${tab==="profile"?"ring-2 ring-black":""}`}/>
        </button>
      </div>
