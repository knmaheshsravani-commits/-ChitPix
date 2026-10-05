import Link from "next/link"
export default function Header(){
  return(
    <div className="h-14 px-4 flex justify-between items-center border-b sticky top-0 bg-white z-50">
      <h1 className="font-black text-[22px] tracking-tighter">ChitPix.com</h1>
      <div className="flex items-center gap-5">
        <Link href="/notifications">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M12 21s-6.5-4.35-8.5-8.15C2 9.5 3.5 5 8 5c2.1 0 3.2 1.1 4 2.2C12.8 6.1 14 5 16 5c4.5 0 6 4.5 4.5 7.85C18.5 16.65 12 21 12 21z"/></svg>
        </Link>
        <Link href="/messages">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-3.9 7.1L18 21l-3.2-1.9A8.5 8.5 0 1 1 21 11.5z"/><path d="M8 12l2 2 4-4"/></svg>
        </Link>
      </div>
    </div>
  )
}
