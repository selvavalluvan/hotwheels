"use client";

import { useState } from "react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import { colorToHex } from "@/lib/colorSwatch";
import type { IdentifiedCar } from "@/lib/types";

type Captured = { base64: string; mediaType: string; previewUrl: string };

export default function AddPage() {
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [form, setForm] = useState<IdentifiedCar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCapture(data: Captured) {
    setCaptured(data);
    setForm(null);
    setError(null);
    setSaved(false);
    setIdentifying(true);
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.base64, mediaType: data.mediaType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Identification failed");
      setForm(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIdentifying(false);
    }
  }

  async function handleSave() {
    if (!form || !captured) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: captured.base64,
          mediaType: captured.mediaType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setCaptured(null);
    setForm(null);
    setError(null);
    setSaved(false);
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex h-[54px] items-center gap-1.5 border-b border-hw-border-2 px-[18px]">
        <Link href="/" className="text-2xl leading-none text-hw-muted-2">
          ‹
        </Link>
        <span className="text-[17px] font-extrabold">Add to Collection</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-[18px]">
        {!captured && (
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-[#16181D]">
            <Corner className="left-[18px] top-[18px] rounded-tl-[7px] border-b-0 border-r-0" />
            <Corner className="right-[18px] top-[18px] rounded-tr-[7px] border-b-0 border-l-0" />
            <Corner className="bottom-[18px] left-[18px] rounded-bl-[7px] border-r-0 border-t-0" />
            <Corner className="bottom-[18px] right-[18px] rounded-br-[7px] border-l-0 border-t-0" />
            <div className="px-[30px] text-center">
              <CameraIcon />
              <div className="mt-3.5 text-[13px] font-semibold uppercase tracking-wider text-white/85">
                Center the card in frame
              </div>
            </div>
          </div>
        )}

        {captured && identifying && (
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-[#0E1014]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={captured.previewUrl} alt="Captured card" className="h-full w-full object-contain" />
            <div className="absolute inset-x-0 top-0 h-[3px] animate-pulse bg-gradient-to-r from-transparent via-hw-red to-transparent" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-[18px] pt-5">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-white">Identifying card</span>
                <span className="flex gap-[3px]">
                  <Dot delay="0s" />
                  <Dot delay=".2s" />
                  <Dot delay=".4s" />
                </span>
              </div>
              <div className="mt-1 text-xs font-medium text-white/70">
                Reading name, series &amp; card number
              </div>
            </div>
          </div>
        )}

        {captured && !identifying && form && (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-3.5 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={captured.previewUrl}
                alt="Captured car"
                className="h-[66px] w-[52px] flex-shrink-0 rounded-[9px] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EC] px-2.5 py-1">
                  <span className="text-[11px] font-extrabold text-hw-green">✓</span>
                  <span className="text-[11px] font-bold tracking-wide text-hw-green">
                    Identified
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-hw-muted">
                  Check the details, then save.
                </div>
              </div>
              <button
                onClick={reset}
                className="flex-shrink-0 text-xs font-bold text-hw-blue"
              >
                Retake
              </button>
            </div>

            <Field label="Car name" value={form.car_name} onChange={(v) => setForm({ ...form, car_name: v })} highlight />
            <Field
              label="Collection"
              value={form.collection_name ?? ""}
              onChange={(v) => setForm({ ...form, collection_name: v })}
            />
            <div className="flex gap-[9px]">
              <div className="flex-1">
                <Field
                  label="Card number"
                  value={form.collection_number ?? ""}
                  onChange={(v) => setForm({ ...form, collection_number: v })}
                />
              </div>
              <div className="flex-1">
                <Field
                  label="Series #"
                  value={form.series_number ?? ""}
                  onChange={(v) => setForm({ ...form, series_number: v })}
                />
              </div>
            </div>
            <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-wider text-hw-muted">
              Color
            </label>
            <div className="mb-3.5 -mt-1.5 flex items-center gap-2 rounded-[11px] border-[1.5px] border-hw-border px-3 py-2.5">
              <span
                className="h-[15px] w-[15px] flex-shrink-0 rounded-full border-[1.5px] border-[#D4D4D8]"
                style={{ background: colorToHex(form.color) }}
              />
              <input
                className="w-full font-sans text-sm font-bold text-[#14110F] outline-none"
                value={form.color ?? ""}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>

            <div className="mb-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_gold: !form.is_gold })}
                className={`relative h-[25px] w-[42px] rounded-full transition-colors ${
                  form.is_gold ? "bg-hw-gold" : "bg-[#D4D4D8]"
                }`}
              >
                <span
                  className={`absolute top-[2.5px] h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.is_gold ? "right-[2.5px]" : "left-[2.5px]"
                  }`}
                />
              </button>
              <span className="text-[13px] font-bold">Treasure Hunt / Gold variant</span>
            </div>

            {error && <p className="mb-3 text-sm text-hw-red">{error}</p>}

            {!saved ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex h-14 w-full items-center justify-center rounded-[16px] bg-hw-red text-base font-extrabold text-white shadow-[0_10px_24px_rgba(227,0,15,0.26)] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save to Inventory"}
              </button>
            ) : (
              <div className="space-y-2.5">
                <p className="text-center text-sm font-bold text-hw-green">✅ Saved!</p>
                <button
                  onClick={reset}
                  className="flex h-14 w-full items-center justify-center rounded-[16px] bg-hw-surface text-base font-extrabold text-[#52525B]"
                >
                  Add Another
                </button>
              </div>
            )}
          </div>
        )}

        {!form && !identifying && (
          <div className="pt-1">
            <CameraCapture onCapture={handleCapture} label={captured ? "Retake Photo" : "Take Photo"} />
            {error && <p className="mt-3 text-center text-sm text-hw-red">{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

function CameraIcon() {
  return (
    <div className="relative mx-auto mb-3.5 h-[46px] w-[46px] rounded-[11px] border-[2.5px] border-white/55">
      <div className="absolute -top-[9px] left-[13px] h-2 w-4 rounded-t-[5px] border-[2.5px] border-b-0 border-white/55" />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white/55" />
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <div
      className={`absolute h-7 w-7 border-[2.5px] border-white/70 ${className}`}
    />
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-[5px] w-[5px] animate-pulse rounded-full bg-white"
      style={{ animationDelay: delay }}
    />
  );
}

function Field({
  label,
  value,
  onChange,
  highlight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  highlight?: boolean;
}) {
  return (
    <div className="mb-2.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-hw-muted">
        {label}
      </label>
      <input
        className={`mt-1.5 w-full rounded-[11px] bg-white px-3 py-2.5 text-sm font-bold text-[#14110F] outline-none ${
          highlight ? "border-2 border-hw-red" : "border-[1.5px] border-hw-border"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
