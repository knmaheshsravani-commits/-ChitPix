"use client";
import { useState } from "react";

export default function PostCard({ post }: any) {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    setLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
    // likePost(post.id) - nee function unte ikkada pettali
  };

  return (
    <div className="w-full max-w-[470px] mx-auto bg-black border border-zinc-800 rounded-xl overflow-hidden">
      <div onDoubleClick={handleDoubleClick} className="relative w-full aspect-square bg-zinc-900 overflow-hidden select-none cursor-pointer">
        <img src={post?.image || "https://picsum.photos/600"} className="w-full h-full object-cover" />

        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-8xl animate-ping">❤️</span>
          </div>
        )}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-7xl animate-bounce">❤️</span>
          </div>
        )}
      </div>

      <div className="p-3 flex gap-3">
        <button onClick={() => setLiked(!liked)} className="text-3xl p-1 active:scale-125 transition-transform">
          {liked? "❤️" : "🤍"}
        </button>
      </div>
    </div>
  );
}

