"use client"
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CommentSection({ postId, comments }: any) {
  const [text, setText] = useState("");

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "comments"), {
      postId: postId,  // Capital I - nuvvu fix chesina field
      text: text,
      username: "testuser",
      createdAt: serverTimestamp()
    });
    setText("");
  };

  return (
    <div className="p-2">
      <div className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add comment..." className="border p-1 flex-1" />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-3">Post</button>
      </div>
      <div className="mt-2">
        {comments.map((c:any) => (
          <p key={c.id}><b>{c.username}:</b> {c.text}</p>
        ))}
      </div>
    </div>
  );
}
