"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState([
    { id: 1, img: "https://picsum.photos/500/600?10", likes: 120, liked: false, comments: ["Nice!", "Super"] },
    { id: 2, img: "https://picsum.photos/500/600?11", likes: 89, liked: false, comments: [] },
  ]);
  const [showComments, setShowComments] = useState<number|null>(null);
  const [text, setText] = useState("");

  return (
    <div className="max-w-[400px] mx-auto bg-white min-h-screen pb-16">
      {tab==="home" && <>
        <div className="flex gap-3 p-3 overflow-x-auto border-b">
          {[1,2,3,4,5,6].map(i=><img key={i} src={`https://picsum.photos/100?${i}`} className="w-14 h-14 rounded-full border-2 border-pink-500" alt="story"/>)}
        </div>
        {posts.map(p=>(
          <div key={p.id} className="border-b">
            <img src={p.img} className="w-full" alt="post"/>
            <div className="p-2 flex gap-4">
              <button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x))} className={p.liked?"text-red-500":""}>❤️ {p.likes}</button>
              <button onClick={()=>setShowComments(p.id)}>💬 {p.comments.length}</button>
            </div>
            {showComments===p.id && (
              <div className="p-3 bg-gray-50">
                {p.comments.map((c,i)=><p key={i} className="text-sm">• {c}</p>)}
                <div className="flex gap-2 mt-2">
                  <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add comment" className="flex-1 border rounded-full px-3 py-1 text-sm"/>
                  <button onClick={()=>{if(!text)return; setPosts(posts.map(x=>x.id===p.id?{...x,comments:[...x.comments,text]}:x)); setText("");}} className="text-blue-500 text-sm font-bold">Post</button>
                </div>
                <button onClick={()=>setShowComments(null)} className="text-xs mt-2">Close</button>
              </div>
            )}
          </div>
        ))}
      </>}

      {tab==="profile" && <div className="p-4 pt-12">
        <div className="flex gap-4 items-center">
          <img src="https://picsum.photos/200/200?9" className="w-20 h-20 rounded-full" alt="profile"/>
          <div className="flex gap-6"><p><b>2</b><br/>Posts</p><p><b>1.2k</b><br/>Followers</p></div>
        </div>
        <h1 className="font-bold mt-3">Mahesh Sravani</h1>
        <div className="grid grid-cols-3 gap-1 mt-6">{posts.map(p=><img key={p.id} src={p.img} className="h-28 object-cover" alt="post"/> )}</div>
      </div>}

      <div className="fixed bottom-0 w-full max-w-[400px] bg-white border-t flex justify-around py-3">
        <button onClick={()=>setTab("home")}>🏠</button>
        <button onClick={()=>setTab("profile")}>👤</button>
      </div>
    </div>
  );
}
