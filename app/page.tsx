"use client";

import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#ffffff",
          padding: "18px 20px",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: "800",
            }}
          >
            ChitPix
          </h1>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search profiles..."
            style={{
              flex: 1,
              maxWidth: "300px",
              padding: "11px 15px",
              borderRadius: "25px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "15px",
            }}
          />

          <button
            style={{
              border: "none",
              background: "#111",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: "20px",
              fontWeight: "600",
            }}
          >
            Profile
          </button>
        </div>
      </header>

      {/* Search result */}
      {search && (
        <section
          style={{
            maxWidth: "700px",
            margin: "20px auto",
            padding: "18px",
            background: "#fff",
            borderRadius: "15px",
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Search Profile</h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                background: "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              👤
            </div>

            <div>
              <strong>{search}</strong>
              <p style={{ margin: "5px 0", color: "#777" }}>
                ChitPix profile
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Profile */}
      <section
        style={{
          maxWidth: "700px",
          margin: "20px auto",
          padding: "25px 20px",
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #ddd",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "85px",
              height: "85px",
              borderRadius: "50%",
              background: "#111",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: "bold",
            }}
          >
            CP
          </div>

          <div>
            <h2 style={{ margin: 0 }}>ChitPix User</h2>
            <p style={{ color: "#777" }}>@chitpix</p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "25px",
            textAlign: "center",
          }}
        >
          <div>
            <strong>0</strong>
            <br />
            Posts
          </div>

          <div>
            <strong>0</strong>
            <br />
            Followers
          </div>

          <div>
            <strong>0</strong>
            <br />
            Following
          </div>
        </div>
      </section>

      {/* Create post */}
      <section
        style={{
          maxWidth: "700px",
          margin: "20px auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #ddd",
        }}
      >
        <h3>Share on ChitPix</h3>

        <button
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            fontSize: "16px",
          }}
        >
          📸 Add Photo / Video
        </button>
      </section>

      {/* Welcome */}
      <section
        style={{
          maxWidth: "700px",
          margin: "20px auto",
          padding: "35px 20px",
          textAlign: "center",
        }}
      >
        <h2>Welcome to ChitPix 🚀</h2>
        <p style={{ color: "#666" }}>
          Share photos, videos and connect with people.
        </p>
      </section>
    </main>
  );
              }
