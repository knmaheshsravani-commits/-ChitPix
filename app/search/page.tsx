// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const R2_PUBLIC_URL = "https://pub-62904f82f9ea4d4ebf8da6283b4e5cf9b2f55.r2.dev"

const I = ({c,s}:{c:string,s?:number}) => <span style={{fontSize:s||16, lineHeight:1}}>{c}</span>
const Search = (p:any) => <I c="🔍" s={p.size}/>
const X = (p:any) => <I c="✕" s={p.size}/>
const Clock = (p:any) => <I c="🕒" s={p.size}/>
const Heart = (p:any) => <span style={{fontSize:p.size||16}}>{p.fill && p.fill!=="none" ? "❤️" : "🤍"}</span>
const Eye = (p:any) => <I c="👁️" s={p.size}/>
const Play = (p:any) => <I c="▶️" s={p.size}/>
const Hash = (p:any) => <I c="#" s={p.size}/>
const Music = (p:any) => <I c="🎵" s={p.size}/>
const MapPin = (p:any) => <I c="📍" s={p.size}/>
const User = (p:any) => <I c="👤" s={p.size}/>
const Crown = (p:any) => <I c="👑" s={p.size}/>
const Sparkles = (p:any) => <I c="✨" s={p.size}/>
const Bot = (p:any) => <I c="🤖" s={p.size}/>
const Mic = (p:any) => <I c="🎙️" s={p.size}/>
const Filter = (p:any) => <I c="⚙️" s={p.size}/>
const Flame = (p:any) => <I c="🔥" s={p.size}/>
const Compass = (p:any) => <I c="🧭" s={p.size}/>
const ShoppingBag = (p:any) => <I c="🛍️" s={p.size}/>
const Clapperboard = (p:any) => <I c="🎬" s={p.size}/>
const Bookmark = (p:any) => <I c="🔖" s={p.size}/>
const Send = (p:any) => <I c="↗️" s={p.size}/>
const BarChart3 = (p:any) => <I c="📊" s={p.size}/>
const House = (p:any) => <I c="🏠" s={p.size}/>
const Plus = (p:any) => <I c="➕" s={p.size}/>

