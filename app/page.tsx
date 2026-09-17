"use client"
import { useState, useEffect, useRef } from "react"
export default function Home(){
 const [currentUser,setCurrentUser]=useState<string|null>(null)
 const [loginUser,setLoginUser]=useState("")
 const [loginPass,setLoginPass]=useState("")
 const [tab,setTab]=useState('home')
 const [showAdd,setShowAdd]=useState(false)
 const [showStoryAdd,setShowStoryAdd]=useState(false)
 const [newImg,setNewImg]=useState("")
 const [newCap,setNewCap]=useState("")
 const [newStoryImg,setNewStoryImg]=useState("")
 const [commentText,setCommentText]=useState("")
 const [activePost,setActivePost]=useState<number|null>(null)
 const [activeStory,setActiveStory]=useState<number|null>(null)
 const [searchQ,setSearchQ]=useState("")
 const [dmText,setDmText]=useState("")
 const [activeChat,setActiveChat]=useState<string|null>(null)
 const fileRef=useRef<HTMLInputElement>(null)
 const storyFileRef=useRef<HTMLInputElement>(null)

 const [stories,setStories]=useState<any[]>([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",time:Date.now(),viewed:false},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",time:Date.now(),viewed:false},
  {id:3,user:"arjun",img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",time:Date.now(),viewed:false},
 ])
 const [posts,setPosts]=useState<any[]>([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:1250,liked:false,caption:"First ChitPix post 🔥 #himalayas",comments:[{user:"sravani",text:"Super bro!"}],song:"Original audio - mahesh-07"},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:890,liked:false,caption:"Beach vibes 🌊 #sunset",comments:[{user:"arjun",text:"Nice 😍"}],song:"Summer Vibes - Trending"},
  {id:3,user:"arjun",img:"https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600",likes:2100,liked:false,caption:"Golden hour ✨ #nature",comments:[],song:"Golden Hour - JVKE"},
 ])
 const [chats,setChats]=useState<any[]>([
  {user:"sravani",avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",last:"Hey super undi 😍",messages:[{from:"sravani",text:"Hey super undi 😍",time:"10:30 AM"},{from:"me",text:"Thanks!",time:"10:31 AM"}]},
  {user:"arjun",avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",last:"Reel chusa bro 🔥",messages:[{from:"arjun",text:"Reel chusa bro 🔥",time:"9 AM"}]},
 ])
 useEffect(()=>{ const s=localStorage.getItem("chitpix_user"); if(s) setCurrentUser(s) },[])
 const handleFile=(e:any,setter:any)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=
