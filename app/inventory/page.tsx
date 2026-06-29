"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { colorToHex } from "@/lib/colorSwatch";
import type { HotwheelsRow } from "@/lib/types";

type View = "list" | "grid";

export default function InventoryPage() {
  const [items, setItems] = useState<HotwheelsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/inventory");
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.car_name.toLowerCase().includes(q) ||
        (i.collection_name ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const seriesCount = new Set(items.map((i) => i.collection_name).filter(Boolean)).size;

  return (
    <main className="flex flex-1 flex-col">
      <div className="px-[22px] pt-1.5">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-condensed text-[26px] font-extrabold italic leading-[.9]">
              MY INVENTORY
            </div>
            <div className="mt-[3px] text-xs font-semibold text-hw-muted">
              {items.length} cars · {seriesCount} series
            </div>
          </div>
          <div className="flex rounded-[10px] bg-hw-surface p-[3px]">
            <button
              onClick={() => setView("list")}
              className={`flex h-[30px] w-8 items-center justify-center rounded-[8px] ${
                view === "list" ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,.1)]" : ""
              }`}
              aria-label="List view"
            >
              <div className="flex flex-col gap-[2.5px]">
                <div className={`h-[2.5px] w-[13px] rounded-full ${view === "list" ? "bg-[#14110F]" : "bg-[#A1A1AA]"}`} />
                <div className={`h-[2.5px] w-[13px] rounded-full ${view === "list" ? "bg-[#14110F]" : "bg-[#A1A1AA]"}`} />
                <div className={`h-[2.5px] w-[13px] rounded-full ${view === "list" ? "bg-[#14110F]" : "bg-[#A1A1AA]"}`} />
              </div>
            </button>
            <button
              onClick={() => setView("grid")}
              className={`flex h-[30px] w-8 items-center justify-center rounded-[8px] ${
                view === "grid" ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,.1)]" : ""
              }`}
              aria-label="Grid view"
            >
              <div className="grid grid-cols-2 gap-[2.5px]">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-[5px] w-[5px] rounded-[1px] ${view === "grid" ? "bg-[#14110F]" : "bg-[#A1A1AA]"}`}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>

        <div className="mt-3.5 flex h-11 items-center gap-[9px] rounded-[13px] bg-hw-surface px-3.5">
          <div className="relative h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-[#A1A1AA]">
            <div className="absolute -bottom-1 -right-[3px] h-0.5 w-2 rotate-45 rounded-full bg-[#A1A1AA]" />
          </div>
          <input
            className="w-full bg-transparent text-sm font-medium text-[#14110F] outline-none placeholder:text-[#A1A1AA]"
            placeholder="Search by name or collection…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 px-[22px] pb-5 pt-3.5">
        {loading ? (
          <p className="pt-10 text-center text-sm font-semibold text-hw-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState hasQuery={query.trim().length > 0} />
        ) : view === "list" ? (
          <div className="flex flex-col gap-[11px]">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[15px] border-[1.5px] border-hw-border-2 p-[11px]"
              >
                <Thumb item={item} className="h-[58px] w-[46px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-extrabold">{item.car_name}</span>
                    {item.is_gold && (
                      <span className="flex-shrink-0 rounded-[5px] bg-hw-gold px-1.5 py-0.5 text-[9px] font-extrabold text-[#5C4400]">
                        TH
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] font-medium text-hw-muted">
                    {[item.collection_name, item.series_number, item.collection_number]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div className="mt-[5px] flex items-center gap-[5px]">
                    <span
                      className="h-[11px] w-[11px] rounded-full border-[1.5px] border-[#D4D4D8]"
                      style={{ background: colorToHex(item.color) }}
                    />
                    <span className="text-[11px] font-semibold text-hw-muted-2">{item.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-[15px] border-[1.5px] border-hw-border-2">
                <div className="relative">
                  <Thumb item={item} className="h-[104px] w-full" />
                  {item.is_gold && (
                    <span className="absolute right-2 top-2 rounded-[6px] bg-hw-gold px-[7px] py-0.5 text-[9px] font-extrabold text-[#5C4400]">
                      TH
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-[9px]">
                  <div className="truncate text-[13px] font-extrabold leading-[1.05]">{item.car_name}</div>
                  <div className="mt-[3px] truncate text-[10px] font-medium text-hw-muted">
                    {[item.collection_name, item.series_number].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function Thumb({ item, className }: { item: HotwheelsRow; className: string }) {
  if (item.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image_url} alt={item.car_name} className={`flex-shrink-0 rounded-[8px] object-cover ${className}`} />
    );
  }
  return (
    <div
      className={`flex-shrink-0 rounded-[8px] ${className}`}
      style={{
        background: colorToHex(item.color),
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 8px, transparent 8px 16px)",
      }}
    />
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center pt-14 text-center">
      <div className="mb-[22px] flex h-24 w-24 items-center justify-center rounded-[24px] bg-hw-surface">
        <div className="relative h-8 w-10 rounded-[7px] border-[3px] border-[#C4C4C8]">
          <div className="absolute -top-[10px] left-[11px] h-[9px] w-[18px] rounded-t-[6px] border-[3px] border-b-0 border-[#C4C4C8]" />
          <div className="absolute left-1/2 top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#C4C4C8]" />
        </div>
      </div>
      <div className="font-condensed text-[22px] font-extrabold italic">
        {hasQuery ? "NO MATCHES" : "NO CARS YET"}
      </div>
      <p className="mb-6 mt-2 text-sm font-medium leading-[1.45] text-hw-muted">
        {hasQuery
          ? "Try a different name or collection."
          : "Scan your first Hot Wheels card and it'll show up here."}
      </p>
      {!hasQuery && (
        <Link
          href="/add"
          className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] bg-hw-red text-base font-extrabold text-white shadow-[0_10px_24px_rgba(227,0,15,0.26)]"
        >
          Scan Your First Car
        </Link>
      )}
    </div>
  );
}
