"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSquadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/squads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, startDate, endDate }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not create");
      return;
    }
    if (data.squad?.id) {
      router.push(`/squads/${data.squad.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-xl font-semibold">New squad</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm text-zinc-700">
          Name
          <input
            required
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Challenge name"
          />
        </label>
        <label className="block text-sm text-zinc-700">
          Start date
          <input
            required
            type="date"
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="block text-sm text-zinc-700">
          End date
          <input
            required
            type="date"
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          className="rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Create
        </button>
      </form>
      <Link href="/squads" className="text-sm text-zinc-700 underline">
        Back to squads
      </Link>
    </div>
  );
}
