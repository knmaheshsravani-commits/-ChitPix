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
  const [newThread, setNewThread] = useState("");
  const [threads, setThreads] = useState<{id:number, text:string, likes:number, liked:boolean}[]>([]);

  const addThread = () => {
    if(!newThread.trim()) return;
    setThreads([{id: Date.now(), text: newThread, likes: 0, liked: false},...threads]);
    setNewThread(""); setShowCreate(false);
  }

  const toggleLike = (id:number) => {
    setThreads(threads.map(t => t.id===id? {...t, liked:!t.liked, likes: t.liked? t.likes-1 : t.likes+1} : t));
  }

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
              <h1 className="text-[32px] font-bold">{name}</h1>
              <p className="text-zinc-600">{username}</p>
              <div className="mt-3 border border-dashed rounded-full px-4 py-1 text-sm text-zinc-500 w-fit">+ Add interests</div>
              <p className="mt-4 text-zinc-500 text-sm">{threads.length} threads • 0 followers</p>
            </div>
            <div className="relative">
              {photo? <img src={photo} className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl">M</div>}
              <button onClick={() => setShowCamera(true)} className="absolute bottom-0 left-0 w-7 h-7 bg-white border rounded-full flex items-center justify-center text-sm">+</button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEdit(true)} className="flex-1 border rounded-xl py-2.5 font-semibold">Edit profile</button>
            <button onClick={() => { if(navigator.share){ navigator.share({title: name, url: window.location.href})} else { alert("Link Copied")} }} className="flex-1 border rounded-xl py-2.5 font-semibold">Share profile</button>
          </div>

          <div className="flex border-b mt-6 text-sm">
            <div className="flex-1 py-3 text-center font-bold border-b-2 border-black">Threads</div>
            <div className="flex-1 py-3 text-center text-zinc-400">Replies</div>
            <div className="flex-1 py-3 text-center text-zinc-400">Media</div>
            <div className="flex-1 py-3 text-center text-zinc-400">Reposts</div>
          </div>

          {/* THREADS WITH LIKE BUTTON */}
          <div className="mt-4">
            {threads.length===0? <p className="text-center text-zinc-400 mt-10 text-sm">No threads yet - Click + to post</p> :
              threads.map(t => (
                <div key={t.id} className="border-b py-4 flex gap-3">
                  {photo? <img src={photo} className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">M</div>}
                  <div className="flex-1">
                    <p className="font-bold text-sm">{username} <span className="text-zinc-400 font-normal">• now</span></p>
                    <p className="mt-1">{t.text}</p>
                    <div className="flex gap-6 mt-3 text-xl">
                      <button onClick={()=>toggleLike(t.id)} className="flex items-center gap-1">
                        <span className={t.liked? "text-red-500" : ""}>{t.liked? "❤️" : "🤍"}</span>
                        <span className="text-sm text-zinc-500">{t.likes>0? t.likes : ""}</span>
                      </button>
                      <button>💬</button>
                      <button>🔁</button>
                      <button>📤</button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {tab === "home" && (
        <div className="max-w-[600px] mx-auto p-5 mt-4">
          <h1 className="text-2xl font-bold mb-4">Home</h1>
          {threads.length===0? <p className="text-zinc-500">No posts yet</p> :
            threads.map(t => (
              <div key={t.id} className="border rounded-2xl p-4 mb-3">
                <p className="font-bold text-sm">{name}</p>
                <p className="mt-1">{t.text}</p>
                <button onClick={()=>toggleLike(t.id)} className="mt-3 flex gap-1 items-center">
                  <span className={t.liked? "text-red-500" : ""}>{t.liked? "❤️" : "🤍"}</span>
                  <span className="text-sm">{t.likes} likes</span>
                </button>
              </div>
            ))
          }
        </div>
      )}

      {tab === "search" && <div className="p-10 text-center mt-20"><h1 className="text-2xl font-bold">Search</h1></div>}
      {tab === "reels" && <div className="p-10 text-center mt-20"><h1 className="text-2xl font-bold">Activity</h1><p className="text-zinc-500 mt-2">{threads.reduce((a,b)=>a+b.likes,0)} total likes</p></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-2xl z-40">
        <button onClick={() => setTab("home")}>🏠</button>
        <button onClick={() => setTab("search")}>🔍</button>
        <button onClick={() => setShowCreate(true)} className="bg-black text-white w-9 h-9 rounded-xl flex items-center justify-center text-xl">+</button>
        <button onClick={() => setTab("reels")}>❤️</button>
        <button onClick={() => setTab("profile")}>👤</button>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Edit profile</h2><button onClick={()=>setShowEdit(false)}>✕</button></div>
            <input value={name} onChange={e=>setName(e.target.value)} className="border rounded-xl px-3 py-2 w-full mb-3" />
            <input value={username} onChange={e=>setUsername(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />
            <button onClick={()=>setShowEdit(false)} className="bg-black text-white rounded-xl py-3 mt-4 w-full">Save</button>
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
            <div className="p-3 bg-zinc-100 rounded-xl">Privacy</div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <div className="flex justify-between mb-4"><h2 className="font-bold">New Thread</h2><button onClick={()=>setShowCreate(false)}>✕</button></div>
            <textarea value={newThread} onChange={e=>setNewThread(e.target.value)} placeholder="What's new?" className="border rounded-xl w-full p-3 h-24"></textarea>
            <button onClick={addThread} className="bg-black text-white w-full rounded-xl py-3 mt-3 font-semibold">Post</button>
          </div>
        </div>
      )}
    </div>
  );
      }
