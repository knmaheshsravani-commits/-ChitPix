export default function Stories(){
 return(
  <div className="flex gap-4 p-3 border-b overflow-x-auto">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px]">Your Story</div>
      </div>
      <span className="text-xs mt-1">Your story</span>
    </div>
    {[1,2,3,4,5].map(i=>(
      <div key={i} className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-gray-200"></div>
        </div>
        <span className="text-xs mt-1">user_{i}</span>
      </div>
    ))}
  </div>
 )
}
