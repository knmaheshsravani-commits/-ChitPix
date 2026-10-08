'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'

export default function MessagesPage(){
  const [photo, setPhoto] = useState("")
  const [query, setQuery] = useState("")
  const [activeChat, setActiveChat] = useState<any>(null)
  const [msg, setMsg] = useState("")

  useEffect(()=>{
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
  },[])

  const chats = [
    { id:1, name:"ChitPix", avatar:"C", last:"You: M logo 🔥", time:"2m", unread:2, online:true, story:true },
    { id:2, name:"My Work", avatar:"M", last:"Seen the new design?", time:"15m", unread:0, online:true, story:true },
    { id:3, name:"Travel", avatar:"T", last:"Where are you?", time:"1h", unread:1, online:false, story:true },
    { id:4, name:"Knmahesh", avatar:"M", last:"Knmahesh", time:"3h", unread:0, online:false, story:false },
    { id:5, name:"Design Team", avatar:"D", last:"Bro check reels icon", time:"1d", unread:0, online:false, story:false },
  ]

  const filtered = chats.filter(c=> c.name.toLowerCase().includes(query.toLowerCase()))

  const [messages, setMessages] = useState<any[]>([
    { from:"them", text:"Hey bro! Reels icons fix ayyinda? 🚀" },
    { from:"me", text:"Ha bro fix ayindi! 2026 5G icons pettina 💯" },
    { from:"them", text:"Super! DM page kuda chala fast undi!" },
  ])

  const sendMsg = () => {
    if(!msg.trim()) return
    setMessages([...messages, {from:"me", text:msg}])
    setMsg("")
  }

  // If chat open - show chat screen
  if(activeChat){
    return (
      <div className="w-full bg-white flex flex-col h-[100dvh] overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#dbdbdb] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={()=>setActiveChat(null)} className="w-8 h-8 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">{activeChat.avatar}</div>
            <div>
              <p className="font-semibold text-[14px] leading-none">{activeChat.name}</p>
              <p className="text-[11px] text-[#8e8e8e]">{activeChat.online? "Active now" : "Active 1h ago"}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="6"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="12" x2="12" y2="12"/></svg>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 bg-white flex flex-col gap-2">
          {messages.map((m,i)=>(
            <div key={i} className={`max-w-[70%] px-3 py-2 rounded-[18px] text-[14px] ${m.from==='me'? "bg-[#0095f6] text-white self-end rounded-br-[4px]" : "bg-[#efefef] text-black self-start rounded-bl-[4px]"}`}>
              {m.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-2.5 border-t border-[#dbdbdb] shrink-0 bg-white flex items-center gap-2">
          <div className="flex-1 bg-[#efefef] rounded-full px-3 py-2 flex items-center gap-2">
            <button className="w-6 h-6 rounded-full bg-[#0095f6] text-white flex items-center justify-center text-[12px]">😊</button>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMsg()} placeholder="Message..." className="bg-transparent outline-none flex-1 text-[14px]" />
            <div className="flex gap-2 text-[18px]"><span>🎙️</span><span>🖼️</span><span>❤️</span></div>
          </div>
          {msg && <button onClick={sendMsg} className="text-[#0095f6] font-semibold text-[14px]">Send</button>}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></Link>
          <h1 className="font-bold text-[20px]">knmahesh</h1>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div className="flex gap-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2 shrink-0">
        <div className="bg-[#efefef] rounded-[10px] px-3 py-[8px] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e
