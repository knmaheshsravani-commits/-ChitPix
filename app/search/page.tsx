// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import BottomNav from "../components/BottomNav"

const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

function fixR2Url(p:any){
  let url = p.image_url || p.url || p.image || p.publicUrl || p.key || ""
  if(!url) return ""
  if(url.startsWith("http") && url.includes("r2.dev")) return url
  if(url.includes("posts/") || url.includes("stories/")){
    const parts = url.split("/")
    const file = parts.slice(-2).join("/")
    return `${R2_PUBLIC.replace(/\/$/, '')}/${file}`
  }
  const file = url.split("/").pop() || ""
  if(!file) return ""
  return `${R2_PUBLIC.replace(/\/$/, '')}/posts/${file}`
}

const I = ({c,s}:{c:string,s?:number}) => <span style={{fontSize:s||16, lineHeight:1}}>{c}</span>
const Search = (p:any) => <I c="🔍" s={p.size}/>
const X = (p:any) => <I c="✕" s={p.size}/>
const Clock = (p:any) => <I c="🕒" s={p.size}/>
const Heart = (p:any) => <span style={{fontSize:p.size||16}}>{p.fill && p.fill!=="none" ? "❤️" : "🤍"}</span>
const Flame = (p:any) => <I c="🔥" s={p.size}/>
const Compass = (p:any) => <I c="🧭" s={p.size}/>
const Hash = (p:any) => <I c="#" s={p.size}/>
const Music = (p:any) => <I c="🎵" s={p.size}/>
const User = (p:any) => <I c="👤" s={p.size}/>
const Mic = (p:any) => <I c="🎙️" s={p.size}/>

