"use client";

import { useState } from "react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import type { HotwheelsRow, IdentifiedCar } from "@/lib/types";

type Captured = { base64: string; mediaType: string; previewUrl: string };
interface CheckResult {
  identified: IdentifiedCar;
  already_have: boolean;
  matches: HotwheelsRow[];
  collection_siblings: HotwheelsRow[];
}

export default function CheckPage() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture(data: Captured) {
    setResult(null);
    setError(null);
    setChecking(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.base64, mediaType: data.mediaType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Check failed");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="flex w-full max-w-xs items-center justify-between">
        <Link href="/" className="text-sm text-zinc-500">
          ← Home
        </Link>
        <h1 className="font-semibold text-zinc-900">Check at Store</h1>
        <div className="w-10" />
      </div>

      <CameraCapture onCapture={handleCapture} label="Take Photo" />

      {checking && <p className="text-zinc-500">Checking against your inventory…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div className="w-full max-w-xs space-y-4">
          <div
            className={`rounded-lg p-4 text-center font-semibold ${
              result.already_have
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {result.already_have ? "🚫 You already have this one!" : "✅ You don't have this one — grab it!"}
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
            <p>
              <span className="text-zinc-500">Car:</span> {result.identified.car_name}
            </p>
            <p>
              <span className="text-zinc-500">Collection:</span>{" "}
              {result.identified.collection_name ?? "—"}
            </p>
            <p>
              <span className="text-zinc-500">Card number:</span>{" "}
              {result.identified.collection_number ?? "—"}
            </p>
            <p>
              <span className="text-zinc-500">Series number:</span>{" "}
              {result.identified.series_number ?? "—"}
            </p>
            <p>
              <span className="text-zinc-500">Color:</span> {result.identified.color ?? "—"}
              {result.identified.is_gold ? " (Gold / Treasure Hunt)" : ""}
            </p>
          </div>

          {result.collection_siblings.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
              <p className="mb-2 font-medium text-zinc-700">
                You have {result.collection_siblings.length} other car
                {result.collection_siblings.length > 1 ? "s" : ""} from this collection:
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-600">
                {result.collection_siblings.map((s) => (
                  <li key={s.id}>
                    {s.car_name} {s.collection_number ? `(${s.collection_number})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
