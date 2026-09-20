"use client"
import { useState } from "react";

export default function Page() {
  const stories = [
    { name: "rxtagur", img: "https://picsum.photos/100?random=2" },
    { name: "akhileshdi...", img: "https://picsum.photos/100?random=3" },
    { name: "abhichar", img: "https://picsum.photos/100?random=4" },
    { name: "your_story", img: "https://picsum.photos/100?random=5" },
  ];
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [tab, setTab] = useState("home");

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[90px]">
      {/* TOP - ChitPix */}
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10 border-b">
        <h1 className="text-[28px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
        </div>
      </div>

      {/* STORIES - Peddaga */}
      <div className="flex gap-4 p-4 overflow-x-auto bg-white border-b">
        {stories.map((s,i)=>(
          <div key={i} className="flex flex-col items-center min-w-[75px]">
            <div className="w-[70px] h-[70px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
              <img src={s.img} className="w-full h-full rounded-full border-[3px] border-white object-cover bg-white" />
            </div>
            <p className="text-[12px] mt-1 truncate w-[70px] text-center">{s.name}</p>
          </div>
        ))}
      </div>

      {/* POST - Full screen */}
      <div className="w-full bg-black text-white">
        <div className="flex justify-between items-center p-3">
          <div><p className="font-bold text-[16px]">_sankar_oo1_</p><p className="text-[12px] text-gray-300">Original audio</p></div>
          <div className="text-2xl">•••</div>
        </div>

        <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),1000)}} className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden">
          <img src="https://picsum.photos/800/1200?random=50" className="w-full h-full object-cover" />
          {showHeart && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[100px] animate-ping">❤️</span></div>}
          <div className="absolute top-1/2 left-0 right-0 text-center -translate-y-1/2 p-6 pointer-events-none">
            <p className="text-white font-bold text-[24px] drop-shadow-lg">Don't express feeling to everyone, not everyone will feel the same.</p>
          </div>
        </div>

        {/* LIKES COMMENTS SHARES - NEW BAR */}
        <div className="bg-white text-black px-3 py-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <button onClick={()=>setLiked(!liked)}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={liked?"red":"none"} stroke={liked?"red":"black"} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="font-bold mt-2 text-[15px]">{liked? "1,247" : "1,246"} likes</p>
          <p className="text-[14px] mt-1"><span className="font-bold">_sankar_oo1_</span> Don't express feeling to everyone 💯👍</p>
          <p className="text-gray-500 text-[14px] mt-1">View all 89 comments</p>
          <p className="text-gray-500 text-[12px] mt-1">2 hours ago</p>
        </div>
      </div>

      {/* BOTTOM - GIANT ICONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[85px] px-2">
        <button onClick={()=>setTab("home")} className="flex-1 flex justify-center">
          <svg width="42" height="42" viewBox="0 0 24 24" fill={tab==="home"?"black":"none"} stroke="black" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <button className="flex-1 flex justify-center"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        <button className="flex-1 flex justify-center"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg></button>
        <button className="flex-1 flex justify-center"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><polygon points="23 7 13.5 15.5 8.5 10.5 1 17.5 1 7 23 7"/><polyline points="13.5 15.5 23 7 23 17.5 1 17.5"/></svg></button>
        <button className="flex-1 flex justify-center"><div className="w-[42px] h-[42px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[16px]">M</div></button>
      </div>
    </div>
  );
}
