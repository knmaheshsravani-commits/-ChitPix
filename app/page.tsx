"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Home, Search, Clapperboard, User, Heart, MessageCircle, Send, Plus, LogOut } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ChitPix(){
  // Nee old code same untundi, just icons change
  const [tab,setTab]=useState("home"),const [posts,setPosts]=useState<any>([]),const [user,setUser]=useState<any>(null)
  // ... migilina state lu same ...

  // Bottom Nav - IKKADA ICONS CHANGE
  return(
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Nee posts code */}

      {/* FIXED BOTTOM NAV - NEW PRO ICONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-zinc-700 flex justify-around py-4">
        <button onClick={()=>setTab("home")} className={tab==="home"?"text-white":"text-zinc-500"}><Home size={26}/></button>
        <button onClick={()=>setTab("search")} className={tab==="search"?"text-white":"text-zinc-500"}><Search size={26}/></button>
        <button onClick={()=>setTab("create")} className="bg-white text-black p-2 rounded-full"><Plus size={26}/></button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"?"text-white":"text-zinc-500"}><Clapperboard size={26}/></button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"?"text-white":"text-zinc-500"}><User size={26}/></button>
      </div>
    </div>
  )
}
