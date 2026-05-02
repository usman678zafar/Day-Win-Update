"use client";

import { ui } from "@/lib/ui";
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
    <div className={`${ui.page} max-w-xl`}>
      <h1 className={ui.headingPage}>New squad</h1>
      <p className={`${ui.muted} mt-2 max-w-prose`}>
        Set a name and date range. You&apos;ll add habits and members from the
        squad page.
      </p>

      <div className={`${ui.card} mt-8`}>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className={ui.sectionTitle}>Name</span>
            <input
              required
              className={`${ui.input} mt-2`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Strong May challenge"
            />
          </label>
          <label className="block">
            <span className={ui.sectionTitle}>Start date</span>
            <input
              required
              type="date"
              className={`${ui.input} mt-2`}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={ui.sectionTitle}>End date</span>
            <input
              required
              type="date"
              className={`${ui.input} mt-2`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          {error ? <p className={ui.errorBox}>{error}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className={ui.btnPrimary}>
              Create squad
            </button>
            <Link href="/squads" className={`${ui.btnSecondary} inline-flex`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
