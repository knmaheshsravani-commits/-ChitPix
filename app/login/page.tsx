"use client";
import { useState } from "react";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Login success BRO! " + userId);
    window.location.href = "/";
  };

  const handleGoogleLogin = async () => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        alert("Supabase keys ledu BRO! Normal login vaadu");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) alert(error.message);
    } catch (err) {
      console.log(err);
      alert("Google login setup cheyali BRO!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-white mb-10 italic">ChitPix 🌸</h1>
      
      <div className="w-full max-w-sm space-y-4">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID (ex: mahesh_07)"
          className="w-full px-4 py-3 rounded-lg text-black"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg text-black"
        />
        <button onClick={handleLogin} className="w-full bg-[#0095f6] text-white py-3 rounded-lg font-bold">
          Log In
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-zinc-700"></div>
          <span className="px-3 text-zinc-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-zinc-700"></div>
        </div>

        <button onClick={handleGoogleLogin} className="w-full bg-white text-black py-3 rounded-lg font-bold">
          Continue with Gmail
        </button>
      </div>
    </div>
  );
}
