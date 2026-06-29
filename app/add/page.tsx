"use client";

import { useState } from "react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import { colorToHex } from "@/lib/colorSwatch";
import { fileToBase64 } from "@/lib/image";
import type { IdentifiedCar } from "@/lib/types";

type Captured = { base64: string; mediaType: string; previewUrl: string };

interface BulkResult {
  previewUrl: string;
  status: "pending" | "done" | "error";
  carName?: string;
  merged?: boolean;
  error?: string;
}

const BLANK_FORM: IdentifiedCar = {
  car_name: "",
  collection_name: null,
  collection_number: null,
  collection_index: null,
  collection_total: null,
  series_number: null,
  series_index: null,
  series_total: null,
  color: null,
  is_gold: false,
  confidence: "low",
};

export default function AddPage() {
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [form, setForm] = useState<IdentifiedCar | null>(null);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);

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
    if (!form || !form.car_name.trim()) {
      setError("Car name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: captured?.base64,
          mediaType: captured?.mediaType,
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
    setManual(false);
    setError(null);
    setSaved(false);
  }

  function startManual() {
    setCaptured(null);
    setManual(true);
    setError(null);
    setSaved(false);
    setForm(BLANK_FORM);
  }

  async function handleBulkCapture(items: Captured[]) {
    reset();
    const initial: BulkResult[] = items.map((i) => ({ previewUrl: i.previewUrl, status: "pending" }));
    setBulkResults(initial);
    setBulkRunning(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const identifyRes = await fetch("/api/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: item.base64, mediaType: item.mediaType }),
        });
        const identified = await identifyRes.json();
        if (!identifyRes.ok) throw new Error(identified.error ?? "Identification failed");

        const saveRes = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...identified, image: item.base64, mediaType: item.mediaType }),
        });
        const savedRow = await saveRes.json();
        if (!saveRes.ok) throw new Error(savedRow.error ?? "Save failed");

        setBulkResults((prev) =>
          prev?.map((r, idx) =>
            idx === i
              ? { ...r, status: "done", carName: identified.car_name, merged: !!savedRow.merged }
              : r
          ) ?? prev
        );
      } catch (err) {
        setBulkResults((prev) =>
          prev?.map((r, idx) =>
            idx === i
              ? { ...r, status: "error", error: err instanceof Error ? err.message : "Something went wrong" }
              : r
          ) ?? prev
        );
      }
    }

    setBulkRunning(false);
  }

  function resetBulk() {
    setBulkResults(null);
    setBulkRunning(false);
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
        {bulkResults ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-3.5">
              <div className="font-condensed text-[22px] font-extrabold italic leading-[.95]">
                BULK ADD
              </div>
              <div className="mt-1 text-xs font-medium text-hw-muted">
                {bulkRunning
                  ? "Identifying and saving each photo…"
                  : `${bulkResults.filter((r) => r.status === "done").length} of ${bulkResults.length} saved`}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {bulkResults.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[15px] border-[1.5px] border-hw-border-2 p-[11px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.previewUrl}
                    alt="Captured car"
                    className="h-[58px] w-[46px] flex-shrink-0 rounded-[8px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    {r.status === "pending" && (
                      <span className="text-sm font-semibold text-hw-muted">Identifying…</span>
                    )}
                    {r.status === "done" && (
                      <>
                        <div className="truncate text-sm font-extrabold">{r.carName}</div>
                        <div className="mt-0.5 text-xs font-semibold text-hw-green">
                          {r.merged ? "Quantity +1" : "Saved"}
                        </div>
                      </>
                    )}
                    {r.status === "error" && (
                      <div className="text-xs font-semibold text-hw-red">{r.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!bulkRunning && (
              <button
                onClick={resetBulk}
                className="mt-5 flex h-14 w-full items-center justify-center rounded-[16px] bg-hw-surface text-base font-extrabold text-[#52525B]"
              >
                Done
              </button>
            )}
          </div>
        ) : (
          <>
            {!captured && !form && (
              <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[24px] bg-[#16181D]">
                <div className="px-[30px] text-center">
                  <CameraIcon />
                  <div className="mt-3.5 text-[13px] font-semibold uppercase tracking-wider text-white/85">
                    Take or upload a photo to get started
                  </div>
                </div>
              </div>
            )}

            {captured && identifying && (
              <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-[#0E1014]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={captured.previewUrl} alt="Captured card" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-[3px] animate-scan-line bg-gradient-to-r from-transparent via-hw-red to-transparent shadow-[0_0_16px_2px_rgba(227,0,15,0.7)]" />
                </div>
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

            {!identifying && form && (
              <div className="flex-1 overflow-y-auto">
                <div className="mb-3.5 flex items-center gap-3">
                  {captured ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={captured.previewUrl}
                      alt="Captured car"
                      className="h-[66px] w-[52px] flex-shrink-0 rounded-[9px] object-cover"
                    />
                  ) : (
                    <AddPhotoThumb onCapture={(data) => setCaptured(data)} />
                  )}
                  <div className="min-w-0 flex-1">
                    {manual ? (
                      <>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-hw-surface px-2.5 py-1">
                          <span className="text-[11px] font-bold tracking-wide text-[#52525B]">
                            Manual Entry
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-medium text-hw-muted">
                          {captured ? "Photo attached." : "Photo optional — add one or skip it."}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EC] px-2.5 py-1">
                          <span className="text-[11px] font-extrabold text-hw-green">✓</span>
                          <span className="text-[11px] font-bold tracking-wide text-hw-green">
                            Identified
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-medium text-hw-muted">
                          Check the details, then save.
                        </div>
                      </>
                    )}
                  </div>
                  {!manual && (
                    <button
                      onClick={reset}
                      className="flex-shrink-0 text-xs font-bold text-hw-blue"
                    >
                      Retake
                    </button>
                  )}
                </div>

                <Field label="Car name" value={form.car_name} onChange={(v) => setForm({ ...form, car_name: v })} highlight />
                {!form.car_name.trim() && (
                  <p className="-mt-2 mb-2.5 text-xs font-semibold text-hw-red">Car name is required</p>
                )}
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
                    disabled={saving || !form.car_name.trim()}
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
              <div className="flex flex-col gap-2.5 pt-1">
                <CameraCapture useCamera onCapture={handleCapture} label="Take Photo" />
                <CameraCapture onCapture={handleCapture} variant="secondary" label="Choose from Gallery" />
                <CameraCapture
                  multiple
                  variant="secondary"
                  onCaptureMultiple={handleBulkCapture}
                  label="Bulk Add Photos"
                />
                <button
                  type="button"
                  onClick={startManual}
                  className="mt-1 text-center text-sm font-bold text-hw-blue"
                >
                  Enter details manually
                </button>
                {error && <p className="mt-1 text-center text-sm text-hw-red">{error}</p>}
              </div>
            )}
          </>
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

function AddPhotoThumb({ onCapture }: { onCapture: (data: Captured) => void }) {
  return (
    <label className="flex h-[66px] w-[52px] flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-[9px] border-[1.5px] border-dashed border-hw-border text-hw-muted">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const { base64, mediaType } = await fileToBase64(file);
          onCapture({ base64, mediaType, previewUrl: URL.createObjectURL(file) });
          e.target.value = "";
        }}
      />
      <span className="text-lg leading-none">+</span>
      <span className="text-[8px] font-bold uppercase leading-none">Photo</span>
    </label>
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
