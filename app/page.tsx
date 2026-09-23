"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("profile");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {tab === "home" && (
        <div className="max-w-[600px] mx-auto p-5">
          <h1 className="text-2xl font-bold">Home 🏠</h1>
          <p className="mt-2 text-zinc-500">Posts ikkada vastayi</p>
        </div>
      )}

      {tab === "search" && (
        <div className="max-w-[600px] mx-auto">
          <div className="p-3 border-b">
            <div className="flex items-center bg-zinc-100 rounded-full px-4 py-2">
              <span className="mr-2">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="bg-transparent outline-none flex-1"
              />
            </div>
          </div>
          <p className="p-5 text-zinc-500">Search results...</p>
        </div>
      )}

      {tab === "reels" && (
        <div className="h-[80vh] flex items-center justify-center text-xl">Reels 🎬</div>
      )}

      {tab === "profile" && (
        <div className="max-w-[600px] mx-auto bg-white px-4 pt-2">
          <div className="flex justify-between items-center py-3 text-2xl">
            <span>📊</span>
            <div className="flex gap-5"><span>🔍</span><span>📷</span><span>⚙️</span></div>
          </div>

          <div className="flex justify-between items-start mt-2">
            <div>
              <h1 className="text-[32px] font-bold leading-tight">Kn Mahesh</h1>
              <p>knmahesh30</p>
              <div className="mt-3 border border-dashed rounded-full px-4 py-1 text-sm text-zinc-500 w-fit">+ Add interests</div>
              <p className="mt-4 text-zinc-500 text-sm">0 followers</p>
            </div>
            <div className="relative">
              <div className="w-[80px] h-[80px] rounded-full bg-black text-white flex items-center justify-center text-3xl">M</div>
              <div className="absolute -left-2 bottom-0 bg-white border rounded-full w-8 h-8 flex items-center justify-center">+</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 border rounded-xl py-2.5 font-semibold">Edit profile</button>
            <button className="flex-1 border rounded-xl py-2.5 font-semibold">Share profile</button>
          </div>

          <h2 className="font-bold text-[18px] mt-8 mb-3">Suggested for you</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="min-w-[180px] bg-zinc-100 rounded-2xl p-4 flex flex-col items-center">
              <img src="https://i.pravatar.cc/100?img=1" className="w-16 h-16 rounded-full" alt="" />
              <p className="font-bold mt-2">KTR</p>
              <p className="text-xs text-zinc-500">ktrtrs</p>
              <button className="bg-black text-white w-full rounded-xl py-2 mt-3 text-sm font-semibold">Follow</button>
            </div>
            <div className="min-w-[180px] bg-zinc-100 rounded-2xl p-4 flex flex-col items-center">
              <img src="https://i.pravatar.cc/100?img=5" className="w-16 h-16 rounded-full" alt="" />
              <p className="font-bold mt-2">Sandeep</p>
              <p className="text-xs text-zinc-500">vangaism</p>
              <button className="bg-black text-white w-full rounded-xl py-2 mt-3 text-sm font-semibold">Follow</button>
            </div>
          </div>

          <div className="flex border-b mt-6 text-zinc-400 font-semibold text-sm">
            <div className="flex-1 py-3 text-black border-b-2 border-black text-center">Threads</div>
            <div className="flex-1 py-3 text-center">Replies</div>
            <div className="flex-1 py-3 text-center">Media</div>
            <div className="flex-1 py-3 text-center">Reposts</div>
          </div>
          <p className="text-center text-zinc-400 mt-10">No threads yet</p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 text-2xl">
        <button onClick={() => setTab("home")} className={tab==="home"?"":"opacity-40"}>🏠</button>
        <button onClick={() => setTab("search")} className={tab==="search"?"":"opacity-40"}>🔍</button>
        <button onClick={() => setTab("reels")} className={tab==="reels"?"":"opacity-40"}>🎬</button>
        <button onClick={() => setTab("profile")} className={tab==="profile"?"":"opacity-40"}>👤</button>
      </div>
    </div>
  );
}
