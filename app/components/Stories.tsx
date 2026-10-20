"use client";
import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Send, Eye, Infinity, Crown, Repeat2, MoreHorizontal, Volume2, VolumeX, Share2, Trash2 } from "lucide-react";

export default function StoryViewer({ story, onClose, onNext, onPrev, stories, currentIndex }: any) {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState("");
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const intervalRef = useRef<any>(null);

  // Views count + 24h logic
  useEffect(() => {
    if (!story?.id) return;
    // 1. Views API - Count per view
    fetch(`/api/stories/${story.id}/view`, { method: 'POST' }).catch(()=>{});
    setProgress(0);
    setPaused(false);
  }, [story?.id]);

  useEffect(() => {
    // 2. Progress Timer - Pause support
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            if (onNext) onNext();
            else onClose();
            return 100;
          }
          return p + 0.7;
        });
      }
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [story, paused, onNext, onClose]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // @ts-ignore
    const x = e.clientX || e.touches?.[0]?.clientX;
    if (x < window.innerWidth / 2) {
      if (onPrev) onPrev();
    } else {
      if (onNext) onNext();
    }
  };

  const handleReact = async (emoji: string) => {
    await fetch(`/api/stories/${story.id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, username: 'knmahesh' })
    });
    if (emoji === '❤️') setLiked(true);
  };

  const handleReplySend = async () => {
    if (!reply.trim()) return;
    await fetch(`/api/stories/${story.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reply, username: 'knmahesh' })
    });
    setReply("");
    alert("Reply sent ✅");
  };

  const handleShare = async () => {
    const url = story.image_url || story.url;
    if (navigator.share) {
      await navigator.share({ title: 'ChitPix Story', text: story.caption, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this story?")) return;
    await fetch(`/api/stories?id=${story.id}`, { method: 'DELETE' });
    onClose();
    window.location.reload();
  };

  // 24h expiry check
  const getTimeLeft = () => {
    if (!story.created_at) return "24h left";
    const created = new Date(story.created_at).getTime();
    const diff = Date.now() - created;
    const hoursLeft = Math.max(0, 24 - Math.floor(diff / (1000*60*60)));
    if (story.expires_at === null) return "R2 Permanent • Never deletes";
    return hoursLeft <= 0 ? "Expired" : `${hoursLeft}h left • Auto delete after 24h`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col select-none"
         onMouseDown={() => setPaused(true)}
         onMouseUp={() => setPaused(false)}
         onTouchStart={() => setPaused(true)}
         onTouchEnd={() => setPaused(false)}
    >
      {/* 1. Progress Bar - Instagram Style */}
      <div className="flex gap-1 p-1.5">
        <div className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-75" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 2. Header - All Info */}
      <div className="flex justify-between items-center px-3 py-2 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-white text-[11px] font-bold">
              {story.username?.[0]?.toUpperCase() || 'M'}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold flex items-center gap-1.5">
              {story.username} • R2 Story
              {story.expires_at === null ? (
                <span className="bg-blue-500 text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-1"><Infinity size={10}/>R2 Permanent</span>
              ) : (
                <span className="bg-orange-500 text-[8px] px-1.5 py-0.5 rounded-full">{getTimeLeft()}</span>
              )}
            </p>
            <p className="text-[10px] opacity-70 flex items-center gap-1">
              <Eye size={10}/>{story.views || 0} views • {getTimeLeft()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMuted(!muted)} className="p-2">
            {muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
          </button>
          <button onClick={handleDelete} className="p-2"><Trash2 size={18}/></button>
          <button onClick={onClose} className="p-2"><X size={20}/></button>
        </div>
      </div>

      {/* 3. Main - Lion + Motivation Text */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-900 overflow-hidden"
           onClick={handleTap}>
        {story.video_url ? (
          <video src={story.video_url} autoPlay loop muted={muted} playsInline
                 className="w-full h-full object-contain" />
        ) : (
          <img src={story.image_url || story.url} alt="story" className="w-full h-full object-contain" />
        )}
        
        {/* Motivation Text - Nee Design Same */}
        {story.caption && (
          <div className="absolute bottom-28 left-4 right-4 pointer-events-none">
            <h1 className="text-white text-[26px] font-black leading-[1.1] text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-tight">
              {story.caption}
            </h1>
          </div>
        )}

        {/* Tap hints */}
        <div className="absolute top-1/2 left-2 -translate-y-1/2 text-white/20 text-xs pointer-events-none">‹</div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 text-white/20 text-xs pointer-events-none">›</div>
      </div>

      {/* 4. Bottom - 25 Features */}
      <div className="p-3 pb-7 bg-gradient-to-t from-black via-black/60 to-transparent">
        {/* Quick Reactions - 6 Emojis */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex gap-3.5 text-[22px]">
            <button onClick={() => handleReact('❤️')} className="active:scale-125 transition">❤️</button>
            <button onClick={() => handleReact('🔥')} className="active:scale-125 transition">🔥</button>
            <button onClick={() => handleReact('😂')} className="active:scale-125 transition">😂</button>
            <button onClick={() => handleReact('😮')} className="active:scale-125 transition">😮</button>
            <button onClick={() => handleReact('👏')} className="active:scale-125 transition">👏</button>
            <button onClick={() => handleReact('💯')} className="active:scale-125 transition">💯</button>
          </div>
          <span className="text-white/50 text-[10px]">{paused ? "Paused" : "Hold to pause • Tap to next"}</span>
        </div>

        {/* Reply Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={`Reply to ${story.username}...`}
              className="w-full bg-zinc-800/80 backdrop-blur border border-zinc-700 text-white rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:border-white/30"
              onKeyDown={e => e.key === 'Enter' && handleReplySend()}
            />
          </div>
          <button onClick={() => setLiked(!liked)} className={`p-2.5 rounded-full bg-zinc-800 transition ${liked ? 'text-red-500' : 'text-white'}`}>
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>
          <button onClick={handleReplySend} className="p-2.5 rounded-full bg-white text-black">
            <Send size={18} />
          </button>
          <button onClick={handleShare} className="p-2.5 rounded-full bg-zinc-800 text-white">
            <Share2 size={18}/>
          </button>
        </div>

        {/* Extra Buttons - To Reel, Profile, Viewers */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-zinc-800 text-white py-2.5 rounded-full text-[12px] font-semibold flex items-center justify-center gap-1.5">
            <Repeat2 size={14}/> To Reel
          </button>
          <button onClick={() => setShowViewers(!showViewers)} className="flex-1 bg-zinc-800 text-white py-2.5 rounded-full text-[12px] font-semibold flex items-center justify-center gap-1.5">
            <Eye size={14}/> {story.views || 0} Views
          </button>
          <button className="flex-1 bg-white text-black py-2.5 rounded-full text-[12px] font-bold">
            Visit Profile
          </button>
          <button className="p-2.5 bg-zinc-800 rounded-full text-white">
            <MoreHorizontal size={18}/>
          </button>
        </div>
      </div>

      {/* Viewers Bottom Sheet */}
      {showViewers && (
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[20px] p-4 max-h-[45vh] overflow-auto animate-in slide-in-from-bottom">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
          <p className="text-white font-bold text-sm mb-3">Viewers • {story.views || 0}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <div className="w-8 h-8 rounded-full bg-pink-500" /> knmahesh • Just now
            </div>
          </div>
          <button onClick={() => setShowViewers(false)} className="mt-4 w-full bg-white text-black py-3 rounded-full font-bold text-sm">Close</button>
        </div>
      )}
    </div>
  );
        }
