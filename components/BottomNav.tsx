"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isInventory = pathname === "/inventory";
  const isHome = pathname === "/";

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[76px] items-center justify-around border-t border-hw-border-2 bg-white px-6 pb-2">
      <Link href="/" className="flex flex-col items-center gap-1.5">
        <div
          className={`h-[18px] w-[18px] rounded-[5px] border-[2.5px] ${
            isHome ? "border-hw-red" : "border-[#C4C4C8]"
          }`}
        />
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${
            isHome ? "text-hw-red" : "text-hw-muted"
          }`}
        >
          Home
        </span>
      </Link>

      <Link href="/add" className="flex flex-col items-center gap-1.5">
        <div className="flex h-[54px] w-[54px] -mt-[26px] items-center justify-center rounded-full border-4 border-white bg-hw-red shadow-lg shadow-red-600/40">
          <div className="relative h-[14px] w-[18px] rounded border-[2.5px] border-white">
            <div className="absolute -top-[5px] left-[5px] h-1 w-2 rounded-t border-[2.5px] border-b-0 border-white" />
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-hw-muted">Scan</span>
      </Link>

      <Link href="/inventory" className="flex flex-col items-center gap-1.5">
        <div className="grid grid-cols-2 gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-[2px] ${isInventory ? "bg-hw-red" : "bg-[#C4C4C8]"}`}
            />
          ))}
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${
            isInventory ? "text-hw-red" : "text-hw-muted"
          }`}
        >
          Inventory
        </span>
      </Link>
    </div>
  );
}
