"use client";
import Link from "next/link";
export default function BottomNav() {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #dbdbdb", height: "58px", display: "flex", justifyContent: "space-around", alignItems: "center", maxWidth: "500px", margin: "0 auto", zIndex: 99 }}>
      <Link href="/" style={{ textDecoration: "none", fontSize: "24px" }}>⌂</Link>
      <span style={{ fontSize: "22px" }}>⌕</span>
      <Link href="/upload" style={{ width: "28px", height: "28px", border: "2px solid black", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", textDecoration: "none", color: "black" }}>+</Link>
      <span style={{ fontSize: "20px" }}>◎</span>
      <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>A</div>
    </div>
  );
}
