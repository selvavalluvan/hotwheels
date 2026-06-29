"use client";

import { useState } from "react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
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
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="flex w-full max-w-xs items-center justify-between">
        <Link href="/" className="text-sm text-zinc-500">
          ← Home
        </Link>
        <h1 className="font-semibold text-zinc-900">Add to Collection</h1>
        <div className="w-10" />
      </div>

      <CameraCapture onCapture={handleCapture} label={captured ? "Retake Photo" : "Take Photo"} />

      {identifying && <p className="text-zinc-500">Identifying car…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {form && (
        <div className="w-full max-w-xs space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <Field label="Car name" value={form.car_name} onChange={(v) => setForm({ ...form, car_name: v })} />
          <Field
            label="Collection name"
            value={form.collection_name ?? ""}
            onChange={(v) => setForm({ ...form, collection_name: v })}
          />
          <Field
            label="Card number (e.g. 244/250)"
            value={form.collection_number ?? ""}
            onChange={(v) => setForm({ ...form, collection_number: v })}
          />
          <Field
            label="Series number (e.g. 2/10)"
            value={form.series_number ?? ""}
            onChange={(v) => setForm({ ...form, series_number: v })}
          />
          <Field label="Color" value={form.color ?? ""} onChange={(v) => setForm({ ...form, color: v })} />
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.is_gold}
              onChange={(e) => setForm({ ...form, is_gold: e.target.checked })}
            />
            Treasure Hunt / Gold variant
          </label>

          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save to Inventory"}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center font-medium text-green-700">✅ Saved!</p>
              <button
                onClick={reset}
                className="w-full rounded-lg bg-zinc-200 px-4 py-3 font-semibold text-zinc-700"
              >
                Add Another
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-zinc-500">{label}</span>
      <input
        className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-2 text-zinc-900 placeholder-zinc-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
