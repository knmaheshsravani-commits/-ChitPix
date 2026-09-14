"use client"
import { useState, useEffect } from "react"

export default function Home() {
  const [user, setUser] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [cap, setCap] = useState("")
  const [tab, setTab] = useState("home")
  const [search, setSearch] = useState("")
  const [imgData, setImgData] = useState("")
  const [cmt, setCmt] = useState<{[key:number]:string}>({})
  const [showCmt, setShowCmt] = useState<{[key:number]:boolean}>({})

  useEffect(() => {
    const u = localStorage.getItem("chitpix_user")
    if (!u) window.location.href = "/login"
    else setUser(u)
    const s = localStorage.getItem("chitpix_posts_v3")
    if (s) setPosts(JSON.parse(s))
    else setPosts([
      { id: 1, user: "mahesh-07", img: "https://picsum.photos/500/500?1", cap: "First post 🔥", likes: 12, comments: [{user:"sravani", text:"super bro!"}] },
      { id: 2, user: "sravani", img: "https://picsum.photos/500/500?2", cap: "Nature 🌿", likes: 5, comments: [] },
    ])
  }, [])

  const save = (up:any[]) => {
    setPosts(up)
    localStorage.setItem("chitpix_posts_v3", JSON.stringify(up))
  }

  const onFile = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImgData(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addPost = () => {
    if (!cap &&!imgData) return
    const img = imgData || `https://picsum.photos/500/500?${Date.now()}`
    const n = { id: Date.now(), user, img, cap, likes: 0, comments: [] }
    save([n,...posts])
    setCap(""); setImgData("")
  }

  const like = (id: number) => {
    save(posts.map(p => p.id === id? {...p, likes: p.likes+1} : p))
  }

  const addComment = (id: number) => {
    const txt = cmt[id]
    if (!txt) return
    const up = posts.map(p => p.id === id? {...p, comments: [...(p.comments||[]), {user, text: txt}]} : p)
    save(up)
    setCmt({...cmt, [id]: ""})
  }

  const filtered = posts.filter(p => p.user.toLowerCase().includes(search.toLowerCase()) || p.cap.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: 'black', color: 'white', paddingBottom: '80px' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'black', zIndex: 10 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>ChitPix</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>@{user}</span>
          <button onClick={() => { localStorage.removeItem("chitpix_user"); location.href="/login" }} style={{ background: 'red', padding: '6px 14px', borderRadius: '20px', border: 'none', color: 'white' }}>Logout</button>
        </div>
      </div>

      {tab === "home" && (
        <div style={{ maxWidth: '470px', margin: '0 auto', padding: '15px' }}>
          <div style={{ border: '1px solid #333', padding: '15px', borderRadius: '12px', background: '#111', marginBottom: '20px' }}>
            <input value={cap} onChange={e=>setCap(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white', marginBottom: '10px' }} />
            {imgData && <img src={imgData} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} alt="" />}
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ flex: 1, background: '#333', padding: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>📸 Choose Photo<input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} /></label>
              <button onClick={addPost} style={{ flex: 1, background: '#0095f6', padding: '10px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold' }}>Post</button>
            </div>
          </div>

          {posts.map(p => (
            <div key={p.id} style={{ border: '1px solid #333', borderRadius: '12px', marginBottom: '20px', background: '#111', overflow: 'hidden' }}>
              <div style={{ padding: '12px', fontWeight: 'bold' }}>@{p.user}</div>
              <img src={p.img} style={{ width: '100%', height: '400px', objectFit: 'cover' }} alt="" />
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '8px' }}>
                  <button onClick={()=>like(p.id)} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'white' }}>❤️ {p.likes}</button>
                  <button onClick={()=>setShowCmt({...showCmt, [p.id]:!showCmt[p.id]})} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'white' }}>💬 {p.comments?.length||0}</button>
                </div>
                <div><b>@{p.user}</b> {p.cap}</div>

                {showCmt[p.id] && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                    {p.comments?.map((c:any,i:number)=>(
                      <div key={i} style={{ marginBottom: '6px', fontSize: '14px' }}><b>@{c.user}</b> {c.text}</div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input value={cmt[p.id]||""} onChange={e=>setCmt({...cmt, [p.id]: e.target.value})} placeholder="Add a comment..." style={{ flex: 1, padding: '8px', background: '#222', border: '1px solid #444', borderRadius: '20px', color: 'white' }} />
                      <button onClick={()=>addComment(p.id)} style={{ background: '#0095f6', border: 'none', borderRadius: '20px', padding: '0 16px', color: 'white' }}>Post</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "search" && (
        <div style={{ maxWidth: '470px', margin: '0 auto', padding: '15px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', borderRadius: '10px', color: 'white', marginBottom: '15px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px' }}>
            {filtered.map(p => <img key={p.id} src={p.img} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt="" />)}
          </div>
        </div>
      )}

      {tab === "reels" && (
        <div style={{ maxWidth: '470px', margin: '0 auto' }}>
          {posts.map(p => (
            <div key={p.id} style={{ height: '85vh', position: 'relative', background: 'black', marginBottom: '5px' }}>
              <img src={p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', bottom: '20px', left: '15px' }}>
                <div style={{ fontWeight: 'bold' }}>@{p.user}</div>
                <div>{p.cap}</div>
                <div>❤️ {p.likes} 💬 {p.comments?.length||0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "profile" && (
        <div style={{ maxWidth: '470px', margin: '0 auto', padding: '15px', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#333', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>👤</div>
          <h2>@{user}</h2>
          <p>{posts.filter(p=>p.user===user).length} Posts</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px', marginTop: '20px' }}>
            {posts.filter(p=>p.user===user).map(p=><img key={p.id} src={p.img} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt="" />)}
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
        <button onClick={()=>setTab("home")} style={{ background: 'none', border: 'none', color: tab==="home"?'white':'#777', fontSize: '24px' }}>🏠</button>
        <button onClick={()=>setTab("search")} style={{ background: 'none', border: 'none', color: tab==="search"?'white':'#777', fontSize: '24px' }}>🔍</button>
        <button onClick={()=>setTab("reels")} style={{ background: 'none', border: 'none', color: tab==="reels"?'white':'#777', fontSize: '24px' }}>🎬</button>
        <button onClick={()=>setTab("profile")} style={{ background: 'none', border: 'none', color: tab==="profile"?'white':'#777', fontSize: '24px' }}>👤</button>
      </div>
    </div>
  )
}
