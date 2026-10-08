'use client'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'

export default function MessagesPage(){
  const [active, setActive] = useState<any>(null)
  const [msg, setMsg] = useState("")
  const [chats, setChats] = useState([
    {from:"them",text:"Hey bro! Reels icons fix ayinda? 🚀"},
    {from:"me",text:"Ha bro done! New 5 icons pettina 💯"},
  ])

  const list = [
    {id:1,name:"ChitPix Team",last:"M logo fire 🔥",time:"2m",unread:2,online:true},
    {id:2,name:"My Work",last:"Design ready?",time:"15m",unread:0,online:true},
    {id:3,name:"Knmahesh",last:"Bro check DM page",time:"1h",unread:1,online:false},
    {id:4,name:"Travel Buddies",last:"Where are you?",time:"3h",unread:0,online:false},
  ]

  if(active){
    return (
      <div className="flex flex-col h-[100dvh] bg-white">
        <div className="flex items-center gap-3 p-3 border-b border-[#dbdbdb]">
          <button onClick={()=>setActive(null)} className="w-8 h-8 flex items-center justify-center text-xl">←</button>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">{active.name[0]}</div>
          <div>
            <p className="font-semibold text-sm">{active.name}</p>
            <p className="text-[11px] text-gray-500">{active.online? "Active now" : "Active 1h ago"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-white">
          {chats.map((c:any,i:number)=>(
            <div key={i} className={`max-w-[70%] px-3 py-2 rounded-[18px] text-sm ${c.from==='me'? 'bg-[#0095f6] text-white self-end rounded-br-[4px]' : 'bg-[#efefef] text-black self-start rounded-bl-[4px]'}`}>{c.text}</div>
          ))}
        </div>

        <div className="p-2 border-t border-[#dbdbdb] flex gap-2 items-center bg-white">
          <div className="flex-1 bg-[#efefef] rounded-full px-3 py-2 flex items-center gap-2">
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&msg){setChats([...chats,{from:'me',text:msg}]);setMsg("")}}} placeholder="Message..." className="bg-transparent outline-none flex-1 text-sm" />
          </div>
          <button onClick={()=>{if(msg){setChats([...chats,{from:'me',text:msg}]);setMsg("")}}} className="text-[#0095f6] font-bold text-sm pr-2">Send</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-[18px]">knmahesh</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <Link href="/" className="text-xl">✕</Link>
      </div>

      {/* Search */}
      <div className="p-2.5 shrink-0">
        <div className="bg-[#efefef] rounded-[10px] px-3 py-2 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>
          <input placeholder="Ask Meta AI or search" className="bg-transparent outline-none flex-1 text-[13px]" />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {list.map((c:any)=>(
          <div key={c.id} onClick={()=>setActive(c)} className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-bold">{c.name[0]}</div>
              {c.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="text-[14px] font-normal truncate">{c.name}</p>
