"use client"
import { useState, useEffect } from "react"
export default function Home(){
  const [user,setUser]=useState("")
  const [posts,setPosts]=useState<any[]>([{id:1,user:"mahesh-07",img:"https://picsum.photos/500/500?1",cap:"First post 🔥",likes:12},{id:2,user:"sravani",img:"https://picsum.photos/500/500?2",cap:"Nature 🌿",likes:5},{id:3,user:"cherry",img:"https://picsum.photos/500/500?3",cap:"ChitPix mass",likes:8}])
  const [cap,setCap]=useState("")
  const [tab,setTab]=useState("home")
  const [search,setSearch]=useState("")
  useEffect(()=>{const u=localStorage.getItem("chitpix_user");if(!u)location.href="/login";else setUser(u);const s=localStorage.getItem("chitpix_posts");if(s)setPosts(JSON.parse(s))},[])
  const post=()=>{if(!cap)return;const n={id:Date.now(),user,img:`https://picsum.photos/500/500?${Date.now()}`,cap,likes:0};const up=[n,...posts];setPosts(up);localStorage.setItem("chitpix_posts",JSON.stringify(up));setCap("")}
  const like=(id:number)=>{const up=posts.map(p=>p.id===id?{...p,likes:p.likes+1}:p);setPosts(up);localStorage.setItem("chitpix_posts",JSON.stringify(up))}
  const filtered=posts.filter(p=>p.user.toLowerCase().includes(search.toLowerCase())||p.cap.toLowerCase().includes(search.toLowerCase()))
  return(
    <div style={{minHeight:'100vh',background:'black',color:'white',paddingBottom:'70px'}}>
      <div style={{padding:'15px',borderBottom:'1px solid #333',display:'flex',justifyContent:'space-between',position:'sticky',top:0,background:'black',zIndex:10}}>
        <h1 style={{fontSize:'28px',fontWeight:'bold',fontFamily:'cursive'}}>ChitPix</h1>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}><span>@{user}</span><button onClick={()=>{localStorage.removeItem("chitpix_user");location.href="/login"}} style={{background:'red',padding:'6px 14px',borderRadius:'20px',border:'none',color:'white'}}>Logout</button></div>
      </div>
      {tab==="home"&&<div style={{maxWidth:'470px',margin:'0 auto',padding:'15px'}}><div style={{border:'1px solid #333',padding:'15px',borderRadius:'12px',background:'#111',marginBottom:'20px'}}><input value={cap} onChange={e=>setCap(e.target.value)} placeholder="What's on your mind?" style={{width:'100%',padding:'10px',background:'#222',border:'1px
