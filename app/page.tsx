"use client"
import { useState, useRef } from "react"

type Post = { id:number, user:string, image:string|null, likes:number, liked:boolean, comments:number, reposts:number, shares:number, saved:boolean }

export default function Page(){
  const fileRef = useRef<HTMLInputElement>(null)
  const [posts,setPosts] = useState<Post[]>([
    {id:1,user:"sneha_99",image:null,likes:20700,liked:false,comments:2020,reposts:558,shares:6710,saved:false}
  ])

  const upload = (e:any)=>{
    const f=e.target.files[0]; if(!f) return;
    const url=URL.createObjectURL(f);
    setPosts([{id:Date.now(),user:"you",image:url,likes:0,liked:false,comments:0,reposts:0,shares:0,saved:false},...posts])
  }
  const like = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}:p))
  const save = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,saved:!p.saved}:p))
  const comment = (id:number)=> { setPosts(posts.map(p=>p.id===id?{...p,comments:p.comments+1}:p)) }
  const repost = (id:number)=> { setPosts(posts.map(p=>p.id===id?{...p,reposts:p.reposts+1}:p)) }
  const share = (id:number)=> { setPosts(posts.map(p=>p.id===id?{...p,shares:p.shares+1}:p)) }

  return(
    <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-20">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload}/>

      <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
        <h1 className="font-extrabold text-[22px]">ChitPix.com</h1>
        <div className="flex gap-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 21s-6.5-4.35-9-8.5A5 5 0 0112 6a5 5 0 019 6.5C18.5 16.65 12 21 12 21z"/></svg>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </div>
      </div>

      <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b">
        <div onClick={()=>fileRef.current?.click()} className="flex flex-col items-center cursor-pointer"><div className="w-[62px] h-[62px] rounded-full bg-[#eee] flex items-center justify-center text-2xl">+</div><span className="text-[12px] mt-1">New Post</span></div>
        {["user_1","user_2","sneha"].map(n=>(
          <div key={n} className="flex flex-col items-center"><div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600"><div className="w-full h-full rounded-full bg-gray-200 border-2 border-white"></div></div><span className="text-[12px] mt-1">{n}</span></div>
        ))}
      </div>

      {posts.map(p=>(
        <div key={p.id} className="border-b">
          <div className="flex justify-between items-center px-3 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-full"></div><span className="font-semibold text-[15px]">{p.user}</span><span className="bg-[#0095F6] text-white px-4 py-1 rounded-full text-[13px] font-semibold">Follow</span></div><span>···</span></div>

          <div className="bg-[#f5f5f5] w-full aspect-square flex items-center justify-center overflow-hidden">{p.image?<img src={p.image} className="w-full h-full object-cover"/>:<span className="text-gray-400">Post Image</span>}</div>

          {/* NEW DESIGN ICONS - NUVVU PETTINA VI */}
          <div className="flex items-center gap-4 px-3 py-3">
            <button onClick={()=>like(p.id)} className="flex items-center gap-1.5">
              <svg className={`w-[26px] h-[26px] ${p.liked?"fill-red-500 stroke-red-500":"fill-none stroke-black"}`} strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 21s-6.5-4.35-9-8.5A5 5 0 0112 6a5 5 0 019 6.5C18.5 16.65 12 21 12 21z"/></svg>
              <span className="text-[14px] font-semibold">{p.likes>=1000?(p.likes/1000).toFixed(1)+'K':p.likes}</span>
            </button>

            <button onClick={()=>comment(p.id)} className="flex items-center gap-1.5">
              <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M8 12a4 4 0 014-4h8a4 4 0 014 4v2a4 4 0 01-4 4h-2l-4 4-2-4H12a4 4 0 01-4-4v-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[14px] font-semibold">{p.comments.toLocaleString()}</span>
            </button>

            <button onClick={()=>repost(p.id)} className="flex items-center gap-1.5">
              <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
              <span className="text-[14px] font-semibold">{p.reposts}</span>
            </button>

            <button onClick={()=>share(p.id)} className="flex items-center gap-1.5">
              <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <span className="text-[14px] font-semibold">{p.shares.toLocaleString()}</span>
            </button>

            <button onClick={()=>save(p.id)} className="ml-auto">
              <svg className={`w-[26px] h-[26px] ${p.saved?"fill-black":"fill-none"}`} stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            </button>
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t flex justify-around items-center py-3">
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="5.5"/><path d="M21 21l-3.5-3.5"/></svg>
        <div onClick={()=>fileRef.current?.click()} className="w-[28px] h-[28px] bg-black rounded-lg flex items-center justify-center cursor-pointer"><svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8.5l6 3.5-6 3.5v-7z"/></svg>
        <div className="w-[26px] h-[26px] rounded-full border-[1.8px] border-black"></div>
      </div>
    </div>
  )
}
