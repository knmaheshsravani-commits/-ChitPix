"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [showShare, setShowShare] = useState<number | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newComment, setNewComment] = useState("");

  const [profile, setProfile] = useState({ name: "Mahesh Ravi", username: "mahesh_chitpix", bio: "📸 ChitPix Creator | Bangalore", followers: 1250, following: 340, posts: 3 });
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);

  const [reels, setReels] = useState([
    { id: 1, user: "aesthetic_vibes", likes: 12401, liked: true, comments: [{user:"travel_diary", text:"Nice bro!"}], desc: "Sunset vibes 🌅 #aesthetic", color: "from-purple-600 to-pink-600", following: true },
    { id: 2, user: "travel_diary", likes: 8900, liked: false, comments: [{user:"food_lover", text:"Goa 😍"}], desc: "Goa beach life 🏖️", color: "from-blue-600 to-cyan-400", following: false },
    { id: 3, user: "food_lover", likes: 23000, liked: false, comments: [], desc: "Biryani time 😋🔥", color: "from-orange-600 to-red-600", following: false },
  ]);

  const filtered = reels.filter(r => r.user.includes(search.toLowerCase()) || r.desc.includes(search));

  const handleLogin = () => {
    if (email === "mahesh@gmail.com" && password === "mahesh123") { setIsAdmin(true); setShowLogin(false); }
    else alert("Wrong email/password bro");
  };

  const toggleLike = (id: number) => setReels(reels.map(r => r.id === id? {...r, liked:!r.liked, likes: r.liked? r.likes-1 : r.likes+1 } : r));
  const toggleFollow = (id: number) => {
    const reel = reels.find(r=>r.id===id);
    if(reel &&!reel.following) setProfile({...profile, following: profile.following+1});
    if(reel && reel.following) setProfile({...profile, following: profile.following-1});
    setReels(reels.map(r => r.id === id? {...r, following:!r.following } : r));
  };
  const addComment = () => {
    if(!newComment || showComments===null) return;
    setReels(reels.map(r => r.id===showComments? {...r, comments:[...r.comments, {user: profile.username, text:newComment}]} : r));
    setNewComment("");
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-3 bg-black z-20">
        <h1 className="text-xl font-black">ChitPix</h1>
        <div className="flex gap-3 items-center text-xl"><span>💬</span><span>✈️</span>
          <button onClick={()=>isAdmin?setIsAdmin(false):setShowLogin(true)} className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">{isAdmin?"👑 Admin":"Login"}</button>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email - IKKADA NEE EMAIL PETTU" className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl" />
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl" />
            <button onClick={handleLogin} className="w-full bg-white text-black py-3 rounded-xl font-bold">Login</button>
            <button onClick={()=>setShowLogin(false)} className="w-full mt-2 text-gray-400 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {showComments!== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex justify-between p-4 border-b border-zinc-800"><h3 className="font-bold">Comments ({reels.find(r=>r.id===showComments)?.comments.length})</h3><button onClick={()=>setShowComments(null)}>✕</button></div>
          <div className="flex-1 overflow-y-scroll p-4 space-y-3">
            {reels.find(r=>r.id===showComments)?.comments.map((c,i)=><div key={i} className="text-sm"><span className="font-bold">@{c.user}</span> {c.text}</div>)}
          </div>
          <div className="p-3 flex gap-2 border-t border-zinc-800"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-zinc-900 p-3 rounded-full text-sm" /><button onClick={addComment} className="text-blue-500 font-bold px-3">Post</button></div>
        </div>
      )}

      {showShare!== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end"><div className="bg-zinc-900 w-full rounded-t-3xl p-6"><h3 className="font-bold mb-4">Share</h3><div className="grid grid-cols-4 gap-4 text-center text-xs"><div>📱 WhatsApp</div><div>📸 Instagram</div><div>🔗 Copy Link</div><div>✈️ Send</div></div><button onClick={()=>setShowShare(null)} className="w-full mt-6 bg-white text-black py-3 rounded-full font-bold">Close</button></div></div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"><div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm"><h3 className="font-bold mb-4">Edit Profile</h3><input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl" /><textarea value={editBio} onChange={e=>setEditBio(e.target.value)} className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl" /><button onClick={()=>{setProfile({...profile, name:editName, bio:editBio}); setShowEdit(false)}} className="w-full bg-white text-black py-3 rounded-xl font-bold">Save</button><button onClick={()=>setShowEdit(false)} className="w-full mt-2 text-gray-400 text-sm">Cancel</button></div></div>
      )}

      {tab==="home" && (
        <div className="flex-1 overflow-y-scroll">
          <div className="flex gap-3 p-3 overflow-x-scroll scrollbar-hide border-b border-zinc-900">{["Your Story","aesthetic","travel","food_lover","nature"].map(s=><div key={s} className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs">{s[0]}</div></div><span className="text-[10px] mt-1">{s}</span></div>)}</div>
          {reels.map(r=><div key={r.id} className="border-b border-zinc-900"><div className="flex justify-between p-3 items-center"><span className="font-bold">@{r.user}</span><div className="flex gap-2"><button onClick={()=>toggleFollow(r.id)} className={`text-xs px-3 py-1 rounded-full font-bold ${r.following?"bg-zinc-800":"bg-white text-black"}`}>{r.following?"Following":"Follow"}</button>{isAdmin&&<button onClick={()=>setReels(reels.filter(x=>x.id!==r.id))} className="text-xs bg-red-600 px-2 py-1 rounded-full">Delete</button>}</div></div><div className={`h-[380px] bg-gradient-to-br ${r.color} flex items-center justify-center`}><span className="text-4xl font-black opacity-20">ChitPix</span></div><div className="flex gap-4 p-3 text-xl"><button onClick={()=>toggleLike(r.id)}>{r.liked?"❤️":"🤍"}</button><button onClick={()=>setShowComments(r.id)}>💬 {r.comments.length}</button><button onClick={()=>setShowShare(r.id)}>↗️</button></div><div className="px-3 text-sm font-bold">{r.likes.toLocaleString()} likes</div><div className="px-3 text-sm pb-3">@{r.user} {r.desc}</div></div>)}
        </div>
      )}

      {tab==="search" && (
        <div className="flex-1 overflow-y-scroll p-3"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search users, hashtags..." className="w-full bg-zinc-900 p-3 rounded-full text-sm mb-4" /><div className="space-y-3">{filtered.map(r=><div key={r.id} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl"><div className={`w-10 h-10 rounded-full bg-gradient-to-br ${r.color}`}></div><div className="flex-1"><p className="font-bold text-sm">@{r.user}</p><p className="text-xs text-gray-400">{r.likes} likes • {r.comments.length} comments</p></div><button onClick={()=>toggleFollow(r.id)} className={`text-xs px-3 py-1 rounded-full ${r.following?"bg-zinc-800":"bg-white text-black"}`}>{r.following?"Following":"Follow"}</button></div>)}</div></div>
      )}

      {tab==="reels" && (
        <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">{reels.map(r=><div key={r.id} className={`h-full snap-start relative bg-gradient-to-br ${r.color} flex items-end`}><div className="absolute inset-0 flex items-center justify-center"><h1 className="text-6xl font-black opacity-20">ChitPix</h1></div><div className="relative w-full p-4 pb-20 flex justify-between"><div><p className="font-bold">@{r.user} • {r.likes} likes • {r.comments.length} comments</p><p className="text-sm mt-1">{r.desc}</p><button onClick={()=>toggleFollow(r.id)} className="mt-2 text-xs border px-3 py-1 rounded-full">{r.following?"Following ✓":"Follow +"}</button></div><div className="flex flex-col gap-5 items-center"><button onClick={()=>toggleLike(r.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">{r.liked?"❤️":"🤍"}</div><span className="text-xs">{r.likes}</span></button><button onClick={()=>setShowComments(r.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">💬</div><span className="text-xs">{r.comments.length}</span></button><button onClick={()=>setShowShare(r.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">↗️</div><span className="text-xs">Share</span></button></div></div></div>)}</div>
      )}

      {tab==="likes" && (
        <div className="flex-1 overflow-y-scroll p-3"><h2 className="font-bold mb-3">Liked Reels ❤️ {reels.filter(r=>r.liked).length}</h2>{reels.filter(r=>r.liked).map(r=><div key={r.id} className={`h-40 rounded-xl mb-3 bg-gradient-to-br ${r.color} flex items-center justify-between p-4`}><span className="font-bold">@{r.user}</span><span>{r.likes} likes</span></div>)}{reels.filter(r=>r.liked).length===0&&<p className="text-gray-500 text-sm">No likes yet - go like reels bro!</p>}</div>
      )}

      {tab==="profile" && (
        <div className="flex-1 overflow-y-scroll p-4"><div className="flex gap-4 items-center"><div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center text-2xl font-black">{profile.name[0]}</div><div className="flex gap-6"><div className="text-center"><p className="font-bold">{profile.posts}</p><p className="text-xs text-gray-400">Posts</p></div><div className="text-center"><p className="font-bold">{profile.followers}</p><p className="text-xs text-gray-400">Followers</p></div><div className="text-center"><p className="font-bold">{profile.following}</p><p className="text-xs text-gray-400">Following</p></div></div></div><h2 className="font-bold mt-3">{profile.name}</h2><p className="text-sm text-gray-300">{profile.bio}</p><button onClick={()=>{setEditName(profile.name); setEditBio(profile.bio); setShowEdit(true)}} className="w-full mt-4 bg-zinc-800 py-2 rounded-lg text-sm font-bold">Edit Profile</button><div className="grid grid-cols-3 gap-1 mt-6">{reels.map(r=><div key={r.id} className={`h-32 bg-gradient-to-br ${r.color} rounded-lg flex items-center justify-center text-xs`}>{r.likes}❤️</div>)}</div></div>
      )}

      <div className="flex justify-around items-center p-3 bg-black border-t border-zinc-900 text-2xl">
        <button onClick={()=>setTab("home")} className={tab==="home"?"":"opacity-50"}>🏠</button>
        <button onClick={()=>setTab("search")} className={tab==="search"?"":"opacity-50"}>🔍</button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"?"":"opacity-50"}>🎬</button>
        <button onClick={()=>setTab("likes")} className={tab==="likes"?"":"opacity-50"}>❤️</button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"?"":"opacity-50"}>👤</button>
      </div>
      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none; scrollbar-width:none}`}</style>
    </div>
  );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              }
