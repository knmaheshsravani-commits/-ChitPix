"use client";
export default function BottomNav() {
  return (
    <div style={{ position: "fixed", bottom: "20px", left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "black", borderRadius: "999px", padding: "12px 24px", display: "flex", alignItems: "center", gap: "28px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2.1L2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.3-4.3"/></svg>
        <div style={{ width: "28px", height: "28px", background: "white", borderRadius: "50%", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>+</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <div style={{ width: "24px", height: "24px", background: "white", borderRadius: "50%" }}></div>
      </div>
    </div>
  );
}
