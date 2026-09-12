"use client";
import { useState } from "react";
export default function Page(){
const [m,sM]=useState("");
const [l,sL]=useState(["ChitPix 🔥","Instagram clone ready!"]);
return(
<div style={{background:"black",color:"white",minHeight:"100vh",padding:"20px",maxWidth:"500px",margin:"0 auto"}}>
<h1>ChitPix 📸</h1>
<p style={{color:"#888"}}>LIVE ayyindi!</p>
<div style={{border:"1px solid #333",height:"50vh",overflow:"auto",padding:"10px",marginTop:"20px",borderRadius:"12px"}}>
{l.map((t,i)=><div key={i} style={{background:"#222",padding:"10px",margin:"8px 0",borderRadius:"12px"}}>{t}</div>)}
</div>
<div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
<input value={m} onChange={e=>sM(e.target.value)} placeholder="Message..." style={{flex:1,padding:"12px",borderRadius:"20px",background:"#111",color:"white",border:"1px solid #333"}}/>
<button onClick={()=>{if(m){sL([...l,m]); sM("");}}} style={{padding:"12px 18px",borderRadius:"20px",fontWeight:"bold",background:"white"}}>Send</button>
</div>
</div>
);
}
