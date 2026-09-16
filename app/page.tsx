"use client";

import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState<string>("");

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setType(file.type);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        ChitPix
      </h1>

      <div className="flex justify-center">
        <button
          onClick={openGallery}
          className="bg-white text-black px-6 py-3 rounded-full font-semibold"
        >
          📷 Add Photo / Video
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFile}
        className="hidden"
      />

      {preview && (
        <div className="mt-8 flex justify-center">
          {type.startsWith("image/") ? (
            <img
              src={preview}
              alt="Selected"
              className="max-w-full max-h-[500px] rounded-2xl"
            />
          ) : (
            <video
              src={preview}
              controls
              className="max-w-full max-h-[500px] rounded-2xl"
            />
          )}
        </div>
      )}
    </main>
  );
}
