onClick={async()=>{
  const txt = prompt("Comment pettu bro 💬:")
  if(!txt) return
  const { error } = await supabase.from("comments").insert({ 
    post_id: post.id, 
    content: txt, 
    username: "@knmahesh30" 
  })
  if(error) alert(error.message)
  else {
    alert("Comment Added ✅")
    // comments malli load chey
    const { data } = await supabase.from("comments").select("*").eq("post_id", post.id)
    console.log("Comments:", data)
  }
}}
