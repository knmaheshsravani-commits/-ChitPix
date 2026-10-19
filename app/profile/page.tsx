"use client"
import BottomNav from "../components/BottomNav"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white max-w-[470px] mx-auto pb-20">
      <div className="p-4 flex justify-between items-center border-b border-zinc-800">
        <h1 className="font-bold text-xl">knmahesh ✓ R2</h1>
        <Link href="/" className="text-sm bg-zinc-800 px-3 py-1 rounded-full">Home</Link>
      </div>
      <div className="p-8 text-center mt-10">
        <img src="https://i.pravatar.cc/200?u=knmahesh" className="w-24 h-24 rounded-full mx-auto border-2 border-pink-500" />
        <h2 className="mt-4 font-bold text-lg">knmahesh</h2>
        <p className="text-zinc-400 text-sm mt-1">ChitPix Creator • R2 Permanent 🚀</p>
        <p className="text-green-400 text-sm mt-4">✅ Profile Page LIVE - R2 Connected</p>
        <p className="text-zinc-500 text-xs mt-2">This page was fixed - now no 404!</p>
      </div>
      <BottomNav />
    </div>
  )
}
