// @ts-nocheck
"use client"
import { useEffect, useState } from "react"
export default function Notifications(){
  const [notifs, setNotifs] = useState([])
  const [user, setUser] = useState({username:'knmahesh'})
  useEffect(()=>{
    fetch("/api/users/current").then(r=>r.json()).then(d=>{ setUser(d); fetch(`/api/notifications?user=${d.username}`).then(r=>r.json()).then(setNotifs) })
    const id = setInterval(()=>{ fetch(`/api/users/current`).then(r=>r.json()).then(d=> fetch(`/api/notifications?user=${d.username}`).then(r=>r.json()).then(setNotifs)) }, 5000)
    return ()=>clearInterval(id)
  },[])
  return(
    <div className="max-w-[470px] mx-auto min-h-[100dvh] bg-white">
      <div className="px-4 py-3 border-b font-bold">Notifications • R2 Live</div>
      <div className="divide-y">
        {notifs.map((n:any)=>(
          <div key={n.id} className={`px-4 py-3 flex gap-3 ${!n.read?'bg-zinc-50':''}`}>
            <img src={`https://i.pravatar.cc/150?u=${n.fromUser}`} className="w-10 h-10 rounded-full"/>
            <div><p className="text-[13px]"><b>{n.fromUser}</b> {n.message}</p><p className="text-[11px] text-zinc-400">{new Date(n.created_at).toLocaleString()} • {n.type}</p></div>
          </div>
        ))}
        {notifs.length===0 && <p className="text-center py-20 text-zinc-400 text-[13px]">No notifications yet • Follow friends to get live updates</p>}
      </div>
    </div>
  )
}
