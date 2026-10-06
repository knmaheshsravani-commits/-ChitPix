"use client";
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-4 h-[60px] flex items-center justify-between">
      <h1 className="text-[26px] font-black tracking-tighter">ChitPix.</h1>
      <div className="flex gap-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </div>
    </header>
  );
}
