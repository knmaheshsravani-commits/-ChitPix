"use client";
import { useState } from "react";

export default function PostCard({ post }: any) {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [comments, setComments] = useState(["Super pic bro! 🔥"]);
  const [newComment, setNewComment] = useState("");

  const handleDoubleClick = () => {
    setLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
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

      {/* PEDDAGA COMMENT */}
      <div className="p-3">
        <p className="text-sm font-bold mb-2">{comments.length} comments</p>
        {comments.map((c,i)=>(
          <p key={i} className="text-sm mb-1"><span className="font-bold">you: </span>{c}</p>
        ))}
      </div>

      <div className="flex gap-2 p-3 border-t border-zinc-800">
        <input
          value={newComment}
          onChange={(e)=>setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
        />
        <button
          onClick={()=>{
            if(newComment.trim()){ setComments([...comments, newComment]); setNewComment(""); }
          }}
          className="text-blue-500 font-bold text-sm"
        >
          Post
        </button>
      </div>
    </div>
  );
}
