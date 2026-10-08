'use client'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'

export default function MessagesPage(){
  const [active, setActive] = useState<any>(null)
  const [text, setText] = useState("")
  const [msgs, setMsgs] = useState([{f:"them",t:"Hey bro! Reels fix ayinda?"},{f:"me",t:"Ha bro done!"}])

  const users = [
    {id:1,n:"ChitPix Team",l:"M logo fire",ti:"2m",u:2},
    {id:2,n:"My Work",l:"Design ready?",ti:"15m",u:0},
    {id:3,n:"Knmahesh",l:"Check DM page",ti:"1h",u:1},
  ]

  if(active){
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center gap-3 p-3 border-b">
          <button onClick={()=>setActive(null)}>Back</button>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">{active.n[0]}</div>
          <span className="font-bold text-sm">{active.n}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {msgs.map((m,i)=>(
            <div key={i} className={m.f==='me'? 'bg-blue-500 text-white self-end px-3 py-2 rounded-2xl text-sm max-w-[70%]' : 'bg-gray-100 self-start px-3 py-2 rounded-2xl text-sm max-w-[70%]'}>{m.t}</div>
          ))}
        </div>
        <div className="p-2 border-t flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Message..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" />
          <button onClick={()=>{if(text){setMsgs([...msgs,{f:'me',t:text}]);setText('')}}} className="text-blue-500 font-bold text-sm">Send</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <p className="font-bold">knmahesh</p>
        <Link href="/">Close</Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.map((u:any)=>(
          <div key={u.id} onClick={()=>setActive(u)} className="flex gap-3 p-4 border-b border-gray-50">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold">{u.n[0]}</div>
            <div>
              <p className="text-sm font-medium">{u.n}</p>
              <p className="text-xs text-gray-500">{u.l}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="h-[52px]"></div>
      <BottomNav />
    </div>
  )
}
