"use client";
export default function Header() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "white", borderBottom: "1px solid #e4e4e7", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>ChitPix.</h1>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </div>
    </header>
  );
}
