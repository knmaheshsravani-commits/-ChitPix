"use client";
import { useState } from "react";

export default function PostCard({ img = 1, post }: any) {
  const isReal =!!post;
  const imageUrl = isReal? post.image_url : `https://picsum.photos/seed/${img}/500/500`;
  const username = isReal? post.username : "arjun.vizag";
  const location = isReal? post.location : "RK Beach • Visakhapatnam";
  const caption = isReal? post.caption : "Vizag vibes 🌊 #ChitPix";
  const [likes, setLikes] = useState(post?.likes || 2890);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ background: "white", borderBottom: "1px solid #efefef", marginBottom: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding: "2px" }}>
            <div style={{ width: "100%", height: "100%", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>{username[0].toUpperCase()}</div>
          </div>
          <div><p style={{ fontWeight: "700", fontSize: "14px" }}>{username}</p><p style={{ fontSize: "11px", color: "#737373" }}>{location}</p></div>
        </div>
        <span style={{ fontWeight: "bold" }}>•••</span>
      </div>

      <img src={imageUrl} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} alt="post" />

      {/* 5 ICONS - LIKE SCREENSHOT */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "12px 14px 6px" }}>
        {/* Heart */}
        <div onClick={() => { setLiked(!liked); setLikes(liked? likes-1 : likes+1); }} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={liked? "#ff3040" : "none"} stroke={liked? "#ff3040" : "#262626"} strokeWidth="1.7"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>{likes.toLocaleString()}</span>
        </div>
        {/* Comment */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span style={{ fontSize: "14px" }}>37</span>
        </div>
        {/* Repost */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.7"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span style={{ fontSize: "14px" }}>52</span>
        </div>
        {/* Share */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span style={{ fontSize: "14px" }}>1,043</span>
        </div>
        {/* Bookmark - Right side */}
        <div onClick={() => setSaved(!saved)} style={{ marginLeft: "auto", cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved? "black" : "none"} stroke="#262626" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>

      <div style={{ padding: "0 14px 12px" }}>
        <p style={{ fontSize: "14px", lineHeight: "18px" }}><b>{username}</b> {caption} <span style={{ color: "#737373" }}>more</span></p>
        <p style={{ fontSize: "12px", color: "#737373", marginTop: "4px" }}>26 September</p>
      </div>
    </div>
  );
}
