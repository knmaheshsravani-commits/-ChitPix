"use client";
import Header from "./components/Header";
import Stories from "./components/Stories";
import PostCard from "./components/PostCard";
import BottomNav from "./components/BottomNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white pb-24 max-w-[500px] mx-auto border-x border-zinc-100">
      <Header />
      <Stories />
      <PostCard />
      <PostCard />
      <PostCard />
      <BottomNav />
    </div>
  );
}
