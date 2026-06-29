"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { colorToHex } from "@/lib/colorSwatch";
import type { HotwheelsRow } from "@/lib/types";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<HotwheelsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<HotwheelsRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/inventory/${id}`);
      const json = await res.json();
      if (res.ok) {
        setItem(json);
        setForm(json);
      } else {
        setError(json.error ?? "Not found");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function save(updates: Partial<HotwheelsRow>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      setItem(json);
      setForm(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdits() {
    if (!form) return;
    await save({
      car_name: form.car_name,
      collection_name: form.collection_name,
      collection_number: form.collection_number,
      series_number: form.series_number,
      color: form.color,
      is_gold: form.is_gold,
    });
    setEditing(false);
  }

  async function adjustQuantity(delta: number) {
    if (!item) return;
    const next = item.quantity + delta;
    if (next < 1) return;
    await save({ quantity: next });
  }

  async function handleDelete() {
    if (!confirm("Delete this car from your inventory?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      router.push("/inventory");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm font-semibold text-hw-muted">Loading…</p>
      </main>
    );
  }

  if (!item || !form) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-[18px] text-center">
        <p className="text-sm font-semibold text-hw-muted">{error ?? "Car not found."}</p>
        <Link href="/inventory" className="text-sm font-bold text-hw-blue">
          Back to Inventory
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex h-[54px] items-center justify-between border-b border-hw-border-2 px-[18px]">
        <Link href="/inventory" className="text-2xl leading-none text-hw-muted-2">
          ‹
        </Link>
        <span className="text-[15px] font-extrabold">Car Detail</span>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-[13px] font-bold text-hw-blue"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-[18px]">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.car_name}
            className="h-[200px] w-full flex-shrink-0 rounded-[18px] object-cover"
          />
        ) : (
          <div
            className="h-[200px] w-full flex-shrink-0 rounded-[18px]"
            style={{
              background: colorToHex(item.color),
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 10px, transparent 10px 20px)",
            }}
          />
        )}

        {!editing ? (
          <>
            <div className="mt-4">
              <div className="font-condensed text-[24px] font-extrabold italic leading-[.95]">
                {item.car_name}
              </div>
              {item.collection_name && (
                <div className="mt-1 text-[13px] font-semibold text-hw-muted-2">
                  {item.collection_name}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Stat label="Card #" value={item.collection_number ?? "—"} />
              <Stat label="Series #" value={item.series_number ?? "—"} />
              <Stat
                label="Color"
                value={
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-[14px] w-[14px] rounded-full border-[1.5px] border-[#D4D4D8]"
                      style={{ background: colorToHex(item.color) }}
                    />
                    {item.color ?? "—"}
                  </span>
                }
              />
              <Stat
                label="Quantity"
                value={
                  <span className="flex items-center gap-2.5">
                    <button
                      onClick={() => adjustQuantity(-1)}
                      disabled={saving || item.quantity <= 1}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#14110F] shadow-[0_1px_3px_rgba(0,0,0,.15)] disabled:opacity-40"
                    >
                      −
                    </button>
                    {item.quantity}
                    <button
                      onClick={() => adjustQuantity(1)}
                      disabled={saving}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#14110F] shadow-[0_1px_3px_rgba(0,0,0,.15)] disabled:opacity-40"
                    >
                      +
                    </button>
                  </span>
                }
              />
            </div>

            {item.is_gold && (
              <span className="mt-2.5 inline-flex w-fit items-center rounded-[9px] bg-hw-gold px-2.5 py-1.5 text-xs font-extrabold text-[#5C4400]">
                Treasure Hunt
              </span>
            )}

            {error && <p className="mt-3 text-sm text-hw-red">{error}</p>}

            <div className="mt-auto flex gap-[11px] pt-5">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded-[15px] bg-hw-red py-[15px] text-center text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(227,0,15,0.24)]"
              >
                Edit Details
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[15px] border-[1.5px] border-hw-border-2 text-hw-red disabled:opacity-50"
                aria-label="Delete"
              >
                {deleting ? "…" : "🗑"}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 flex flex-1 flex-col">
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

            <button
              onClick={handleSaveEdits}
              disabled={saving}
              className="mt-auto flex h-14 w-full items-center justify-center rounded-[16px] bg-hw-red text-base font-extrabold text-white shadow-[0_10px_24px_rgba(227,0,15,0.26)] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[13px] bg-hw-surface px-[13px] py-[11px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-hw-muted">{label}</div>
      <div className="mt-[3px] text-base font-extrabold">{value}</div>
    </div>
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
