export default function PostCard(){
  return(
    <div className="border-b pb-3">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black"></div>
          <span className="font-semibold text-sm">chitpix_user</span>
        </div>
        <span className="font-bold">•••</span>
      </div>
      <div className="w-full h-[380px] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Post Image</span>
      </div>
      <div className="p-3 flex gap-4 text-xl">
        <span>♡</span><span>💬</span><span>✈️</span>
      </div>
      <div className="px-3 text-sm"><b>chitpix_user</b> Welcome to ChitPix 🚀</div>
    </div>
  )
}
