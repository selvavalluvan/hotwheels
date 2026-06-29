"use client";

import { useRef, useState } from "react";
import { fileToBase64 } from "@/lib/image";

interface Props {
  onCapture: (data: { base64: string; mediaType: string; previewUrl: string }) => void;
  label?: string;
}

export default function CameraCapture({ onCapture, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mediaType } = await fileToBase64(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onCapture({ base64, mediaType, previewUrl: url });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Captured car"
          className="w-full max-w-xs rounded-lg border border-gray-300 object-contain"
        />
      ) : (
        <div className="flex h-48 w-full max-w-xs items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
          No photo yet
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full max-w-xs rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white active:bg-blue-700"
      >
        {label ?? "Take Photo"}
      </button>
    </div>
  );
}
