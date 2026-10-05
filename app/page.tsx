"use client"
import Header from "./components/Header"
import Stories from "./components/Stories"
import PostCard from "./components/PostCard"
import BottomNav from "./components/BottomNav"

export default function Page(){
  return(
    <div className="min-h-screen bg-white pb-20 max-w-[500px] mx-auto">
      <Header />
      <Stories />
      <PostCard />
      <PostCard />
      <BottomNav />
    </div>
  )
}
