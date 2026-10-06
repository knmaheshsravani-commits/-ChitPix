"use client";
export default function PostCard({ img = 1 }: { img?: number }) {
  return (
    <div style={{ background: "white", borderBottom: "1px solid #f4f4f5", paddingBottom: "12px" }}>
      {/* HEADER - FIXED WITH INLINE FLEX */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "black" }}></div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", lineHeight: "13px" }}>arjun.vizag</span>
          <span style={{ fontSize: "11px", color: "#71717a", marginTop: "3px" }}>Visakhapatnam</span>
        </div>
        <div style={{ marginLeft: "auto", color: "#a1a1aa", fontWeight: "bold" }}>...</div>
      </div>

      {/* IMAGE */}
      <img src={`https://picsum.photos/600/750?random=${img}`} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", background: "#f4f4f5" }} alt="post" />

      {/* ACTIONS */}
      <div style={{ padding: "12px" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7" style={{ marginLeft: "auto" }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "10px" }}>1,250 likes</p>
        <p style={{ fontSize: "13px", marginTop: "4px" }}><span style={{ fontWeight: "600" }}>arjun.vizag</span> 2026 vibes - Vizag beach #ChitPix</p>
      </div>
    </div>
  );
}
