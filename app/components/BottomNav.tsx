"use client";
import Link from "next/link";
export default function BottomNav() {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #dbdbdb", height: "58px", display: "flex", justifyContent: "space-around", alignItems: "center", maxWidth: "500px", margin: "0 auto", zIndex: 99, paddingBottom: "4px" }}>
      {/* Home Filled */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="black"><path d="M9.5 21.5v-7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7h4.5a1 1 0 0 0 1-1v-9.5a1 1 0 0 0-.4-.8L12.5 2.7a1 1 0 0 0-1 0L3.9 9.2a1 1 0 0 0-.4.8V20.5a1 1 0 0 0 1 1H9.5z"/></svg>
      </Link>
      {/* Reels */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="4"/><polygon points="10 8 16 12 10 16 10 8" fill="none"/></svg>
      {/* Share with dot */}
      <Link href="/upload" style={{ position: "relative", textDecoration: "none" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <div style={{ position: "absolute", top: "-2px", right: "-4px", width: "8px", height: "8px", background: "#ff3040", borderRadius: "50%", border: "1.5px solid white" }}></div>
      </Link>
      {/* Search */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
      {/* Profile with M and red dot */}
      <div style={{ position: "relative" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", fontFamily: "serif" }}>M</div>
        <div style={{ position: "absolute", bottom: "-1px", right: "-2px", width: "8px", height: "8px", background: "#ff3040", borderRadius: "50%", border: "1.5px solid white" }}></div>
      </div>
    </div>
  );
}
