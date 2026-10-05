"use client"
import BottomNav from "./components/BottomNav"

export default function Page(){
  return(
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-white">
        <h1 className="font-black text-xl">ChitPix.com</h1>
        <div className="w-8 h-8 rounded-full bg-black"></div>
      </div>
      <div className="p-10 text-center mt-20">
        <h1 className="text-3xl font-bold">Welcome BRO 🚀</h1>
        <p className="text-gray-500 mt-2">Fresh start success!</p>
      </div>
      <BottomNav />
    </div>
  )
}
