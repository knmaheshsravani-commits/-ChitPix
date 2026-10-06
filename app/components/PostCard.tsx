use ";
export default function PostCard() {
  return (
    <div className="bg-white border-b border-gray-100 mb-2">
      <div className="flex items-center gap-2 p-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6600] to-yellow-400"></div>
        <b className="text-sm">arjun.vizag</b>
        <span className="ml-auto text-gray-400 text-xs">2h ago</span>
      </div>
      <img src="https://picsum.photos/600/600?random=1" alt="post" className="w-full aspect-square object-cover bg-gray-100" />
      <div className="p-3">
        <div className="flex gap-4 text-[22px]"><span>🤍</span><span>💬</span><span>🚀</span><span className="ml-auto">🔖</span></div>
        <p className="font-bold text-[13px] mt-2">1,250 likes</p>
        <p className="text-[13px] mt-1"><b>arjun.vizag</b> Vizag beach vibes 🌊 #ChitPix</p>
      </div>
    </div>
  );
}
