// Profile pic section lo - ila marchu
<div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'26px'}}>
  
  <div style={{
    width:'100px', 
    height:'100px', 
    borderRadius:'50%',
    padding:'5px',
    background:'linear-gradient(45deg, #feda75, #d62976, #962fbf, #4f5bd5)',
  }}>
    <img 
      src={user?.photoURL || user?.profilePic || "https://i.pravatar.cc/150?img=3"} 
      alt="profile"
      style={{
        width:'100%',
        height:'100%',
        borderRadius:'50%',
        objectFit:'cover',
        background:'white',
        border:'5px solid white'
      }}
      onError={(e)=> e.target.src="https://i.pravatar.cc/150?img=3"}
    />
  </div>

  <p style={{marginTop:'12px', fontSize:'15px'}}>{user?.email}</p>
</div>
