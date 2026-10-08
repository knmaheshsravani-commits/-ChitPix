'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Messages(){
  const [active, setActive] = useState<any>(null)
  const [msg, setMsg] = useState("")
  const [list, setList] = useState([
    {id:1,name:"ChitPix",txt:"Hey bro!"},
    {id:2,name:"My Work",txt:"Design ready?"},
    {id:3,name:"Travel",txt:"Where are you?"},
  ])
  const [chats, setChats] = useState<any[]>([
    {from:"them",text:"Hey bro! Reels fix ayinda?"},
    {from:"me",text:"Ha bro done! 🚀"},
  ])

  if(active){
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100dvh',background:'#fff'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid #dbdbdb'}}>
          <button onClick={()=>setActive(null)} style={{fontSize:20}}>←</button>
          <div style={{width:32,height:32,borderRadius:'50%',background:'#000',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>{active.name[0]}</div>
          <b>{active.name}</b>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
          {chats.map((c,i)=>(
            <div key={i} style={{maxWidth:'
