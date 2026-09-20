const [liked, setLiked] = useState(false);
const [showHeart, setShowHeart] = useState(false);

const handleDoubleClick = () => {
  setLiked(true);
  setShowHeart(true);
  setTimeout(() => setShowHeart(false), 1000);
  // Nee like function ikkada call chey - likePost(post.id)
};<div onDoubleClick={handleDoubleClick} className="relative w-full aspect-square bg-zinc-900 overflow-hidden select-none">
  <img src={post.image} className="w-full h-full object-cover" />
  
  {showHeart && (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-8xl animate-ping">❤️</span>
    </div>
  )}
  
  {showHeart && (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-7xl animate-[scale_1s_ease]">❤️</span>
    </div>
  )}
</div><button onClick={()=>setLiked(!liked)} className="text-3xl p-2">
  {liked ? "❤️" : "🤍"}
</button>
