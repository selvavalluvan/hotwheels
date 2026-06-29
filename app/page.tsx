import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900">🏎️ Hot Wheels Inventory</h1>
        <p className="mt-2 text-zinc-500">Scan, track, never buy a duplicate again.</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Link
          href="/add"
          className="rounded-xl bg-red-600 px-6 py-5 text-center text-lg font-semibold text-white shadow active:bg-red-700"
        >
          ➕ Add to Collection
        </Link>
        <Link
          href="/check"
          className="rounded-xl bg-blue-600 px-6 py-5 text-center text-lg font-semibold text-white shadow active:bg-blue-700"
        >
          🔍 Check at Store
        </Link>
        <Link
          href="/inventory"
          className="rounded-xl border border-zinc-300 bg-white px-6 py-5 text-center text-lg font-semibold text-zinc-700 shadow active:bg-zinc-100"
        >
          📦 View My Inventory
        </Link>
      </div>
    </main>
  );
}
