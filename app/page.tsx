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
          <div className="flex justify-between"><span>Stats</span><div className="flex gap-3"><button onClick={()=>setTab("search")}>Search</button><button onClick={()=>{const i=document.getElementById("file")?.click()}}>Photo</button></div></div>
          <div className="flex justify-between mt-6">
            <div><h1 className="text-3xl font-bold">Kn Mahesh</h1><p>knmahesh30</p><p className="mt-3 text-sm text-zinc-500">{threads.length} threads</p></div>
            {photo? <img src={photo} className="w-20 h-20 rounded-full" /> : <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center">M</div>}
          </div>
          <div className="mt-6">
            {threads.map(t=>(
              <div key={t.id} className="border-b py-4">
                <p>{t.text}</p>
                <button onClick={()=>toggleLike(t.id)} className={`mt-2 px-3 py-1 rounded-full border ${t.liked?"bg-black text-white":"bg-white"}`}>{t.liked?"Liked ❤️":"Like 🤍"} {t.likes}</button>
              </div>
            ))}
            {threads.length===0 && <p className="text-center text-zinc-400 mt-10">No threads yet - Click + to post</p>}
          </div>
        </div>
      )}
      {tab==="home" && <div className="max-w-[600px] mx-auto p-10"><h1 className="font-bold">Home</h1>{threads.map(t=><div key={t.id} className="border p-3 mt-3 rounded-xl"><p>{t.text}</p><button onClick={()=>toggleLike(t.id)} className="mt-2 text-sm">{t.liked?"❤️ Liked":"🤍 Like"} {t.likes}</button></div>)}</div>}
      {tab==="search" && <div className="p-10 text-center"><h1 className="font-bold">Search</h1></div>}
      {tab==="activity" && <div className="p-10 text-center"><h1 className="font-bold text-xl">Activity</h1><p className="mt-2 text-zinc-500">{threads.reduce((a,b)=>a+b.likes,0)} total likes</p></div>}

      <input id="file" type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0]; if(f) setPhoto(URL.createObjectURL(f))}} />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 text-sm font-bold z-50">
        <button onClick={()=>setTab("home")}>HOME</button>
        <button onClick={()=>setTab("search")}>SEARCH</button>
        <button onClick={()=>setShowCreate(true)} className="bg-black text-white px-5 py-2 rounded-xl">+ POST</button>
        <button onClick={()=>setTab("activity")}>LIKES</button>
        <button onClick={()=>setTab("profile")} className="text-blue-600">PROFILE</button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5">
            <h2 className="font-bold mb-3">New Thread</h2>
            <textarea value={newThread} onChange={e=>setNewThread(e.target.value)} placeholder="What's new?" className="border rounded-xl w-full p-3 h-24"></textarea>
            <button onClick={addThread} className="bg-black text-white w-full rounded-xl py-3 mt-3">Post</button>
            <button onClick={()=>setShowCreate(false)} className="w-full mt-2 py-2 border rounded-xl">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
