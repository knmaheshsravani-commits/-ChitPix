
"use client";

import React, { useEffect, useRef, useState } from "react";

type FilterItem = {
  name: string;
  icon: string;
  css: string;
  category: string;
};

const PHOTO_FILTERS: FilterItem[] = [
  { name: "Normal", icon: "✨", css: "none", category: "Basic" },
  { name: "Beauty", icon: "💖", css: "brightness(1.08) contrast(1.04) saturate(1.15)", category: "Beauty" },
  { name: "Portrait", icon: "👤", css: "brightness(1.08) saturate(1.12) contrast(1.08)", category: "Beauty" },
  { name: "Vintage", icon: "📷", css: "sepia(.4) contrast(.95) saturate(.8)", category: "Retro" },
  { name: "Cinematic", icon: "🎬", css: "contrast(1.25) saturate(.85) brightness(.95)", category: "Art" },
  { name: "Warm", icon: "🌅", css: "sepia(.18) saturate(1.3)", category: "Basic" },
  { name: "Cool", icon: "❄️", css: "saturate(.9) hue-rotate(12deg)", category: "Basic" },
  { name: "B&W", icon: "⚫", css: "grayscale(1)", category: "Art" },
  { name: "Dream", icon: "🌸", css: "brightness(1.12) saturate(1.2) contrast(.92)", category: "Beauty" },
  { name: "Drama", icon: "🔥", css: "contrast(1.4) saturate(1.15)", category: "Art" },
  { name: "Soft", icon: "☁️", css: "brightness(1.08) contrast(.88) saturate(.9)", category: "Beauty" },
  { name: "Glow", icon: "✨", css: "brightness(1.2) contrast(1.05) saturate(1.2)", category: "Beauty" },
  { name: "Golden", icon: "🌞", css: "sepia(.25) saturate(1.5) brightness(1.05)", category: "Retro" },
  { name: "Rose", icon: "🌹", css: "sepia(.12) hue-rotate(325deg) saturate(1.3)", category: "Beauty" },
  { name: "Ocean", icon: "🌊", css: "hue-rotate(15deg) saturate(1.25) contrast(1.05)", category: "Art" },
  { name: "Forest", icon: "🌿", css: "hue-rotate(25deg) saturate(1.3)", category: "Art" },
  { name: "Noir", icon: "🎞️", css: "grayscale(1) contrast(1.5)", category: "Retro" },
  { name: "Pop", icon: "🎨", css: "saturate(1.7) contrast(1.12)", category: "Art" },
  { name: "Retro", icon: "📼", css: "sepia(.3) contrast(1.15) saturate(.9)", category: "Retro" },
  { name: "Fade", icon: "🌫️", css: "contrast(.85) brightness(1.08) saturate(.75)", category: "Retro" },
];

const FILTER_CATEGORIES = [
  "All",
  "Basic",
  "Beauty",
  "Retro",
  "Art",
];


const DEFAULT_EDIT = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  vignette: 0,
  zoom: 100,
  rotation: 0,
  flipH: false,
  flipV: false,
};

type EditSettings = typeof DEFAULT_EDIT;


