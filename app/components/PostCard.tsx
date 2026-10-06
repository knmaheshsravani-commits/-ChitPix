"use client";
import { useState } from "react";

export default function PostCard({ img = 1, post }: any) {
  const isReal =!!post;
  const imageUrl = isReal? post.image_url : `https://picsum.photos/seed/${img}/500/500`;
  const username = isReal? post.username : "arjun.vizag";
  const location = isReal? post.location : "Visakhapatnam";
  const caption = isReal? post.caption : "Vizag beach vibes 🌊 #ChitPix";
  const [likes, setLikes] = useState(post?.likes || 234);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ background: "white", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px", marginBottom: "8px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#FF6A00,#EE0979)", padding: "2px" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px" }}>{username[0].toUpperCase()}</div>
          </div>
          <div>
            <p style={{ fontWeight: "700", fontSize: "14px", lineHeight: "14px" }}>{username}</p>
            <p style={{ fontSize: "11px", color: "#888" }}>{location}</p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><circle cx="12" cy="12" r="2"/><circle cx="19.5" cy="12" r="2"/><circle cx="4.5" cy="12" r="2"/></svg>
      </div>

      {/* Image */}
      <img src={imageUrl} alt="post" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />

      {/* NEW ICONS ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 12px 6px" }}>
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>

          {/* HEART - New Thick Design */}
          <div onClick={() => { setLiked(!liked); setLikes(liked? likes - 1 : likes + 1); }} style={{ cursor: "pointer" }}>
            {liked? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF3040" stroke="#FF3040" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            )}
          </div>

          {/* COMMENT - New Bubble */}
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>

          {/* SHARE - New Paper Plane */}
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>

        {/* BOOKMARK - New */}
        <div onClick={() => setSaved(!saved)} style={{ cursor: "pointer" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={saved? "black" : "none"} stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>

      {/* Likes & Caption */}
      <div style={{ padding: "0 14px 10px" }}>
        <p style={{ fontWeight: "800", fontSize: "14px" }}>{likes} likes</p>
        <p style={{ fontSize: "14px", marginTop: "4px", lineHeight: "18px" }}>
          <span style={{ fontWeight: "800" }}>{username}</span> {caption}
        </p>
      </div>
    </div>
  );
}
