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
    { user: "_sankar_001", img: "https://picsum.photos/800/1000?random=50" },
    { user: "rxtagur", img: "https://picsum.photos/800/1000?random=51" },
    { user: "akhilesh", img: "https://picsum.photos/800/1000?random=52" },
  ];

  const filtered = posts.filter(p => p.user.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-black pb-[70px]">
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
          {filtered.map((p,i)=>(
            <div key={i} className="border-b pb-2 w-full">
              <div className="flex items-center gap-2 px-3 py-2"><img src={p.img} className="w-8 h-8 rounded-full"/><p className="font-bold text-[14px]">{p.user}</p></div>
              <img src={p.img} className="w-full aspect-[4/5] object-cover"/>
              <div className="flex gap-5 px-3 py-3 items-center">
                <div className="flex items-center gap-1"><span onClick={()=>setLiked(!liked)} className="text-[24px]">{liked?"❤️":"🤍"}</span><span className="text-[13px] font-bold">14.5K</span></div>
                <div className="flex items-center gap-1"><span className="text-[24px]">💬</span><span className="text-[13px] font-bold">324</span></div>
                <div className="flex items-center gap-1"><span className="text-[24px]">🔄</span><span className="text-[13px] font-bold">356</span></div>
                <div className="flex items-center gap-1"><span className="text-[24px]">✈️</span><span className="text-[13px] font-bold">41.8K</span></div>
                <span className="text-[24px] ml-auto">🔖</span>
              </div>
              <div className="px-3 pb-2 text-[13px] text-gray-500">11 September</div>
            </div>
          ))}
        </>
      )}

      {tab==="search" && <div className="p-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search user" className="w-full border p-3 rounded-full"/></div>}
      {tab==="reels" && <div className="bg-black h-[80vh] flex items-center justify-center"><video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted className="h-full"/></div>}
      {tab==="shop" && <div className="p-10 text-center"><div className="text-[50px]">🛒</div><p>Shop coming soon</p></div>}
      {tab==="profile" && <div className="p-4"><div className="flex gap-5 items-center"><img src="https://picsum.photos/200/200?random=10" className="w-20 h-20 rounded-full"/><div><p className="font-bold">_sankar_001</p><p>Devanhalli</p></div></div></div>}

            {/* MEGA BIG BOLD BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[1.5px] border-gray-300 flex justify-around items-center h-[75px] z-50 pb-2">
        <button onClick={()=>setTab("home")} className="p-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill={tab==="home"?"black":"white"} stroke="black" strokeWidth="2.5"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1v-9.5z"/></svg>
        </button>
        <button onClick={()=>setTab("reels")} className="p-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="black" stroke="black" strokeWidth="1.5"/></svg>
        </button>
        <button onClick={()=>setTab("search")} className="p-3">
          <div className="w-[36px] h-[36px] border-[2.5px] border-black rounded-xl flex items-center justify-center text-[26px] font-light">+</div>
        </button>
        <button onClick={()=>setTab("search")} className="p-3">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5l5 5" strokeWidth="2.5"/></svg>
        </button>
        <button onClick={()=>setTab("profile")} className="p-3">
          <img src="https://picsum.photos/200/200?random=10" className={`w-[36px] h-[36px] rounded-full object-cover ${tab==="profile"?"ring-[2.5px] ring-black":""}`}/>
        </button>
      </div>
  );
}
