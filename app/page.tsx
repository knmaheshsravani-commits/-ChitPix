"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const stories = [
    { name: "Your story", img: "https://picsum.photos/100?random=1" },
    { name: "rxtagur", img: "https://picsum.photos/100?random=2" },
    { name: "akhileshdi...", img: "https://picsum.photos/100?random=3" },
    { name: "abhichar", img: "https://picsum.photos/100?random=4" },
  ];

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[90px]">
      {/* TOP - Insta style */}
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10 border-b border-zinc-200">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <h1 className="text-[28px] font-bold" style={{fontFamily:"cursive"}}>Instagram</h1>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.35l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </div>

      {/* STORIES - Peddaga */}
      <div className="flex gap-4 p-4 overflow-x-auto bg-white border-b border-zinc-200">
        {stories.map((s,i)=>(
          <div key={i} className="flex flex-col items-center min-w-[75px]">
            <div className="w-[70px] h-[70px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <img src={s.img} className="w-full h-full rounded-full border-[3px] border-white object-cover bg-white"/>
            </div>
            <p className="text-[12px] mt-1 truncate w-[70px] text-center">{s.name}</p>
          </div>
        ))}
      </div>

      {/* POST - Full screen like your photo */}
      <div className="w-full bg-black text-white">
        <div className="flex justify-between items-center p-3">
          <div><p className="font-bold text-[16px]">_sankar_ool_</p><p className="text-[13px] text-zinc-300">Made with Edits</p></div>
          <div className="text-2xl">═</div>
        </div>

        <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),900)}} className="relative w-full aspect-[9/14] bg-zinc-900">
          <img src="https://picsum.photos/800/1200?random=50" className="w-full h-full object-cover"/>
          {showHeart && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[140px]">❤️</span></div>}
          <div className="absolute top-1/2 left-0 right-0 text-center -translate-y-1/2">
            <p className="text-white font-bold text-[24px] drop-shadow-lg">Don't express feeling to everyone<br/>💯👍</p>
          </div>
        </div>
      </div>

      {/* BOTTOM - FULL SCREEN GIANT ICONS - Like your screenshot */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-300 flex justify-around items-center h-[85px] w-full">
        <button onClick={()=>setTab("home")} className="flex-1 flex justify-center">
          <svg width="38" height="38" viewBox="0 0 24 24" fill={tab==="home"?"black":"none"} stroke="black" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <button className="flex-1 flex justify-center">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
        </button>
        <button className="flex-1 flex justify-center">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
        <button className="flex-1 flex justify-center">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button className="flex-1 flex justify-center">
          <div className="w-[38px] h-[38px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[14px]">M</div>
        </button>
      </div>
    </div>
  );
}
