"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { HotwheelsRow } from "@/lib/types";

export default function InventoryPage() {
  const [items, setItems] = useState<HotwheelsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.car_name.toLowerCase().includes(q) ||
        (i.collection_name ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="flex w-full max-w-md items-center justify-between">
        <Link href="/" className="text-sm text-zinc-500">
          ← Home
        </Link>
        <h1 className="font-semibold text-zinc-900">My Inventory ({items.length})</h1>
        <div className="w-10" />
      </div>

      <input
        className="w-full max-w-md rounded border border-zinc-300 px-3 py-2"
        placeholder="Search by name or collection…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-zinc-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-500">No cars yet. Go add some!</p>
      ) : (
        <ul className="w-full max-w-md space-y-3">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
            >
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.car_name}
                  className="h-16 w-16 rounded object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-zinc-100" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-semibold text-zinc-900">
                  {item.car_name} {item.is_gold ? "✨" : ""}
                </p>
                <p className="text-zinc-500">
                  {item.collection_name ?? "—"} {item.collection_number ? `· ${item.collection_number}` : ""}
                </p>
                <p className="text-zinc-400">{item.color ?? ""}</p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
