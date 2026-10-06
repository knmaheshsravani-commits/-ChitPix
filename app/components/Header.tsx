"use client";
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 h-[60px] flex items-center justify-between">
      <h1 className="text-[24px] font-black tracking-tight">ChitPix<span className="text-orange-500">.</span></h1>
      <div className="flex gap-5 text-xl"><span>♡</span><span>✈️</span></div>
    </header>
  );
}
