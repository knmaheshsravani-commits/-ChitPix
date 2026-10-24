"use client"
import { useState, useRef } from "react"

export default function Stories(){
  const [showProfile, setShowProfile] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  
  const stories = [
    {id:'me', user:'Your story', avatar:'https://i.pravatar.cc/100?img=20', isMe:true},
    {id:'1', user:'abhichaarli', avatar:'https://i.pravatar.cc/100?img=21'},
    {id:'2', user:'shetty._lifts', avatar:'https://i.pravatar.cc/100?img=22'},
    {id:'3', user:'yaseen', avatar:'https://i.pravatar.cc/100?img=23'},
  ]

  const openProfile = (s:any) => {
    if(s.isMe){ fileRef.current?.click(); return }
    setShowProfile({...s, followers: '12.5k', following: '340', posts: 64, isFollowing: false})
  }

  return (
    <>
      <input ref={fileRef} type="file" hidden />
      <div className="bg-white border-b border-neutral-100 px-2 py-3 flex gap-3 overflow-x-auto scrollbar-hide">
        {stories.map(s=>(
          <div key={s.id} className="flex flex-col items-center min-w-[66px]" onClick={()=>openProfile(s)}>
            <div className="relative">
              <div className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${s.isMe ? 'bg-neutral-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
                <div className="w-full h-full rounded-full border-[2.5px] border-white overflow-hidden bg-white"><img src={s.avatar} className="w-full h-full object-cover" /></div>
              </div>
              {s.isMe && <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[14px] font-bold">+</div>}
            </div>
            <span className="text-[11px] mt-1 w-[66px] truncate text-center">{s.user}</span>
          </div>
        ))}
      </div>

      {/* PROFILE CLICK -> DIRECT OPEN - Follow/Unfollow + Count */}
      {showProfile && (
        <div className="fixed inset-0 z-[200] bg-white max-w-[480px] mx-auto">
          <div className="p-3 flex justify-between border-b"><button onClick={()=>setShowProfile(null)}>←</button><span className="font-bold">{showProfile.user}</span><button>⋯</button></div>
          <div className="p-4">
            <div className="flex gap-6 items-center">
              <img src={showProfile.avatar} className="w-20 h-20 rounded-full" />
              <div className="flex gap-6">
                <div className="text-center"><div className="font-bold">{showProfile.posts}</div><div className="text-[12px]">Posts</div></div>
                <div className="text-center"><div className="font-bold">{showProfile.followers}</div><div className="text-[12px]">Followers</div></div>
                <div className="text-center"><div className="font-bold">{showProfile.following}</div><div className="text-[12px]">Following</div></div>
              </div>
            </div>
            <div className="mt-3"><div className="font-bold text-[14px]">{showProfile.user}</div><div className="text-[12px] opacity-60">📍 Kadur, Karnataka</div></div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowProfile({...showProfile, isFollowing: !showProfile.isFollowing})} className={`flex-1 py-1.5 rounded-md font-bold text-[13px] ${showProfile.isFollowing ? 'bg-neutral-100' : 'bg-black text-white'}`}>{showProfile.isFollowing ? 'Following ✓' : 'Follow'}</button>
              <button className="flex-1 bg-neutral-100 py-1.5 rounded-md font-bold text-[13px]">Message</button>
              <button className="w-8 bg-neutral-100 rounded-md">⚙️</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
