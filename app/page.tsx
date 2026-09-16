"use client";

import { useRef, useState } from "react";

type Media = {
  url: string;
  type: "image" | "video";
  name: string;
};

export default function Home() {
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [message, setMessage] = useState("");

  const addFile = (file: File) => {
    const url = URL.createObjectURL(file);

    setMedia((old) => [
      {
        url,
        type: file.type.startsWith("video") ? "video" : "image",
        name: file.name,
      },
      ...old,
    ]);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addFile(file);
    e.target.value = "";
  };

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addFile(file);
    e.target.value = "";
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    alert("Message sent: " + message);
    setMessage("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#ffffff",
          padding: "15px 20px",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 45,
              height: 45,
              borderRadius: 14,
              background: "#111827",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            CP
          </div>

          <h1 style={{ margin: 0, fontSize: 24 }}>ChitPix</h1>
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
        {/* Search */}
        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 16,
            marginBottom: 18,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search profile..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 16,
              outline: "none",
            }}
          />

          {search && (
            <div style={{ marginTop: 12, padding: 10 }}>
              Searching for: <b>{search}</b>
            </div>
          )}
        </div>

        {/* Upload buttons */}
        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 16,
            marginBottom: 18,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create a ChitPix</h2>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => photoInput.current?.click()}
              style={{
                padding: "13px 18px",
                border: 0,
                borderRadius: 12,
                background: "#111827",
                color: "white",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              📷 Add Photo
            </button>

            <button
              onClick={() =>
