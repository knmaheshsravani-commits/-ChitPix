export default function Stories(){
  return(
    <div className="w-full border-b bg-white">
      <div className="flex gap-4 p-3 overflow-x-auto scrollbar-hide">
        {/* Your Story */}
        <div className="flex flex-col items-center min-w-[66px]">
          <div className="w-[62px] h-[62px] rounded-full bg-gray-200 flex items-center justify-center border">
            <span className="text-2xl">+</span>
          </div>
          <span className="text-[11px] mt-1">Your story</span>
        </div>

        {/* Other stories - Insta gradient */}
        {[1,2,3,4,5,6].map(i=>(
          <div key={i} className="flex flex-col items-center min-w-[66px]">
            <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-200"></div>
              </div>
            </div>
            <span className="text-[11px] mt-1">user_{i}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
