'use client'
import { useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const Icons = {
  home: (active:boolean) => (
    <svg width="26" height="26" fill={active ? "black" : "none"} stroke="black" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1V9.5z"/>
    </svg>
  ),
  search: (active:boolean) => (
    <svg width="26" height="26" fill="none" stroke="black" strokeWidth={active ? "2.5" : "1.8"} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6"/><path d="M16.5 16.5L20 20"/>
    </svg>
  ),
  plus: () => (
    <div style={{width:'26px', height:'26px', border:'1.8px solid black', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'300'}}>+</div>
  ),
  reels: (active:boolean) => (
    <svg width="26" height="26" fill={active ? "black" : "none"} stroke="black" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4-6 4V8z" fill={active ? "white" : "black"} stroke="none"/>
    </svg>
  ),
  profile: (active:boolean, img?:string) => (
    <img src={img || "https://i.pravatar.cc/100"} style={{width:'26px', height:'26px', borderRadius:'50%', border: active ? '2px solid black' : '1px solid #ccc'}} />
  )
}

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState(pathname)

  const handleNav = (path:string) => {
    setTab(path)
    router.push(path)
  }

  return (
    <>
      <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" capture="environment" />
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        height:'60px', background:'white', borderTop:'1px solid #e5e5e5',
        display:'flex', justifyContent:'space-around', alignItems:'center', zIndex:100
      }}>
        <button onClick={()=>handleNav('/')} style={{background:'none', border:'none'}}>{Icons.home(tab==='/')}</button>
        <button onClick={()=>handleNav('/search')} style={{background:'none', border:'none'}}>{Icons.search(tab==='/search')}</button>
        <button onClick={()=>fileInputRef.current?.click()} style={{background:'none', border:'none'}}>{Icons.plus()}</button>
        <button onClick={()=>handleNav('/reels')} style={{background:'none', border:'none'}}>{Icons.reels(tab==='/reels')}</button>
        <button onClick={()=>handleNav('/profile')} style={{background:'none', border:'none'}}>{Icons.profile(tab==='/profile')}</button>
      </div>
    </>
  )
}
