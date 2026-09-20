"use client";
import { useState } from "react";

function PostCard({ post }: any) {
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
    <div className="w-full bg-black border border-zinc-800 rounded-xl overflow-hidden mb-4">
      <div onDoubleClick={handleDoubleClick} className="relative w-full aspect-square bg-zinc-900 overflow-hidden">
        <img src={post.image} className="w-full h-full object-cover" />
        {showHeart && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[120px] animate-bounce">❤️</span></div>}
      </div>

      {/* PEDDAGA ICONS - 32px */}
      <div className="p-4 flex gap-5 items-center">
        <button onClick={() => setLiked(!liked)} className="active:scale-125 transition-all">
          {liked? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF3040"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.35l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          )}
        </button>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </div>

      <div className="px-4 pb-2">
        <p className="text-[15px] font-bold mb-2">{comments.length} comments</p>
        {comments.map((c,i)=>(<p key={i} className="text-[15px] mb-1"><span className="font-bold">you: </span>{c}</p>))}
      </div>
      <div className="flex gap-2 p-4 border-t border-zinc-800">
        <input value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-zinc-500"/>
        <button onClick={()=>{ if(newComment.trim()){ setComments([...comments, newComment]); setNewComment(""); } }} className="text-blue-500 font-bold text-[15px]">Post</button>
      </div>
    </div>
  );
}

export default function Page() {
  const posts = [
    { id: 1, image: "https://picsum.photos/800?random=10" },
    { id: 2, image: "https://picsum.photos/800?random=11" },
    { id: 3, image: "https://picsum.photos/800?random=12" },
  ];
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 border-b border-zinc-800 text-center font-bold text-xl">ChitPix</header>
      <main className="max-w-[470px] mx-auto pt-4 px-2">
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </main>
    </div>
  );
}
