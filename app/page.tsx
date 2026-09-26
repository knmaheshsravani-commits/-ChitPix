"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [threads, setThreads] = useState<any[]>([
    {id:1, user:"knmahesh30", text:"Welcome to ChitPix! 🔥 Final Version!", likes:5, liked:false, time:"2h ago"},
    {id:2, user:"knmahesh30", text:"Hii friends, ela unnaru?", likes:2, liked:false, time:"1h ago"},
  ]);
  const [profilePic, setProfilePic] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const username = "knmahesh30";

  // PERMANENT SAVE - IDHE FIX!
  useEffect(() => {
    const savedPic = localStorage.getItem("chitpix_profile_pic");
    if(savedPic) setProfilePic(savedPic);

    const savedThreads = localStorage.getItem("chitpix_threads");
    if(savedThreads) setThreads(JSON.parse(savedThreads));
  }, []);

  useEffect(() => {
    if(profilePic) localStorage.setItem("chitpix_profile_pic", profilePic);
  }, [profilePic]);

  useEffect(() => {
    localStorage.setItem("chitpix_threads", JSON.stringify(threads));
  }, [threads]);

  const toggleLike = (id:any) => {
    setThreads(prev => prev.map(t => {
      if(t.id === id){
        return {...t, liked:!t.liked, likes: t.liked? t.likes - 1 : t.likes + 1}
      }
      return t;
    }));
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {tab === "home" && (
        <div className="w-full bg-white min-h-screen pb-24">
          <div className="bg-white p-4 flex justify-between items-center border-b sticky top-0 z-10">
            <h1 className="font-black text-3xl" style={{background:"linear-gradient(135deg,#7B2FFF,#FF3CAC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
            <button onClick={()=>setShowCreate(true)} className="w-10 h-10 rounded-full bg-black text-white text-2xl">+</button>
          </div>
          <div className="w-full">
            {threads.map((t)=>(
              <div key={t.id} className="bg-white border-b border-gray-100">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black flex items-center justify-center">
                    {t.user===username && profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span className="text-white font-bold">{t.user[0].toUpperCase()}</span>}
                  </div>
                  <div><p className="font-bold text-black">@{t.user}</p><p className="text-xs text-gray-500">{t.time}</p></div>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-[17px] text-black">{t.text}</p>
                  <div className="flex gap-6 mt-4 items-center">
                    <button onClick={()=>toggleLike(t.id)} className="flex items-center gap-1 text-[30px] active:scale-125 transition">{t.liked? "❤️" : "🤍"}<span className="text-sm font-bold text-black">{t.likes}</span></button>
                    <button className="text-[26px]">💬</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div className="w-full bg-white min-h-screen pb-24 flex flex-col items-center p-5">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black bg-gray-100 mt-6 flex items-center justify-center">
            {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-black">K</span>}
          </div>
          <h2 className="font-black text-2xl mt-4 text-black">@{username}</h2>
          <p className="text-sm text-green-600 mt-1 font-bold">{profilePic? "✅ Photo Saved!" : ""}</p>

          <label className="mt-6 bg-black text-white px-10 py-3.5 rounded-full text-base font-bold cursor-pointer active:scale-95 transition">
            📷 {profilePic? "Photo Marchu" : "Add Photo"}
            <input type="file" accept="image/*" hidden onChange={(e)=>{
              const file = e.target.files?.[0];
              if(file){
                const reader = new FileReader();
                reader.onload = (ev) => setProfilePic(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </label>

          {profilePic && (
            <button onClick={()=>{ setProfilePic(""); localStorage.removeItem("chitpix_profile_pic"); }} className="mt-3 text-sm text-red-500 underline">Remove Photo</button>
          )}

          <div className="grid grid-cols-2 gap-3 w-full mt-8">
            {threads.map(t=>(
              <div key={t.id} className="h-36 bg-gray-100 rounded-xl flex items-center justify-center text-sm p-3 text-black font-bold text-center border">{t.text.slice(0,60)}</div>
            ))}
          </div>
        </div>
      )}

      {tab === "search" && (
        <div className="w-full bg-white min-h-screen p-5 pb-24">
          <div className="flex items-center gap-3 bg-gray-200 rounded-full px-5 py-4">
            <span className="text-2xl">⌕</span>
            <input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="Search..." className="bg-transparent outline-none w-full text-lg text-black" />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black flex justify-around items-center py-4 z-50">
        <button onClick={()=>setTab("home")} className={`text-[60px] ${tab==="home"?"text-black":"text-gray-600"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[60px] ${tab==="search"?"text-black":"text-gray-600"}`}>⌕</button>
        <button onClick={()=>setShowCreate(true)} className="w-14 h-14 rounded-full bg-black text-white text-3xl font-bold">+</button>
        <button className="text-[60px]">♡</button>
        <button onClick={()=>setTab("profile")} className="w-11 h-11 rounded-full overflow-hidden border-[6px] border-black bg-white">
          {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black text-white flex items-center justify-center font-bold">K</div>}
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[60]">
          <div className="bg-white w-full rounded-t-[24px] p-6 pb-10">
            <div className="flex justify-between mb-4"><span className="font-black text-xl text-black">Create Post</span><button onClick={()=>setShowCreate(false)} className="text-2xl">✕</button></div>
            <textarea value={newText} onChange={(e)=>setNewText(e.target.value)} placeholder="Em rayali?" className="w-full border-2 rounded-xl p-4 h-32 text-lg text-black"></textarea>
            <button onClick={()=>{ if(newText){ setThreads([{id:Date.now(), user:username, text:newText, likes:0, liked:false, time:"now"},...threads]); setNewText(""); setShowCreate(false); setTab("home"); } }} className="w-full bg-black text-white py-4 rounded-full mt-4 font-bold">Post 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}
