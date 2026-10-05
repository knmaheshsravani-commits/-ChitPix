"use client"
import { useState } from "react"
import { Heart, MessageCircle, Send, Home, Search, PlusSquare, Clapperboard, CircleUser } from "lucide-react"

export default function Page(){
  const [liked, setLiked] = useState(false)
  return (
    <div className="max-w-[500px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="font-bold text-xl">ChitPix.com</h1>
        <div className="flex gap-4">
          <Heart className="w-6 h-6" />
          <Send className="w-6 h-6" />
        </div>
      </div>

      {/* Post Image */}
      <div className="bg-gray-100 h-[400px] flex items-center justify-center text-gray-400">
        Post Image
      </div>

      {/* POST ACTIONS - NEW ICONS */}
      <div className="flex gap-4 p-3">
        <Heart onClick={()=>setLiked(!liked)} className={`w-[26px] h-[26px] cursor-pointer ${liked? "fill-red-500 text-red-500" : ""}`} />
        <MessageCircle className="w-[26px] h-[26px] cursor-pointer" />
        <Send className="w-[26px] h-[26px] cursor-pointer" />
      </div>

      <div className="px-3 font-bold">124 likes</div>

      <div className="flex items-center gap-2 p-3">
        <div className="w-8 h-8 bg-black rounded-full"></div>
        <span className="font-bold">bunny</span>
        <button className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm ml-2">Follow</button>
      </div>

      {/* BOTTOM 5 ICONS - SAME SIZE NEW */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white border-t flex justify-around items-center py-3">
        <Home className="w-[26px] h-[26px]" />
        <Search className="w-[26px] h-[26px]" />
        <PlusSquare className="w-[26px] h-[26px]" />
        <Clapperboard className="w-[26px] h-[26px]" />
        <CircleUser className="w-[26px] h-[26px]" />
      </div>
    </div>
  )
   }
