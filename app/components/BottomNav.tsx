"use client";
export default function BottomNav() {
  return (
    <div className="fixed bottom-5 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto bg-black text-white rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
        <span className="text-[20px]">⌂</span>
        <span className="text-[20px]">⌕</span>
        <span className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">+</span>
        <span className="text-[20px]">▶</span>
        <span className="text-[20px]">◉</span>
      </div>
    </div>
  );
}
