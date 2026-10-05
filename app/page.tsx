"use client"
import {useState,useRef} from "react"

export default function Page(){
 const [stories,setStories]=useState([
  {id:0,name:"Your story",me:true},
  {id:1,name:"user_1",me:false},
  {id:2,name:"user_2",me:false},
 ])
 const [posts,setPosts]=useState([
  {id:1,user:"sneha_99",f:false,
   liked:false,likes:124},
  {id:2,user:"bunny",f:false,
   liked:false,likes:89},
 ])
 const fileRef=useRef(null)

 return(
  <div className="max-w-[500px] mx-auto
   bg-white min-h-screen pb-[70px]">
   <div className="h-14 flex justify-between
    items-center px-4 border-b sticky top-0
    bg-white z-10">
    <b className="text-xl">ChitPix.com</b>
    <div className="flex gap-3">
     <span>♡</span><span>✉</span>
    </div>
   </div>

   <div className="flex gap-3 p-3
    overflow-auto border-b">
    {stories.map((s,i)=>(
     <div key={s.id}
      className="min-w-[66px] text-center"
      onClick={()=>{
       if(i===0)
       (fileRef.current as any)?.click()
      }}>
      <div className="w-[62px] h-[62px]
       rounded-full p-[2px]"
       style={{background:s.me?"#ddd"
       :"orange"}}>
       <div className="w-full h-full
        bg-gray-200 rounded-full
        flex items-center justify-center">
        {s.me?"+":""}
       </div>
      </div>
      <div className="text-[11px] mt-1">
       {s.name}
      </div>
     </div>
    ))}
    <input ref={fileRef} type="file"
     hidden onChange={()=>{
      setStories([...stories,
       {id:Date.now(),name:"new",
       me:false}])
     }}/>
   </div>
       {posts.map(p=>(
    <div key={p.id}
     className="border-b">
     <div className="flex justify-between
      p-3 items-center">
      <div className="flex gap-2
       items-center">
       <div className="w-8 h-8
        bg-black rounded-full"></div>
       <b className="text-sm">
        {p.user}</b>
      </div>
      <b>...</b>
     </div>
     <div className="h-[360px]
      bg-gray-100 flex items-center
      justify-center">Post</div>
     <div className="flex gap-4 p-3">
      <button onClick={()=>{
       setPosts(posts.map(x=>{
        if(x.id===p.id)return{...x,
         liked:!x.liked,
         likes:x.liked?x.likes-1:
         x.likes+1}
        return x
       }))
      }}>
       {p.liked?"❤️":"🤍"}
      </button>
      <span>💬</span><span>✈️</span>
     </div>
     <div className="px-3 pb-3 text-sm">
      <b>{p.likes} likes</b>
     </div>
    </div>
   ))}

   <div className="fixed bottom-0
    left-0 right-0 max-w-[500px]
    mx-auto h-[60px] bg-white
    border-t flex justify-around
    items-center text-[20px]">
    <span>⌂</span>
    <span>⌕</span>
    <div className="w-7 h-7 bg-black
     text-white flex items-center
     justify-center rounded-lg">+</div>
    <span>▶</span>
    <span>◯</span>
   </div>
  </div>
 )
}
