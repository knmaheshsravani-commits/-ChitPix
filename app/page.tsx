"use client";

import { useState } from "react";

export default function Home() {
  const [liked, setLiked] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "white",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26 }}>📸 ChitPix</h1>

        <div style={{ display: "flex", gap: 15, fontSize: 22 }}>
          <span>🔍</span>
          <span>💬</span>
          <span>👤</span>
        </div>
      </header>

      {/* Welcome */}
      <section style={{ padding: "20px", textAlign: "center" }}>
        <h2>Welcome to ChitPix 👋</h2>
        <p>Share your photos, videos and moments.</p>
      </section>

      {/* Create Post */}
      <section
        style={{
          background: "white",
          margin: "10px",
          padding: 20,
          borderRadius: 15,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h3>Create a Post</h3>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={buttonStyle}>📸 Photo</button>
          <button style={buttonStyle}>🎥 Video</button>
          <button style={buttonStyle}>✏️ Text</button>
        </div>
      </section>

      {/* Example Post */}
      <article
        style={{
          background: "white",
          margin: 10,
          borderRadius: 15,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ padding: 15 }}>
          <strong>ChitPix User</strong>
          <p style={{ marginBottom: 0 }}>My first ChitPix post 🚀</p>
        </div>

        <div
          style={{
            height: 280,
            background: "linear-gradient(135deg, #ddd, #aaa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
          }}
        >
          📸
        </div>

        <div style={{ padding: 15 }}>
          <div style={{ display: "flex", gap: 20, fontSize: 24 }}>
            <button
              onClick={() => setLiked(!liked)}
              style={iconButton}
            >
              {liked ? "❤️" : "🤍"}
            </button>

            <button style={iconButton}>💬</button>
            <button style={iconButton}>🔖</button>
            <button style={iconButton}>↗️</button>
          </div>

          <p style={{ marginBottom: 0 }}>
            {liked ? "1 Like" : "Be the first to like this"}
          </p>
        </div>
      </article>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "white",
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-around",
          padding: 12,
          fontSize: 22,
        }}
      >
        <span>🏠</span>
        <span>🔍</span>
        <span>➕</span>
        <span>💬</span>
        <span>👤</span>
      </nav>
    </main>
  );
}

const buttonStyle = {
  border: "none",
  background: "#eee",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const iconButton = {
  border: "none",
  background: "transparent",
  fontSize: 24,
  cursor: "pointer",
};
