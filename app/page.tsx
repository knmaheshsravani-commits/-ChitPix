"use client";
import Header from "./components/Header";
import Stories from "./components/Stories";
import PostCard from "./components/PostCard";
import BottomNav from "./components/BottomNav";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: "90px", maxWidth: "500px", margin: "0 auto" }}>
      <Header />
      <Stories />
      <PostCard img={1} />
      <PostCard img={2} />
      <PostCard img={3} />
      <BottomNav />
    </div>
  );
}
