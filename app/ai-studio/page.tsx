"use client"

import { useEffect, useRef, useState } from "react"

const PHOTO_FILTERS = [
  { name: "Normal", icon: "✨", css: "none" },
  { name: "Beauty", icon: "💖", css: "brightness(1.08) contrast(1.04) saturate(1.15)" },
  { name: "Portrait", icon: "👤", css: "brightness(1.08) saturate(1.12) contrast(1.08)" },
  { name: "Vintage", icon: "📷", css: "sepia(0.4) contrast(0.95) saturate(0.8)" },
  { name: "Cinematic", icon: "🎬", css: "contrast(1.25) saturate(0.85) brightness(0.95)" },
  { name: "Warm", icon: "🌅", css: "sepia(0.18) saturate(1.3)" },
  { name: "Cool", icon: "❄️", css: "saturate(0.9) hue-rotate(12deg)" },
  { name: "B&W", icon: "⚫", css: "grayscale(1)" },
  { name: "Dream", icon: "🌸", css: "brightness(1.12) saturate(1.2) contrast(0.92)" },
  { name: "Drama", icon: "🔥", css: "contrast(1.4) saturate(1.15)" },
  { name: "Soft", icon: "☁️", css: "brightness(1.08) contrast(0.88) saturate(0.9)" },
  { name: "Glow", icon: "✨", css: "brightness(1.2) contrast(1.05) saturate(1.2)" },
  { name: "Golden", icon: "🌞", css: "sepia(0.25) saturate(1.5) brightness(1.05)" },
  { name: "Rose", icon: "🌹", css: "sepia(0.12) hue-rotate(325deg) saturate(1.3)" },
  { name: "Ocean", icon: "🌊", css: "hue-rotate(15deg) saturate(1.25) contrast(1.05)" },
  { name: "Forest", icon: "🌿", css: "hue-rotate(25deg) saturate(1.3)" },
  { name: "Noir", icon: "🎞️", css: "grayscale(1) contrast(1.5)" },
  { name: "Pop", icon: "🎨", css: "saturate(1.7) contrast(1.12)" },
  { name: "Retro", icon: "📼", css: "sepia(0.3) contrast(1.15) saturate(0.9)" },
  { name: "Fade", icon: "🌫️", css: "contrast(0.85) brightness(1.08) saturate(0.75)" },
]

export default function AIStudioPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const imageUrlRef = useRef("")

  const [image, setImage] = useState("")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState("Normal")

  const selectedFilter =
    PHOTO_FILTERS.find((f) => f.name === activeFilter)?.css || "none"

  function uploadPhoto(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Photo size must be below 20MB.")
      return
    }

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
    }

    const newUrl = URL.createObjectURL(file)

    imageUrlRef.current = newUrl
    setImage(newUrl)
    setFileName(file.name)
    setActiveFilter("Normal")
    setError("")
  }

  function removePhoto() {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
      imageUrlRef.current = ""
    }

    setImage("")
    setFileName("")
    setActiveFilter("Normal")
    setError("")

    if (fileRef.current) {
      fileRef.current.value = ""
    }
  }

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current)
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f7f5fc] pb-10 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-fuchsia-600">
              ChitPix
            </h1>
            <p className="text-xs font-semibold tracking-widest text-slate-500">
              AI PHOTO STUDIO
            </p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-2 text-sm font-bold text-white">
            ✨ AI Studio
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-5 p-4">

        {/* WELCOME */}
        <section className="rounded-3xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-6 text-white shadow-lg">
          <p className="text-sm font-semibold text-white/80">
            WELCOME TO
          </p>
          <h2 className="mt-2 text-2xl font-black">
            AI Photo Studio ✨
          </h2>
          <p className="mt-2 text-sm text-white/90">
            Create beautiful photos with ChitPix editing tools.
          </p>
        </section>

        {/* PHOTO UPLOAD */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              📸 Your Photo
            </h2>

            {image && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-sm font-bold text-red-500"
              >
                Remove
              </button>
            )}
          </div>

          {image ? (
            <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src={image}
                alt="Edited photo preview"
                className="max-h-[500px] w-full object-contain"
                style={{ filter: selectedFilter }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 p-6 text-center"
            >
              <span className="text-6xl">🖼️</span>
              <span className="mt-4 text-lg font-bold">
                Upload Your Photo
              </span>
              <span className="mt-2 text-sm text-slate-500">
                Select a photo from your phone
              </span>
              <span className="mt-5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-7 py-3 font-bold text-white">
                + Select Photo
              </span>
              <span className="mt-3 text-xs text-slate-400">
                JPG · PNG · WEBP · Maximum 20MB
              </span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => uploadPhoto(e.target.files?.[0])}
          />

          {image && (
            <div className="mt-3">
              <p className="truncate text-xs text-slate-500">
                Selected: {fileName}
              </p>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 w-full rounded-xl border border-fuchsia-200 bg-fuchsia-50 py-3 font-bold text-fuchsia-700"
              >
                Change Photo
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </section>

        {/* PHOTO FILTERS */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-2 text-lg font-bold">
              ✨ ChitPix Photo Filters
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Choose your favourite photo style.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {PHOTO_FILTERS.map((filter) => (
                <button
                  key={filter.name}
                  type="button"
                  onClick={() => setActiveFilter(filter.name)}
                  className={`flex min-h-[75px] flex-col items-center justify-center gap-1 rounded-2xl border p-2 ${
                    activeFilter === filter.name
                      ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 ring-2 ring-fuchsia-200"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold">
                    {filter.icon} {filter.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveFilter("Normal")}
              className="mt-5 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              Reset Filter
            </button>

          </section>
        )}

        {/* FOOTER */}
        <p className="py-3 text-center text-xs text-slate-400">
          ChitPix AI Studio · Create Your Own Style ❤️
        </p>

      </div>
    </main>
  )
                }
