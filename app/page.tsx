"use client";
import { useState } from "react";
export default function Home(){
 const [like,setLike]=useState(false);
 return(
  <div style={{background:"white",color:"black",minHeight:"100vh",fontFamily:"Arial"}}>
   <div style={{borderBottom:"1px solid #ddd",padding:"12px",display:"flex",justifyContent:"space-between",position:"sticky",top:0,background:"white",zIndex:10}}>
    <h1 style={{fontWeight:900,fontSize:"24px"}}>ChitPix</h1>
    <div>💬 👤</div>
   </div>
   <div style={{maxWidth:"480px",margin:"0 auto"}}>
    <div style={{display:"flex",gap:"12px",padding:"12px",borderBottom:"1px solid #eee"}}>
     <div style={{textAlign:"center"}}><div style={{width:"56px",height:"56px",background:"linear-gradient(45deg,orange,pink)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold"}}>Y</div><div style={{fontSize:"10px"}}>Your story</div></div>
     <div style={{textAlign:"center"}}><div style={{width:"56px",height:"56px",background:"linear-gradient(45deg,purple,pink)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold"}}>A</div><div style={{fontSize:"10px"}}>ammu</div></div>
     <div style={{textAlign:"center"}}><div style={{width:"56px",height:"56px",background:"linear-gradient(45deg,blue,cyan)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold"}}>R</div><div style={{fontSize:"10px"}}>rahul</div></div>
    </div>
    <div style={{padding:"10px",display:"flex",gap:"8px",alignItems:"center"}}>
     <div style={{width:"32px",height:"32px",background:"orange",borderRadius:"50%"}}></div><b>ammu_cutie</b>
    </div>
    <img src="https://picsum.photos/seed/chitpix/600/600" style={{width:"100%"}} />
    <div style={{padding:"10px",fontSize:"22px",display:"flex",gap:"15px"}}>
     <span onClick={()=>setLike(!like)} style={{cursor:"pointer"}}>{like?"❤️":"🤍"}</span><span>💬</span><span>✈️</span>
    </div>
    <div style={{padding:"0 10px 80px 10px",fontSize:"14px"}}><b>{like?13:12} likes</b><br/><b>ammu_cutie</b> My first post on ChitPix ❤️</div>
   </div>
   <div style={{position:"fixed",bottom:0,width:"100%",background:"white",borderTop:"1px solid #ddd",display:"flex",justifyContent:"space-around",padding:"12px",fontSize:"22px",maxWidth:"480px",left:"50%",transform:"translateX(-50%)"}}>
    <span>🏠</span><span>🔍</span><span>➕</span><span>💬</span><span>👤</span>
   </div>
  </div>
 );
    }
