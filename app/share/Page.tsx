'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'

export default function MessagesPage(){
  const [active, setActive] = useState<any>(null)
  const [text, setText] = useState("")
  const [allMsgs, setAllMsgs] = useState<any>({})
  const [photo, setPhoto] = useState("")

  const users = [
    {id:1,n:"ChitPix Team",l:"M logo fire 🔥",t:"2m",u:2, color:"bg-black"},
    {id:2,n:"My Work",l:"Design ready?",t:"15m",u:0, color:"bg-purple-600"},
    {id:3,n:"Knmahesh",l:"Check DM page",t:"1h",u:1, color:"bg-blue-600"},
  ]

  useEffect(()=>{
    const saved = localStorage.getItem("chitpix_dms")
    if(saved) setAllMsgs(JSON.parse(saved))
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)

    // POST SHARE NUNCHI VASTHE - direct open
    const shared = localStorage.getItem("chitpix_shared_post")
    if(shared){
      const post = JSON.parse(shared)
      setActive(users[0])
      const key = `user_1`
      const prev = saved? JSON.parse(saved) : {}
      const msgs = prev[key] || [{f:"them",t:"Hey bro! Reels fix ayinda?"}]
      const newMsgs = [...msgs, {f:"them", t:`Shared a post: ${post.caption}`, img: post.image}]
      const updated = {...prev, [key]: newMsgs}
      setAllMsgs(updated)
      localStorage.setItem("chitpix_dms", JSON.stringify(updated))
      localStorage.removeItem("chitpix_shared_post")
    }
  },[])

  const currentMsgs = active? (allMsgs[`user_${active.id}`] || [{f:"them",t:"Hey bro! Reels fix ayinda?"},{f:"me",t:"Ha bro done!"}]) : []

  const sendMsg = ()=>{
    if(!text.trim() ||!active) return
    const key = `user_${active.id}`
    const updated = {
     ...allMsgs,
      [key]: [...currentMsgs, {f:"me", t:text}]
    }
    setAllMsgs(updated)
    localStorage.setItem("chitpix_dms", JSON.stringify(updated))
    setText("")
  }

  if(active){
    return (
      <div className="w-full bg-white overflow-hidden flex flex-col" style={{height:'100dvh'}}>
        <div className="flex items-center gap-3 p-3 border-b bg-white">
          <button onClick={()=>setActive(null)} className="w-8 h-8 flex items-center justify-center text-xl">←</button>
          <div className={`w-8 h-8 rounded-full ${active.color} text-white flex items-center justify-center font-bold text-sm`}>{active.n[0]}</div>
          <div className="flex-1">
            <p className="font-bold text-[14px]">{active.n}</p>
            <p className="text-[11px] text-green-500">Active now</p>
          </div>
          <Link href="/" className="text-xl">✕</Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50">
          {currentMsgs.map((m:any,i:number)=>(
            <div key={i} className={`max-w-[75%] px-4 py-2 rounded-2xl text-[14px] ${m.f==='me'? 'bg-blue-500 text-white self-end rounded-br-sm' : 'bg-white self-start rounded-bl-sm shadow-sm'}`}>
              {m.img && <img src={m.img} className="w-full h-32 object-cover rounded-xl mb-2" alt=""/>}
              <p>{m.t}</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t bg-white flex gap-2 items-center pb-[90px]">
          <input
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && sendMsg()}
            placeholder="Message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[14px] outline-none"
          />
          <button onClick={sendMsg} className="bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold text-[14px]">Send</button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <div className="max-w-md mx-auto bg-white pb-[80px]">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <p className="font-bold text-[18px]">knmahesh</p>
          <Link href="/" className="text-gray-500">✕</Link>
        </div>

        <div className="px-4 py-2">
          <input placeholder="Search" className="w-full bg-gray-100 rounded-full px-4 py-2 text-[14px] outline-none"/>
        </div>

        <div className="flex-1">
          {users.map((u:any)=>(
            <div key={u.id} onClick={()=>setActive(u)} className="flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
              <div className={`w-12 h-12 rounded-full ${u.color} text-white flex items-center justify-center font-bold`}>{u.n[0]}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-[14px] font-semibold">{u.n}</p>
                  <p className="text-[11px] text-gray-400">{u.t}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[13px] text-gray-500 truncate w-[200px]">{u.l}</p>
                  {u.u>0 && <span className="bg-blue-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{u.u}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
                  }
