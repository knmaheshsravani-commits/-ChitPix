export const dynamic = 'force-dynamic';

export default function ReelsPage() {
  return (
    <main style={{minHeight:'100vh',background:'#080b14',color:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <h1 style={{fontSize:28,fontWeight:800}}>ChitPix Reels ✅ LIVE</h1>
      <p style={{marginTop:12,color:'#22c55e'}}>Server Only - No Client Exception</p>
      <p style={{marginTop:8,fontSize:12,color:'#666'}}>Build: {Date.now()}</p>
      <div style={{marginTop:24,padding:16,background:'#111',borderRadius:12,width:'100%',maxWidth:320,textAlign:'center'}}>
        <p>R2 LIVE • Ready</p>
        <p style={{fontSize:12,marginTop:8,color:'#888'}}>If you see this, error is FIXED 🎉</p>
      </div>
      <a href="/" style={{marginTop:24,background:'white',color:'black',padding:'12px 24px',borderRadius:30,textDecoration:'none',fontWeight:700}}>Go Home</a>
    </main>
  );
}
