"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [threads, setThreads] = useState<any[]>([
    {id:1, user:"knmahesh30", text:"Hi friends My New app use me all", likes:0, liked:false, time:"now"},
    {id:2, user:"knmahesh30", text:"Welcome to ChitPix! 🔥 Final Version!", likes:5, liked:false, time:"2h ago"},
    {id:3, user:"knmahesh30", text:"Hii friends, ela unnaru?", likes:3, liked:true, time:"1h ago"},
  ]);
  const [profilePic, setProfilePic] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const username = "knmahesh30";

  useEffect(() => {
    const savedPic = localStorage.getItem("chitpix_profile_pic");
    if(savedPic) setProfilePic(savedPic);
    const savedThreads = localStorage.getItem("chitpix_threads_v4");
    if(savedThreads) setThreads(JSON.parse(savedThreads));
  }, []);
  useEffect(() => { if(profilePic) localStorage.setItem("chitpix_profile_pic", profilePic); }, [profilePic]);
  useEffect(() => { localStorage.setItem("chitpix_threads_v4", JSON.stringify(threads)); }, [threads]);

  const toggleLike = (id:any) => {
    setThreads(prev => prev.map(t => t.id===id? {...t, liked:!t.liked, likes: t.liked? t.likes-1 : t.likes+1} : t));
  };

  const sharePost = (text:any) => {
    if (navigator.share) {
      navigator.share({ title: "ChitPix", text: text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert("✅ Copied! Share chey bro: " + text);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-black">

      {tab === "home" && (
        <div className="w-full bg-white min-h-screen pb-28">
          <div className="bg-white p-4 flex justify-between items-center border-b sticky top-0 z-10">
            <h1 className="font-black text-3xl" style={{background:"linear-gradient(135deg,#7B2FFF,#FF3CAC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
            <button onClick={()=>setShowCreate(true)} className="w-10 h-10 rounded-full bg-black text-white text-2xl font-bold">+</button>
          </div>

          {threads.map((t)=>(
            <div key={t.id} className="bg-white border-b border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border">
                  {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black text-white flex items-center justify-center font-bold">{t.user[0].toUpperCase()}</div>}
                </div>
                <div><p className="font-bold text-sm">@{t.user}</p><p className="text-[11px] text-gray-500">{t.time}</p></div>
              </div>
              <p className="text-[15px] leading-6 mb-3">{t.text}</p>

              {/* ANNI 3 OPTIONS - LOVE + COMMENT + SHARE */}
              <div className="flex gap-5 items-center">
                <button onClick={()=>toggleLike(t.id)} className="flex items-center gap-1.5 text-[24px] active:scale-125 transition">
                  {t.liked? "❤️" : "🤍"} <span className="text-[14px] font-bold">{t.likes}</span>
                </button>
                <button className="text-[22px]">💬</button>
                <button onClick={()=>sharePost(t.text)} className="text-[22px] ml-2">↗️ Share</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "profile" && (
        <div className="w-full bg-white min-h-screen pb-28 flex flex-col items-center p-5">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black bg-gray-100 mt-6 flex items-center justify-center">
            {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span className="text-5xl font-black">K</span>}
          </div>
          <h2 className="font-black text-2xl mt-4">@{username}</h2>
          <label className="mt-6 bg-black text-white px-10 py-3.5 rounded-full font-bold cursor-pointer">
            📷 {profilePic? "Photo Marchu" : "Add Photo"}
            <input type="file" accept="image/*" hidden onChange={(e)=>{
              const file=e.target.files?.[0];
              if(file){ const r=new FileReader(); r.onload=(ev)=>setProfilePic(ev.target?.result as string); r.readAsDataURL(file); }
            }} />
          </label>
          <div className="grid grid-cols-2 gap-3 w-full mt-8">
            {threads.map(t=><div key={t.id} className="h-28 bg-gray-100 rounded-xl p-3 text-sm font-bold border text-center flex items-center justify-center">{t.text.slice(0,50)}</div>)}
          </div>
        </div>
      )}

      {tab === "search" && (
        <div className="w-full bg-white min-h-screen p-5 pb-28">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-5 py-4">
            <span className="text-2xl">⌕</span>
            <input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="Search..." className="bg-transparent outline-none w-full text-lg" />
          </div>
        </div>
      )}

      {tab === "likes" && (
        <div className="w-full bg-white min-h-screen p-5 pb-28">
          <h2 className="font-black text-2xl">Liked Posts ❤️</h2>
          <div className="mt-5">
            {threads.filter(t=>t.liked).map(t=><div key={t.id} className="p-4 border-b">@{t.user}: {t.text} - ❤️ {t.likes}</div>)}
            {threads.filter(t=>t.liked).length===0 && <p className="text-gray-500 mt-10 text-center">Inka love kottalevu bro!</p>}
          </div>
        </div>
      )}

      {/* BOTTOM NAV - 5 ICONS ANNI UNNAYI */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black flex justify-around items-center py-4 z-50">
        <button onClick={()=>setTab("home")} className={`text-[32px] ${tab==="home"?"text-black":"text-gray-400"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[30px] ${tab==="search"?"text-black":"text-gray-400"}`}>⌕</button>
        <button onClick={()=>setShowCreate(true)} className="w-14 h-14 rounded-full bg-black text-white text-3xl font-bold">+</button>
        <button onClick={()=>setTab("likes")} className={`text-[30px] ${tab==="likes"?"text-black":"text-gray-400"}`}>♡</button>
        <button onClick={()=>setTab("profile")} className="w-11 h-11 rounded-full overflow-hidden border-[3px] border-black">
          {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black text-white flex items-center justify-center font-bold">K</div>}
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[60]">
          <div className="bg-white w-full rounded-t-[24px] p-6 pb-10">
            <div className="flex justify-between mb-4"><span className="font-black text-xl">Create Post</span><button onClick={()=>setShowCreate(false)} className="text-2xl">✕</button></div>
            <textarea value={newText} onChange={(e)=>setNewText(e.target.value)} placeholder="Em rayali?" className="w-full border-2 rounded-xl p-4 h-32 text-lg outline-none"></textarea>
            <button onClick={()=>{ if(newText){ setThreads([{id:Date.now(), user:username, text:newText, likes:0, liked:false, time:"now"},...threads]); setNewText(""); setShowCreate(false); setTab("home"); } }} className="w-full bg-black text-white py-4 rounded-full mt-4 font-bold">Post 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}
