"use client";

import { useRef, useState } from "react";

type Post = {
  id: number;
  username: string;
  media: string;
  type: "image" | "video";
  caption: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video") ? "video" : "image";

    const newPost: Post = {
      id: Date.now(),
      username: "You",
      media: url,
      type,
      caption: "My new ChitPix post ❤️",
    };

    setPosts((oldPosts) => [newPost, ...oldPosts]);

    e.target.value = "";
  };

  const profiles = [
    "ChitPix Official",
    "Ruchi Vantalu",
    "Mahesh",
    "Friends",
  ];

  const filteredProfiles = profiles.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        color: "#111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#ffffff",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "25px",
            fontWeight: "800",
          }}
        >
          ChitPix
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            on
