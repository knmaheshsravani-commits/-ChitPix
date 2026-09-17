'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function MessagesPage(){
 const [users,setUsers]=useState<any[]>([])
 const [sel,setSel]=useState<any>(null)
 const [msgs,setMsgs]=useState<any[]>([])
 const [text,setText]=useState('')
 const [myId,setMyId]=useState('')

 useEffect(()=>{
  (async()=>{
   const {data:{user}} = await supabase.auth.getUser()
   if(user) setMyId(user.id)
   const {data} = await supabase.from('profiles').select('*')
   if(data) setUsers(data.filter((u:any)=>u.id!==user?.id))
  })()
 },[])

 useEffect(()=>{
  if(!sel) return
  const load=async()=>{
   const {data}=await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${myId},receiver_id.eq.${sel.id}),and(sender_id.eq.${sel.id},receiver_id.eq.${myId})`).order('created_at',{ascending:true})
   if(data) setMsgs(data)
  }
  load()
  const ch=supabase.channel('dm').on('postgres_changes',{event:'*',schema:'public',table:'direct_messages'},()=>load()).subscribe()
  return()=>{supabase.removeChannel(ch)}
 },[sel,myId])

 const send=async()=>{
  if(!text.trim()||!sel) return
  await supabase.from('direct_messages').insert({sender_id:myId,receiver_id:sel.id,content:text})
  setText('')
 }

 return(
 <div className="max-w-[480px] mx-auto bg-black text-white min-h-screen flex">
  <div className="w-[140px] border-r border-gray-800 p-2">
   <Link href="/" className="font-bold">← ChitPix</Link>
   <div className="mt-4">
   {users.map(u=><div key={u.id} onClick={()=>setSel(u)} className={`p-2 rounded cursor-pointer ${sel?.id===u.id?'bg-white text-black':'hover:bg-gray-900'}`}>{u.username}</div>)}
   </div>
  </div>
  <div className="flex-1 flex flex-col">
   {sel? <>
    <div className="p-3 border-b border-gray-800 font-bold">{sel.username}</div>
    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
     {msgs.map(m=><div key={m.id} className={`p-2 rounded max-w-[80%] ${m.sender_id===myId?'bg-white text-black ml-auto':'bg-gray-800'}`}>{m.content}</div>)}
    </div>
    <div className="p-2 flex gap-2 border-t border-gray-800">
     <input value={text} onChange={e=>setText(e.target.value)} placeholder="Message..." className="flex-1 bg-gray-900 rounded-full px-3 py-1 text-sm"/>
     <button onClick={send} className="bg-white text-black px-3 rounded-full text-sm font-bold">Send</button>
    </div>
   </>:<div className="flex-1 flex items-center justify-center text-gray-500">Select a user</div>}
  </div>
 </div>
 )
}
