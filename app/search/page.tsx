"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function SearchPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [photo, setPhoto] = useState("")
  const [selected, setSelected] = useState<any>(null)

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved) setPosts(JSON.parse(saved))
    const p = localStorage.getItem("chitpix_profile_photo"); if(p) setPhoto(p)
  },[])

  const filtered = posts.filter(p=> p.caption?.toLowerCase().includes(query.toLowerCase()) || p.username?.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="w-full bg-white flex flex-col" style={{height:"100vh", height:"100dvh", overflow:"hidden"}}>
      <div className="px-3 py-2 border-b bg-white shrink-0">
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search ChitPix..." className="bg-transparent outline-none flex-1 text-sm" />
            {query && <button onClick={()=>setQuery("")} className="text-xs bg-gray-200 px-2 py-1 rounded-full">X</button>}
          </div>
          <Link href="/" className="text-sm font-semibold">Cancel</Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query===""? (
          <>
            <div className="p-3">
              <p className="font-bold text-sm">Explore</p>
              <p className="text-xs text-gray-500">Trending on ChitPix</p>
            </div>
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((p,i)=>(
                <div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-gray-100 cursor-pointer"><img src={p.image} className="w-full h-full object-cover" /></div>
              ))}
              {posts.length===0 && <div className="col-span-3 py-20 text-center"><p className="text-4xl">🔍</p><p className="font-bold mt-2">No Posts to Search</p><p className="text-xs text-gray-500">Create posts to see here</p></div>}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {filtered.map((p,i)=>(
              <div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-gray-100 cursor-pointer"><img src={p.image} className="w-full h-full object-cover" /></div>
            ))}
            {filtered.length===0 && <div className="col-span-3 py-20 text-center text-sm text-gray-500">No results for "{query}"</div>}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex justify-between p-4 text-white"><button onClick={()=>setSelected(null)}>✕ Close</button><button className="font-bold">⋯</button></div>
          <div className="flex-1 flex items-center justify-center"><img src={selected.image} className="max-w-full max-h-[80vh] object-contain" /></div>
        </div>
      )}

      <div className="bg-white border-t shrink-0">
        <div className="max-w-md mx-auto flex justify-between items-center px-2 py-2">
          <Link href="/" className="w-11 h-11 flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg></Link>
          <Link href="/reels" className="w-11 h-11 flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="4"/><polygon points="10 8 16 12 10 16 10 8" strokeLinejoin="round"/></svg></Link>
          <Link href="/" className="w-11 h-11 flex items-center justify-center relative"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></Link>
          <Link href="/search" className="bg-gray-100 px-6 py-2 rounded-full flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="black"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="black" strokeWidth="2" fill="none"/></svg></Link>
          <Link href="/profile" className="w-11 h-11 flex items-center justify-center relative"><div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">{photo? <img src={photo} className="w-full h-full object-cover"/> : "M"}</div></Link>
        </div>
      </div>
    </div>
  )
}
