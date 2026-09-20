"use client"
import { useState } from "react";

export default function Page() {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [tab, setTab] = useState("home");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(["Super bro! 🔥", "Mass pic anna!"]);
  const [newComment, setNewComment] = useState("");
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

  const addComment = () => { if(newComment.trim()){ setComments([...comments, newComment]); setNewComment(""); } };

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[80px]">
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-20 border-b border-gray-200">
        <h1 className="text-[30px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf)", WebkitBackgroundClip:"text", color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4 text-[22px]"><span>♡</span><span>✈️</span></div>
      </div>

      {/* STORY - FIXED 100% VISIBLE */}
      <div className="flex gap-4 p-4 overflow-x-auto bg-white border-b border-gray-200" style={{display:"flex"}}>
        {stories.map((s,i)=>(
          <div key={i} className="flex flex-col items-center min-w-[78px]">
            <div className="w-[78px] h-[78px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-white p-[3px]">
                <img src={s.img} className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <p className="text-[12px] mt-1.5 truncate w-[78px] text-center">{s.name}</p>
          </div>
        ))}
      </div>

      {/* POSTS - 3 PHOTOS TO FILL WHITE SPACE */}
      <div className="w-full bg-white">
        {posts.map((p, idx)=>(
          <div key={idx} className="w-full max-w-[500px] mx-auto border-b border-gray-100 pb-2 mb-2">
            <div className="flex items-center gap-2 p-3">
              <img src={p.img} className="w-8 h-8 rounded-full" />
              <p className="font-bold text-[14px]">{p.user}</p>
            </div>
            <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),900);}} className="relative bg-gray-100">
              <img src={p.img} className="w-full h-[420px] object-cover" />
              {showHeart && idx===0 && <div className="absolute inset-0 flex items-center justify-center text-[80px] animate-pulse">❤️</div>}
            </div>
            <div className="px-3 py-2.5 flex gap-4 text-[22px]">
              <button onClick={()=>setLiked(!liked)}>{liked && idx===0? "❤️" : "🤍"}</button>
              <button onClick={()=>setShowComments(true)}>💬</button>
              <button>✈️</button>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM 5 ICONS - BIG 34px */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around items-center py-3 z-30 h-[60px]">
        <button onClick={()=>setTab("home")}><svg width="32" height="32" viewBox="0 0 24 24" fill={tab==="home"?"black":"none"} stroke="black" strokeWidth="1.8"><path d="M3 11L12 2.5L21 11v9a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-9z"/></svg></button>
        <button><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M21 21L16.65 16.65"/></svg></button>
        <button><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5L16 12L10 15.5V8.5z"/></svg></button>
        <button><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M6 7h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg></button>
        <button><div className="w-[32px] h-[32px] rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><img src="https://picsum.photos/100?random=10" className="w-full h-full rounded-full border-2 border-white" /></div></button>
      </div>
    </div>
  );
}
