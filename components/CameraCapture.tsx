"use client";

import { useRef } from "react";
import { fileToBase64 } from "@/lib/image";

interface Props {
  onCapture: (data: { base64: string; mediaType: string; previewUrl: string }) => void;
  label?: string;
}

export default function CameraCapture({ onCapture, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mediaType } = await fileToBase64(file);
    const url = URL.createObjectURL(file);
    onCapture({ base64, mediaType, previewUrl: url });
    e.target.value = "";
  }

  return (
    <div>
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
        className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] bg-hw-red text-base font-extrabold text-white shadow-[0_10px_24px_rgba(227,0,15,0.26)]"
      >
        <div className="relative h-[14px] w-[18px] rounded border-[2.5px] border-white">
          <div className="absolute -top-[5px] left-[5px] h-1 w-2 rounded-t border-[2.5px] border-b-0 border-white" />
        </div>
        {label ?? "Take Photo"}
      </button>
    </div>
  );
}
