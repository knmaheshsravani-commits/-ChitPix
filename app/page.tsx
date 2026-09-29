"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("reels");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [reels, setReels] = useState([
    { id: 1, user: "aesthetic_vibes", likes: 12400, liked: false, desc: "Sunset vibes 🌅 #aesthetic", color: "from-purple-600 to-pink-600", following: false },
    { id: 2, user: "travel_diary", likes: 8900, liked: false, desc: "Goa beach life 🏖️ #travel", color: "from-blue-600 to-cyan-400", following: false },
    { id: 3, user: "food_lover", likes: 23000, liked: true, desc: "Biryani time 😋🔥", color: "from-orange-600 to-red-600", following: true },
  ]);

  const stories = ["Your Story", "aesthetic", "travel", "food_lover", "nature", "tech", "music"];

  const handleLogin = () => {
    // IKKADA NEE EMAIL PETTU BRO
    if (email === "mahesh@gmail.com" && password === "mahesh123") {
      setIsAdmin(true); setShowLogin(false);
    } else alert("Wrong bro");
  };

  const toggleLike = (id: number) => {
    setReels(reels.map(r => r.id === id? {...r, liked:!r.liked, likes: r.liked? r.likes - 1 : r.likes + 1 } : r));
  };

  const toggleFollow = (id: number) => {
    setReels(reels.map(r => r.id === id? {...r, following:!r.following } : r));
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-black/90 z-20">
        <h1 className="text-xl font-black">ChitPix</h1>
        <div className="flex gap-4 items-center">
          <span className="text-xl">💬</span>
          <span className="text-xl">✈️</span>
          <button onClick={() => isAdmin? setIsAdmin(false) : setShowLogin(true)} className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
            {isAdmin? "👑 Admin" : "Login"}
          </button>
        </div>
      </div>

      {/* Login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm">
            <h2 className="font-bold mb-4">Admin Login</h2>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl" />
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl" />
            <button onClick={handleLogin} className="w-full bg-white text-black py-3 rounded-xl font-bold">Login</button>
            <button onClick={()=>setShowLogin(false)} className="w-full mt-2 text-gray-400 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* HOME TAB */}
      {tab === "home" && (
        <div className="flex-1 overflow-y-scroll p-0">
          <div className="flex gap-3 p-3 overflow-x-scroll scrollbar-hide border-b border-zinc-900">
            {stories.map(s => (
              <div key={s} className="flex flex-col items-center min-w-[60px]">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs">{s[0]}</div></div>
                <span className="text-[10px] mt-1">{s}</span>
              </div>
            ))}
          </div>
          {reels.map(r => (
            <div key={r.id} className="border-b border-zinc-900 pb-3">
              <div className="flex justify-between p-3"><span className="font-bold">@{r.user}</span><button onClick={()=>toggleFollow(r.id)} className={`text-xs px-3 py-1 rounded-full ${r.following? "bg-zinc-800" : "bg-white text-black"}`}>{r.following? "Following" : "Follow"}</button></div>
              <div className={`h-[400px] bg-gradient-to-br ${r.color} flex items-center justify-center`}><span className="text-5xl font-black opacity-20">ChitPix</span></div>
              <div className="flex gap-4 p-3 text-xl"><button onClick={()=>toggleLike(r.id)}>{r.liked? "❤️" : "🤍"} </button><button>💬</button><button>↗️</button></div>
              <div className="px-3 text-sm font-bold">{r.likes.toLocaleString()} likes</div>
              <div className="px-3 text-sm">{r.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* REELS TAB - TikTok Style */}
      {tab === "reels" && (
        <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {reels.map(r => (
            <div key={r.id} className={`h-full snap-start relative bg-gradient-to-br ${r.color} flex items-end`}>
              <div className="absolute inset-0 flex items-center justify-center"><h1 className="text-6xl font-black opacity-20">ChitPix</h1></div>
              <div className="relative w-full p-4 pb-20 flex justify-between">
                <div>
                  <p className="font-bold">@{r.user} <button onClick={()=>toggleFollow(r.id)} className="ml-2 text-xs border px-2 py-0.5 rounded-full">{r.following? "Following" : "Follow"}</button></p>
                  <p className="text-sm mt-1">{r.desc}</p>
                  {isAdmin && <button onClick={()=>setReels(reels.filter(x=>x.id!==r.id))} className="mt-3 bg-red-600 px-4 py-1 rounded-full text-xs">Delete</button>}
                </div>
                <div className="flex flex-col gap-5 items-center">
                  <button onClick={()=>toggleLike(r.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">{r.liked? "❤️" : "🤍"}</div><span className="text-xs mt-1">{(r.likes/1000).toFixed(1)}K</span></button>
                  <button className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">💬</div><span className="text-xs">234</span></button>
                  <button className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">↗️</div><span className="text-xs">Share</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH / PROFILE */}
      {(tab === "search" || tab === "profile" || tab === "likes") && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-5xl mb-3">{tab==="search"? "🔍" : tab==="likes"? "❤️" : "👤"}</div>
            <p>{tab} Page Coming Soon - Reels chudu bro!</p>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="flex justify-around items-center p-3 bg-black border-t border-zinc-900 text-2xl">
        <button onClick={()=>setTab("home")} className={tab==="home"? "opacity-100" : "opacity-50"}>🏠</button>
        <button onClick={()=>setTab("search")} className={tab==="search"? "opacity-100" : "opacity-50"}>🔍</button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"? "opacity-100" : "opacity-50"}>🎬</button>
        <button onClick={()=>setTab("likes")} className={tab==="likes"? "opacity-100" : "opacity-50"}>❤️</button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"? "opacity-100" : "opacity-50"}>👤</button>
      </div>

      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none; scrollbar-width:none}`}</style>
    </div>
  );
          }
