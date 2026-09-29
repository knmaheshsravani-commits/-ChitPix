"use client";
import { useState, useRef } from "react";

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [reels, setReels] = useState([
    { id: 1, user: "aesthetic_vibes", likes: "12.4K", desc: "Sunset vibes 🌅 #aesthetic", color: "from-purple-600 to-pink-600" },
    { id: 2, user: "travel_diary", likes: "8.9K", desc: "Goa beach life 🏖️", color: "from-blue-600 to-cyan-400" },
    { id: 3, user: "food_lover", likes: "23K", desc: "Biryani time 😋🔥", color: "from-orange-600 to-red-600" },
    { id: 4, user: "nature_clicks", likes: "5.2K", desc: "Hills are calling 🏔️", color: "from-green-600 to-emerald-400" },
  ]);

  const handleLogin = () => {
    //  email  brother sister 
    if (email === "knmaheshsravani@gmail.com" && password === "Mahesh@9848#") {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert("Wrong email/password bro");
    }
  };

  const deleteReel = (id: number) => {
    if(confirm("Delete this reel?")) {
      setReels(reels.filter(r => r.id !== id));
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-xl font-black tracking-wider">ChitPix</h1>
        <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold">
          {isAdmin ? "👑 Admin - Logout" : "Login"}
        </button>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm">
            <h2 className="mb-4 font-bold text-lg">Admin Login</h2>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 mb-3 bg-black rounded-xl border border-zinc-800" />
            <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 mb-3 bg-black rounded-xl border border-zinc-800" />
            <button onClick={handleLogin} className="w-full bg-white text-black py-3 rounded-xl font-bold">Login</button>
            <button onClick={()=>setShowLogin(false)} className="w-full mt-3 text-sm text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      {/* TikTok Style Reels Container */}
      <div className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {reels.map((reel) => (
          <div key={reel.id} className={`h-screen w-screen snap-start relative flex items-end justify-center bg-gradient-to-br ${reel.color}`}>
            {/* Fake Video Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-7xl font-black opacity-20">ChitPix</h1>
            </div>

            {/* Bottom Info */}
            <div className="relative z-10 w-full p-4 pb-8 flex justify-between items-end">
              <div className="flex-1">
                <p className="font-bold text-lg">@{reel.user}</p>
                <p className="text-sm mt-1 opacity-90">{reel.desc}</p>
                <p className="text-sm mt-3 flex items-center gap-2">❤️ {reel.likes} likes</p>
                {isAdmin && (
                  <button onClick={()=>deleteReel(reel.id)} className="mt-4 bg-red-600 px-5 py-2 rounded-full text-sm font-bold">🗑️ Delete Reel</button>
                )}
              </div>

              {/* Right Side Actions like TikTok */}
              <div className="flex flex-col gap-6 items-center pb-4">
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl">❤️</div>
                  <span className="text-xs mt-1">{reel.likes}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl">💬</div>
                  <span className="text-xs mt-1">234</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl">↗️</div>
                  <span className="text-xs mt-1">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
