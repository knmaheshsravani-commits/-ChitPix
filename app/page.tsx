"use client"
import { useState, useEffect } from "react";
export default function Page() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [profile, setProfile] = useState({
    name: "_sankar_001", fullName: "Sankar Mahesh",
    bio: "Devanhalli | ChitPix Creator 🚀 | Travel | Code",
    link: "chitpix-p6.vercel.app", city: "Devanhalli, Karnataka",
  });
  const [temp, setTemp] = useState(profile);
  useEffect(()=>{
    const u = localStorage.getItem("chitpix_user");
    if(!u){ window.location.href="/login"; }
    else{ setCurrentUser(u); setProfile(prev=>({...prev, name:u})); }
  },[]);
  const stories = [
    { name: "rxtagur", img: "https://picsum.photos/200/200?random=2" },
    { name: "akhilesh", img: "https://picsum.photos/200/200?random=3" },
    { name: "abhichar", img: "https://picsum.photos/200/200?random=4" },
    { name: "your_story", img: "https://picsum.photos/200/200?random=5" },
    { name: "mahesh", img: "https://picsum.photos/200/200?random=6" },
    {
