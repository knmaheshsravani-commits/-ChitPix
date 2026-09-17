"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage(){
  const [users,setUsers]=useState<any[]>([])

  useEffect(()=>{ getUsers() },[])

  const getUsers=async()=>{
    const {data} = await supabase.from('users').select('*').order('created_at',{ascending:false})
    setUsers(data||[])
  }

  const toggleBan=async(u:any)=>{
    if(u.username==='knmahesh') return alert('King ni ban cheyalem bro 👑')
    const {error} = await supabase.from('users').update({is_banned:!u.is_banned}).eq('id', u.id)
    if(!error) getUsers()
  }

  return(
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-black mb-4">chit-pix <span className="text-zinc-500 font-light">ADMIN 👑</span></h1>

      <div className="bg-zinc-900 p-3 rounded-2xl mb-4 border border-zinc-800">
        <p className="text-xs text-zinc-500">TOTAL USERS</p>
        <p className="text-xl font-bold">{users.length}</p>
      </div>

      <div className="space-y-2">
        {users.map((u:any)=>(
          <div key={u.id} className={`flex justify-between items-center p-3 rounded-2xl bg-zinc-900 border ${u.is_banned?'border-red-500 bg-red-950/20':'border-zinc-800'}`}>
            <div className="flex gap-3 items-center">
              <img src={u.avatar_url||`https://i.pravatar.cc/100?u=${u.username}`} className="w-10 h-10 rounded-full"/>
              <div>
                <p className="font-bold text-sm">{u.username} {u.is_banned?'(BANNED)':''}</p>
                <p className="text-[11px] text-zinc-500">{u.email||u.username}</p>
              </div>
            </div>
            <button onClick={()=>toggleBan(u)} class
