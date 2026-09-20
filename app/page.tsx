"use client"
import { useState, useEffect } from "react";
export default function Page() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(()=>{
    const u = localStorage.getItem("chitpix_user");
    if(!u){ window.location.href="/login"; }
    else setCurrentUser(u);
  },[]);