const MOCK_USERS = [
  { username:"knmahesh", name:"K N Mahesh", photo:"", verified:true, followers:"10K" },
  { username:"zepto_rider_", name:"Zepto Rider", photo:"", followers:"2.3K" },
  { username:"virat.kohli", name:"Virat Kohli", photo:"", verified:true, followers:"270M" },
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
  const [toast, setToast] = useState("")
  const [sort, setSort] = useState("recent")
  const [loading, setLoading] = useState(true)
  const [aiSearching, setAiSearching] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [realUsers, setRealUsers] = useState<any[]>([])

  const showToast = (m:string)=>{ setToast(m); setTimeout(()=>setToast(""),2500) }

  useEffect(()=>{
    const fetchR2 = async () => {
      setLoading(true)
      try{
        const res = await fetch("/api/posts", {cache:"no-store"})
        const data = await res.json()
        if(Array.isArray(data) && data.length>0){
          const r2Posts = data.map((p:any)=>{
            return {
              image: p.image_url || p.url,
              image_url: p.image_url || p.url,
              caption: p.caption || p.content || "ChitPix 2026",
              username: p.username || "knmahesh",
              likes: p.likes || 100,
              views: p.views || 500,
              category: p.category || "For You",
              id: p.id
            }
          })
          setPosts(r2Posts)
        }
      }catch(e){
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchR2()
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const r = localStorage.getItem("search_recent")
    if(r) try{setRecent(JSON.parse(r))}catch{}
  },[])

  useEffect(()=>{
    if(query.trim().length < 1){
      setRealUsers([])
      return
    }
    const t = setTimeout(async ()=>{
      try{
        const res = await fetch("/api/users?search="+query.toLowerCase(), {cache:"no-store"})
        const data = await res.json()
        if(data.users && Array.isArray(data.users)){
          setRealUsers(data.users)
        }
      }catch(e){}
    },300)
    return ()=> clearTimeout(t)
  },[query])

  const saveRecent = (q:string)=>{
    if(!q.trim()) return
    const newR = [q].concat(recent.filter((r:any)=>r!==q)).slice(0,10)
    setRecent(newR)
    localStorage.setItem("search_recent", JSON.stringify(newR))
  }

  const handleAISearch = ()=>{
    setAiSearching(true)
    setTimeout(()=>{
      setAiSearching(false)
      showToast("Found results")
    },800)
  }

  const handleVoice = ()=>{
    setShowVoice(true)
    setTimeout(()=>{setShowVoice(false); setQuery("trending")},1000)
  }

  const filteredPosts = posts.filter((p:any)=>{
    const q = query.toLowerCase()
    if(!query) return true
    if(p.caption && p.caption.toLowerCase().includes(q)) return true
    if(p.username && p.username.toLowerCase().includes(q)) return true
    return false
  })

  const baseUsers = realUsers.length > 0 ? realUsers : MOCK_USERS
  const filteredUsers = baseUsers

  return (
    <div className="w-full bg-white flex flex-col h-[100dvh] overflow-hidden max-w-[470px] mx-auto">
      <div className="px-3 py-2.5 bg-white shrink-0 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#efefef] rounded-full px-3 py-2 flex items-center gap-2">
            <Search size={16} />
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){saveRecent(query); handleAISearch()}}} placeholder="Search R2" className="bg-transparent outline-none flex-1 text-[14px]" />
            <button onClick={handleVoice} className="p-1"><Mic size={16} /></button>
            {query && <button onClick={()=>setQuery("")} className="bg-zinc-300 rounded-full w-5 h-5 flex items-center justify-center"><X size={12} /></button>}
          </div>
          <button onClick={()=>{setQuery(""); setActiveTab("Top")}} className="text-[14px] font-medium">Cancel</button>
        </div>
        <div className="flex gap-5 mt-3 overflow-x-auto">
          {[
            {id:"Top", icon: Compass},
            {id:"Accounts", icon: User},
            {id:"Audio", icon: Music},
            {id:"Tags", icon: Hash},
          ].map((tab:any)=>{
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={"pb-2 text-[13px] flex items-center gap-1 whitespace-nowrap border-b-2 "+(activeTab===tab.id ? "border-black text-black font-bold" : "border-transparent text-zinc-400")}>
                <Icon size={14}/> {tab.id}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {loading && <div className="p-10 text-center text-zinc-400">Loading R2...</div>}
        {recent.length>0 && query==="" && (
          <div className="p-3 border-b border-zinc-100">
            <div className="flex justify-between items-center mb-2"><p className="font-bold text-[14px]">Recent</p><button onClick={()=>{setRecent([]); localStorage.removeItem("search_recent")}} className="text-blue-500 text-[13px]">Clear</button></div>
            {recent.map((r:any,i:number)=>(
              <div key={i} onClick={()=>setQuery(r)} className="flex items-center gap-3 py-2 cursor-pointer">
                <Clock size={14}/><p className="text-[13px] flex-1">{r}</p><X size={14}/>
              </div>
            ))}
          </div>
        )}
        {!loading && query === "" && (
          <>
            <div className="grid grid-cols-3 gap-[2px]">
              {filteredPosts.map((p:any,i:number)=>(
                <div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-zinc-100 cursor-pointer">
                  <img src={p.image || p.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && query !== "" && (
          <>
            {activeTab==="Top" && <div className="grid grid-cols-3 gap-[2px]">{filteredPosts.map((p:any,i:number)=>(<div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-zinc-100 cursor-pointer"><img src={p.image} alt="" className="w-full h-full object-cover"/></div>))}</div>}
            {activeTab==="Accounts" && (
              <div className="divide-y divide-zinc-100">{filteredUsers.map((u:any,i:number)=>(
                <Link key={i} href={"/profile/"+u.username} className="flex items-center gap-3 p-3 hover:bg-zinc-50 cursor-pointer">
                  <img src={u.avatar_url || u.photo || "https://i.pravatar.cc/100?u="+u.username} alt="" className="w-11 h-11 rounded-full object-cover bg-zinc-100"/>
                  <div className="flex-1"><p className="font-semibold text-[13px]">{u.username}</p><p className="text-[12px] text-zinc-500">{u.name || "ChitPix User"}</p></div>
                  <button className="bg-black text-white px-4 py-1 rounded-full text-[11px] font-bold">Follow</button>
                </Link>
              ))}</div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="flex justify-between items-center p-3 text-white"><span className="font-semibold text-[13px]">{selected.username}</span><button onClick={()=>setSelected(null)}><X size={20}/></button></div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <img src={selected.image || selected.image_url} alt="" className="max-w-full max-h-full object-contain"/>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-full text-[11px] z-[200]">{toast}</div>}

      <div className="bg-white border-t border-zinc-200 shrink-0">
        <div className="max-w-md mx-auto flex justify-between items-center px-2 h-[52px]">
          <Link href="/" className="w-12 h-12 flex items-center justify-center"><House size={22}/></Link>
          <Link href="/search" className="w-12 h-12 flex items-center justify-center"><div className="bg-black rounded-full w-9 h-9 flex items-center justify-center"><Search size={18} /></div></Link>
          <Link href="/reels" className="w-12 h-12 flex items-center justify-center"><Clapperboard size={22}/></Link>
          <Link href="/profile" className="w-12 h-12 flex items-center justify-center"><User size={16}/></Link>
        </div>
      </div>
    </div>
  )
      }
