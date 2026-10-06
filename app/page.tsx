"use client";

export default function Home() {
  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-[#FF6600] rounded-[20px] flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
          <div className="w-7 h-7 bg-white rounded-full"></div>
        </div>
      </div>
      <h1 className="text-2xl font-black">ChitPix.com</h1>
      <p className="text-gray-500 mt-2">Instagram of India</p>
      <p className="text-xs text-green-600 mt-4 font-bold">✅ Icons Ready - Build Ready</p>
    </div>
  );
}
