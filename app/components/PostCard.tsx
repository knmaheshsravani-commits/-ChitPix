"use client";

export default function PostCard() {
  return (
    <div className="bg-white border-b border-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-tr from-[#FF3A00] via-[#FF8A00] to-[#FFD600] p-[2px]">
          <div className="w-full h-full bg-white rounded-full p-[2px]">
            <div className="w-full h-full bg-zinc-900 rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[13.5px] font-semibold leading-none tracking-tight">arjun.vizag</span>
          <span className="text-[11px] text-zinc-500 mt-0.5">Visakhapatnam • Original</span>
        </div>
        <button className="ml-auto text-zinc-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>

      {/* Image - 2026 Ratio */}
      <div className="w-full bg-zinc-50">
        <img src="https://picsum.photos/800/1000?random=1" alt="post" className="w-full aspect-[4/5] object-cover" />
      </div>

      {/* Action Bar - 2026 Icons */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-[18px]">
          <button className="hover:opacity-60
