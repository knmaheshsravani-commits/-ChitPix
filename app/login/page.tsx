"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email || !password){
      alert("Email & Password pettu BRO!");
      return;
    }
    setLoading(true);
    try {
      if(isLogin){
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      alert(err.message + " - Firebase Console lo Google Enable chey BRO!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-white mb-2 italic">ChitPix 🌸</h1>
      <p className="text-zinc-400 mb-10">{isLogin ? "Login to continue" : "Create account"}</p>
      
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (ex: mahesh@gmail.com)"
            type="email"
            className="w-full px-4 py-3 rounded-lg text-black outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6)"
            className="w-full px-4 py-3 rounded-lg text-black outline-none"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0095f6] text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-zinc-500 text-sm">or</div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full bg-white text-black py-3 rounded-lg font-bold"
        >
          Continue with Google
        </button>

        <p className="text-center text-zinc-400 text-sm pt-4">
          {isLogin ? "No account?" : "Have account?"}{" "}
          <span onClick={()=>setIsLogin(!isLogin)} className="text-white font-bold underline cursor-pointer">
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
}
