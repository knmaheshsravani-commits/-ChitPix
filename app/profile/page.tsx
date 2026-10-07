'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const [username, setUsername] = useState('Knmahesh')
  const [bio, setBio] = useState('Welcome to ChitPix💙🧡🤝')
  const [link, setLink] = useState('chitpix.app')
  const [photo, setPhoto] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editLink, setEditLink] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedPost, setSelectedPost] = useState<any>(null)

  useEffect(() => {
    const n = localStorage.getItem('profile_name') || 'Knmahesh'
    const b = localStorage.getItem('profile_bio') || 'Welcome to ChitPix💙🧡🤝'
    const l = localStorage.getItem('profile_link') || 'chitpix.app'
    const p = localStorage.getItem('profile_photo') || ''
    const admin = localStorage.getItem('chitpix_admin')
    setUsername(n); setBio(b); setLink(l); setPhoto(p)
    setEditName(n); setEditBio(b); setEditLink(l)
    if (admin) setIsAdmin(true)
    fetch('/api/posts').then(r=>r.json()).then(d=>setPosts(d.posts || d || [])).catch(()=>{})
  }, [])

  const handlePhoto = (e:any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPhoto(base64)
      localStorage.setItem('profile_photo', base64)
    }
    reader.readAsDataURL(file)
  }
  const handleSave = () => {
    localStorage.setItem('profile_name', editName)
    localStorage.setItem('profile_bio', editBio)
    localStorage.setItem('profile_link', editLink)
    setUsername(editName); setBio(editBio); setLink(editLink)
    setShowEdit(false)
  }
  const handleLogout = () => {
    if (confirm('Logout avvala bro?')) {
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="font-bold text-lg flex items-center gap-1">{username} <span className="text-blue-500 text-sm">✓</span></h1>
          <div className="flex gap-3">
            {isAdmin && <Link href="/admin" className="text-xs bg-red-600 text-white px-3 py-1 rounded-full">ADMIN</Link>}
            <button onClick={handleLogout} className="text-xl">⚙️</button>
          </div>
        </div>

        {/* PROFILE INFO */}
        <div className="p-4">
          <div className="flex gap-6 items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-purple-600">
                <div className="bg-white rounded-full p-0.5">
                  {photo? <img src={photo} className="w-[72px] h-[72px] rounded-full object-cover" /> :
                  <div className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center font-bold text-2xl">M</div>}
                </div>
              </div>
              <label htmlFor="photoInput" className="absolute bottom-0 right-0 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer shadow">+</label>
              <input id="photoInput" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </div>
            <div className="flex gap-6 text-center flex-1 justify-around">
              <div><b className="block text-lg">{posts.length}</b><span className="text-sm">Posts</span></div>
              <div><b className="block text-lg">1.2K</b><span className="text-sm">Followers</span></div>
              <div><b className="block text-lg">180</b><span className="text-sm">Following</span></div>
            </div>
          </div>

          <div className="mt-3">
            <p className="font-bold flex items-center gap-1">{username} <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✓</span></p>
            <p className="text-sm mt-1">{bio}</p>
            <a href={`https://${link}`} className="text-sm text-blue-600 font-semibold">🔗 {link}</a>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={()=>setShowEdit(true)} className="flex-1 py-1.5 rounded-lg bg-gray-100 font-semibold text-sm">Edit Profile</button>
            <button onClick={()=>navigator.clipboard.writeText(window.location.href).then(()=>alert('Link Copied!'))} className="flex-1 py-1.5 rounded-lg bg-gray-100 font-semibold text-sm">Share Profile</button>
          </div>

          {/* HIGHLIGHTS */}
          <div className="flex gap-4 mt-6 overflow-x-auto">
            {['ChitPix','My Work','Travel','Friends'].map(h=>(
              <div key={h} className="text-center min-w-[60px]">
                <div className="w-14 h-14 rounded-full border p-0.5 mx-auto"><div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-lg">✨</div></div>
                <p className="text-[11px] mt-1">{h}</p>
              </div>
            ))}
            <div className="text-center min-w-[60px]">
              <div className="w-14 h-14 rounded-full border border-dashed flex items-center justify-center mx-auto">+</div>
              <p className="text-[11px] mt-1">New</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-t mt-2">
          <button onClick={()=>setActiveTab('posts')} className={`flex-1 py-3 text-sm flex justify-center items-center gap-1 ${activeTab==='posts'?'border-t border-black font-bold': 'text-gray-400'}`}>⊞ POSTS</button>
          <button onClick={()=>setActiveTab('reels')} className={`flex-1 py-3 text-sm flex justify-center items-center gap-1 ${activeTab==='reels'?'border-t border-black font-bold': 'text-gray-400'}`}>▶ REELS</button>
          <button onClick={()=>setActiveTab('saved')} className={`flex-1 py-3 text-sm flex justify-center items-center gap-1 ${activeTab==='saved'?'border-t border-black font-bold': 'text-gray-400'}`}>♡ SAVED</button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-0.5">
          {activeTab==='posts' && posts.length>0? posts.map((p,i)=>(
            <div key={i} onClick={()=>setSelectedPost(p)} className="aspect-square bg-gray-100 relative cursor-pointer">
              <img src={p.image || p.imageUrl || p.url} className="w-full h-full object-cover" />
            </div>
          )) : activeTab==='posts'? (
            <div className="col-span-3 py-20 text-center">
              <p className="text-4xl">📸</p>
              <p className="font-bold mt-2">No Posts Yet</p>
              <p className="text-sm text-gray-500">When you share photos, they'll appear here</p>
              <Link href="/" className="inline-block mt-3 text-blue-500 text-sm font-semibold">Share your first photo</Link>
            </div>
          ) : (
            <div className="col-span-3 py-20 text-center text-gray-400 text-sm">Coming Soon...</div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold mb-3">Edit Profile</h3>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Name" className="w-full p-3 my-2 rounded-lg border" />
            <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} rows={3} placeholder="Bio" className="w-full p-3 my-2 rounded-lg border"></textarea>
            <input value={editLink} onChange={e=>setEditLink(e.target.value)} placeholder="Link" className="w-full p-3 my-2 rounded-lg border" />
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className="flex-1 p-3 bg-black text-white rounded-lg font-bold">Save</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-gray-100 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* POST VIEW MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={()=>setSelectedPost(null)}>
          <img src={selectedPost.image || selectedPost.imageUrl} className="max-w-full max-h-[80vh] rounded" />
        </div>
      )}
    </div>
  )
                                               }
