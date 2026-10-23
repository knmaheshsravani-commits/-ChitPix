"use client"
export default function HomePage(){
  return (
    <div style={{minHeight:'100vh',background:'white',color:'black',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',padding:20}}>
      <h1 style={{fontSize:24,fontWeight:800}}>ChitPix TEST LIVE ✅</h1>
      <p style={{marginTop:10,color:'green'}}>If you see this, app/page.tsx OK</p>
      <p style={{marginTop:10,fontSize:12}}>Build: {Date.now()}</p>
    </div>
  )
}
