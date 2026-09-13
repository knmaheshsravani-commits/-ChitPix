"use client"
import { useState } from "react";
export default function Home(){
 const [L,setL]=useState(false);
 return(<div style={{background:"#fff",color:"#000",minHeight:"100vh"}}>
 <div style={{borderBottom:"1px solid #dbdbdb",padding:"12px 14px",display:"flex",justifyContent:"space-between",position:"sticky",top:0,background:"#fff"}}>
 <b style={{fontSize:"22px",fontFamily:"cursive"}}>ChitPix</b>
 <div style={{display:"flex",gap:"14px"}}>
 <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.7"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
 <div style={{width:"24px",height:"24px",background:"#000",borderRadius:"50%"}}/>
 </div></div>
 <div style={{maxWidth:"470px",margin:"0 auto"}}>
 <div style={{display:"flex",gap:"12px",padding:"12px",borderBottom:"1px solid #efefef",overflowX:"auto"}}>
 <div style={{textAlign:"center"}}><div style={{width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)",padding:"2px"}}><div style={{background:"#fff",borderRadius:"50%",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700"}}>Y</div></div><div style={{fontSize:"10px"}}>Your story</div></div>
 <div style={{textAlign:"center"}}><div style={{width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)",padding:"2px"}}><img src="https://i.pravatar.cc/100?img=5" style={{width:"100%",borderRadius:"50%",border:"2px solid #fff"}}/></div><div style={{fontSize:"10px"}}>ammu</div></div>
 <div style={{textAlign:"center"}}><div style={{width:"56px",height:"56px",borderRadius:"50%",background:"#ddd",padding:"2px"}}><img src="https://i.pravatar.cc/100?img=8" style={{width:"100%",borderRadius:"50%",border:"2px solid #fff"}}/></div><div style={{fontSize:"10px"}}>rahul</div></div>
 </div>
 <div style={{padding:"10px",display:"flex",gap:"8px",alignItems:"center"}}><img src="https://i.pravatar.cc/100?img=5" style={{width:"32px",height:"32px",borderRadius:"50%"}}/><b style={{fontSize:"14px"}}>ammu_cutie</b><span style={{marginLeft:"auto"}}>⋯</span></div>
 <img src="https://picsum.photos/seed/chitpixwhite/600/700" style={{width:"100%",display:"block"}}/>
 <div style={{padding:"12px",display:"flex",gap:"16px",alignItems:"center"}}>
 <span onClick={()=>setL(!L)} style={{cursor:"pointer"}}>
 <svg width="24" height="24" viewBox="0 0 24 24" fill={L?"red":"none"} stroke={L?"red":"black"} strokeWidth="1.8"><path d="M12 20l-1.5-1.3C5 13.5 2 11 2 7.5 2 4.5 4.5 2 7.5 2c1.7 0 3.3.8 4.5 2.1C13.2 2.8 14.8 2 16.5 2 19.5 2 22 4.5 22 7.5c0 3.5-3 6-8.5 11.2L12 20z"/></svg>
 </span>
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l1.8-5.5A8.5 8.5 0 0 1 21 11.5z"/></svg>
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
 <span style={{marginLeft:"auto"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>
 </div>
 <div style={{padding:"0 12px 90px 12px",fontSize:"14px"}}><b>{L?13:12} likes</b><br/><b>ammu_cutie</b> Original icons 🔥<div style={{color:"#8e8e8e",fontSize:"12px",marginTop:"4px"}}>2 hours ago</div></div>
 </div>
 <div style={{position:"fixed",bottom:0,width:"100%",background:"#fff",borderTop:"1px solid #dbdbdb",display:"flex",justifyContent:"space-around",padding:"12px 0",maxWidth:"470px",left:"50%",transform:"translateX(-50%)"}}>
 <svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M3 9L12 2l9 7v11a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z"/></svg>
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.3-4.3"/></svg>
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l1.8-5.5A8.5 8.5 0 0 1 21 11.5z"/></svg>
 <div style={{width:"24px",height:"24px",background:"#000",borderRadius:"50%"}}/>
 </div>
 </div>);
  }
