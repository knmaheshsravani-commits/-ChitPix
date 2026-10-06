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
    <div style={{ background: "white", marginBottom: "16px", borderBottom: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding: "2.5px" }}>
            <div style={{ width: "100%", height: "100%", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "16px" }}>{username[0].toUpperCase()}</div>
          </div>
          <div>
            <p style={{ fontWeight: "700", fontSize: "14px" }}>{username}</p>
            <p style={{ fontSize: "11px", color: "#737373" }}>{location}</p>
          </div>
        </div>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>•••</span>
      </div>

      <img src={imageUrl} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} alt="post" />

      {/* PREMIUM BOLD ICONS */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px 6px" }}>
        <div style={{ display: "flex", gap: "22px" }}>
          <div onClick={() => { setLiked(!liked); setLikes(liked? likes-1 : likes+1); }} style={{ cursor: "pointer" }}>
            <svg width="28" height="28" viewBox="0 0 48 48">
              <path fill={liked? "#FF3040" : "none"} stroke={liked? "#FF3040" : "black"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.1 16.5.7.3 1.1 1 1.1 1.7v.2c0 1.1-.8 1.9-1.9 1.9h-1c-.9 0-1.7-.6-1.9-1.5L24 29.4l-6.2 6.9c-.2.9-1 1.5-1.9 1.5h-1c-1.1 0-1.9-.8-1.9-1.9v-.2c0-.7.4-1.4 1.1-1.7C8.9 28.6 3 24.4 3 17.6 3 11.3 7.7 6.1 13.4 6.1c2.7 0 5.2 1.3 6.6 3.4 1.4-2.1 3.9-3.4 6.6-3.4z"
              style={{ transform: "scale(0.85)", transformOrigin: "center" }} />
              <path d="M24 10c-1.5-2.2-3.8-3.5-6.3-3.5-5.2 0-9.4 4.5-9.4 10.1 0 5.8 5.2 9.6 10.4 14.8L24 37.5l5.3-6.1c5.2-5.2 10.4-9 10.4-14.8 0-5.6-4.2-10.1-9.4-10.1-2.5 0-4.8 1.3-6.3 3.5z" fill={liked? "#FF3040" : "none"} stroke={liked? "#FF3040" : "#262626"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.656 11.656A8 8 0 0 1 12 19.25a8 8 0 0 1-3.082-.62L3 21l2.37-5.918A8 8 0 0 1 4 11.656a8 8 0 0 1 8-8 8 8 0 0 1 8.656 8z" />
          </svg>

          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </div>

        <div onClick={() => setSaved(!saved)} style={{ cursor: "pointer" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={saved? "#262626" : "none"} stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21L12 17L5 21V5C5 4.5 5.18 4.03 5.53 3.68C5.88 3.33 6.35 3.15 6.95 3.15H17.05C17.65 3.15 18.12 3.33 18.47 3.68C18.82 4.03 19 4.5 19 5V21Z" />
          </svg>
        </div>
      </div>

      <div style={{ padding: "0 16px 14px" }}>
        <p style={{ fontWeight: "800", fontSize: "14px" }}>{likes} likes</p>
        <p style={{ fontSize: "14px", marginTop: "6px" }}><b>{username}</b> {caption}</p>
      </div>
    </div>
  );
}
