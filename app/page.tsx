"use client"
import { useState, useRef } from "react"

function Heart({fill}:any){
 return(
  <svg viewBox="0 0 24 24" width="24" height="24"
   fill={fill?"#ff3040":"none"}
   stroke={fill?"#ff3040":"black"}
   strokeWidth="1.6">
   <path d="M12 21s-6.5-4.8-8.5-8.5
    C1 9 3 5 8 5c2 0 3 1 4 2
    c1-1 2-2 4-2c5 0 7 4 4.5 7.5
    C18.5 16.2 12 21 12 21z"/>
  </svg>
 )
}
function Comment(){
 return(
  <svg viewBox="0 0 24 24" width="24" height="24"
   fill="none" stroke="black" strokeWidth="1.6">
   <path d="M21 11.5A8.5 8.5 0 0 1
    3 11.5A8.5 8.5 0 0 1 12 3
    a8.5 8.5 0 0 1 9 8.5z"/>
   <path d="M12 11.5v.01M8 11.5v.01M16 11.5v.01"/>
  </svg>
 )
}
function Share(){
 return(
  <svg viewBox="0 0 24 24" width="24" height="24"
   fill="none" stroke="black" strokeWidth="1.6">
   <path d="M22 2L11 13M22 2l-7 20
    l-4-9l-9-4z"/>
  </svg>
 )
}
function HomeIcon(){
 return(
  <svg viewBox="0 0 24 24" width="24" height="24"
   fill="black" stroke="black" strokeWidth="1.6">
   <path d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1
    h-5v-5H9v5H4a1 1 0 0 1-1-1z"/>
  </svg>
 )
}
function SearchIcon(){
 return(
  <svg viewBox="0 0 24 24" width="24" height="24"
   fill="none" stroke="black" strokeWidth="1.6">
   <circle cx="11" cy="11" r="6"/>
   <path d="M16 16l4 4"/>
  </svg>
 )
}

export default function Page(){
 const [stories,setStories]=useState([
  {id:0,name:"Your story",me:true},
  {id:1,name:"user_1",me:false},
  {id:2,name:"user_2",me:false},
 ])
 const [posts,setPosts]=useState([
  {id:1,user:"sneha_99",f:false,liked:false,likes:124},
  {id:2,user:"bunny",f:false,liked:false,likes:89},
 ])
 const fileRef=useRef(null)

 return(
  <div className="max-w-[500px] mx-auto bg-white min-h-screen pb-[70px]">
   <div className="h-14 flex justify-between items-center px-4 border-b sticky top-0 bg-white z-10">
    <h1 className="font-black text-xl">ChitPix.com</h1>
    <div className="flex gap-4">
     <Heart fill={false}/><Share/>
    </div>
   </div>

   <div className="flex gap-3 p-3 overflow-auto border-b">
    {stories.map((s,i)=>(
     <div key={s.id} className="min-w-[66px] text-center"
      onClick={()=>{
       if(i===0) (fileRef.current as any)?.click()
      }}>
      <div className="w-[62px] h-[62px] rounded-full p-[2px]"
       style={{background:s.me?"#ddd":"orange"}}>
       <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
        {s.me?"+":""}
       </div>
      </div>
      <div className="text-[11px] mt-1">{s.name}</div>
     </div>
    ))}
    <input ref={fileRef} type="file" hidden
     onChange={()=>{
      setStories([...stories,{id:Date.now(),name:"new",me:false}])
     }}/>
   </div>

   {posts.map(p=>(
    <div key={p.id} className="border-b">
     <div className="flex justify-between p-3 items-center">
      <div className="flex gap-2 items-center">
       <div className="w-8 h-8 bg-black rounded-full"></div>
       <b className="text-sm">{p.user}</b>
       <button onClick={()=>{
        setPosts(posts.map(x=>x.id===p.id?{...x,f:!x.f}:x))
       }}
       className="text-[11px] font-bold px-3 py-1 rounded-full border"
       style={{background:p.f?"white":"#0095f6",color:p.f?"black":"white"}}>
        {p.f?"Following":"Follow"}
       </button>
      </div>
      <b>...</b>
     </div>
     <div className="h-[380px] bg-gray-100 flex items-center justify-center">Post</div>
     <div className="flex gap-4 p-3 items-center">
      <button onClick={()=>{
       setPosts(posts.map(x=>{
        if(x.id===p.id) return {...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}
        return x
       }))
      }}>
       <Heart fill={p.liked}/>
      </button>
      <Comment/><Share/>
     </div>
     <div className="px-3 pb-3 text-sm"><b>{p.likes} likes</b></div>
    </div>
   ))}

   <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto h-[60px] bg-white border-t flex justify-around items-center">
    <HomeIcon/><SearchIcon/>
    <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-xl">+</div>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4l-6 4z"/></svg>
    <div className="w-6 h-6 rounded-full border-2 border-black"></div>
   </div>
  </div>
 )
}
