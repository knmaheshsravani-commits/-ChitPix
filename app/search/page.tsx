"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const MOCK_USERS = [
  { username:"knmahesh", name:"K N Mahesh", photo:"", verified:true },
  { username:"zepto_rider_", name:"Zepto Rider", photo:"https://picsum.photos/100/100?random=1" },
  { username:"virat.kohli", name:"Virat Kohli", photo:"https://picsum.photos/100/100?random=2", verified:true },
  { username:"travel_lover", name:"Travel Lover", photo:"https://picsum.photos/100/100?random=3" },
  { username:"foodie_queen", name:"Foodie Queen", photo:"https://picsum.photos/100/100?random=4" },
]

const MOCK_AUDIOS = [
  { title:"Original audio - knmahesh", uses:"12.3K reels" },
  { title:"Trending 2026 - Chill Mix", uses:"89K reels" },
  { title:"Love Story - Taylor", uses:"1.2M reels" },
]

const MOCK_TAGS = [
  { tag:"#trending", posts:"2.1M" },
  { tag:"#chitpix", posts:"15.2K" },
  { tag:"#viral2026", posts:"890K" },
]

export default function SearchPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [photo, setPhoto] = useState("")
  const [selected, setSelected] = useState<any>(null)
  const [liked, setLiked] = useState<any>({})
  const [activeTab, setActiveTab] = useState("Top")
  const [recent, setRecent] = useState<string[]>([])
  const [exploreCat, setExploreCat] = useState("For You")

  useEffect(()=>{
    const s = localStorage.getItem("posts")
    if(s) setPosts(JSON.parse(s))
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const r = localStorage.getItem("search_recent")
    if(r) setRecent(JSON.parse(r))
  },[])

  const saveRecent = (q:string)=>{
    if(!q.trim()) return
    const newR = [q,...recent.filter(r=>r!==q)].slice(0,8)
    setRecent(newR)
    localStorage.setItem("search_recent", JSON.stringify(newR))
  }

  const filteredPosts = posts.filter((p:any)=>
    p.caption?.toLowerCase().includes(query.toLowerCase()) ||
    p.username?.toLowerCase().includes(query.toLowerCase())
  )
  const filteredUsers = MOCK_USERS.filter(u=> u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase()))
  const filteredAudios = MOCK_AUDIOS.filter(a=> a.title.toLowerCase().includes(query.toLowerCase()))
  const filteredTags = MOCK_TAGS.filter(t=> t.tag.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="w-full bg-white flex flex-col h-[100dvh] overflow-hidden">
      {/* SEARCH BAR */}
      <div className="px-3 py-2.5 bg-white shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#efefef] rounded-[10px] px-3 py-[9px] flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') saveRecent(query)}} placeholder="Search" className="bg-transparent outline-none flex-1 text-[16px] placeholder:text-[#8e8e8e]" autoFocus />
            {query && (
              <button onClick={()=>setQuery("")} className="bg-[#c7c7c7] rounded-full w-[18px] h-[18px] flex items-center justify-center"><span className="text-white text-[11px] font-bold">✕</span></button>
            )}
          </div>
          {query && <button onClick={()=>setQuery("")} className="text-[15px]">Cancel</button>}
        </div>
        {query && (
          <div className="flex gap-6 mt-3 overflow-x-auto scrollbar-none">
            {["Top","Accounts","Audio","Tags","Places"].map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} className={`pb-2 text-[14px] whitespace-nowrap border-b-2 ${activeTab===tab? "border-black text-black font-bold" : "border-transparent text-[#8e8e8e] font-medium"}`}>{tab}</button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-white">
        {query === ""? (
          <>
            {recent.length>0 && (
              <div className="p-3">
                <div className="flex justify-between items-center mb-3"><p className="font-bold text-[16px]">Recent</p><button onClick={()=>{setRecent([]); localStorage.removeItem("search_recent")}} className="text-blue-500 text-[14px] font-medium">Clear all</button></div>
                {recent.map((r,i)=>(
                  <div key={i} onClick={()=>setQuery(r)} className="flex items-center gap-3 py-2.5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">🕒</div>
                    <p className="text-[14px] flex-1">{r}</p>
                    <button onClick={(e)=>{e.stopPropagation(); const nr=recent.filter((_,idx)=>idx!==i); setRecent(nr); localStorage.setItem("search_recent", JSON.stringify(nr))}} className="text-[18px] text-gray-400">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto">
              {["For You","Food","Travel","Style","Music","Animals"].map(cat=>(
                <button key={cat} onClick={()=>setExploreCat(cat)} className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap border ${exploreCat===cat? "bg-black text-white border-black" : "bg-white text-black border-gray-200"}`}>{cat}</button>
              ))}
            </div>
            <div className="p-3 flex justify-between items-center"><p className="font-bold text-[16px]">Explore</p><span className="text-[12px] text-gray-500">{posts.length} posts</span></div>
            <div className="grid grid-cols-3 gap-[2px]">
              {posts.map((p:any,i:number)=>(
                <div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-[#efefef] relative cursor-pointer overflow-hidden group">
                  <img src={p.image} alt="" className="w-full h-full object-cover group-active:scale-105 transition duration-200" />
                  {i%5===0 && <div className="absolute top-1.5 right-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2.5l2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 14.8l-4.7 2.2.9-5.2-3.8-3.7 5.3-.8L12 2.5z"/></svg></div>}
                </div>
              ))}
            </div>
            {posts.length===0 && (
              <div className="py-24 text-center"><div className="w-24 h-24 border-[3px] border-black rounded-full mx-auto flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg></div><p className="font-light text-[22px] mt-4">No Posts Yet</p></div>
            )}
          </>
        ) : (
          <>
            {activeTab==="Top" && (
              filteredPosts.length>0? <div className="grid grid-cols-3 gap-[2px]">{filteredPosts.map((p:any,i:number)=>(<div key={i} onClick={()=>{setSelected(p); saveRecent(query)}} className="aspect-square bg-[#efefef] cursor-pointer"><img src={p.image} alt="" className="w-full h-full object-cover"/></div>))}</div>
              : <div className="py-20 text-center"><p className="text-[16px]">No results for "{query}"</p><p className="text-[14px] text-[#8e8e8e] mt-1">Try searching for something else</p></div>
            )}
            {activeTab==="Accounts" && (
              <div className="divide-y">{filteredUsers.length>0? filteredUsers.map((u:any,i:number)=>(
                <div key={i} onClick={()=>saveRecent(u.username)} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <img src={u.photo||`https://i.pravatar.cc/100?u=${u.username}`} alt="" className="w-12 h-12 rounded-full object-cover"/>
                  <div className="flex-1"><div className="flex items-center gap-1"><p className="font-semibold text-[14px]">{u.username}</p>{u.verified&&<span className="text-blue-500 text-[12px]">✔</span>}</div><p className="text-[13px] text-gray-500">{u.name}</p></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )) : <div className="py-20 text-center text-gray-500">No accounts found</div>}</div>
            )}
            {activeTab==="Audio" && (
              <div className="divide-y">{filteredAudios.map((a:any,i:number)=>(
                <div key={i} onClick={()=>saveRecent(a.title)} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">🎵</div>
                  <div><p className="font-medium text-[14px]">{a.title}</p><p className="text-[12px] text-gray-500">{a.uses}</p></div>
                </div>
              ))}</div>
            )}
            {activeTab==="Tags" && (
              <div className="divide-y">{filteredTags.map((t:any,i:number)=>(
                <div key={i} onClick={()=>saveRecent(t.tag)} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 border rounded-full flex items-center justify-center font-bold">#</div>
                  <div><p className="font-medium text-[14px]">{t.tag}</p><p className="text-[12px] text-gray-500">{t.posts} posts</p></div>
                </div>
              ))}</div>
            )}
            {activeTab==="Places" && (<div className="py-20 text-center text-gray-500">No places near you</div>)}
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="flex justify-between items-center p-3 text-white shrink-0">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs overflow-hidden">{photo? <img src={photo} alt="" className="w-full h-full object-cover"/> : "M"}</div><span className="font-semibold text-sm">{selected.username||"knmahesh"}</span></div>
            <button onClick={()=>setSelected(null)} className="w-8 h-8 flex items-center justify-center text-xl">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black"><img src={selected.image} alt="" className="max-w-full max-h-full object-contain"/></div>
          <div className="bg-black p-3 shrink-0">
            <div className="flex gap-4 mb-2">
              <button onClick={()=>setLiked({...liked, [selected.image]:!liked[selected.image]})} className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill={liked[selected.image]? "white":"none"} stroke="white" strokeWidth="1.8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
              <button className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
              <button className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
            </div>
            <p className="text-white text-sm"><span className="font-bold">{selected.username||"knmahesh"}</span> {selected.caption||"My post ❤️"}</p>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-[#dbdbdb] shrink-0">
        <div className="max-w-md mx-auto flex justify-between items-center px-2 h-[50px]">
          <Link href="/" className="w-12 h-12 flex items-center justify-center"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M12 2.8L2 12h3v8h6v-6h2v6h6v-8h3L12 2.8z"/></svg></Link>
          <Link href="/search" className="w-12 h-12 flex items-center justify-center"><div className="bg-[#efefef] rounded-full w-10 h-7 flex items-center justify-center"><svg width="23" height="23" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="5.5"/><path d="M20 20l-2.5-2.5"/></svg></div></Link>
          <Link href="/" className="w-12 h-12 flex items-center justify-center"><div className="w-[23px] h-[23px] rounded-[6px] border-[1.7px] border-black flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></Link>
          <Link href="/reels" className="w-12 h-12 flex items-center justify-center"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M9.5 8.5l6 3.5-6 3.5v-7z" fill="black" stroke="none"/></svg></Link>
          <Link href="/profile" className="w-12 h-12 flex items-center justify-center"><div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">{photo? <img src={photo} alt="" className="w-full h-full object-cover"/> : <span className="text-[11px] font-bold">M</span>}</div></Link>
        </div>
      </div>
    </div>
  )
                  }
