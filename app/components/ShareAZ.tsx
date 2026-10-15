"use client"
import { useState } from "react"
import { Icons } from "./NewIcons"

type Props = {
  post: any
  onClose: () => void
  onToast: (m: string) => void
  onDownload: (p: any) => void
}

// 2026 NEW ICONS INSIDE SHARE
const NewShareIcons = {
  Link: ({ size=22 }: {size?:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.4" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
  Download: ({ size=22 }: {size?:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M7 12l5 5 5-5"/><path d="M4 20h16"/></svg>
  ),
  WhatsApp: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M19.05 4.9A9.82 9.82 0 0 0 12.04 2C6.6 2 2.2 6.4 2.2 11.85c0 1.7.44 3.4 1.28 4.9L2 22l5.4-1.42A9.84 9.84 0 0 0 12.04 22c5.44 0 9.84-4.4 9.84-9.85 0-2.63-1.03-5.1-2.83-6.25zM12.04 20c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.84.85-3.1-.2-.3A8.03 8.03 0 0 1 3.9 11.85C3.9 7.35 7.55 3.7 12.04 3.7c2.18 0 4.23.85 5.77 2.4a8.1 8.1 0 0 1 2.37 5.75c0 4.5-3.65 8.15-8.14 8.15z"/><path d="M17.4 14.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.5.7.3 1.26.5 1.69.62.7.22 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34z" fill="white"/></svg>
  ),
  AddStory: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="url(#g)" strokeWidth="1.4"/><defs><linearGradient id="g" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#feda75"/><stop offset="1" stopColor="#d62976"/></linearGradient></defs><path d="M12 8v8M8 12h8" stroke="black" strokeWidth="1.4" strokeLinecap="round"/></svg>
  )
}

export default function ShareAZ({ post, onClose, onToast, onDownload }: Props) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  const users = [
    { id: "1", name: "taste_of_Umesh", img: "https://i.pravatar.cc/100?img=11", verified: true, status: "2 new messages · 1w", dot: "blue" as const },
    { id: "2", name: "RX TAGUR 46", img: "https://i.pravatar.cc/100?img=12", verified: false, status: "Seen", dot: "none" as const, story: true },
    { id: "3", name: "somesh", img: "https://i.pravatar.cc/100?img=8", verified: false, status: "Call me · 28w", dot: "none" as const },
    { id: "4", name: "dhanavire✨158", img: "", verified: false, status: "Active 20m ago", dot: "none" as const },
    { id: "5", name: "x__srini", img: "https://i.pravatar.cc/100?img=15", verified: false, status: "Sent", dot: "none" as const },
    { id: "6", name: "knmahesh30", img: "https://i.pravatar.cc/100?img=1", verified: false, status: "Active now", dot: "green" as const },
  ]

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id)? prev.filter(x => x!== id) : [...prev, id])
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="absolute inset-0 bg-white text-black z-[90] flex flex-col">
      <div className="h-[54px] flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-1"><h2 className="font-black text-[22px]">knmahesh30</h2><span className="text-[12px]">⌄</span><span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span></div>
        <span className="text-[20px]">📝</span>
      </div>

      <div className="px-4 py-2">
        <div className="bg-zinc-100 rounded-full flex items-center px-4 py-2.5 gap-2">
          <span className="text-zinc-500">⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search or ask Meta AI" className="bg-transparent outline-none flex-1 text-[15px]" />
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
      </div>

      <div className="flex justify-between items-center px-4 py-2 shrink-0">
        <h3 className="font-bold text-[17px]">Messages</h3><span className="text-[#0064e0] font-semibold">Requests</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-[150px]">
        {filtered.map(u => (
          <div key={u.id} onClick={() => toggle(u.id)} className="flex items-center justify-between py-2.5 px-2 hover:bg-zinc-50 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-[52px] h-[52px] rounded-full ${u.story? 'p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600' : 'bg-zinc-200'}`}>
                  <div className="w-full h-full rounded-full bg-white p-[2px]">{u.img? <img src={u.img} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full bg-zinc-300 rounded-full" />}</div>
                </div>
                {u.dot === "green" && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
              </div>
              <div>
                <div className="flex items-center gap-1"><span className="font-semibold text-[14px]">{u.name}</span>{u.verified && <span className="text-blue-500 text-[10px]">✔️</span>}</div>
                <p className={`text-[12px] ${u.status.includes("new")? "font-bold text-black" : "text-zinc-500"}`}>{u.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {u.dot === "blue" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              {selected.includes(u.id)? <div className="w-6 h-6 bg-[#0064e0] rounded-full flex items-center justify-center text-white text-[11px]">✓</div> : <div className="w-6 h-6 border border-zinc-300 rounded-full"></div>}
            </div>
          </div>
        ))}

        {/* 2026 NEW ICONS - NO OLD EMOJI */}
        <div className="mt-6 border-t border-zinc-100 pt-5 grid grid-cols-4 gap-3">
          <button onClick={() => { navigator.clipboard.writeText(post?.image_url || ""); onToast("Copied R2 link 🔗") }} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><NewShareIcons.Link size={24} /></div>
            <span className="text-[11px] font-medium">Copy R2</span>
          </button>
          <button onClick={() => onDownload(post)} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><NewShareIcons.Download size={24} /></div>
            <span className="text-[11px] font-medium">Download</span>
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post?.image_url || "")}`)} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><NewShareIcons.WhatsApp /></div>
            <span className="text-[11px] font-medium">WhatsApp</span>
          </button>
          <button onClick={() => { onToast("Added to R2 Story ✅"); onClose() }} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><NewShareIcons.AddStory /></div>
            <span className="text-[11px] font-medium">Add Story</span>
          </button>
        </div>

        {/* EXTRA ROW - 2026 ICONS */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          <button onClick={() => { onToast("Shared to Feed R2"); onClose() }} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><Icons.Home active={false} size={22} /></div>
            <span className="text-[11px]">Feed</span>
          </button>
          <button onClick={() => { onToast("Reposted R2"); onClose() }} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><Icons.Repost size={22} /></div>
            <span className="text-[11px]">Repost</span>
          </button>
          <button onClick={() => { navigator.clipboard.writeText(post?.image_url || ""); onToast("Link Copied"); }} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><Icons.Share size={22} /></div>
            <span className="text-[11px]">Share</span>
          </button>
          <button onClick={() => onClose()} className="flex flex-col items-center gap-2">
            <div className="w-[56px] h-[56px] bg-zinc-100 rounded-full flex items-center justify-center"><Icons.Search size={22} /></div>
            <span className="text-[11px]">More</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-white border-t">
        {selected.length > 0 && <div className="p-3"><button onClick={() => { onToast(`R2 Sent to ${selected.length} friends ✅`); onClose() }} className="w-full bg-[#0064e0] text-white py-3.5 rounded-full font-bold">Send R2 to {selected.length} friend{selected.length > 1? "s" : ""}</button></div>}
        <div className="h-[60px] flex justify-around items-center px-2">
          <div className="w-6 h-6 flex items-center justify-center"><Icons.Home active={false} size={24} /></div>
          <div className="w-6 h-6 flex items-center justify-center"><Icons.Reels size={24} /></div>
          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center"><Icons.Share size={20} /></div>
          <div className="w-6 h-6 flex items-center justify-center"><Icons.Search size={24} /></div>
          <div className="w-7 h-7 bg-black rounded-full text-white flex items-center justify-center text-[11px]">M</div>
        </div>
      </div>

      <button onClick={onClose} className="absolute top-2 right-3 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">✕</button>
    </div>
  )
      }
