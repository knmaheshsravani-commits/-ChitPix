"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newImage, setNewImage] = useState("")
  const [caption, setCaption] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("Knmahesh")

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved){
      setPosts(JSON.parse(saved))
    } else {
      setPosts([
        {
          id: 1,
          image: "https://picsum.photos/500/500?random=1",
          username: "Sravani",
          caption: "Welcome to ChitPix",
          likes: 128,
          liked: false,
          time: "2h ago"
        }
      ])
    }
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
  },[])

  const savePosts = (newPosts:any[])=>{
    setPosts(newPosts)
    localStorage.setItem("posts", JSON.stringify(newPosts))
  }

  const handleCreate = ()=>{
    if(!newImage){
      alert("Photo select chey bro")
      return
    }
    const newPost = {
      id: Date.now(),
      image: newImage,
      username: username,
      caption: caption,
      likes: 0,
      liked: false,
      time: "Just now",
      avatar: photo
    }
    const updated = [newPost,...posts]
    savePosts(updated)
    setNewImage("")
    setCaption("")
    setShowCreate(false)
  }

  const handleLike = (index:number)=>{
    const updated = [...posts]
    if(updated[index].liked){
      updated[index].likes = updated[index].likes - 1
      updated[index].liked = false
    } else {
      updated[index].likes = updated[index].likes + 1
      updated[index].liked = true
    }
    savePosts(updated)
  }

  const pickImage = (e:any)=>{
    const file = e.target.files[0]
    if(file){
      const reader = new FileReader()
      reader.onload = ()=>{
        setNewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto bg-white">

        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h1 className="font-bold text-xl">ChitPix</h1>
          <div className="flex gap-3 items-center">
            <button onClick={()=>setShowCreate(true)} className="bg-black text-white w-8 h-8 rounded-full">+</button>
            <Link href="/profile">
              {photo? <img src={photo} className="w-8 h-8 rounded-full object-cover" alt="p" /> : <div className="w-8 h-8 rounded-full bg-gray-200"></div>}
            </Link>
          </div>
        </div>

        <div className="flex gap-3 p-3 overflow-x-auto border-b">
          <div className="text-center min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden mx-auto">
              {photo? <img src={photo} className="w-full h-full object-cover" alt="s" /> : <span>U</span>}
            </div>
            <p className="text-[10px] mt-1">You</p>
          </div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5 mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center">A</div></div><p className="text-[10px] mt-1">ChitPix</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5 mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center">W</div></div><p className="text-[10px] mt-1">Work</p></div>
          <div className="text-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5 mx-auto"><div className="bg-white w-full h-full rounded-full flex items-center justify-center">T</div></div><p className="text-[10px] mt-1">Travel</p></div>
        </div>

        <div>
          {posts.map((p, i)=>(
            <div key={p.id} className="border-b">
              <div className="flex items-center gap-2 p-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  {p.avatar? <img src={p.avatar} className="w-full h-full object-cover" alt="a" /> : <div className="w-full h-full bg-gray-300"></div>}
                </div>
                <p className="font-bold text-sm">{p.username}</p>
                <p className="text-xs text-gray-400 ml-auto">{p.time}</p>
              </div>
              <img src={p.image} alt="post" className="w-full aspect-square object-cover bg-gray-100" onDoubleClick={()=>handleLike(i)} />
              <div className="p-3">
                <div className="flex gap-4">
                  <button onClick={()=>handleLike(i)}>{p.liked? "❤️" : "🤍"}</button>
                  <button>💬</button>
                  <button>✈️</button>
                </div>
                <p className="font-bold text-sm mt-2">{p.likes} likes</p>
                <p className="text-sm"><span className="font-bold">{p.username}</span> {p.caption}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-4">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">New Post</h3>
              <button onClick={()=>setShowCreate(false)}>X</button>
            </div>
            <label className="border-2 border-dashed rounded-xl h-60 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">
              {newImage? <img src={newImage} alt="new" className="w-full h-full object-cover" /> : <span>Upload Photo</span>}
              <input type="file" accept="image/*" hidden onChange={pickImage} />
            </label>
            <input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Add caption..." className="w-full border p-3 rounded-lg mt-3" />
            <button onClick={handleCreate} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold mt-3">Share</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 max-w-md mx-auto">
        <Link href="/">Home</Link>
        <Link href="/">Search</Link>
        <button onClick={()=>setShowCreate(true)}>+</button>
        <Link href="/">Reels</Link>
        <Link href="/profile">Profile</Link>
      </div>

    </div>
  )
}
