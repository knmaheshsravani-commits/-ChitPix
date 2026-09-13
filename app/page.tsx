"use client"
import { useState, useEffect } from "react"
export default function Home(){
  const [user,setUser]=useState("")
  const [posts,setPosts]=useState<any[]>([])
  const [caption,setCaption]=useState("")
  useEffect(()=>{
    const u=localStorage.getItem("chitpix_user")
    if(!u) window.location.href="/login"
    else setUser(u)
    const saved=localStorage.getItem("chitpix_posts")
    if(saved) setPosts(JSON.parse(saved))
    else setPosts([
      {id:1,user:"mahesh-07",img:"https://picsum.photos/500/500?1",cap:"First post on ChitPix 🔥",likes:12},
      {id:2,user:"cherry",img:"https://picsum.photos/500/500?2",cap:"Black theme mass!",likes:5}
    ])
  },[])
  const uploadPost=()=>{
    if(!caption) return alert("Add caption")
    const newPost={id:Date.now(),user,img:`https://picsum.photos/500/500?${Date.now()}`,cap:caption,likes:0}
    const updated=[newPost,...posts]
    setPosts(updated)
    localStorage.setItem("chitpix_posts",JSON.stringify(updated))
    setCaption("")
  }
  const like=(id:number)=>{
    const updated=posts.map(p=>p.id===id?{...p,likes:p.likes+1}:p)
    setPosts(updated)
    localStorage.setItem("chitpix_posts",JSON.stringify(updated))
  }
  return(
    <div style={{minHeight:'100vh',background:'black',color:'white'}}>
      <div style={{padding:'15px',borderBottom:'1px solid #333',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'black'}}>
        <h1 style={{fontSize:'30px',fontWeight:'bold',fontFamily:'cursive'}}>ChitPix</h1>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <span>@{user}</span>
          <button onClick={()=>{localStorage.removeItem("chitpix_user");window.location.href="/login"}} style={{background:'red',padding:'6px 14px',borderRadius:'20px',border:'none',color:'white'}}>Logout</button>
        </div>
      </div>
      <div style={{maxWidth:'470px',margin:'0 auto',padding:'15px'}}>
        <div style={{border:'1px solid #333',padding:'15px',borderRadius:'12px',marginBottom:'20px',background:'#111'}}>
          <input placeholder="
