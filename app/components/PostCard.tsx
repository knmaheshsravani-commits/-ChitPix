"use client";
import { useState } from "react";

export default function PostCard({ img = 1, post }: any) {
  const isReal =!!post;
  const imageUrl = isReal? post.image_url : `https://picsum.photos/seed/${img}/500/500`;
  const username = isReal? post.username : "arjun.vizag";
  const location = isReal? post.location : "RK Beach • Visakhapatnam";
  const caption = isReal? post.caption : "Vizag vibes ✨ #ChitPix";
  const [likes, setLikes] = useState(post?.likes || 2890);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleLike = () => {
    if (!liked) setLikes(likes+1); else setLikes(likes-1);
    setLiked(!liked);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!liked) { setLiked(true); setLikes(likes+1); }
      setShowHeart(true);
      setTimeout(()=>setShowHeart(false), 900);
    }
    setLastTap(now);
  };

  return (
    <div style={{ background: "white", borderBottom: "1px solid #efefef", marginBottom: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding: "2px" }}>
            <div style={{ width: "100%", height: "100%", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>{username[0].toUpperCase()}</div>
          </div>
          <div><p style={{ fontWeight: "700", fontSize: "14px" }}>{username}</p><p style={{ fontSize: "11px", color: "#737373" }}>{location}</p></div>
        </div>
        <span style={{ fontWeight: "bold" }}>•••</span>
      </div>

      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "#f5f5f5" }} onTouchEnd={handleDoubleTap} onDoubleClick={()=>{ if(!liked){setLiked(true); setLikes(likes+1);} setShowHeart(true); setTimeout(()=>setShowHeart(false),900);}}>
        <img src={imageUrl} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} alt="post" draggable={false} />
        {showHeart && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ fontSize: "90px", animation: "pop 0.9s ease-out", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>❤️</span></div>}
      </div>

      {/* 5 ICONS - LIKE SCREENSHOT */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "12px 14px 6px" }}>
        <div onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={liked? "#ff3040" : "none"} stroke={liked? "#ff3040" : "#262626"} strokeWidth="1.7"><path d="M12 21C12 21 4 13 4 8.5C4 5.42 7.42 3 10.5 3C12.24 3 13.91 3.81 15 5.09C16.09 3.81 17.76 3 19.5 3C22.58 3 26 5.42 26 8.5C26 13 12 21 12 21Z" transform="translate(-2 -1)"/></svg>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>{likes.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.7"><path d="M21 11.5a8.5 8.5 0 1 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 0 1 21 11.5Z"/></svg>
          <span style={{ fontSize: "14px" }}>37</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.7"><path d="M17 1l4 4-14 14-4 1 1-4 14-14Z"/></svg>
          <span style={{ fontSize: "14px" }}>52</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span style={{ fontSize: "14px" }}>1,043</span>
        </div>
        <div onClick={()=> setSaved(!saved)} style={{ marginLeft: "auto", cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved? "black" : "none"} stroke="#262626" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>

      <div style={{ padding: "0 14px 12px" }}>
        <p style={{ fontSize: "14px", lineHeight: "18px" }}><b>{username}</b> {caption} <span style={{ color: "#737373" }}>more</span></p>
        <p style={{ fontSize: "12px", color: "#737373", marginTop: "4px" }}>26 September</p>
      </div>
      <style>{`@keyframes pop { 0%{transform:scale(0)} 15%{transform:scale(1.3)} 30%{transform:scale(0.95)} 45%,80%{transform:scale(1)} 100%{transform:scale(0)} }`}</style>
    </div>
  );
}
