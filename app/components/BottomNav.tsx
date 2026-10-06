"use client";
export default function BottomNav() {
  return (
    <div className="fixed bottom-5 left-0 right-0 flex justify-center z-50">
      <div className="bg-black text-white rounded-full px-6 py-3.5 flex items-center gap-7 shadow-2xl">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
        <div className="bg-white text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-[18px]">+</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <div className="w-6 h-6 rounded-full bg-white"></div>
      </div>
    </div>
  );
}
