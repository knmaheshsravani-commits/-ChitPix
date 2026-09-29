"use client";
import { useState } from "react";

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([
    { id: 1, user: "aesthetic_vibes", likes: 234 },
    { id: 2, user: "travel_diary", likes: 120 },
  ]);

  const handleLogin = () => {
    if (email === "knmaheshsravani@gmail.com" && password === "Mahesh@9848#") {
      setIsAdmin(true);
      setShowLogin(false);
      alert("Admin Login Success 👑");
    } else {
      alert("Wrong Credentials");
    }
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between p-4">
        <h1 className="text-xl font-bold">ChitPix</h1>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-white text-black px-4 py-1 rounded-full"
        >
          {isAdmin ? "👑 Admin" : "Login"}
        </button>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[90%] max-w-sm">
            <h2 className="mb-4 font-bold">Admin Login</h2>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-3 bg-black rounded"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-3 bg-black rounded"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black py-2 rounded"
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className="w-full mt-2 text-sm text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="p-4 grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-zinc-900 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <p>@{post.user}</p>
              {isAdmin && (
                <button
                  onClick={() => deletePost(post.id)}
                  className="bg-red-600 px-3 py-1 rounded-full text-sm"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">{post.likes} likes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
