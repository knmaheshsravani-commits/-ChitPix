"use client"
import { useState, useRef } from "react"

export default function Page(){
 const [stories,setStories]=useState([
  {id:0,name:"Your story",me:true},
  {id:1,name:"user_1",me:false},
  {id:2,name:"user_2",me:false},
 ])
 const [posts,setPosts]=useState([
  {id:1,user:"sneha_99",follow:false,like:false,likes:124},
  {id:2,user:"bunny_official",follow:false,like:false,likes:89},
 ])
 const fileRef=useRef<any>(null)
 return(
  <div style={{maxWidth:500,margin:"0 auto",background:"white",minHeight:"100vh",paddingBottom:70}}>
   <div style={{height:58,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px",borderBottom:"1px solid #eee",position:"sticky",top:0,background:"white",zIndex:10}}>
    <h1 style={{fontWeight:900,fontSize:22}}>ChitPix.com</h1>
    <div style={{display:"flex",gap:16,fontSize:20}}>❤️ 💬</div>
   </div>
   <div style={{display:"flex",gap:12,padding:12,overflowX:"auto",borderBottom:"1px solid #eee"}}>
    {stories.map((s,i)=><div key={s.id} style={{minWidth:66,textAlign:"center"}} onClick={()=>{if(i===0)fileRef.current?.click()}}>
     <div style={{width:62,height:62,borderRadius:"50%",background:s.me?"#ddd":"orange",padding:2}}>
      <div style={{width:"100%",height:"100%",background:"#eee",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{s.me?"+":""}</div>
     </div>
     <div style={{fontSize:11,marginTop:4}}>{s.name}</div>
    </div>)}
    <input ref={fileRef} type="file" hidden onChange={()=>{setStories([...stories,{id:Date.now(),name:"new",me:false}]);alert("Added")}}/>
   </div>
   {posts.map(p=><div key={p.id} style={{borderBottom:"1px solid #eee"}}>
    <div style={{display:"flex",justifyContent:"space-between",padding:12}}>
     <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <div style={{width:32,height:32,background:"black",borderRadius:"50%"}}></div>
      <b>{p.user}</b>
      <button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,follow:!x.follow}:x))} style={{fontSize:11,padding:"4px 12px",borderRadius:20,border:"1px solid #ccc",background:p.follow?"white":"#0095f6",color:p.follow?"black":"white",fontWeight:700}}>{p.follow?"Following":"Follow"}</button>
     </div><b>...</b>
    </div>
    <div style={{height:360,background:"#f3f3f3",display:"flex",alignItems:"center",justifyContent:"center"}}>Post</div>
    <div style={{display:"flex",gap:16,padding:12,fontSize:22}}><span onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,like:!x.like,likes:x.like?x.likes-1:x.likes+1}:x))}>{p.like?"❤️":"🤍"}</span><span>💬</span><span>📤</span></div>
    <div style={{padding:"0 12px 12px"}}><b>{p.likes} likes</b></div>
   </div>)}
   <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:500,margin:"0 auto",height:60,background:"white",borderTop:"1px solid #eee",display:"flex",justifyContent:"space-around",alignItems:"center",fontSize:22}}><span>🏠</span><span>🔍</span><span>+</span><span>🎬</span><span>👤</span></div>
  </div>
 )
}
