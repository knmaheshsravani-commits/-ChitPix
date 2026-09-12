"use client";
import {useState,useEffect,useRef} from "react";
export default function ChitPix(){
const [tab,setTab]=useState("home");
const [posts,setPosts]=useState<any[]>(()=>{
if(typeof window!="undefined"){
let s=localStorage.getItem("cpv2");
return s?JSON.parse(s):[]
}return[];
});
const [cap,setCap]=useState("");
const [q,setQ]=useState("");
const [msgs,setMsgs]=useState([{u:"Sravani m",t:"Hi bro",tm:"18:44"}]);
const [inp,setInp]=useState("");
const ref=useRef<any>(null);
useEffect(()=>localStorage.setItem("cpv2",JSON.stringify(posts)),[posts]);
useEffect(()=>ref.current?.scrollIntoView({behavior:"smooth"}),[msgs,tab]);
const add=(d:any,ty:any)=>{
setPosts([{id:Date.now(),cap,d,ty,lk:0,l:false},...posts]);
setCap("")
};
return(
<div style={{background:"#000",color:"#fff",minHeight:"100vh",maxWidth:500,margin:"0 auto",display:"flex",flexDirection:"column"}}>
<div style={{padding:12,borderBottom:"1px solid #222",display:"flex",justifyContent:"space-between"}}><b>ChitPix 📸</b><small style={{color:"#666"}}>Bijapur</small></div>
{tab=="home"&&<div style={{flex:1,overflowY:"auto"}}>
<div style={{margin:10,padding:10,border:"1px solid #333",borderRadius:12}}>
<textarea value={cap} onChange={e=>setCap(e.target.value)} placeholder="Emo rayi bro..." style={{width:"100%",background:"#111",color:"#fff",border:"1px solid #333",padding:10,borderRadius:8}}/>
<input type="file" accept="image/*,video/*" onChange={e=>{
let f=e.target.files?.[0];if(!f)return;let r=new FileReader();r.onload=x=>add(x.target?.result,f.type);r.readAsDataURL(f)}} style={{marginTop:8,width:"100%"}}/>
<button onClick={()=>cap&&add(null,null)} style={{width:"100%",marginTop:8,background:"#fff",color:"#000",padding:12,borderRadius:8,fontWeight:"bold"}}>POST 🚀</button>
</div>
{posts.map((p:any)=><div key={p.id} style={{borderBottom:"8px solid #111"}}>
<div style={{padding:10,display:"flex",justifyContent:"space-between"}}><b>@knmahesh</b><span onClick={()=>setPosts(posts.filter(x=>x.id!=p.id))}>🗑️</span></div>
{p.d&&(p.ty?.startsWith("video")?<video src={p.d} controls style={{width:"100%"}}/>:<img src={p.d} style={{width:"100%"}}/>)}
<div style={{padding:10,display:"flex",gap:16}}><span onClick={()=>setPosts(posts.map(x=>x.id==p.id?{...x,l:!x.l,lk:x.l?x.lk-1:x.lk+1}:x))}>{p.l?"❤️":"🤍"} {p.lk}</span><span>💬</span><span>📤</span></div>
<div style={{padding:"0 10px 10px"}}>{p.cap}</div>
</div>)}
{posts.length==0&&<p style={{textAlign:"center",color:"#666",marginTop:50}}>No posts - first post chey!</p>}
</div>}
{tab=="chat"&&<div style={{flex:1,display:"flex",flexDirection:"column"}}>
<div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
{msgs.map((m:any,i)=><div key={i} style={{alignSelf:m.u=="Me"?"flex-end":"flex-start",background:m.u=="Me"?"#10b981":"#1f1f1f",color:m.u=="Me"?"#000":"#fff",padding:"10px 14px",borderRadius:18}}>{m.u!="Me"&&<small style={{color:"#10b981",display:"block"}}>{m.u}</small>}{m.t}</div>)}
<div ref={ref}/>
</div>
<div style={{padding:10,display:"flex",gap:8,borderTop:"1px solid #222"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key=="Enter"&&inp){setMsgs([...msgs,{u:"Me",t:inp}]);setInp("")}}} placeholder="Message" style={{flex:1,background:"#1a1a1a",border:"1px solid #333",color:"#fff",padding:12,borderRadius:24}}/><button onClick={()=>{if(inp){setMsgs([...msgs,{u:"Me",t:inp}]);setInp("")}}} style={{background:"#10b981",border:"none",width:44,height:44,borderRadius:"50%"}}>➤</button></div>
</div>}
{tab=="search"&&<div style={{padding:10}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{width:"100%",padding:12,background:"#111",border:"1px solid #333",color:"#fff",borderRadius:10}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginTop:10}}>{posts.filter(p=>p.cap.includes(q)).map(p=>p.d&&<img key={p.id} src={p.d} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}}/>)}</div></div>}
{tab=="reels"&&<div style={{padding:10}}>{posts.filter(p=>p.ty?.startsWith("video")).map(p=><video key={p.id} src={p.d} controls style={{width:"100%",marginTop:10,borderRadius:10}}/>)}</div>}
{tab=="profile"&&<div style={{padding:20,textAlign:"center"}}><div style={{width:80,height:80,margin:"0 auto",borderRadius:"50%",background:"linear-gradient(45deg,#f59e0b,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>M</div><h3>knmahesh</h3><p style={{color:"#666"}}>Bijapur, Karnataka</p><b>{posts.length}</b> Posts<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginTop:20}}>{posts.map(p=>p.d&&<img key={p.id} src={p.d} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}}/>)}</div></div>}
<div style={{display:"flex",justifyContent:"space-around",padding:"10px 0",borderTop:"1px solid #222",background:"#000",position:"sticky",bottom:0}}>
<span onClick={()=>setTab("home")} style={{color:tab=="home"?"#fff":"#666"}}>🏠<br/><small>Home</small></span>
<span onClick={()=>setTab("search")} style={{color:tab=="search"?"#fff":"#666"}}>🔍<br/><small>Search</small></span>
<span onClick={()=>setTab("reels")} style={{color:tab=="reels"?"#fff":"#666"}}>🎬<br/><small>Reels</small></span>
<span onClick={()=>setTab("chat")} style={{color:tab=="chat"?"#fff":"#666"}}>💬<br/><small>Chat</small></span>
<span onClick={()=>setTab("profile")} style={{color:tab=="profile"?"#fff":"#666"}}>👤<br/><small>Profile</small></span>
</div>
</div>
)
  }
