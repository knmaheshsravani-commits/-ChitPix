"use client"

import { useRef, useState } from "react"

export default function AIStudioPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [image, setImage] = useState("")
  const [error, setError] = useState("")

  function uploadPhoto(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Photo must be below 20MB")
      return
    }

    setError("")

    const url = URL.createObjectURL(file)
    setImage(url)
  }

  return (
    <main className="min-h-screen bg-[#f7f5fc] text-slate-900">

      {/* HEADER */}
      <header className="bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black text-fuchsia-600">
          ChitPix AI Studio ✨
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create Beautiful Photos
        </p>
      </header>

      <div className="mx-auto max-w-xl space-y-5 p-4">

        {/* WELCOME */}
        <section className="rounded-3xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-6 text-white">
          <h2 className="text-2xl font-bold">
            Welcome to AI Studio
          </h2>
          <p className="mt-2 text-sm">
            Edit your photos with ChitPix.
          </p>
        </section>

        {/* PHOTO UPLOAD */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">

          <h2 className="mb-4 text-lg font-bold">
            📸 Upload Your Photo
          </h2>

          {image ? (
            <img
              src={image}
              alt="Your uploaded photo"
              className="max-h-[450px] w-full rounded-2xl bg-black object-contain"
            />
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50">
              <span className="text-6xl">🖼️</span>
              <p className="mt-3 font-bold">
                Select Your Photo
              </p>
              <p className="mt-1 text-xs text-slate-500">
                JPG, PNG, WEBP · Maximum 20MB
              </p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadPhoto(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 py-3 font-bold text-white"
          >
            {image ? "Change Photo" : "+ Select Photo"}
          </button>

          {image && (
            <button
              type="button"
              onClick={() => {
                setImage("")
                if (fileRef.current) fileRef.current.value = ""
              }}
              className="mt-2 w-full rounded-full bg-slate-100 py-3 font-bold text-slate-700"
            >
              Remove Photo
            </button>
          )}

          {error && (
            <p className="mt-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

        </section>

        {/* TOOLS PLACEHOLDER */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">
            🎨 Editing Tools
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Upload a photo to start your editing journey.
          </p>
        </section>

      </div>
    </main>
  )
}