type EditSettings = typeof DEFAULT_EDIT;
export default function AIStudioPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef("");

  const [image, setImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("Normal");
  const [category, setCategory] = useState("All");

  const [edit, setEdit] = useState<EditSettings>(DEFAULT_EDIT);
  
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(28);
  const [textBold, setTextBold] = useState(true);
  const [sticker, setSticker] = useState("");
  
  const historyRef = useRef<any[]>([]);
  const futureRef = useRef<any[]>([]);
  const currentSnapshotRef = useRef<any>(null);

  const [historyCount, setHistoryCount] = useState(0);
  const [futureCount, setFutureCount] = useState(0);

  const createSnapshot = () => ({
    edit: { ...edit },
    activeFilter,
    overlayText,
    textColor,
    textSize,
    textBold,
    sticker,
  });

  useEffect(() => {
    const snapshot = createSnapshot();

    if (currentSnapshotRef.current === null) {
      currentSnapshotRef.current = snapshot;
      return;
    }

    if (
      JSON.stringify(currentSnapshotRef.current) !==
      JSON.stringify(snapshot)
    ) {
      historyRef.current.push(currentSnapshotRef.current);

      if (historyRef.current.length > 30) {
        historyRef.current.shift();
      }

      currentSnapshotRef.current = snapshot;
      futureRef.current = [];

      setHistoryCount(historyRef.current.length);
      setFutureCount(0);
    }
  }, [
    edit,
    activeFilter,
    overlayText,
    textColor,
    textSize,
    textBold,
    sticker,
  ]);

  function restoreSnapshot(s: any) {
    setEdit(s.edit);
    setActiveFilter(s.activeFilter);
    setOverlayText(s.overlayText);
    setTextColor(s.textColor);
    setTextSize(s.textSize);
    setTextBold(s.textBold);
    setSticker(s.sticker);

    currentSnapshotRef.current = s;
  }

  function undoEdit() {
    if (!historyRef.current.length) return;

    const previous = historyRef.current.pop();
    futureRef.current.push(createSnapshot());

    restoreSnapshot(previous);

    setHistoryCount(historyRef.current.length);
    setFutureCount(futureRef.current.length);
  }

  function redoEdit() {
    if (!futureRef.current.length) return;

    const next = futureRef.current.pop();
    historyRef.current.push(createSnapshot());

    restoreSnapshot(next);

    setHistoryCount(historyRef.current.length);
    setFutureCount(futureRef.current.length);
  }

  function resetAllEdits() {
    setActiveFilter("Normal");
    setCategory("All");
    setEdit(DEFAULT_EDIT);
    setOverlayText("");
    setTextColor("#ffffff");
    setTextSize(28);
    setTextBold(true);
    setSticker("");
  }
  

  const selectedFilter =
    PHOTO_FILTERS.find(f => f.name === activeFilter)?.css || "none";

  const imageStyle: React.CSSProperties = {
    filter: `${selectedFilter} brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) sepia(${edit.warmth}%) blur(${edit.blur}px)`,
    transform: `rotate(${edit.rotation}deg) scale(${edit.zoom / 100})`,
    transition: "filter .2s ease, transform .2s ease",
  };

  function uploadPhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Photo size must be below 20MB.");
      return;
    }

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);

    const imageStyle: React.CSSProperties = {
  filter: `${selectedFilter} brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) sepia(${edit.warmth}%) blur(${edit.blur}px)`,
  transform: `rotate(${edit.rotation}deg) scale(${edit.zoom / 100}) scaleX(${edit.flipH ? -1 : 1}) scaleY(${edit.flipV ? -1 : 1})`,
  transition: "all .2s ease",
};

  function removePhoto() {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = "";
    }

    setImage("");
    setFileName("");
    setActiveFilter("Normal");
    setEdit(DEFAULT_EDIT);
    setError("");

    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f5fc] pb-10 text-slate-900">

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
          <span className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white">
            ✨ AI Studio
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-5 p-4">

        <section className="rounded-3xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-6 text-white">
          <h2 className="text-2xl font-black">
            AI Photo Studio ✨
          </h2>
          <p className="mt-2 text-sm">
            Edit your photos with ChitPix.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">

          <h2 className="mb-4 text-lg font-bold">
            📸 Your Photo
          </h2>

          {image ? (
            <>
              <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img
                  src={image}
                  alt="Photo preview"
                  className="max-h-[500px] w-full object-contain"
                  style={imageStyle}
                />
              </div>

              <p className="mt-3 truncate text-xs text-slate-500">
                Selected: {fileName}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 py-3 font-bold text-fuchsia-700"
                >
                  🔄 Change Photo
                </button>

                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-xl bg-red-50 py-3 font-bold text-red-600"
                >
                  🗑️ Remove Photo
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 p-6 text-center">
              <span className="text-6xl">🖼️</span>
              <h3 className="mt-4 text-lg font-bold">
                Upload Your Photo
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Choose a photo or capture a new one.
              </p>

              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl bg-fuchsia-600 py-3 font-bold text-white"
                >
                  🖼️ Gallery
                </button>

                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="rounded-xl bg-slate-900 py-3 font-bold text-white"
                >
                  📷 Camera
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                JPG · PNG · WEBP · Maximum 20MB
              </p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => uploadPhoto(e.target.files?.[0])}
          />

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => uploadPhoto(e.target.files?.[0])}
          />

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </section>

        {/* PART 3 CONTINUES BELOW */}
                    
        {/* PART 3 - PHOTO FILTERS */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">
                  ✨ ChitPix Photo Filters
                </h2>
                <p className="text-xs text-slate-500">
                  Choose your favourite style
                </p>
              </div>

              <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-700">
                {PHOTO_FILTERS.length} Filters
              </span>
            </div>

            {/* FILTER CATEGORIES */}

            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {FILTER_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition ${
                    category === item
                      ? "bg-fuchsia-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* FILTER OPTIONS */}

            <div className="grid grid-cols-3 gap-3">

              {PHOTO_FILTERS
                .filter((filter) =>
                  category === "All" ||
                  filter.category === category
                )
                .map((filter) => (

                  <button
                    key={filter.name}
                    type="button"
                    onClick={() => setActiveFilter(filter.name)}
                    className={`flex min-h-[95px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-2 transition active:scale-95 ${
                      activeFilter === filter.name
                        ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 ring-2 ring-fuchsia-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >

                    <span className="text-2xl">
                      {filter.icon}
                    </span>

                    <span className="text-xs font-bold">
                      {filter.name}
                    </span>

                    {activeFilter === filter.name && (
                      <span className="text-[10px] font-black text-fuchsia-600">
                        ✓ SELECTED
                      </span>
                    )}

                  </button>
                ))}

            </div>

            {/* FILTER INFORMATION */}

            <div className="mt-4 rounded-xl bg-fuchsia-50 p-3">
              <p className="text-sm font-bold text-fuchsia-700">
                ✨ Active Filter: {activeFilter}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Your selected filter is applied to the photo preview.
              </p>
            </div>

            {/* RESET FILTER */}

            <button
              type="button"
              onClick={() => {
                setActiveFilter("Normal");
                setCategory("All");
              }}
              className="mt-4 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
            >
              ↺ Reset Filters
            </button>

          </section>
        )}

        {/* PART 4 CONTINUES BELOW */}
                
        {/* PART 4 - ADVANCED ADJUSTMENTS */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-black">
                🎛️ Photo Adjustments
              </h2>
              <p className="text-xs text-slate-500">
                Adjust your photo with live controls.
              </p>
            </div>

            {/* BRIGHTNESS */}

            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-bold">
                  ☀️ Brightness
                </label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.brightness}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={edit.brightness}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    brightness: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* CONTRAST */}

            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-bold">
                  ◐ Contrast
                </label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.contrast}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={edit.contrast}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    contrast: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* SATURATION */}

            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-bold">
                  🎨 Saturation
                </label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.saturation}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={edit.saturation}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    saturation: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* WARMTH */}

            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-bold">
                  🌅 Warmth
                </label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.warmth}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={edit.warmth}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    warmth: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* BLUR */}

            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-bold">
                  🌫️ Blur
                </label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.blur}px
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={edit.blur}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    blur: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={() =>
                setEdit({
                  ...edit,
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  warmth: 0,
                  blur: 0
                })
              }
              className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              ↺ Reset Adjustments
            </button>

          </section>
        )}

        {/* PART 5 CONTINUES BELOW */}
        
        {/* PART 5 - TRANSFORM TOOLS */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-2 text-lg font-black">
              ✂️ Crop & Transform
            </h2>

            <p className="mb-5 text-xs text-slate-500">
              Rotate, flip and zoom your photo.
            </p>

            {/* CROP */}

            <button
              type="button"
              onClick={() => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;

                  ctx.drawImage(img, 0, 0);
                  const link = document.createElement("a");
                  link.download = "chitpix-crop-source.png";
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                  setError("Crop source downloaded. Full crop selection will be available in the next crop tool update.");
                };
                img.src = image;
              }}
              className="mb-4 w-full rounded-xl bg-fuchsia-50 py-3 font-bold text-fuchsia-700"
            >
              ✂️ Prepare Crop Image
            </button>

            {/* ROTATION */}

            <div className="mb-5">
              <p className="mb-3 text-sm font-bold">
                🔄 Rotate Photo
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      rotation: edit.rotation - 90
                    })
                  }
                  className="rounded-xl bg-slate-100 py-3 font-bold"
                >
                  ↶ Rotate Left
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      rotation: edit.rotation + 90
                    })
                  }
                  className="rounded-xl bg-slate-100 py-3 font-bold"
                >
                  ↷ Rotate Right
                </button>
              </div>
            </div>

            {/* FLIP */}

            <div className="mb-5">
              <p className="mb-3 text-sm font-bold">
                ↔️ Flip Photo
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      flipH: !edit.flipH
                    } as EditSettings)
                  }
                  className="rounded-xl bg-fuchsia-50 py-3 font-bold text-fuchsia-700"
                >
                  ↔️ Horizontal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      flipV: !edit.flipV
                    } as EditSettings)
                  }
                  className="rounded-xl bg-fuchsia-50 py-3 font-bold text-fuchsia-700"
                >
                  ↕️ Vertical
                </button>
              </div>
            </div>

            {/* ZOOM */}

            <div className="mb-5">
              <div className="mb-2 flex justify-between">
                <p className="text-sm font-bold">
                  🔍 Zoom
                </p>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.zoom}%
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="200"
                value={edit.zoom}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    zoom: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={() =>
                setEdit({
                  ...edit,
                  rotation: 0,
                  zoom: 100,
                  flipH: false,
                  flipV: false
                } as EditSettings)
              }
              className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white"
            >
              ↺ Reset Transform
            </button>

          </section>
        )}

        {/* PART 6 CONTINUES BELOW */}
        
        {/* PART 6 - BEFORE AFTER & VIGNETTE */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-2 text-lg font-black">
              👀 Before & After Studio
            </h2>

            <p className="mb-4 text-xs text-slate-500">
              Compare your original and edited photo.
            </p>

            {/* BEFORE AFTER */}

            <div className="grid grid-cols-2 gap-3">

              <div>
                <p className="mb-2 text-center text-sm font-bold">
                  Original
                </p>

                <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-black">
                  <img
                    src={image}
                    alt="Original photo"
                    className="max-h-full w-full object-contain"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-center text-sm font-bold text-fuchsia-600">
                  Edited
                </p>

                <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-black">
                  <img
                    src={image}
                    alt="Edited photo"
                    className="max-h-full w-full object-contain"
                    style={imageStyle}
                  />
                </div>
              </div>

            </div>

            {/* VIGNETTE */}

            <div className="mt-6">
              <div className="mb-3 flex justify-between">
                <label className="text-sm font-bold">
                  🌑 Vignette Effect
                </label>

                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.vignette}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={edit.vignette}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    vignette: Number(e.target.value)
                  })
                }
                className="w-full accent-fuchsia-600"
              />

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      vignette: 0
                    })
                  }
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      vignette: 50
                    })
                  }
                  className="flex-1 rounded-xl bg-fuchsia-100 py-3 text-sm font-bold text-fuchsia-700"
                >
                  Medium
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEdit({
                      ...edit,
                      vignette: 100
                    })
                  }
                  className="flex-1 rounded-xl bg-fuchsia-600 py-3 text-sm font-bold text-white"
                >
                  Strong
                </button>
              </div>
            </div>

            {/* ORIGINAL PREVIEW */}

            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("Normal");
                  setEdit(DEFAULT_EDIT);
                }}
                className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white"
              >
                ↺ Restore Original Settings
              </button>
            </div>

          </section>
        )}

        {/* PART 7 CONTINUES BELOW */}
        
        {/* PART 7 - TEXT EDITOR & STICKERS */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="text-lg font-black">
              📝 Text & Sticker Studio
            </h2>

            <p className="mb-4 text-xs text-slate-500">
              Customize your photo with text and emojis.
            </p>

            {/* LIVE TEXT PREVIEW */}

            <div className="relative mb-5 flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-black">

              <img
                src={image}
                alt="Text editing preview"
                className="max-h-[400px] w-full object-contain"
                style={imageStyle}
              />

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">

                {sticker && (
                  <span className="text-5xl drop-shadow-lg">
                    {sticker}
                  </span>
                )}

                {overlayText && (
                  <span
                    className="break-words px-4 text-center drop-shadow-lg"
                    style={{
                      color: textColor,
                      fontSize: `${textSize}px`,
                      fontWeight: textBold ? "bold" : "normal",
                      textShadow: "2px 2px 5px black",
                    }}
                  >
                    {overlayText}
                  </span>
                )}

              </div>
            </div>

            {/* TEXT INPUT */}

            <label className="mb-2 block text-sm font-bold">
              ✍️ Enter Your Text
            </label>

            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Write something..."
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-fuchsia-500"
            />

            {/* TEXT COLOR */}

            <div className="mt-5">
              <label className="mb-3 block text-sm font-bold">
                🎨 Text Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-lg"
                />

                <span className="text-sm font-semibold">
                  {textColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* TEXT SIZE */}

            <div className="mt-5">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-bold">
                  🔠 Text Size
                </label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {textSize}px
                </span>
              </div>

              <input
                type="range"
                min="12"
                max="60"
                value={textSize}
                onChange={(e) =>
                  setTextSize(Number(e.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* BOLD */}

            <button
              type="button"
              onClick={() => setTextBold(!textBold)}
              className={`mt-4 w-full rounded-xl py-3 font-bold ${
                textBold
                  ? "bg-fuchsia-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              B {textBold ? "Bold ON" : "Bold OFF"}
            </button>

            {/* STICKERS */}

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold">
                😍 Choose Stickers
              </h3>

              <div className="grid grid-cols-5 gap-3">
                {[
                  "❤️", "🔥", "😍", "🥰", "⭐",
                  "✨", "🌸", "🌹", "👑", "🦋",
                  "💎", "🎉", "🌈", "💖", "😎"
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSticker(item)}
                    className={`rounded-xl border p-3 text-2xl ${
                      sticker === item
                        ? "border-fuchsia-500 bg-fuchsia-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* REMOVE OPTIONS */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setOverlayText("")}
                className="rounded-xl bg-red-50 py-3 font-bold text-red-600"
              >
                Remove Text
              </button>

              <button
                type="button"
                onClick={() => setSticker("")}
                className="rounded-xl bg-orange-50 py-3 font-bold text-orange-600"
              >
                Remove Sticker
              </button>

            </div>

            <button
              type="button"
              onClick={() => {
                setOverlayText("");
                setSticker("");
                setTextColor("#ffffff");
                setTextSize(28);
                setTextBold(true);
              }}
              className="mt-3 w-full rounded-xl bg-slate-900 py-3 font-bold text-white"
            >
              ↺ Reset Text & Stickers
            </button>

          </section>
        )}

        {/* PART 8 CONTINUES BELOW */}
        
        {/* PART 8 - EDITING HISTORY */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-2 text-lg font-black">
              ↶ Editing History
            </h2>

            <p className="mb-4 text-xs text-slate-500">
              Undo and redo your editing changes.
            </p>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                disabled={historyCount === 0}
                onClick={undoEdit}
                className="rounded-xl bg-fuchsia-600 py-4 font-bold text-white disabled:opacity-40"
              >
                ↶ Undo
              </button>

              <button
                type="button"
                disabled={futureCount === 0}
                onClick={redoEdit}
                className="rounded-xl bg-slate-900 py-4 font-bold text-white disabled:opacity-40"
              >
                ↷ Redo
              </button>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-fuchsia-50 p-3 text-center">
                <p className="text-2xl font-black text-fuchsia-600">
                  {historyCount}
                </p>
                <p className="text-xs font-semibold">
                  Undo Steps
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-center">
                <p className="text-2xl font-black">
                  {futureCount}
                </p>
                <p className="text-xs font-semibold">
                  Redo Steps
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => {
                setOverlayText("");
                setSticker("");
              }}
              className="mt-4 w-full rounded-xl bg-orange-50 py-3 font-bold text-orange-600"
            >
              🧹 Clear Text & Stickers
            </button>

            <button
              type="button"
              onClick={resetAllEdits}
              className="mt-3 w-full rounded-xl bg-red-600 py-3 font-bold text-white"
            >
              ↺ Reset All Editing
            </button>

          </section>
        )}

        {/* PART 9 CONTINUES BELOW */}
        
        {/* PART 9 - EXPORT & SHARE */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="text-lg font-black">
              📥 Save Your Edited Photo
            </h2>

            <p className="mb-5 mt-2 text-xs text-slate-500">
              Download your finished ChitPix creation.
            </p>

            <div className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-5 text-center text-white">
              <div className="text-5xl">🖼️</div>
              <h3 className="mt-3 text-xl font-black">
                Your Photo Is Ready!
              </h3>
              <p className="mt-2 text-sm text-white/90">
                Filters, adjustments, text and stickers included.
              </p>
            </div>

            <button
              type="button"
              disabled={exporting}
              onClick={() => exportPhoto(false)}
              className="mt-5 w-full rounded-xl bg-fuchsia-600 py-4 font-black text-white disabled:opacity-50"
            >
              {exporting ? "⏳ Preparing Photo..." : "⬇️ Download HD Photo"}
            </button>

            <button
              type="button"
              disabled={exporting}
              onClick={() => exportPhoto(true)}
              className="mt-3 w-full rounded-xl bg-slate-900 py-4 font-bold text-white disabled:opacity-50"
            >
              📤 Share Edited Photo
            </button>

            {exportMessage && (
              <p className="mt-4 rounded-xl bg-fuchsia-50 p-3 text-center text-sm font-semibold text-fuchsia-700">
                {exportMessage}
              </p>
            )}

            <p className="mt-4 text-center text-xs text-slate-400">
              PNG Format · High Quality · ChitPix Studio
            </p>

          </section>
        )}

        {/* PART 10 CONTINUES BELOW */}
        
        {/* PART 10 - FINAL STUDIO */}

        <section className="rounded-3xl bg-white p-4 shadow-sm">

          <h2 className="text-lg font-black">
            ❤️ ChitPix AI Studio
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create beautiful photos with ChitPix editing tools.
          </p>

          {image && (
            <>
              <div className="mt-4 rounded-xl bg-green-50 p-3 text-center">
                <p className="font-bold text-green-700">
                  ✅ Photo Loaded Successfully
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {fileName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetAllEdits();
                  historyRef.current = [];
                  futureRef.current = [];
                  currentSnapshotRef.current = null;
                  setHistoryCount(0);
                  setFutureCount(0);
                  setExportMessage("");
                  setError("");
                }}
                className="mt-4 w-full rounded-xl bg-fuchsia-100 py-3 font-bold text-fuchsia-700"
              >
                ↺ Reset Complete Studio
              </button>

              <button
                type="button"
                onClick={() => {
                  removePhoto();
                  resetAllEdits();
                  historyRef.current = [];
                  futureRef.current = [];
                  currentSnapshotRef.current = null;
                  setHistoryCount(0);
                  setFutureCount(0);
                  setExportMessage("");
                }}
                className="mt-3 w-full rounded-xl bg-red-50 py-3 font-bold text-red-600"
              >
                🗑️ Remove Photo & Start Again
              </button>
            </>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 border-t pt-5 text-center">
            <h3 className="text-xl font-black text-fuchsia-600">
              ChitPix ✨
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Create · Edit · Share · Inspire
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Made with ❤️ for ChitPix Creators
            </p>
          </div>

        </section>

      </div>
    </main>
  );
  }
  
