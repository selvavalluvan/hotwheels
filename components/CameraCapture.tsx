"use client";

import { useRef } from "react";
import { fileToBase64 } from "@/lib/image";

type Captured = { base64: string; mediaType: string; previewUrl: string };

interface Props {
  onCapture?: (data: Captured) => void;
  onCaptureMultiple?: (data: Captured[]) => void;
  multiple?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
  useCamera?: boolean;
}

export default function CameraCapture({
  onCapture,
  onCaptureMultiple,
  multiple,
  label,
  variant = "primary",
  useCamera,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (multiple && onCaptureMultiple) {
      const captured = await Promise.all(
        files.map(async (file) => {
          const { base64, mediaType } = await fileToBase64(file);
          return { base64, mediaType, previewUrl: URL.createObjectURL(file) };
        })
      );
      onCaptureMultiple(captured);
    } else if (onCapture) {
      const file = files[0];
      const { base64, mediaType } = await fileToBase64(file);
      const url = URL.createObjectURL(file);
      onCapture({ base64, mediaType, previewUrl: url });
    }
    e.target.value = "";
  }

  const isSecondary = variant === "secondary";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={useCamera ? "environment" : undefined}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={
          isSecondary
            ? "flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] border-[1.5px] border-hw-border bg-white text-base font-extrabold text-[#14110F]"
            : "flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] bg-hw-red text-base font-extrabold text-white shadow-[0_10px_24px_rgba(227,0,15,0.26)]"
        }
      >
        <div
          className={`relative h-[14px] w-[18px] rounded border-[2.5px] ${
            isSecondary ? "border-[#14110F]" : "border-white"
          }`}
        >
          <div
            className={`absolute -top-[5px] left-[5px] h-1 w-2 rounded-t border-[2.5px] border-b-0 ${
              isSecondary ? "border-[#14110F]" : "border-white"
            }`}
          />
        </div>
        {label ?? "Take Photo"}
      </button>
    </div>
  );
}