export default function SearchPage(){
  const [posts, setPosts] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<any>(null)
  const [liked, setLiked] = useState<any>({})
  const [activeTab, setActiveTab] = useState("Top")
  const [recent, setRecent] = useState<string[]>(["maggam","350","kadur"])
  const [toast, setToast] = useState("")
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("recent")
  const [priceRange, setPriceRange] = useState([200,2000])
  const [workType, setWorkType] = useState("All")
  const [color, setColor] = useState("All")
  const [realUsers, setRealUsers] = useState<any[]>([])
  const [navTab, setNavTab] = useState('search')

  const showToast = (m:string)=>{ setToast(m); setTimeout(()=>setToast(""),2500) }

  useEffect(()=>{
    const fetchR2 = async () => {
      setLoading(true)
      try{
        const res = await fetch("/api/posts?limit=100", {cache:"no-store"})
        const data = await res.json()
        const raw = data.posts || data || []
        const r2Posts = raw.map((p:any)=>({
          image: fixR2Url(p),
          image_url: fixR2Url(p),
          caption: p.caption || p.content || "ChitPix R2 HD",
          username: p.username || "knmahesh",
          likes: p.likes || 100,
          views: p.views || 500,
          price: p.price || 350,
          color: p.color || "gold",
          work: p.work || p.category || "Maggam",
          category: p.category || "For You",
          id: p.id
        })).filter((p:any)=>p.image)
        setPosts(r2Posts)
      }catch(e){ setPosts([]) } finally { setLoading(false) }
    }
    fetchR2()
  },[])

  useEffect(()=>{
    if(query.trim().length < 1){ setRealUsers([]); return }
    const t = setTimeout(async ()=>{
      try{
        const res = await fetch("/api/users?search="+query.toLowerCase(), {cache:"no-store"})
        const data = await res.json()
        if(data.users) setRealUsers(data.users)
      }catch(e){}
    },300)
    return ()=> clearTimeout(t)
  },[query])

  const saveRecent = (q:string)=>{
    if(!q.trim()) return
    setRecent([q].concat(recent.filter((r:any)=>r!==q)).slice(0,10))
  }

  // 25 FUTURES LOGIC
  const filteredPosts = posts.filter((p:any)=>{
    const q = query.toLowerCase()
    if(query && !(p.caption.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || String(p.id).includes(q))) return false
    if(workType!=="All" && p.work.toLowerCase()!==workType.toLowerCase()) return false
    if(color!=="All" && p.color.toLowerCase()!==color.toLowerCase()) return false
    if(p.price < priceRange[0] || p.price > priceRange[1]) return false
    return true
  }).sort((a,b)=>{
    if(sort==="popular") return b.likes - a.likes
    if(sort==="price_low") return a.price - b.price
    if(sort==="price_high") return b.price - a.price
    return b.id - a.id
  })

  return (
    <div className="w-full bg-white flex flex-col min-h-screen max-w-[470px] mx-auto pb-[60px]">
      {/* TOP SEARCH */}
      <div className="px-3 py-2.5 bg-white sticky top-0 z-30 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#efefef] rounded-full px-3 py-2 flex items-center gap-2">
            <Search size={16} />
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){saveRecent(query)}}} placeholder="Search R2 - ID, maggam, 350" className="bg-transparent outline-none flex-1 text-[14px]" autoFocus />
            {query && <button onClick={()=>setQuery("")} className="bg-zinc-300 rounded-full w-5 h-5 flex items-center justify-center"><X size={12} /></button>}
          </div>
          <button onClick={()=>{setQuery("");}} className="text-[14px] font-medium">Cancel</button>
        </div>

        {/* 25 FUTURES - CHIPS */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[
            {id:"Top", icon: Compass},
            {id:"Accounts", icon: User},
            {id:"Tags", icon: Hash},
          ].map((tab:any)=>{
            const Icon = tab.icon
            return <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={"px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap border "+(activeTab===tab.id ? "bg-black text-white border-black" : "bg-zinc-100 border-zinc-100")}><Icon size={12}/> {tab.id}</button>
          })}
        </div>

        {/* FILTERS - 6,7,8,9 */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          <select value={workType} onChange={e=>setWorkType(e.target.value)} className="bg-zinc-100 rounded-full px-3 py-1 text-[11px]">
            <option>All Work</option><option>Maggam</option><option>Aari</option><option>Stone</option><option>Zardosi</option>
          </select>
          <select value={color} onChange={e=>setColor(e.target.value)} className="bg-zinc-100 rounded-full px-3 py-1 text-[11px]">
            <option>All Color</option><option>Gold</option><option>Red</option><option>Green</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="bg-zinc-100 rounded-full px-3 py-1 text-[11px]">
            <option value="recent">Latest</option><option value="popular">Popular 🔥</option><option value="price_low">₹ Low</option><option value="price_high">₹ High</option>
          </select>
          <span className="bg-zinc-100 rounded-full px-3 py-1 text-[11px]">₹{priceRange[0]}-{priceRange[1]}</span>
        </div>
        <p className="text-[10px] text-zinc-400 mt-2">{filteredPosts.length} R2 results • {workType} • ₹{priceRange[0]}+ • No localStorage</p>
      </div>

      <div className="flex-1 bg-white">
        {loading && <div className="p-10 text-center text-zinc-400">Loading R2 HD...</div>}
        {recent.length>0 && query==="" && (
          <div className="p-3 border-b border-zinc-100">
            <div className="flex justify-between items-center mb-2"><p className="font-bold text-[13px]">Recent R2 Searches</p><button onClick={()=>setRecent([])} className="text-blue-500 text-[12px]">Clear</button></div>
            {recent.map((r:any,i:number)=>(
              <div key={i} onClick={()=>setQuery(r)} className="flex items-center gap-3 py-2 cursor-pointer"><Clock size={14}/><p className="text-[13px] flex-1">{r}</p></div>
            ))}
            <div className="mt-3"><p className="font-bold text-[12px]">Trending 🔥</p><div className="flex gap-2 mt-2 flex-wrap">{["maggam","kadur","350","red blouse","aari"].map((t:any)=>(<button key={t} onClick={()=>setQuery(t)} className="bg-zinc-100 rounded-full px-3 py-1 text-[11px]">#{t}</button>))}</div></div>
          </div>
        )}
        {!loading && (
          <>
            {activeTab==="Top" && <div className="grid grid-cols-3 gap-[2px]">{filteredPosts.map((p:any,i:number)=>(<div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-zinc-100 cursor-pointer relative group"><img src={p.image} alt="" className="w-full h-full object-cover"/><div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded">₹{p.price}</div><div className="absolute top-1 right-1 bg-black/60 text-white text-[7px] px-1 rounded">R2</div></div>))}</div>}
            {activeTab==="Accounts" && (
              <div className="divide-y divide-zinc-100">{realUsers.map((u:any,i:number)=>(
                <Link key={i} href={"/profile/"+u.username} className="flex items-center gap-3 p-3"><img src={u.avatar_url || "https://i.pravatar.cc/100?u="+u.username} className="w-11 h-11 rounded-full"/><div className="flex-1"><p className="font-semibold text-[13px]">{u.username}</p><p className="text-[11px] text-zinc-500">R2 Verified</p></div></Link>
              ))}</div>
            )}
          </>
        )}
        {filteredPosts.length===0 && !loading && query && <div className="p-10 text-center"><p className="text-zinc-400 text-[13px]">No R2 for "{query}"</p><div className="grid grid-cols-3 gap-[2px] mt-4">{posts.slice(0,6).map((p:any,i)=>(<div key={i} onClick={()=>setSelected(p)} className="aspect-square bg-zinc-100"><img src={p.image} className="w-full h-full object-cover"/></div>))}</div><p className="text-[11px] text-zinc-400 mt-2">Similar R2 designs</p></div>}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[470px] mx-auto">
          <div className="flex justify-between items-center p-3 text-white bg-black/50"><span className="font-semibold text-[13px]">{selected.username} • ₹{selected.price}</span><div className="flex gap-3"><a href={`https://wa.me/916363373372?text=Hi! ID ${selected.id} price?`} target="_blank" className="bg-green-500 px-3 py-1 rounded-full text-[11px]">WA</a><button onClick={()=>setSelected(null)}><X size={20}/></button></div></div>
          <div className="flex-1 flex items-center justify-center bg-black"><img src={selected.image} alt="" className="max-w-full max-h-full object-contain"/></div>
          <div className="p-3 bg-white"><p className="text-[13px]">{selected.caption}</p><div className="flex gap-2 mt-2"><button onClick={()=>{setLiked({...liked,[selected.id]:!liked[selected.id]}); showToast(liked[selected.id] ? "Unsaved" : "Saved to R2")}} className="flex-1 bg-zinc-100 py-2 rounded-full text-[12px]">{liked[selected.id] ? "❤️ Saved" : "🤍 Save R2"}</button><button onClick={()=>{navigator.clipboard.writeText(window.location.href); showToast("Link copied")}} className="flex-1 bg-black text-white py-2 rounded-full text-[12px]">Share ↗️</button></div></div>
        </div>
      )}

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-full text-[11px] z-[200]">{toast}</div>}
      <BottomNav activeTab={navTab} setActiveTab={setNavTab} />
    </div>
  )
       }
