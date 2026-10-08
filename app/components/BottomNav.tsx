'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function BottomNav() {
  const path = usePathname()
  const [photo, setPhoto] = useState("")

  useEffect(()=>{
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
  },[])

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #dbdbdb', zIndex: 100 }}>
      <div style={{ maxWidth: '470px', margin: '0 auto', height: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>

        {/* HOME - active pill like your screenshot */}
        <Link href="/">
          <div style={{ padding: '8px 20px', background: path==='/'?'#efefef':'transparent', borderRadius: '20px', display:'flex', alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={path==='/'?'black':'none'} stroke="black" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill={path==='/'?'white':'none'}/></svg>
          </div>
        </Link>
      
        <Link href="/reels">
          <div style={{ padding: '8px', width:'44px', height:'44px', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={path==='/reels'?'black':'none'} stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4-6 4V8z"/></svg>
          </div>
        </Link>

        {/* SHARE ICON - messages kadu, home ki link chesa - error rakunda */}
        <Link href="/">
          <div style={{ padding: '8px', width:'44px', height:'44px', display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
            <span style={{ position:'absolute', top:'6px', right:'6px', width:'7px', height:'7px', background:'red', borderRadius:'50%' }}></span>
          </div>
        </Link>

        <Link href="/search">
          <div style={{ padding: '8px 20px', background: path==='/search'?'#efefef':'transparent', borderRadius: '20px', display:'flex', alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </Link>

        <Link href="/profile">
          <div style={{ padding: '6px 12px', background: path==='/profile'?'#efefef':'transparent', borderRadius: '20px', display:'flex', alignItems:'center', position:'relative' }}>
            {photo ? <img src={photo} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit:'cover' }} alt="" /> : <img src="https://i.pravatar.cc/100?img=3" style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />}
            {path!=='/profile' && <span style={{ position:'absolute', top:'2px', right:'2px', width:'7px', height:'7px', background:'red', borderRadius:'50%' }}></span>}
          </div>
        </Link>

      </div>
    </div>
  )
}
