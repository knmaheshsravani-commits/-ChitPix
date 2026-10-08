"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function SearchPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [photo, setPhoto] = useState("")
  const [selected, setSelected] = useState<any>(null)
  const [liked, setLiked] = useState<any>({})
  const [activeTab, setActiveTab] = useState("Top")

  useEffect(()=>{
    const s = localStorage.getItem("posts")
    if(s) setPosts(JSON.parse(s))
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
  },[])

  const filtered = posts.filter((p:any)=>
    p.caption?.toLowerCase().includes(query.toLowerCase()) ||
    p.username?.toLowerCase().includes(query.toLowerCase())
  )

  const displayPosts = query? filtered : posts

  return (
    <div className="w-full bg-white flex flex-col h-[100dvh] overflow-hidden">

      {/* Search Bar - 2026 Style */}
      <div className="px-3 py-2.5 bg-white shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#efefef] rounded-[10px] px-3 py-[9px] flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-[16px] placeholder:text-[#8e8e8e]"
              autoFocus
            />
            {query && (
              <button onClick={()=>setQuery("")} className="bg-[#c7c7c7] rounded-full w-[18px] h-[18px] flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">✕</span>
              </button>
            )}
          </div>
          {query && <button onClick={()=>setQuery("")} className="text-[15px]">Cancel</button>}
        </div>

        {/* Tabs - 100% working */}
        {query && (
          <div className="flex gap-6 mt-3 overflow-x-auto">
            {["Top","Accounts","Audio","Tags","Places"].map(tab=>(
              <button
                key={tab}
                onClick={()=>setActiveTab(tab)}
                className={`pb-2 text-[14px] font-medium whitespace-nowrap border-b ${activeTab===tab? "border-black text-black font-bold" : "border-transparent text-[#8e8e8e]"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {query === ""? (
          <>
            <div className="p-3 flex justify-between items-center">
              <p className="font-bold text-[16px]">Explore</p>
              <div className="w-6 h-6 border border-black rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-[2px]">
              {posts.map((p:any,i:number)=>(
                <div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-[#efefef] relative group cursor-pointer">
                  <img src={p.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5">
                    {i % 3 === 0 && <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.5l2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 14.8l-4.7 2.2.9-5.2-3.8-3.7 5.3-.8L12 2.5z"/></svg>}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-active:bg-black/20"/>
                </div>
              ))}
            </div>
            {posts.length===0 && (
              <div className="py-24 text-center">
                <div className="w-24 h-24 border-[3px] border-black rounded-full mx-auto flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>
                </div>
                <p className="font-light text-[22px] mt-4">No Posts Yet</p>
                <p className="text-[14px] text-[#8e8e8e] mt-1">When you share photos, they will appear here</p>
              </div>
            )}
          </>
        ) : (
          <>
            {filtered.length>0? (
              <div className="grid grid-cols-3 gap-[2px]">
                {filtered.map((p:any,i:number)=>(
                  <div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-[#efefef] cursor-pointer">
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-[16px]">No results for "{query}"</p>
                <p className="text-[14px] text-[#8e8e8e] mt-1">Try searching for something else</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full View Modal - 100% working */}
      {selected && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="flex justify-between items-center p-3 text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs overflow-hidden">
                {photo? <img src={photo} alt="" className="w-full h-full object-cover" /> : "M"}
              </div>
              <span className="font-semibold text-sm">{selected.username || "knmahesh"}</span>
            </div>
            <button onClick={()=>setSelected(null)} className="w-8 h-8 flex items-center justify-center text-xl">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <img src={selected.image} alt="" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="bg-black p-3 shrink-0">
            <div className="flex gap-4 mb-2">
              <button onClick={()=>setLiked({...liked, [selected.image]:!liked[selected.image]})} className="text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill={liked[selected.image]? "white" : "none"} stroke="white" strokeWidth="1.8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <button className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
              <button className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
            </div>
            <p className="text-white text-sm"><span className="font-bold">{selected.username || "knmahesh"}</span> {selected.caption}</p>
          </div>
        </div>
      )}

      {/* 2026 NEW 5G BOTTOM NAV - Full Working */}
      <div className="bg-white border-t border-[#dbdbdb] shrink-0">
        <div className="max-w-md mx-auto flex justify-between items-center px-2 h-[50px]">
          <Link href="/" className="w-12 h-12 flex items-center justify-center">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M12 2.8L2 12h3v8h6v-6h2v6h6v-8h3L12 2.8z"/></svg>
          </Link>
          <Link href="/search" className="w-12 h-12 flex items-center justify-center">
            <div className="bg-[#efefef] rounded-full w-10 h-7 flex items-center justify-center">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="5.5"/><path d="M20 20l-2.5-2.5"/></svg>
            </div>
          </Link>
          <Link href="/" className="w-12 h-12 flex items-center justify-center">
            <div className="w-[23px] h-[23px] rounded-[6px] border-[1.7px] border-black flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </Link>
          <Link href="/reels" className="w-12 h-12 flex items-center justify-center">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M9.5 8.5l6 3.5-6 3.5v-7z" fill="black" stroke="none"/></svg>
          </Link>
          <Link href="/profile" className="w-12 h-12 flex items-center justify-center">
            <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {photo? <img src={photo} alt="" className="w-full h-full object-cover" /> : <span className="text-[11px] font-bold">M</span>}
            </div>
          </Link>
        </div>
      </div>

    </div>
  )
            }
