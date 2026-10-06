"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PostCard({ img, post }: any) {
  const isReal =!!post;
  const imageUrl = isReal? post.image_url : `https://picsum.photos/seed/${img}/500/500`;
  const username = isReal? post.username : "arjun.vizag";
  const location = isReal? post.location : "Visakhapatnam";
  const caption = isReal? post.caption : "Vizag beach vibes 🌊 #ChitPix";
  const [likes, setLikes] = useState(post?.likes || 124);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const newLiked =!liked;
    const newLikes = newLiked? likes + 1 : likes - 1;
    setLiked(newLiked);
    setLikes(newLikes);
    if (isReal) {
      await supabase.from("posts").update({ likes: newLikes }).eq("id", post.id);
    }
  };

  return (
    <div style={{ background: "white", borderBottom: "1px solid #f4f4f5", paddingBottom: "12px", marginBottom: "8px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(45deg,#FF8A00,#FF3A00,#C700B1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "12px" }}>{username[0].toUpperCase()}</div>
        <div><p style={{ fontWeight: "600", fontSize: "14px" }}>{username}</p><p style={{ fontSize: "11px", color: "#71717a" }}>{location}</p></div>
      </div>

      {/* Image */}
      <img src={imageUrl} alt="post" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", background: "#f4f4f5" }} />

      {/* Actions - OLD ICONS */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <svg onClick={handleLike} style={{ cursor: "pointer" }} width="24" height="24" viewBox="0 0 24 24" fill={liked? "red" : "none"} stroke={liked? "red" : "black"} strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0
