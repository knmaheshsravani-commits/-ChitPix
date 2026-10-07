'use client'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [username, setUsername] = useState('ChitPix User')
  const [bio, setBio] = useState('Welcome to ChitPix')
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')

  useEffect(() => {
    try {
      const n = localStorage.getItem('profile_name')
      const b = localStorage.getItem('profile_bio')
      if (n) { setUsername(n); setEditName(n) }
      if (b) { setBio(b); setEditBio(b) }
      if (!n) setEditName('ChitPix User')
      if (!b) setEditBio('Welcome to ChitPix')
    } catch {}
  }, [])

  const handleSave = () => {
    const finalName = editName || 'ChitPix User'
    const finalBio = editBio || 'Welcome to ChitPix'
    setUsername(finalName)
    setBio(finalBio)
    localStorage.setItem('profile_name', finalName)
    localStorage.setItem('profile_bio', finalBio)
    setShowEdit(false)
    alert('Profile Updated!')
  }

  const handleShare = async () => {
    const url = window.location.origin + '/profile'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ChitPix Profile', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link Copied: ' + url)
      }
    } catch {
      await navigator.clipboard.writeText(url)
      alert('Link Copied!')
    }
  }

  return (
    <div className="min-h-screen bg-white p-5">
      <div className="max-w-md mx-auto text-center">
        <div className="mt-5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-purple-600 mx-auto flex items-center justify-center text-4xl">U</div>
          <h2 className="mt-3 text-xl font-bold">{username}</h2>
          <p className="text-gray-500 mt-1">{bio}</p>
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={() => setShowEdit(true)} className="px-5 py-2 rounded-lg border bg-white font-semibold">Edit Profile</button>
            <button onClick={handleShare} className="px-5 py-2 rounded-lg border bg-white font-semibold">Share Profile</button>
          </div>
        </div>
        <div className="flex justify-around mt-8 border-t pt-4">
          <div><b>0</b><p className="text-sm">Posts</p></div>
          <div><b>0</b><p className="text-sm">Followers</p></div>
          <div><b>0</b><p className="text-sm">Following</p></div>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-11/12 max-w-sm">
            <h3 className="font-bold mb-3">Edit Profile</h3>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username" className="w-full p-3 my-2 rounded-lg border" />
            <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" rows={3} className="w-full p-3 my-2 rounded-lg border"></textarea>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className="flex-1 p-3 bg-black text-white rounded-lg font-semibold">Save</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 p-3 bg-gray-100 rounded-lg font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
