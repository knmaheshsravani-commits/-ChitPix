"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [tab, setTab] = useState("home");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<any[]>([{ id: 1, image_url: "https://picsum.photos/seed/1/600/800", caption: "First post beo!", likes: 12, liked: false, comments: [] }]);
  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("ChitPix beo 💖");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [commentInputs, setCommentInputs] = useState<{[key:number]:string}>({});
  const [showComments, setShowComments] = useState<{[key:number]:boolean}>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email ||!password) { alert("Email & Password pettu!"); return; }
    setLoading(true);
    try {
      if (isSignup) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; else alert("Check email!"); }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const addPost = () => {
    if (!url) { alert("URL pettu!"); return; }
    setPosts([{ id: Date.now(), image_url: url, caption: text, likes: 0, liked: false, comments: [] },...posts]);
    setText(""); setUrl("");
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try { const n = `${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if(error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setUrl(data.publicUrl); } catch(e:any){ alert(e.message) } finally { setUploading(false) }
  };

  const toggleLike = (id: number) => setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes-1 : p.likes+1 } : p));

  const addComment = (postId: number) => {
    const txt = commentInputs[postId];
    if(!txt ||!txt.trim()) return;
    setPosts(posts.map(p => p.id === postId? {...p, comments: [...(p.comments||[]), { user: session?.user?.email?.split('@')[0] || 'beo', text: txt }] } : p));
    setCommentInputs({...commentInputs, [postId]: ""});
  };

  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));
  const myName = session?.user?.email?.split('@')[0] || 'mahesh';
  const displayName = newName || myName;

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-[500px]">
          <div className="text-center mb-8"><h1 className="text-[52px] font-black">ChitPix
