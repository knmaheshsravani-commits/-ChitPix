"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("profile");
  const [showCreate, setShowCreate] = useState(false);
  const [photo, setPhoto] = useState("");
  const [newThread, setNewThread] = useState("");
  const [threads, setThreads] = useState<any[]>([]);

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
      {tab==="profile" && (
        <div className="max-w-[600px] mx-auto p-5">
          <div className="flex justify-between items-center">
            <span className="font-bold">Stats</span>
            <div className="flex gap-4">
              <button onClick={()=>setTab("search")}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4-4"/></svg>
              </button>
              <button onClick={()=>document.getElementById("file")?.click()}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <div><h1 className="text-3xl font-bold">Kn Mahesh</h1><p>knmahesh30</p><p className="mt-3 text-sm text-zinc-500">{threads.length} threads</p></div>
            {photo? <img src={photo} className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center">M</div>}
          </div>
          <div className="mt-6">
            {threads.map(t=>(
              <div key={t.id} className="border-b py-4 flex gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm">M</div>
                <div className="flex-1">
                  <p className="font-bold text-sm">knmahesh30</p>
                  <p className="mt-1">{t.text}</p>
                  <button onClick={()=>toggleLike(t.id)} className="mt-3 flex items-center gap-1">
                    <svg width="20" height="20" fill={t.liked?"red":"none"} stroke={t.liked?"red":"currentColor"} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span className="text-sm">{t.likes>0?t.likes:""}</span>
                  </button>
                </div>
              </div>
            ))}
            {threads.length===0 && <p className="text-center text-zinc-400 mt-16">No threads yet - Click + to post</p>}
          </div>
        </div>
      )}

      {tab==="home" && <div className="p-10 text-center mt-20 font-bold">Home Feed</div>}
      {tab==="search" && <div className="p-10 text-center mt-20 font-bold">Search</div>}
      {tab==="activity" && <div className="p-10 text-center mt-20"><h1 className="font-bold text-xl">Activity</h1><p className="text-zinc-500">{threads.reduce((a,b)=>a+b.likes,0)} total likes</p></div>}

      <input id="file" type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0]; if(f) setPhoto(URL.createObjectURL(f))}} />

      {/* 5 REAL ICONS - LIKE LEKUNDA SHARE */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 z-50">
  <button onClick={()=>setTab("home")} className={tab==="home"?"text-black":"text-zinc-400"}>
    <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </button>
  <button onClick={()=>setTab("search")} className={tab==="search"?"text-black":"text-zinc-400"}>
    <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4-4"/></svg>
  </button>
  <button onClick={()=>setShowCreate(true)} className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center">
    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  </button>
  <button onClick={()=>{ if(navigator.share){ navigator.share({title:"Kn Mahesh Profile", url: window.location.href})} else { alert("Link Copied: "+window.location.href)} }} className="text-zinc-400">
    <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  </button>
  <button onClick={()=>setTab("profile")} className={tab==="profile"?"text-black":"text-zinc-400"}>
    <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </button>
</div>

      {showCreate && (
  <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4" onClick={()=>setShowCreate(false)}>
    <div className="bg-white rounded-t-[24px] sm:rounded-2xl w-full max-w-[600px] p-5" onClick={e=>e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={()=>setShowCreate(false)} className="text-zinc-500">Cancel</button>
        <h2 className="font-bold">Option 1 - New Thread</h2>
        <button onClick={addThread} className="font-bold">Post</button>
      </div>
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">M</div>
        <textarea value={newThread} onChange={e=>setNewThread(e.target.value)} placeholder="What's new?" className="flex-1 text-[16px] outline-none min-h-[100px] resize-none" autoFocus></textarea>
      </div>
      <button onClick={addThread} className="bg-black text-white w-full rounded-full py-3 mt-5 font-bold">Post</button>
    </div>
  </div>
)}
    </div>
  );
}
