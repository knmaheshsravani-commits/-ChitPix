"use client"
import {useState,useRef} from "react"

const Home=()=>(
<svg viewBox="0 0 24 24" width="24"
height="24" fill="none"
stroke="black" strokeWidth="2">
<path d="M3 9L12 2L21 9V20H3V9Z"/>
<path d="M9 22V12H15V22"/>
</svg>
)

const Search=()=>(
<svg viewBox="0 0 24 24" width="24"
height="24" fill="none"
stroke="black" strokeWidth="2">
<circle cx="11" cy="11" r="6"/>
<path d="M16.5 16.5L21 21"/>
</svg>
)

const Heart=()=>(
<svg viewBox="0 0 24 24" width="24"
height="24" fill="none"
stroke="black" strokeWidth="2">
<path d="M12 21L4 12.5A4 4 0 0 1 12 5
A4 4 0 0 1 20 12.5L12 21Z"/>
</svg>
)

const Chat=()=>(
<svg viewBox="0 0 24 24" width="24"
height="24" fill="none"
stroke="black" strokeWidth="2">
<path d="M21 11.5A8.5 8.5 0 0 1 3 11.5
A8.5 8.5 0 0 1 12 3A8.5 8.5 0 0 1 21 11.5Z"/>
</svg>
)

const Send=()=>(
<svg viewBox="0 0 24 24" width="24"
height="24" fill="none"
stroke="black" strokeWidth="2">
<path d="M22 2L11 13"/>
<path d="M22 2L15 22L11 13L2 9L22 2Z"/>
</svg>
)

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

<div className="h-14 flex
justify-between items-center
px-4 border-b sticky top-0
bg-white z-10">
<b className="text-xl">ChitPix.com</b>
<div className="flex gap-4">
<Heart/><Chat/>
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
{s.name}</div>
</div>
))}
<input ref={fileRef} type="file"
hidden onChange={()=>{
setStories([...stories,
{id:Date.now(),name:"new",me:false}])
}}/>
</div>

{posts.map(p=>(
<div key={p.id} className="border-b">
<div className="flex justify-between
p-3 items-center">
<div className="flex gap-2
items-center">
<div className="w-8 h-8
bg-black rounded-full"></div>
<b className="text-sm">{p.user}</b>
<button onClick={()=>{
setPosts(posts.map(x=>
x.id===p.id?{...x,f:!x.f}:x))
}}
className="text-[11px] font-bold
px-3 py-1 rounded-full border"
style={{background:p.f?"white"
:"#0095f6",color:p.f?"black":"white"}}>
{p.f?"Following":"Follow"}
</button>
</div>
<b>...</b>
</div>
<div className="h-[360px] bg-gray-100
flex items-center justify-center">
Post
</div>
<div className="flex gap-4 p-3">
<button onClick={()=>{
setPosts(posts.map(x=>{
if(x.id===p.id) return{...x,
liked:!x.liked,
likes:x.liked?x.likes-1:x.likes+1}
return x
}))
}}>
{p.liked?"❤️":<Heart/>}
</button>
<Chat/><Send/>
</div>
<div className="px-3 pb-3 text-sm">
<b>{p.likes} likes</b>
</div>
</div>
))}

<div className="fixed bottom-0 left-0
right-0 max-w-[500px] mx-auto
h-[60px] bg-white border-t
flex justify-around items-center">
<Home/><Search/>
<div className="bg-black text-white
w-8 h-8 flex items-center
justify-center rounded-lg">+</div>
<div className="w-6 h-6 border-2
rounded flex items-center
justify-center">▶</div>
<div className="w-6 h-6 border-2
rounded-full"></div>
</div>

</div>
)
}
