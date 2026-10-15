"use client"
import { useState } from "react"

export default function ShareAZ({ post, onClose, onToast, onDownload }: any) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState<"Messages" | "Requests">("Messages")

  const users = [
    { id: "1", name: "taste_of_Umesh", img: "https://i.pravatar.cc/100?img=11", verified: true, status: "2 new messages · 1w", dot: "blue" },
    { id: "2", name: "RX TAGUR 46😜", img: "https://i.pravatar.cc/100?img=12", status: "Seen", dot: "none", story: true },
    { id: "3", name: "somesh", img: "https://i.pravatar.cc/100?img=8", status: "Call me · 28w", dot: "none" },
    { id: "4", name: "dhanavire✨158", img: "", status: "Active 20m ago", dot: "none" },
    { id: "5", name: "x__srini", img: "https://i.pravatar.cc/100?img=15", status: "Sent", dot: "none" },
    { id: "6", name: "nithin_k", img: "https://i.pravatar.cc/100?img=3", status: "Active now", dot: "green" },
  ]

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id)? prev.filter(x => x!== id) : [...prev, id])
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
  const handleSend = () => {
    if (selected.length === 0) { onToast("Select friend to send R2"); return }
    onToast(`R2 Sent to ${selected.length} friends ✅`)
    onClose()
  }

  return (
    <div className="absolute inset-0 bg-white text-black z-[90] flex flex-col">
      <div className="h-[54px] flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-1"><h2 className="font-black text-[22px]">knmahesh30</h2><span className="text-[12px]">⌄</span><span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span></div>
        <span className="text-[20px]">📝</span>
      </div>

      <div className="px-4 py-2">
        <div className="bg-zinc-100 rounded-full flex items-center px-4 py-2.5 gap-2">
          <span className="text-zinc-500">⌕</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search or ask Meta AI" className="bg-transparent outline-none flex-1 text-[15px]" />
        </div>
      </div>

      <div className="flex gap-4 px-4 py-3 overflow-x-auto shrink-0 border-b border-zinc-100">
        <div className="flex flex-col items-center min-w-[70px]">
          <div className="relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border shadow px-2 py-1 rounded-full text-[12px]">Note...</div>
            <div className="w-[60px] h-[60px] rounded-full bg-black text-white flex items-center justify-center font-serif">M</div>
          </div>
          <span className="text-[11px] mt-1 text-zinc-500">Your note</span>
          <span className="text-[10px] font-bold">✕ Location off</span>
        </div>
        <div className="flex flex-col items-center min-w-[70px]"><img src="https://i.pravatar.cc/100?img=20" className="w-[60px] h-[60px] rounded-full object-cover" alt="" /><span className="text-[12px] mt-1">Map</span></div>
        <div className="flex flex-col items-center min-w-[70px] relative"><div className="w-[60px] h-[60px] rounded-full bg-zinc-200 overflow-hidden"><div className="w-full h-full bg-zinc-300 flex items-center justify-center">👤</div></div><span className="w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full absolute bottom-5 right-1"></span><span className="text-[12px] mt-1">Nithin K</span></div>
      </div>

      <div className="flex justify-between items-center px-4 py-2 shrink-0"><h3 className="font-bold text-[17px]">Messages</h3><button onClick={()=>setTab(tab==="Messages"?"Requests":"Messages")} className="text-[#0064e0] font-semibold">{tab==="Messages"?"Requests":"Messages"}</button></div>

      <div className="flex-1 overflow-y-auto px-2 pb-[130px]">
        {filtered.map(u=>(
          <div key={u.id} onClick={()=>toggle(u.id)} className="flex items-center justify-between py-2.5 px-2 hover:bg-zinc-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="relative"><div className={`w-[52px] h-[52px] rounded-full ${u.story?'p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600':'bg-zinc-200'}`}><div className="w-full h-full rounded-full bg-white p-[2px]">{u.img? <img src={u.img} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full bg-zinc-300 rounded-full" />}</div></div>{u.dot==="green" && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}</div>
              <div><div className="flex items-center gap-1"><span className="font-semibold text-[14px]">{u.name}</span>{u.verified && <span className="text-blue-500 text-[10px]">✔️</span>}</div><p className={`text-[12px] ${u.status.includes("new")?"font-bold text-black":"text-zinc-500"}`}>{u.status}</p></div>
            </div>
            <div className="flex items-center gap-2">{u.dot==="blue" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}{selected.includes(u.id)? <div className="w-6 h-6 bg-[#0064e0] rounded-full flex items-center justify-center text-white text-[11px]">✓</div> : <div className="w-6 h-6 border border-zinc-300 rounded-full"></div>}</div>
          </div>
        ))}

        <div className="mt-5 border-t pt-4 grid grid-cols-4 gap-3">
          <button onClick={()=>{navigator.clipboard.writeText(post?.image_url||""); onToast("Copied R2 🔗")}} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">🔗</div><span className="text-[10px]">Copy R2</span></button>
          <button onClick={()=>onDownload(post)} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">⬇️</div><span className="text-[10px]">Download</span></button>
          <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(post?.image_url||"")}`)} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-[12px]">WA</div><span className="text-[10px]">WhatsApp</span></button>
          <button onClick={()=>{onToast("Added to R2 Story ✅"); onClose()}} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full flex items-center justify-center text-white">+</div><span className="text-[10px]">Add Story</span></button>
        </div>
        <p className="text-[9px] text-zinc-400 text-center mt-4">20 FUTURES: Search Meta AI, Note, Map, Online, Requests, Verified, Blue dot, Seen, Active, Sent, Multi Select, Copy R2, Download R2, WA, Add Story, R2 Cloud, No Local, Group Send, Location Off, Story Ring</p>
      </div>

      <div className="absolute bottom-0 w-full bg-white border-t">
        {selected.length>0 && <div className="p-3"><button onClick={handleSend} className="w-full bg-[#0064e0] text-white py-3.5 rounded-full font-bold text-[14px]">Send R2 to {selected.length} friend{selected.length>1?"s":""}</button></div>}
        <div className="h-[60px] flex justify-around items-center px-2 text-[20px]"><span>🏠</span><span>🎬</span><span className="bg-zinc-100 px-6 py-1 rounded-full">✈️</span><span>🔍</span><span className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[11px]">M</span></div>
      </div>

      <button onClick={onClose} className="absolute top-2 right-3 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">✕</button>
    </div>
  )
}
