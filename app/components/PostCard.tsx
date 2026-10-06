"use client";
export default function PostCard() {
  return (
    <div className="bg-white border-b border-zinc-100 pb-2">
      <div className="flex items-center gap-2.5 px-3 py-3">
        <div className="w-8 h-8 rounded-full bg-zinc-900"></div>
        <div>
          <p className="text-[13px] font-semibold leading-none">arjun.vizag</p>
          <p className="text-[11px] text-zinc-500 leading-none mt-1">Visakhapatnam</p>
        </div>
        <div className="ml-auto text-zinc-400">...</div>
      </div>
      <img src="https://picsum.photos/600/750?random=1" className="w-full aspect-[4/5] object-cover bg-zinc-100" alt="post" />
      <div className="px-3 pt-3">
        <div className="flex gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="ml-auto"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p className="text-[13px] font-bold mt-2">1,250 likes</p>
        <p className="text-[13px] mt-1"><span className="font-semibold">arjun.vizag</span> 2026 vibes - Vizag beach #ChitPix</p>
      </div>
    </div>
  );
}
