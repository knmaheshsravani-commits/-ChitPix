"use client"
import Link from "next/link"

export default function Header(){
  return(
    <div style={{height:'58px', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 16px', borderBottom:'1px solid #e5e7eb', background:'white', position:'sticky', top:0, zIndex:50}}>
      <h1 style={{fontWeight:900, fontSize:'22px', letterSpacing:'-1px'}}>ChitPix.com</h1>
      <div style={{display:'flex', gap:'18px'}}>
        <Link href="/notifications">❤️</Link>
        <Link href="/messages">💬</Link>
      </div>
    </div>
  )
}
