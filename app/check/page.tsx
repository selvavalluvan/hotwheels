"use client";

import { useState } from "react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import { colorToHex } from "@/lib/colorSwatch";
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

  function reset() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex h-[54px] items-center gap-1.5 border-b border-hw-border-2 px-[18px]">
        <Link href="/" className="text-2xl leading-none text-hw-muted-2">
          ‹
        </Link>
        <span className="text-[17px] font-extrabold">Check at Store</span>
      </div>

      <div className="flex flex-1 flex-col p-[18px]">
        {!result && !checking && (
          <div className="flex flex-1 flex-col justify-end">
            <CameraCapture onCapture={handleCapture} label="Take Photo" />
            {error && <p className="mt-3 text-center text-sm text-hw-red">{error}</p>}
          </div>
        )}

        {checking && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm font-semibold text-hw-muted">Checking against your inventory…</p>
          </div>
        )}

        {result && (
          <div className="flex flex-1 flex-col">
            {result.already_have ? (
              <div className="rounded-[22px] bg-hw-red px-5 py-[22px] text-center shadow-[0_12px_28px_rgba(227,0,15,0.28)]">
                <div className="mx-auto mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/[.18]">
                  <span className="text-[26px] font-extrabold leading-none text-white">!</span>
                </div>
                <div className="font-condensed text-[28px] font-extrabold italic leading-[.95] text-white">
                  YOU ALREADY OWN THIS
                </div>
                <div className="mt-2 text-[13px] font-medium text-white/85">
                  It&apos;s already in your inventory
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] bg-hw-green px-5 py-[22px] text-center shadow-[0_12px_28px_rgba(26,138,58,0.26)]">
                <div className="mx-auto mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/[.18]">
                  <span className="text-[22px] font-extrabold leading-none text-white">✓</span>
                </div>
                <div className="font-condensed text-[28px] font-extrabold italic leading-[.95] text-white">
                  NEW TO YOU
                </div>
                <div className="mt-2 text-[13px] font-medium text-white/85">
                  Not in your collection yet — grab it!
                </div>
              </div>
            )}

            {result.already_have && result.matches.length > 0 ? (
              <>
                <div className="mx-0.5 mb-2.5 mt-5 text-[10px] font-semibold uppercase tracking-wider text-hw-muted">
                  Match in your inventory
                </div>
                {result.matches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3.5 rounded-[16px] border-[1.5px] border-hw-border p-3"
                  >
                    {m.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt={m.car_name} className="h-[66px] w-[54px] flex-shrink-0 rounded-[9px] object-cover" />
                    ) : (
                      <div className="h-[66px] w-[54px] flex-shrink-0 rounded-[9px] bg-hw-surface" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-extrabold">{m.car_name}</div>
                      <div className="mt-0.5 text-xs font-medium text-hw-muted-2">
                        {[m.collection_name, m.series_number, m.collection_number].filter(Boolean).join(" · ")}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className="h-[13px] w-[13px] rounded-full border border-[#D4D4D8]"
                          style={{ background: colorToHex(m.color) }}
                        />
                        <span className="text-xs font-semibold text-hw-muted-2">{m.color}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="mx-0.5 mb-2.5 mt-5 text-[10px] font-semibold uppercase tracking-wider text-hw-muted">
                  What we found on the card
                </div>
                <div className="rounded-[16px] border-[1.5px] border-hw-border p-3.5">
                  <div className="text-base font-extrabold">{result.identified.car_name}</div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {[
                      result.identified.collection_name,
                      result.identified.collection_number,
                      result.identified.series_number,
                      result.identified.color,
                    ]
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-[8px] bg-hw-surface px-2.5 py-1 text-[11px] font-semibold text-[#52525B]"
                        >
                          {tag}
                        </span>
                      ))}
                    {result.identified.is_gold && (
                      <span className="rounded-[8px] bg-hw-gold px-2.5 py-1 text-[11px] font-extrabold text-[#5C4400]">
                        TH
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {result.collection_siblings.length > 0 && (
              <div className="mt-3.5 rounded-[16px] border-[1.5px] border-hw-border p-3.5 text-sm">
                <p className="mb-2 font-bold">
                  You have {result.collection_siblings.length} other car
                  {result.collection_siblings.length > 1 ? "s" : ""} from this collection:
                </p>
                <ul className="list-inside list-disc space-y-1 text-hw-muted-2">
                  {result.collection_siblings.map((s) => (
                    <li key={s.id}>
                      {s.car_name} {s.collection_number ? `(${s.collection_number})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2.5 pt-5">
              {result.already_have ? (
                <Link
                  href="/inventory"
                  className="flex h-[54px] items-center justify-center rounded-[16px] bg-hw-blue text-base font-extrabold text-white shadow-[0_8px_20px_rgba(21,101,232,0.24)]"
                >
                  View in Inventory
                </Link>
              ) : (
                <Link
                  href="/add"
                  className="flex h-[54px] items-center justify-center rounded-[16px] bg-hw-red text-base font-extrabold text-white shadow-[0_8px_20px_rgba(227,0,15,0.26)]"
                >
                  Add to Collection
                </Link>
              )}
              <button
                onClick={reset}
                className="flex h-[54px] items-center justify-center rounded-[16px] border-[1.5px] border-hw-border bg-white text-base font-extrabold"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
