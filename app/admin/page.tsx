"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage(){
 const [users,setUsers]=useState<any[]>([])
 useEffect(()=>{ getUsers() },[])

 const getUsers=async()=>{
   // profiles table nundi teesukuntundi - correct table
   const {data} = await supabase.from('profiles').select('*').order('created_at',{ascending:false})
   setUsers(data || [])
 }

 const toggleBan=async(u:any)=>{
   if(u.username==='knmahesh' || u.username==='@knmahesh30') return alert('King ni ban cheyalem bro 👑')
   const {error} = await supabase.from('profiles').update({is_banned:!u.is_banned}).eq('id', u.id)
   if(error) alert(error.message)
   else getUsers()
 }

 return(
   <div className="min-h-screen bg-black text-white p-4">
     <h1 className="text-2xl font-black mb-4">Chit-Pix <span className="text-zinc-500">ADMIN 👑</span></h1>
     <div className="bg-zinc-900 p-3 rounded-2xl mb-4 border border-zinc-800">
       <p className="text-xs text-zinc-500">TOTAL USERS</p>
       <p className="text-xl font-bold">{users.length}</p>
     </div>
     <div className="space-y-2">
       {users.map((u:any)=>(
         <div key={u.id} className="flex justify-between items-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
           <div className="flex gap-3 items-center">
             <img src={u.avatar_url||`https://i.pravatar.cc/100?u=${u.username}`} className="w-10 h-10 rounded-full"/>
             <div>
               <p className="font-bold text-sm">{u.username} {u.is_banned?'🔴 (BANNED)':''}</p>
               <p className="text-[11px] text-zinc-500">{u.email||u.username}</p>
             </div>
           </div>
           {u.username!== 'knmahesh' && u.username!== '@knmahesh30'? (
             <button onClick={()=>toggleBan(u)} className={`px-4 py-2 rounded-full text-xs font-bold ${u.is_banned?'bg-red-500 text-white':'bg-yellow-400 text-black'}`}>{u.is_banned?'UnBan':'Ban'}</button>
           ) : (
             <span className="text-[10px] bg-zinc-800 px-3 py-1 rounded-full">KING 👑</span>
           )}
         </div>
       ))}
     </div>
   </div>
 )
}
