"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("profile");
  const [showEdit, setShowEdit] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("Kn Mahesh");
  const [username, setUsername] = useState("knmahesh30");
  const [photo, setPhoto] = useState("");

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {tab === "profile" && (
        <div className="max-w-[600px] mx-auto p-5">
          <div className="flex justify-between items-center">
            <span className="text-xl">📊</span>
            <div className="flex gap-4 text-xl">
              <button onClick={() => setTab("search")}>🔍</button>
              <button onClick={() => setShowCamera(true)}>📷</button>
              <button onClick={() => setShowSettings(true)}>⚙️</button>
            </div>
          </div>

          <div className="flex justify-between items-start mt-6">
            <div>
              <h1 className="text-[32px] font-bold leading-tight">{name}</h1>
              <p className="text-zinc-600">{username}</p>
              <div className="mt-3 border border-dashed rounded-full px-4 py-1 text-sm text-zinc-500 w-fit">+ Add interests</div>
              <p className="mt-4 text-zinc-500 text-sm">0 followers</p>
            </div>
            <div className="relative">
              {photo? <img src={photo} className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl">M</div>}
              <button onClick={() => setShowCamera(true)} className="absolute bottom-0 left-0 w-7 h-7 bg-white border rounded-full flex items-center justify-center text-sm">+</button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEdit(true)} className="flex-1 border rounded-xl py-2.5 font-semibold">Edit profile</button>
            <button onClick={() => { if(navigator.share){ navigator.share({title: name, url: window.location.href})} else { alert("Link Copied: "+window.location.href)} }} className="flex-1 border rounded-xl py-2.5 font-semibold">Share profile</button>
          </div>

          <h3 className="font-bold mt-8 mb-3">Suggested for you</h3>
          <div className="flex gap-3 overflow-x-auto">
            <div className="min-w-[180px] bg-zinc-100 rounded-2xl p-4 text-center">
              <img src="https://i.pravatar.cc/100?img=8" className="w-14 h-14 rounded-full mx-auto" />
              <p className="font-bold mt-2">KTR</p><p className="text-xs text-zinc-500">ktrtrs</p>
              <button className="bg-black text-white w-full rounded-xl py-2 mt-3 text-sm">Follow</button>
            </div>
            <div className="min-w-[180px] bg-zinc-100 rounded-2xl p-4 text-center">
              <img src="https://i.pravatar.cc/100?img=5" className="w-14 h-14 rounded-full mx-auto" />
              <p className="font-bold mt-2">Sandeep</p><p className="text-xs text-zinc-500">vangaism</p>
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

      {tab === "home" && <div className="p-10 text-center mt-20"><h1 className="text-2xl font-bold">Home Feed</h1><p className="text-zinc-500">Coming soon</p></div>}
      {tab === "search" && <div className="p-10 text-center mt-20"><h1 className="text-2xl font-bold">Search</h1><input placeholder="Search" className="border rounded-xl px-4 py-2 w-full max-w-[400px] mt-4" /></div>}
      {tab === "reels" && <div className="p-10 text-center mt-20"><h1 className="text-2xl font-bold">Activity</h1></div>}

      {/* 5 ICONS BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-2xl z-40">
        <button onClick={() => setTab("home")}>🏠</button>
        <button onClick={() => setTab("search")}>🔍</button>
        <button onClick={() => setShowCreate(true)} className="bg-black text-white w-9 h-9 rounded-xl flex items-center justify-center text-xl">+</button>
        <button onClick={() => setTab("reels")}>❤️</button>
        <button onClick={() => setTab("profile")}>👤</button>
      </div>

      {/* POPUPS */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Edit profile</h2><button onClick={()=>setShowEdit(false)}>✕</button></div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border rounded-xl px-3 py-2 w-full mb-3" />
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="border rounded-xl px-3 py-2 w-full" />
            <button onClick={()=>setShowEdit(false)} className="bg-black text-white rounded-xl py-3 mt-4 w-full font-semibold">Save</button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5 text-center">
            <h2 className="font-bold mb-4">Add Photo</h2>
            <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){ setPhoto(URL.createObjectURL(f)); setShowCamera(false)} }} className="w-full" />
            <button onClick={()=>setShowCamera(false)} className="mt-4 w-full border rounded-xl py-2">Cancel</button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Settings</h2><button onClick={()=>setShowSettings(false)}>✕</button></div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="p-3 bg-zinc-100 rounded-xl">🔒 Privacy</div>
              <div className="p-3 bg-zinc-100 rounded-xl">🔔 Notifications</div>
              <div className="p-3 bg-zinc-100 rounded-xl text-red-500">Log out</div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <div className="flex justify-between mb-4"><h2 className="font-bold">New Thread</h2><button onClick={()=>setShowCreate(false)}>✕</button></div>
            <textarea placeholder="What's new?" className="border rounded-xl w-full p-3 h-24"></textarea>
            <button onClick={()=>setShowCreate(false)} className="bg-black text-white w-full rounded-xl py-3 mt-3 font-semibold">Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
