"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [threads, setThreads] = useState<any[]>([
    {id:1, user:"knmahesh30", text:"Welcome to ChitPix! 🔥 Full Screen Ready!", likes:5, time:"2h ago"},
    {id:2, user:"knmahesh30", text:"Hii friends, ela unnaru?", likes:2, time:"1h ago"},
  ]);
  const [profilePic, setProfilePic] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const username = "knmahesh30";

  return (
    <div className="w-full min-h-screen bg-white">

      {/* HOME - FULL WHITE */}
      {tab === "home" && (
        <div className="w-full bg-white min-h-screen pb-24">
          <div className="bg-white p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
            <h1 className="font-black text-3xl tracking-tight" style={{background:"linear-gradient(135deg,#7B2FFF,#FF3CAC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
            <div className="flex gap-5 items-center">
              <button onClick={()=>setShowCreate(true)} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-2xl">+</button>
              <button className="text-3xl">✈️</button>
            </div>
          </div>

          <div className="w-full">
            {threads.map((t)=>(
              <div key={t.id} className="bg-white border-b border-gray-100 w-full">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-bold">{t.user[0].toUpperCase()}</div>
                  <div>
                    <p className="font-bold text-base text-black">@{t.user}</p>
                    <p className="text-xs text-gray-500">{t.time}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-[17px] text-black leading-6">{t.text}</p>
                  <div className="flex gap-6 text-2xl mt-4">
                    <button onClick={()=>setThreads(threads.map(x=> x.id===t.id? {...x, likes:x.likes+1}:x))}>❤️ <span className="text-sm">{t.likes}</span></button>
                    <button>💬</button>
                    <button>🔗</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "search" && (
        <div className="w-full bg-white min-h-screen p-5 pb-24">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-5 py-4">
            <span className="text-2xl">⌕</span>
            <input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="Search ChitPix..." className="bg-transparent outline-none w-full text-lg text-black" />
          </div>
          <div className="mt-6">
            {threads.filter(t=> t.text.toLowerCase().includes(searchQ.toLowerCase())).map(t=>(
              <div key={t.id} className="p-4 border-b text-black text-base"><span className="font-bold">@{t.user}</span> - {t.text}</div>
            ))}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div className="w-full bg-white min-h-screen p-5 pb-24 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-black bg-gray-100 mt-8">
            {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold">K</div>}
          </div>
          <h2 className="font-black text-2xl mt-4 text-black">@{username}</h2>
          <label className="mt-5 bg-black text-white px-8 py-3 rounded-full text-base font-bold cursor-pointer">
            📷 Photo add
            <input type="file" accept="image/*" hidden onChange={(e)=>{
              const f=e.target.files?.[0];
              if(f){ const r=new FileReader(); r.onload=(ev)=>setProfilePic(ev.target?.result as string); r.readAsDataURL(f); }
            }} />
          </label>
          <div className="grid grid-cols-3 gap-2 w-full mt-10">
            {threads.map(t=>(
              <div key={t.id} className="h-32 bg-gray-100 rounded-xl flex items-center justify-center text-sm p-2 text-black font-bold text-center border">{t.text.slice(0,40)}</div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAV - PEDDA ICONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black flex justify-around items-center py-4 z-50">
        <button onClick={()=>setTab("home")} className={`text-[52px] ${tab==="home"?"text-black scale-125":"text-gray-600"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[52px] ${tab==="search"?"text-black scale-125":"text-gray-600"}`}>⌕</button>
        <button onClick={()=>setShowCreate(true)} className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">+</button>
        <button className="text-[52px] text-gray-600">♡</button>
        <button onClick={()=>setTab("profile")} className="w-11 h-11 rounded-full overflow-hidden border-[3px] border-black">
          {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black text-white flex items-center justify-center text-sm font-bold">K</div>}
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[60]">
          <div className="bg-white w-full rounded-t-[24px] p-6 pb-10">
            <div className="flex justify-between mb-4"><span className="font-black text-xl text-black">Create Post</span><button onClick={()=>setShowCreate(false)} className="text-2xl">✕</button></div>
            <textarea value={newText} onChange={(e)=>setNewText(e.target.value)} placeholder="Em rayali bro?" className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 text-lg text-black outline-none"></textarea>
            <button onClick={()=>{ if(newText){ setThreads([{id:Date.now(), user:username, text:newText, likes:0, time:"now"},...threads]); setNewText(""); setShowCreate(false); setTab("home"); } }} className="w-full bg-black text-white py-4 rounded-full mt-4 text-lg font-bold">Post Chey 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}
