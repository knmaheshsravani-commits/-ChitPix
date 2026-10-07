'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const [username, setUsername] = useState('ChitPix User')
  const [bio, setBio] = useState('Welcome to ChitPix')
  const [photo, setPhoto] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    try {
      const n = localStorage.getItem('profile_name')
      const b = localStorage.getItem('profile_bio')
      const p = localStorage.getItem('profile_photo')
      const admin = localStorage.getItem('chitpix_admin')
      if (n) setUsername(n)
      if (b) setBio(b)
      if (p) setPhoto(p)
      if (admin) setIsAdmin(true)
      setEditName(n || 'ChitPix User')
      setEditBio(b || 'Welcome to ChitPix')
    } catch {}
  }, [])

  const handlePhoto = (e:any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPhoto(base64)
      localStorage.setItem('profile_photo', base64)
      alert('Photo Updated! ✅')
    }
    reader.readAsDataURL(file)
  }

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
          <div className="relative w-24 h-24 mx-auto">
            {photo? (
              <img src={photo} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-purple-600 flex items-center justify-center text-4xl font-bold">{username[0]?.toUpperCase()}</div>
            )}
            <label className="absolute bottom-0 right-0 bg-black text-white rounded-full w-7 h-7 flex items-center justify-center text-sm cursor-pointer">+</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="photoInput" />
            <label htmlFor="photoInput" className="absolute inset-0 cursor-pointer"></label>
          </div>

          <h2 className="mt-3 text-xl font-bold">{username}</h2>
          <p className="text-gray-500 mt-1">{bio}</p>

          <div className="flex gap-3 justify-center mt-5 flex-wrap">
            <button onClick={() => setShowEdit(true)} className="px-5 py-2 rounded-lg border bg-white font-semibold">Edit Profile</button>
            <button onClick={handleShare} className="px-5 py-2 rounded-lg border bg-white font-semibold">Share Profile</button>
          </div>

          {isAdmin && (
            <Link href="/admin" className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-bold">🔴 Admin Panel</Link>
          )}
        </div>

        <div className="flex justify-around mt-8 border-t pt-4">
          <div><b>0</b><p className="text-sm">Posts</p></div>
          <div><b>0</b><p className="text-sm">Followers</p></div>
          <div><b>0</b><p className="text-sm">Following</p></div>
        </div>

        <div className="mt-8 text-left">
          <h3 className="font-bold mb-2">Posts</h3>
          <div className="grid grid-cols-3 gap-1">
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No posts yet</div>
          </div>
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
