"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [threads, setThreads] = useState<any[]>([
    {id:1, user:"knmahesh30", text:"Welcome to ChitPix! 🔥", likes:5, time:"2h ago", image:""},
  ]);
  const [profilePic, setProfilePic] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const username = "knmahesh30";

  const likePost = (id:any) => {
    setThreads(threads.map(t=> t.id===id? {...t, likes:(t.likes||0)+1} : t));
  };

  return (
    <div className="max-w-[430px] mx-auto bg-white min-h-screen relative">
      {/* HOME TAB */}
      {tab === "home" && (
        <div className="bg-gray-50 min-h-screen pb-20">
          <div className="bg-white p-3 flex justify-between items-center border-b sticky top-0 z-10">
            <h1 className="font-black text-xl" style={{background:"linear-gradient(135deg,#7B2FFF,#FF3CAC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
            <div className="flex gap-3">
              <button onClick={()=>setShowCreate(true)} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">+</button>
              <button className="text-xl">✈</button>
            </div>
          </div>

          <div className="bg-white p-3 flex gap-3 overflow-x-auto border-b">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">K</span>}
                </div>
              </div>
              <span className="text-[10px] mt-1">Your story</span>
            </div>
            {["user1","user2","user3","user4"].map(u=>(
              <div key={u} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                <span className="text-[10px] mt-1">{u}</span>
              </div>
            ))}
          </div>

          <div>
            {threads.map((t)=>(
              <div key={t.id} className="bg-white mb-2 border-b">
                <div className="p-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">{t.user[0].toUpperCase()}</div>
                  <span className="font-bold text-sm">@{t.user}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{t.time || "just now"}</span>
                </div>
                {t.image && <img src={t.image} className="w-full max-h-[400px] object-cover" />}
                <div className="p-3">
                  <div className="flex gap-4 text-xl mb-2">
                    <button onClick={()=>likePost(t.id)}>❤️ {t.likes || 0}</button>
                    <button>💬 0</button>
                    <button className="ml-auto">↗</button>
                  </div>
                  <p className="text-sm"><span className="font-bold">@{t.user}</span> {t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {tab === "search" && (
        <div className="p-4 bg-white min-h-screen pb-20">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <span>⌕</span>
            <input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="Search..." className="bg-transparent outline-none w-full text-sm" />
          </div>
          <div className="mt-4">
            {threads.filter(t=> t.text.toLowerCase().includes(searchQ.toLowerCase())).map(t=>(
              <div key={t.id} className="p-3 border-b"><span className="font-bold text-sm">@{t.user}</span> - <span className="text-sm">{t.text}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="p-4 bg-white min-h-screen pb-20 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 bg-gray-200 mt-6">
            {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">K</div>}
          </div>
          <h2 className="font-bold mt-3">@{username}</h2>
          <label className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm cursor-pointer">
            📷 Photo Marchu
            <input type="file" accept="image/*" hidden onChange={(e)=>{
              const f=e.target.files[0];
              if(f){ const r=new FileReader(); r.onload=(ev)=>setProfilePic(ev.target.result as string); r.readAsDataURL(f); }     
          </label>
          <div className="grid grid-cols-3 gap-1 w-full mt-8">
            {threads.filter(t=>t.user===username).map(t=>(
              <div key={t.id} className="h-28 bg-gray-100 rounded flex items-center justify-center text-[10px] p-1 text-black font-bold">
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAV - Idi marchipoku bro! */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t flex justify-around items-center py-3 z-20">
        <button onClick={()=>setTab("home")} className={`text-2xl ${tab==="home"?"text-black":"text-gray-400"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-2xl ${tab==="search"?"text-black":"text-gray-400"}`}>⌕</button>
        <button onClick={()=>setShowCreate(true)} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">+</button>
        <button className="text-2xl text-gray-400">♡</button>
        <button onClick={()=>setTab("profile")} className="w-8 h-8 rounded-full overflow-hidden border-2 border-black">
          {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black text-white flex items-center justify-center text-xs">K</div>}
        </button>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-[430px] rounded-t-2xl p-4">
            <div className="flex justify-between mb-3"><span className="font-bold">Create Post</span><button onClick={()=>setShowCreate(false)}>X</button></div>
            <textarea value={newText} onChange={(e)=>setNewText(e.target.value)} placeholder="Em rayali bro?" className="w-full border rounded p-2 h-24"></textarea>
            <button onClick={()=>{ if(newText){ setThreads([{id:Date.now(), user:username, text:newText, likes:0, time:"now"},...threads]); setNewText(""); setShowCreate(false); setTab("home"); } }} className="w-full bg-black text-white py-2 rounded-full mt-3">Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
