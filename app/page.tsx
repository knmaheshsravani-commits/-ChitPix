"use client"
import { useState, useRef } from "react"

export default function Page(){
 const [stories,setStories]=useState([
  {id:0,name:"Your story",me:true},
  {id:1,name:"user_1",me:false},
  {id:2,name:"user_2",me:false},
  {id:3,name:"sneha",me:false},
 ])
 const [posts,setPosts]=useState([
  {id:1,user:"sneha_99",f:false,liked:false,likes:124},
  {id:2,user:"bunny",f:false,liked:false,likes:89},
 ])
 const fileRef=useRef(null)

 return(
  <div className="max-w-[500px] mx-auto bg-white min-h-screen pb-[70px] text-black">
   <div className="h-[56px] flex justify-between items-center px-4 border-b sticky top-0 bg-white z-10">
    <h1 className="font-black text-[22px] tracking-tight">ChitPix.com</h1>
    <div className="flex gap-4 text-[22px] font-bold">
     <span>♡</span><span>✉️</span>
    </div>
   </div>

   <div className="flex gap-3 p-3 overflow-auto border-b no-scrollbar">
    {stories.map((s,i)=>(
     <div key={s.id} className="min-w-[66px] text-center cursor-pointer"
      onClick={()=>{
       if(i===0) (fileRef.current as any)?.click()
      }}>
      <div className="w-[62px] h-[62px] rounded-full p-[2.5px]"
       style={{background:s.me?"#dbdbdb":"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)"}}>
       <div className="w-full h-full bg-white rounded-full p-[2px]">
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xl">
         {s.me?"+":""}
        </div>
       </div>
      </div>
      <div className="text-[11px] mt-1 truncate w-[66px]">{s.name}</div>
     </div>
    ))}
    <input ref={fileRef} type="file" hidden
     onChange={()=>{
      setStories([...stories,{id:Date.now(),name:"new",me:false}])
     }}/>
   </div>

   {posts.map(p=>(
    <div key={p.id} className="border-b border-gray-100">
     <div className="flex justify-between p-3 items-center">
      <div className="flex gap-2 items-center">
       <div className="w-8 h-8 bg-black rounded-full"></div>
       <b className="text-[14px]">{p.user}</b>
       <button onClick={()=>{
        setPosts(posts.map(x=>x.id===p.id?{...x,f:!x.f}:x))
       }}
       className="text-[12px] font-bold px-3 py-1 rounded-full border ml-2"
       style={{background:p.f?"white":"#0095f6",color:p.f?"black":"white"}}>
        {p.f?"Following":"Follow"}
       </button>
      </div>
      <b>⋯</b>
     </div>
     <div className="h-[380px] bg-[#f0f0f0] flex items-center justify-center text-gray-400">Post Image</div>
     <div className="flex gap-4 p-3 text-[24px]">
      <button onClick={()=>{
       setPosts(posts.map(x=>{
        if(x.id===p.id) return {...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}
        return x
       }))
      }}>{p.liked?"❤️":"🤍"}</button>
      <span>💬</span><span>✈️</span>
     </div>
     <div className="px-3 pb-3 text-[14px]"><b>{p.likes} likes</b></div>
    </div>
   ))}

   <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto h-[60px] bg-white border-t flex justify-around items-center text-[24px]">
    <span>⌂</span><span>⌕</span><span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-lg text-xl">+</span><span>▶️</span><span>◯</span>
   </div>
  </div>
 )
}
