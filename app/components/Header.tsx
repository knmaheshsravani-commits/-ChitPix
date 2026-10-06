"use client";
export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-[60px] flex items-center justify-between">
      <h1 className="text-[22px] font-black tracking-tighter">ChitPix<span className="text-[#FF6600]">.</span></h1>
      <div className="flex gap-4 text-[20px]">
        <span>❤️</span>
        <span>💬</span>
      </div>
    </header>
  );
}
