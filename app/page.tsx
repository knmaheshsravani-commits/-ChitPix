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

      {/* REAL INSTAGRAM STYLE BOTTOM NAV - BIG BOLD */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around items-center h-[62px] z-50">
        <button onClick={()=>setTab("home")} className="p-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill={tab==="home"?"black":"none"} stroke="black" strokeWidth={tab==="home"?"0":"2"}><path d="M12 2.5L2 12v9h6v-6h8v6h6v-9L12 2.5z"/></svg>
        </button>
        <button onClick={()=>setTab("reels")} className="p-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M10 9l6 3-6 3V9z" fill="black"/></svg>
        </button>
        <button onClick={()=>setTab("search")} className="p-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 2l-2 8H2l6 4-2 8 6-5 6 5-2-8 6-4h-8l-2-8z"/></svg>
        </button>
        <button onClick={()=>setTab("search")} className="p-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
        </button>
        <button onClick={()=>setTab("profile")} className="p-2">
          <img src="https://picsum.photos/200/200?random=10" className={`w-[30px] h-[30px] rounded-full ${tab==="profile"?"ring-2 ring-black":""}`}/>
        </button>
      </div>
    </div>
  );
}
