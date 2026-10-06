"use client";
import { useState } from "react";

export default function PostCard({ img = 1, post }: any) {
  const isReal =!!post;
  const imageUrl = isReal? post.image_url : `https://picsum.photos/seed/${img}/500/500`;
  const username = isReal? post.username : "arjun.vizag";
  const location = isReal? post.location : "RK Beach • Visakhapatnam";
  const caption = isReal? post.caption : "Vizag vibes 🌊 #ChitPix";
  const [likes, setLikes] = useState(post?.likes || 412);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ background: "white", marginBottom: "12px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding: "2.5px" }}>
            <div style={{ width: "100%", height: "100%", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>{username[0].toUpperCase()}</div>
          </div>
          <div>
            <p style={{ fontWeight: "700", fontSize: "13.5px" }}>{username}</p>
            <p style={{ fontSize: "11px", color: "#666" }}>{location}</p>
          </div>
        </div>
        <div style={{ fontWeight: "bold", letterSpacing: "2px" }}>•••</div>
      </div>

      <img src={imageUrl} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} alt="post" />

      {/* NEW DESIGN ICONS - 2024 Insta Style */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 14px 8px" }}>
        <div style={{ display: "flex", gap: "20px" }}>

          {/* NEW HEART - Bolder */}
          <div onClick={() => { setLiked(!liked); setLikes(liked? likes - 1 : likes + 1); }} style={{ cursor: "pointer" }}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill={liked? "#ed4956" : "none"} stroke={liked? "#ed4956" : "black"} strokeWidth="1.9">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* NEW COMMENT - Rounded Bubble */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.9" strokeLinejoin="round">
            <path d="M21 12c0 4.97-4.03 9-9 9a9 9 0 0 1-3.39-.66L3 21l.66-5.61A8.95 8.95 0 0 1 3 12C3 7.03 7.03 3 12 3s9 4.03 9 9z" />
          </svg>

          {/* NEW SHARE - Clean Send */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </div>

        {/* NEW BOOKMARK - Filled when saved */}
        <div onClick={() => setSaved(!saved)} style={{ cursor: "pointer" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={saved? "black" : "none"} stroke="black" strokeWidth="1.9">
            <path d="M19 21L12 17L5 21V5C5 4.45 5.2 3.97 5.59 3.59C5.97 3.2 6.45 3 7 3H17C17.55 3 18.03 3.2 18.41 3.59C18.8 3.97 19 4.45 19 5V21Z" />
          </svg>
        </div>
      </div>

      <div style={{ padding: "0 14px 12px" }}>
        <p style={{ fontWeight: "800", fontSize: "14px" }}>{likes} likes</p>
        <p style={{ fontSize: "14px", marginTop: "6px" }}><b>{username}</b> {caption}</p>
      </div>
    </div>
  );
}
