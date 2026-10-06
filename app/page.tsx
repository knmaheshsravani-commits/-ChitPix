"use client"
import { useState } from "react"

export default function Page() {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(20700)

  const handleLike = () => {
    if(liked){ setLikes(likes-1) } else { setLikes(likes+1) }
    setLiked(!liked)
  }

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-20 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
        <h1 className="font-extrabold text-[22px] tracking-tight">ChitPix.com</h1>
        <div className="flex gap-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21s-6.5-4.3-9-8.5A5 5 0 0112 6a5 5 0 019 6.5C18.5 16.7 12 21 12 21z"/></svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </div>
      </div>

      {/* STORIES */}
      <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b">
        <div className="flex flex-col items-center"><div className="w-[62px] h-[62px] rounded-full bg-gray-200 flex items-center justify-center text-2xl">+</div><span className="text-[12px] mt-1">Your story</span></div>
        {["user_1","user_2","sneha"].map(n=>(
          <div key={n} className="flex flex-col items-center"><div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600"><div className="w-full h-full rounded-full bg-gray-200 border-2 border-white"></div></div><span className="text-[12px] mt-1">{n}</span></div>
        ))}
      </div>

      {/* POST HEADER */}
      <div className="flex justify-between items-center px-3 py-3">
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-full"></div><span className="font-semibold text-[15px]">sneha_99</span><button className="bg-[#0095F6] text-white px-4 py-1 rounded-full text-[13px] font-semibold">Follow</button></div><span>···</span>
      </div>

      {/* POST IMAGE */}
      <div className="bg-[#F2F2F2] w-full aspect-square flex items-center justify-center text-gray-400">Post Image</div>

      {/* POST ACTIONS - PERFECT LIKE SCREENSHOT */}
      <div className="flex items-center gap-5 px-3 py-3 border-b">
        {/* LIKE - WORKING */}
        <button onClick={handleLike} className="flex items-center gap-1.5">
          <svg className={`w-[24px] h-[24px] ${liked? "fill-red-500 stroke-red-500" : "fill-none stroke-black"}`} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21s-6.5-4.3-9-8.5A5 5 0 0112 6a5 5 0 019 6.5C18.5 16.7 12 21 12 21z"/></svg>
          <span className="text-[15px] font-medium">{(likes/1000).toFixed(1)}K</span>
        </button>

        {/* COMMENT */}
        <button className="flex items-center gap-1.5">
          <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 01-12.5 7.5L3 21l2-5.5A8.5 8.5 0 0121 11.5z"/></svg>
          <span className="text-[15px] font-medium">2,020</span>
        </button>

        {/* REPOST */}
        <button className="flex items-center gap-1.5">
          <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          <span className="text-[15px] font-medium">558</span>
        </button>

        {/* SHARE */}
        <button className="flex items-center gap-1.5">
          <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          <span className="text-[15px] font-medium">6,710</span>
        </button>

        {/* SAVE - RIGHT SIDE */}
        <button className="ml-auto">
          <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </button>
      </div>

      <div className="px-3 py-2">
        <p className="text-[14px]"><span className="font-semibold">sneha_99</span> Non-Ka... more</p>
        <p className="text-[12px] text-gray-500 mt-1">21 hours ago</p>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t flex justify-around items-center py-3">
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M21 21l-3.5-3.5"/></svg>
        <div className="w-[28px] h-[28px] bg-black rounded-lg flex items-center justify-center"><svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.5"/><path d="M10 8l6 4-6 4V8z"/></svg>
        <div className="w-[26px] h-[26px] rounded-full border-[1.8px] border-black"></div>
      </div>
    </div>
  )
}
