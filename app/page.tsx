"use client";
import { Heart, MessageCircle, Send, Bookmark, Home as HomeIcon, Search, PlusSquare, Clapperboard, User } from 'lucide-react';

export default function Page() {
  return (
    <div style={{background:'white', minHeight:'100vh', maxWidth:'800px', margin:'0 auto'}}>
      {/* Header */}
      <div style={{padding:'26px 32px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{fontWeight:'800', fontSize:'22px', fontFamily:'cursive'}}>ChitPix</h1>
        <div style={{display:'flex', gap:'15px'}}>
          <Heart size={22} />
          <MessageCircle size={22} />
        </div>
      </div>

      {/* Post */}
      <div style={{borderBottom:'1px solid #eee'}}>
        <div style={{padding:'32px', display:'flex', gap:'16px', alignItems:'center'}}>
          <img src="https://i.pravatar.cc/100?img=5" style={{width:32, height:32, borderRadius:'50%'}} />
          <b>travelwithlia</b>
        </div>
        <img src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29" style={{width:'100%'}} />
        <div style={{display:'flex', gap:'26px', padding:'16px'}}>
          <Heart size={52} />
          <MessageCircle size={52} />
          <Send size={52} />
          <Bookmark size={52} style={{marginLeft:'auto'}} />
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed', bottom:0, width:'100%', maxWidth:'800px', background:'white', borderTop:'1px solid #eee', display:'flex', justifyContent:'space-around', padding:'32px 0'}}>
        <HomeIcon size={52} fill="black" />
        <Search size={52} />
        <PlusSquare size={52} />
        <Clapperboard size={52} />
        <User size={52} />
      </div>
    </div>
  )
}
