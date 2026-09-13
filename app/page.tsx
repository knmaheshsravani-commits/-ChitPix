"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [reels, setReels] = useState([
    { id: 1, user: "travel_lover", likes: 120, desc: "My ChitPix Reel 🔥" },
    { id: 2, user: "foodie_king", likes: 89, desc: "Holalkere vibes ❤️" },
  ]);

  useEffect(() => {
    const u = localStorage.getItem("chitpix_user");
    if (!u) {
      router.push("/login");
    } else {
      setUser(u);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("chitpix_user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Logout */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-black sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">ChitPix</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">@{user}</span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-xs font-bold">
            Logout
          </button>
        </div>
      </div>

      {/* Reels Feed */}
      <div className="max-w-[400px] mx-auto">
        {reels.map((reel) => (
          <div key={reel.id} className="h-[80vh] border-b border-gray-800 flex flex-col justify-end p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 -z-10"></div>
            <h3 className="font-bold">@{reel.user}</h3>
            <p className="text-sm opacity-80">{reel.desc}</p>
            <p className="text-sm mt-2">❤️ {reel.likes} likes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
