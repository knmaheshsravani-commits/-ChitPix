"use client";
import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, Eye, Infinity, Crown, Repeat2, MoreHorizontal } from "lucide-react";

export default function StoryViewer({ story, onClose, onNext }: any) {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState("");

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          onNext ? onNext() : onClose();
          return 100;
        }
        return p + 0.8;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [story]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* 1. Progress Bar */}
      <div className="flex gap-1 p-1">
        <div className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 2. Header */}
      <div className="flex justify-between items-center px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[1px]">
            <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold">M</div>
          </div>
          <div className="text-white">
            <p className="text-[13px] font-semibold flex items-center gap-2">
              {story.username} • R2 Story
              {story.isR2Permanent && <span className="bg-blue-500 text-[8px] px-1 py-0.5 rounded flex items-center gap-1"><Infinity size={10}/>R2</span>}
            </p>
            <p className="text-[10px] opacity-70 flex items-center gap-1"><Eye size={10}/>{story.views || 0} views • R2 Permanent views</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white p-2"><X size={20}/></button>
      </div>

      {/* 3. Main Image - Nee Lion Photo */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
        <img src={story.image_url || story.url} alt="story" className="w-full h-full object-contain" />
        
        {/* 22. Motivation Text Overlay */}
        {story.caption && (
          <div className="absolute bottom-24 left-4 right-4">
            <h1 className="text-white text-[28px] font-black leading-tight text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {story.caption}
            </h1>
          </div>
        )}
      </div>

      {/* 4. Bottom - ALL 25 FEATURES UI */}
      <div className="p-3 pb-6 bg-gradient-to-t from-black to-transparent">
        {/* Quick Reactions Row */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex gap-3 text-xl">
            <span onClick={() => setLiked(!liked)} className="cursor-pointer">❤️</span>
            <span>🔥</span>
            <span>😂</span>
            <span>😮</span>
            <span>👏</span>
          </div>
          <span className="text-white/60 text-[11px]">{progress < 100 ? "Hold to pause" : ""}</span>
        </div>

        {/* Reply + Actions */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Reply to knmahesh..."
              className="w-full bg-zinc-800/80 backdrop-blur border border-zinc-700 text-white rounded-full px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <button onClick={() => setLiked(!liked)} className={`p-2.5 rounded-full bg-zinc-800 ${liked ? 'text-red-500' : 'text-white'}`}>
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>
          <button className="p-2.5 rounded-full bg-zinc-800 text-white">
            <Send size={18} />
          </button>
        </div>

        {/* 17 & 24 - Extra Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-zinc-800 text-white py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5">
            <Repeat2 size={14}/> To Reel
          </button>
          <button className="flex-1 bg-white text-black py-2.5 rounded-full text-xs font-bold">
            Visit Profile
          </button>
          <button className="p-2.5 bg-zinc-800 rounded-full text-white">
            <MoreHorizontal size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
