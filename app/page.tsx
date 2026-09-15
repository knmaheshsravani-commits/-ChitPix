"use client"
import { useState, useEffect } from "react"

export default function Home() {
  const [user, setUser] = useState("mahesh-07")
  const [posts, setPosts] = useState([
    { id: 1, user: "mahesh-07", img: "https://picsum.photos/600/600?1", likes: 12, caption: "First post", comments: [] as any[] },
    { id: 2, user: "sravani", img: "https://picsum.photos/600/600?2", likes: 5, caption: "Hello", comments: [] as any[] },
  ])
  const [cap, setCap] = useState("")
  const [tab, setTab] = useState("home")
  const [search, setSearch] = useState("")
  const [imgData, setImgData] = useState("")
  const [cmt, setCmt] = useState<any>({})
  const [showCmt, setShowCmt] = useState<any>({})
  const [stories, setStories] = useState([
    { user: "mahesh-07", img: "https://picsum.photos/200/200?1", seen: false },
    { user: "sravani", img: "https://picsum.photos/200/200?2", seen: false },
  ]);

  const handleShare = (p:any) => {
    const url = p.img;
    if (navigator.share) {
      navigator.share({ title: 'Chit-Pix', text: p.caption, url: url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied! 🚀');
    }
  };

  const addPost = () => {
    if(!imgData) return alert("Image select chey bro!");
    setPosts([{ id: Date.now(), user, img: imgData, likes: 0, caption: cap, comments: [] },...posts]);
    setCap(""); setImgData("");
  }

  const addComment = (id:number) => {
    if(!cmt[id]) return;
    setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments, {user, text:cmt[id]}]} : p));
    setCmt({...cmt, [id]:""});
  }

  return (
    <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', maxWidth:'500px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center'}}>Chit-Pix 📸</h1>
      <div style={{display:'flex', gap:'10px', overflowX:'auto', marginBottom:'20px'}}>
        {stories.map((s,i)=>(
