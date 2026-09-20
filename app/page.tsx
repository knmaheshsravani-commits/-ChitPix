{showComments && (
  <div className="fixed inset-0 bg-black/70 z-[99] flex flex-col justify-end" onClick={()=>setShowComments(false)}>
    <div onClick={e=>e.stopPropagation()} className="bg-white w-full max-w-[420px] mx-auto rounded-t-[20px] p-4 pb-[80px] min-h-[45vh]">
      <div className="w-[40px] h-[4px] bg-gray-300 rounded-full mx-auto mb-3"></div>
      <p className="font-bold text-center text-[16px] mb-4">Comments</p>

      <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
        {comments.map((c,i)=><div key={i} className="flex gap-2"><b className="text-[13px]">{c.user}</b><span className="text-[13px]">{c.text}</span></div>)}
        {comments.length===0 && <p className="text-gray-400 text-[13px] text-center">No comments yet</p>}
      </div>

      <div className="flex gap-2 items-center border-t pt-3">
        <img src="https://picsum.photos/200/200?9" className="w-[32px] h-[32px] rounded-full"/>
        <input
          value={newComment}
          onChange={e=>setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-[14px] outline-none"
        />
        <button
          onClick={()=>{
            if(newComment.trim()){
              setComments([...comments, {user: currentUser || "_sankar_001", text: newComment}]);
              setNewComment("");
            }
          }}
          className="text-blue-600 font-bold text-[14px]"
        >
          Post
        </button>
      </div>
    </div>
  </div>
)}
