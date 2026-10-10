'use client'
import { useEffect, useState, useRef } from 'react'

export default function Stories() {
  const [stories, setStories] = useState<any[]>([])
  const [viewed, setViewed] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<any>(null)

  // Load from R2
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/posts?type=stories')
        const data = await res.json()
        if (data.posts?.length > 0) setStories(data.posts)
        else {
          // fallback to posts api
          const res2 = await fetch('/api/posts')
          const data2 = await res2.json()
          const storyPosts = (data2.posts||[]).filter((p:any)=>p.type==='stories' || p.isStory)
          if(storyPosts.length>0) setStories(storyPosts)
        }
      } catch {}
      // Mock if empty
      if(stories.length===0){
        setStories([
          {id:'1', username:'Knmahesh', avatar:'https://i.pravatar.cc/100?u=kn', image_url:'https://picsum.photos/400/700?1'},
          {id:'2', username:'ChitPix', avatar:'https://i.pravatar.cc/100?u=chit', image_url:'https://picsum.photos/400/700?2'},
        ])
      }
    }
    load()
  }, [])

  // Story progress
  useEffect(() => {
    if(activeIndex===null) return
    setProgress(0)
    const interval = setInterval(()=>{
      setProgress(p=>{
        if(p>=100){
          // next story
          if(activeIndex < stories.length-1){
            setActiveIndex(activeIndex+1)
            return 0
          }else{
            setActiveIndex(null)
            return 0
          }
        }
        return p+1.5
      })
    }, 50)
    timerRef.current = interval
    return ()=>clearInterval(interval)
  }, [activeIndex])

  const handleUpload = async (e:any)=>{
    const file = e.target.files?.[0]
    if(!file) return
    if(file.size > 50*1024*1024){ alert("Max 50MB"); return }
    setUploading(true)
    try{
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "stories")
      formData.append("username", "Knmahesh")
      formData.append("caption", "Story 🔥")

      const res = await fetch("/api/upload",{method:"POST", body:formData})
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)

      alert('Story uploaded! 24h tarvata auto delete! ✅')
      window.location.reload()
    }catch(err:any){ alert('Upload failed: '+err.message) }
    setUploading(false)
    if(fileRef.current) fileRef.current.value=""
  }

  const openStory = (idx:number)=>{
    setActiveIndex(idx)
    const id = stories[idx].id
    if(!viewed.includes(id)) setViewed([...viewed, id])
  }

  const activeStory = activeIndex!==null? stories[activeIndex] : null

  return (
    <>
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none', borderBottom:'1px solid #efefef', background:'white' }}>
        {/* YOUR STORY + ADD */}
        <div style={{ textAlign: 'center', minWidth: '64px' }}>
          <div onClick={()=>fileRef.current?.click()} style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #bbb', fontSize: '28px', cursor: 'pointer', position:'relative' }}>
            {uploading? <span style={{fontSize:'12px', fontWeight:700}}>...</span> : '+'}
            <div style={{position:'absolute', bottom:'-2px', right:'-2px', width:'20px', height:'20px', background:'#0095f6', borderRadius:'50%', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', border:'2px solid white'}}>+</div>
          </div>
          <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleUpload} />
          <p style={{ fontSize: '11px', marginTop: '6px' }}>Your Story</p>
        </div>

        {stories.map((story: any, idx:number) => {
          const isViewed = viewed.includes(story.id)
          const img = story.avatar || story.user_avatar || story.image_url || story.image || `https://i.pravatar.cc/100?u=${story.username}`
          const name = story.username || 'user'
          const isVideo = story.video_url || story.isVideo
          return (
            <div key={story.id} onClick={() => openStory(idx)} style={{ textAlign: 'center', minWidth: '64px', cursor: 'pointer' }}>
              <div style={{ width: '62px', height: '62px', borderRadius: '50%', padding: '2.5px', background: isViewed? '#dbdbdb' : 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)' }}>
                <div style={{ background: '#fff', borderRadius: '50%', padding: '2px' }}>
                  <img src={img} alt={name} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', marginTop: '6px', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap' }}>{name}</p>
            </div>
          )
        })}
      </div>

      {/* VIEWER - Instagram Style */}
      {activeStory && activeIndex!==null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.98)', display: 'flex', flexDirection:'column' }}>
          {/* Progress Bar */}
          <div style={{display:'flex', gap:'4px', padding:'8px', position:'absolute', top:0, left:0, right:0, zIndex:10}}>
            {stories.map((_,i)=>(
              <div key={i} style={{flex:1, height:'2px', background:'rgba(255,255,255,0.3)', borderRadius:'2px', overflow:'hidden'}}>
                <div style={{width: i===activeIndex? `${progress}%` : i<activeIndex? '100%' : '0%', height:'100%', background:'white', transition: i===activeIndex? 'none' : 'width 0.3s'}}/>
              </div>
            ))}
          </div>

          {/* Header */}
          <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'20px 16px 12px', position:'absolute', top:'10px', left:0, right:0, zIndex:10}}>
            <img src={activeStory.avatar || activeStory.user_avatar || `https://i.pravatar.cc/100?u=${activeStory.username}`} style={{width:'32px', height:'32px', borderRadius:'50%'}} alt=""/>
            <span style={{color:'white', fontWeight:600, fontSize:'14px'}}>{activeStory.username}</span>
            <span style={{color:'rgba(255,255,255,0.6)', fontSize:'12px'}}> {activeStory.created_at? new Date(activeStory.created_at).toLocaleTimeString() : 'now'}</span>
            <button onClick={() => setActiveIndex(null)} style={{ marginLeft:'auto', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>✕</button>
          </div>

          {/* Media */}
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={()=> setActiveIndex(activeIndex < stories.length-1? activeIndex+1 : null)}>
            {activeStory.video_url || activeStory.isVideo? (
              <video src={activeStory.video_url || activeStory.image_url} autoPlay playsInline style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', objectFit: 'contain' }} />
            ) : (
              <img src={activeStory.image_url || activeStory.image} style={{ width: '100%', maxWidth: '400px', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }} alt="story" />
            )}
          </div>

          {/* Tap areas */}
          <div style={{position:'absolute', inset:0, display:'flex'}}>
            <div style={{flex:1}} onClick={(e)=>{e.stopPropagation(); setActiveIndex(activeIndex>0? activeIndex-1 : null)}}/>
            <div style={{flex:1}} onClick={(e)=>{e.stopPropagation(); setActiveIndex(activeIndex < stories.length-1? activeIndex+1 : null)}}/>
          </div>
        </div>
      )}

      {uploading && <div style={{position:'fixed', bottom:'70px', left:'50%', transform:'translateX(-50%)', background:'black', color:'white', padding:'8px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:700, zIndex:100}}>Uploading Story to R2... 🚀</div>}
    </>
  )
            }
