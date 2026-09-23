"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("profile");
  const [search, setSearch] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState("Kn Mahesh");
  const [username, setUsername] = useState("knmahesh30");

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {tab === "home" && (
        <div className="max-w-[600px] mx-auto p-5">
          <h1 className="text-2xl font-bold">Home</h1>
          <p className="text-zinc-500 mt-2">Home feed coming soon...</p>
        </div>
      )}

      {tab === "search" && (
        <div className="max-w-[600px] mx-auto p-5">
          <h1 className="text-2xl font-bold">Search</h1>
        </div>
      )}

      {tab === "reels" && (
        <div className="max-w-[600px] mx-auto p-5">
          <h1 className="text-2xl font-bold">Reels</h1>
        </div>
      )}

      {tab === "profile" && (
        <div className="max-w-[600px] mx-auto p-5">
          <div className="flex justify-between">
            <span>📊</span>
            <div className="flex gap-3"><span>🔍</span><span>📷</span><span>⚙️</span></div>
          </div>

          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-[32px] font-bold leading-tight">{name}</h1>
              <p>{username}</p>
              <div className="mt-3 border border-dashed rounded-full px-4 py-1 text-sm text-zinc-500 w-fit">+ Add interests</div>
              <p className="mt-4 text-zinc-500 text-sm">0 followers</p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl">M</div>
              <div className="absolute bottom-0 left-0 w-7 h-7 bg-white border rounded-full flex items-center justify-center">+</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEdit(true)} className="flex-1 border rounded-xl py-2.5 font-semibold">Edit profile</button>
            <button className="flex-1 border rounded-xl py-2.5 font-semibold">Share profile</button>
          </div>

          <h3 className="font-bold mt-8 mb-3">Suggested for you</h3>
          <div className="flex gap-3 overflow-x-auto">
            <div className="min-w-[180px] bg-zinc-100 rounded-2xl p-4 text-center">
              <img src="https://i.pravatar.cc/100?img=8" className="w-14 h-14 rounded-full mx-auto" />
              <p className="font-bold mt-2">KTR</p>
              <p className="text-xs text-zinc-500">ktrtrs</p>
              <button className="bg-black text-white w-full rounded-xl py-2 mt-3 text-sm">Follow</button>
            </div>
            <div className="min-w-[180px] bg-zinc-100 rounded-2xl p-4 text-center">
              <img src="https://i.pravatar.cc/100?img=5" className="w-14 h-14 rounded-full mx-auto" />
              <p className="font-bold mt-2">Sandeep</p>
              <p className="text-xs text-zinc-500">vangaism</p>
              <button className="bg-black text-white w-full rounded-xl py-2 mt-3 text-sm">Follow</button>
            </div>
          </div>

          <div className="flex border-b mt-6 text-sm">
            <div className="flex-1 py-3 text-center font-bold border-b-2 border-black">Threads</div>
            <div className="flex-1 py-3 text-center text-zinc-400">Replies</div>
            <div className="flex-1 py-3 text-center text-zinc-400">Media</div>
            <div className="flex-1 py-3 text-center text-zinc-400">Reposts</div>
          </div>
          <p className="text-center text-zinc-400 mt-10 text-sm">No threads yet</p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-xl">
        <button onClick={() => setTab("home")}>🏠</button>
        <button onClick={() => setTab("search")}>🔍</button>
        <button onClick={() => setTab("reels")}>🎬</button>
        <button onClick={() => setTab("profile")} className="text-blue-600">👤</button>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Edit profile</h2>
              <button onClick={() => setShowEdit(false)} className="text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-zinc-500">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="border rounded-xl px-3 py-2 outline-none" />
              <label className="text-sm text-zinc-500 mt-2">Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} className="border rounded-xl px-3 py-2 outline-none" />
              <button onClick={()=>setShowEdit(false)} className="bg-black text-white rounded-xl py-3 mt-4 font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
