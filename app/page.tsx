"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if(user.trim()===""){
      alert("User ID enter chey bro!");
      return;
    }
    localStorage.setItem("chitpix_user", user);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* BIG LOGO */}
      <h1 className="text-[62px] font-black text-white mb-10 tracking-wide" style={{fontFamily:"cursive"}}>ChitPix</h1>

      {/* BIG CARD */}
      <div className="w-full max-w-[420px] bg-[#121212] border border-[#333] rounded-[16px] p-8 shadow-2xl">
        <div className="space-y-5">
          <input
            value={user}
            onChange={e=>setUser(e.target.value)}
            placeholder="User ID (ex: mahesh_07)"
            className="w-full bg-[#262626] border border-[#444] text-white text-[18px] p-[18px] rounded-[12px] outline-none focus:border-white placeholder:text-gray-400"
          />
          <input
            value={pass}
            onChange={e=>setPass(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full bg-[#262626] border border-[#444] text-white text-[18px] p-[18px] rounded-[12px] outline-none focus:border-white placeholder:text-gray-400"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white py-[18px] rounded-[12px] font-black text-[20px] mt-2"
          >
            Log In
          </button>
        </div>

        <div className="flex items-center my-8">
          <div className="flex-1 h-[1px] bg-[#333]"/>
          <p className="px-4 text-[14px] text-gray-400 font-bold">OR</p>
          <div className="flex-1 h-[1px] bg-[#333]"/>
        </div>

        <p className="text-center text-[16px] text-white font-bold">Log in with Facebook</p>
      </div>

      <div className="w-full max-w-[420px] bg-[#121212] border border-[#333] rounded-[16px] p-6 mt-5 text-center">
        <p className="text-[16px] text-white">Don't have an account? <span className="text-[#0095f6] font-bold text-[16px]">Sign up</span></p>
      </div>

      <p className="mt-10 text-[13px] text-gray-500">© 2026 ChitPix from Devanhalli, Karnataka</p>
    </div>
  );
}
