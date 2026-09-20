{tab==="profile" && <div className="p-4 pt-12">
  <div className="flex gap-4 items-center">
    <img src="https://picsum.photos/200/200?9" className="w-[80px] h-[80px] rounded-full border"/>
    <div className="flex gap-6">
      <p className="text-center"><b>12</b><br/>Posts</p>
      <p className="text-center"><b>1.2k</b><br/>Followers</p>
      <p className="text-center"><b>180</b><br/>Following</p>
    </div>
  </div>
  <h1 className="font-bold mt-3">{profile.fullName}</h1>
  <p className="text-[13px] text-gray-700">{profile.bio}</p>
  <p className="text-[13px] text-blue-600">{profile.city}</p>
  <div className="flex gap-2 mt-4">
    <button onClick={()=>setShowEdit(true)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-[14px]">Edit Profile</button>
    <button onClick={shareProfile} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-[14px]">Share Profile</button>
    <button onClick={logout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-[14px]">Logout</button>
  </div>
  <div className="grid grid-cols-3 gap-1 mt-6">
    {posts.map(p=><img key={p.id} src={p.img} className="h-[120px] object-cover"/>)}
  </div>
</div>}
