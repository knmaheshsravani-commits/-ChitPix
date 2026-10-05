"use client"
import Link from "next/link"

export default function Header(){
  return(
    <div className="h-[60px] px-4 flex justify-between items-center border-b bg-white sticky top-0 z-50">
      <h1 className="font-black text-[24px] tracking-tighter">ChitPix.com</h1>
      <div className="flex items-center gap-5">
        <Link href="/notifications">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 21s-6.5-4.35-8.5-8.15C2 9.5 3.5 5 8 5c2.1 0 3.2 1.1 4 2.2C12.8 6.1 14 5 16 5c4.5 0 6 4.5 4.5 7.85C18.5 16.65 12 21 12 21z"/></svg>
        </Link>
        <Link href="/messages">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg>
        </Link>
      </div>
    </div>
  )
}
