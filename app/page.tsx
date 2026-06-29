"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import type { HotwheelsRow } from "@/lib/types";

export default function Home() {
  const [items, setItems] = useState<HotwheelsRow[] | null>(null);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((json) => setItems(Array.isArray(json) ? json : []))
      .catch(() => setItems([]));
  }, []);

  const carCount = items?.length ?? 0;
  const seriesCount = items
    ? new Set(items.map((i) => i.collection_name).filter(Boolean)).size
    : 0;

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex-1 px-[22px] pt-[18px]">
        <div className="flex items-center gap-[11px]">
          <div className="flex h-[42px] w-[42px] flex-shrink-0 skew-x-[-9deg] items-center justify-center rounded-[10px] bg-hw-red shadow-[0_4px_12px_rgba(227,0,15,0.38)]">
            <span className="skew-x-[9deg] font-condensed text-[17px] font-extrabold italic text-white">
              HW
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.24em] text-hw-muted">
              Hot Wheels
            </div>
            <div className="font-condensed text-[28px] font-extrabold italic leading-[.86] tracking-tight">
              INVENTORY
            </div>
          </div>
        </div>

        <p className="mt-[18px] text-sm font-medium text-hw-muted-2">
          Scan it. Track it. Never buy a double again.
        </p>

        <div className="mt-[18px] flex gap-[9px]">
          <div className="flex-1 rounded-[15px] bg-hw-surface px-[14px] py-[13px]">
            <div className="font-condensed text-[26px] font-extrabold italic leading-none">
              {carCount}
            </div>
            <div className="mt-[3px] text-[10px] font-semibold uppercase tracking-wider text-hw-muted">
              Cars
            </div>
          </div>
          <div className="flex-1 rounded-[15px] bg-hw-surface px-[14px] py-[13px]">
            <div className="font-condensed text-[26px] font-extrabold italic leading-none">
              {seriesCount}
            </div>
            <div className="mt-[3px] text-[10px] font-semibold uppercase tracking-wider text-hw-muted">
              Series
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-[13px]">
          <Link
            href="/add"
            className="flex items-center gap-[14px] rounded-[19px] bg-hw-red px-[18px] py-[18px] shadow-[0_10px_24px_rgba(227,0,15,0.26)]"
          >
            <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] bg-white/[.18]">
              <div className="relative h-[14px] w-[18px] rounded border-[2.5px] border-white">
                <div className="absolute -top-[5px] left-[5px] h-1 w-2 rounded-t border-[2.5px] border-b-0 border-white" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[17px] font-extrabold text-white">Add to Collection</div>
              <div className="text-xs font-medium text-white/80">
                Scan a new car into your inventory
              </div>
            </div>
            <span className="ml-auto text-[22px] font-bold text-white">›</span>
          </Link>

          <Link
            href="/check"
            className="flex items-center gap-[14px] rounded-[19px] bg-hw-blue px-[18px] py-[18px] shadow-[0_10px_24px_rgba(21,101,232,0.24)]"
          >
            <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] bg-white/[.18]">
              <div className="relative h-[15px] w-[15px] rounded-full border-[2.5px] border-white">
                <div className="absolute -bottom-[5px] -right-1 h-[2.5px] w-2 rotate-45 rounded bg-white" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[17px] font-extrabold text-white">Check at Store</div>
              <div className="text-xs font-medium text-white/80">
                Already own it? Find out before you buy
              </div>
            </div>
            <span className="ml-auto text-[22px] font-bold text-white">›</span>
          </Link>

          <Link
            href="/inventory"
            className="flex items-center gap-[14px] rounded-[19px] border-[1.5px] border-hw-border bg-white px-[18px] py-[18px]"
          >
            <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] bg-hw-surface">
              <div className="grid grid-cols-2 gap-[3px]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[6px] w-[6px] rounded-[1px] bg-[#52525B]" />
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[17px] font-extrabold">View My Inventory</div>
              <div className="text-xs font-medium text-hw-muted">
                {carCount} cars across {seriesCount} series
              </div>
            </div>
            <span className="ml-auto text-[22px] font-bold text-[#C4C4C8]">›</span>
          </Link>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
