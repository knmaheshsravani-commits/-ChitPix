"use client"
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CommentSection({ postId, comments }) {
  const [text, setText] = useState("");

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "comments"), {
      postId: postId,
      text: text,
      username: "testuser",
      createdAt: serverTimestamp()
    });
    setText("");
  };

  return (
    <div className="p-2 bg-white">
      <div className="flex gap-2">
        <input 
          value={text} 
          onChange={(e)=>setText(e.target.value)} 
          placeholder="Add comment..." 
          className="border p-2 flex-1 rounded"
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-3 rounded">Post</button>
      </div>
      <div className="mt-2">
        {comments && comments.map((c) => (
          <p key={c.id} className="text-sm py-1"><b>{c.username}:</b> {c.text}</p>
        ))}
      </div>
    </div>
  );
}
