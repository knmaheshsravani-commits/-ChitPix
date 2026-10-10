'use client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  return (
    <div style={{height:'60px', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 16px', borderBottom:'1px solid #dbdbdb', background:'white', position:'sticky', top:0, zIndex:50}}>
      <h1 onClick={()=>router.push('/')} style={{fontFamily:'cursive', fontSize:'28px', fontWeight:'bold', cursor:'pointer'}}>ChitPix<span style={{fontSize:'8px', background:'black', color:'white', padding:'2px 5px', borderRadius:'10px', marginLeft:'6px', verticalAlign:'middle'}}>R2 LIVE</span></h1>
      <div style={{display:'flex', gap:'18px'}}>
        <button onClick={()=>router.push('/notifications')} style={{background:'none', border:'none', cursor:'pointer'}}>
          <svg width="24" height="24" fill="none" stroke="black" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13 4 8.5A4.5 4.5 0 0 1 12 5a4.5 4.5 0 0 1 8 3.5C20 13 12 21 12 21z"/></svg>
        </button>
        <button onClick={()=>router.push('/messages')} style={{background:'none', border:'none', cursor:'pointer'}}>
          <svg width="24" height="24" fill="none" stroke="black" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 0 1 21 11.5z"/></svg>
        </button>
      </div>
    </div>
  )
}
