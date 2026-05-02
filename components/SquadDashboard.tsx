"use client";

/* eslint-disable react-hooks/set-state-in-effect -- client-side fetch on mount for MVP dashboard */

import { TrackerGrid, type TrackerHabitRow } from "@/components/TrackerGrid";
import {
  SquadDashboardPageSkeleton,
  TrackerTablesSkeleton,
} from "@/components/SquadDashboardSkeleton";
import { ui } from "@/lib/ui";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type SquadMember = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

type SquadApiJoined = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startDateKey: string;
  endDateKey: string;
  joined: true;
  role: string;
  members: SquadMember[];
};

type SquadApiPreview = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startDateKey: string;
  endDateKey: string;
  joined: false;
  memberCount: number;
};

type SquadState = SquadApiJoined | SquadApiPreview;

type TrackerResponse = {
  squadId: string;
  days: string[];
  habits: TrackerHabitRow[];
  logs: { habitId: string; userId: string; dateKey: string; completed: boolean }[];
  currentUserId: string;
};

function logsToSet(logs: TrackerResponse["logs"]) {
  const s = new Set<string>();
  for (const l of logs) {
    if (l.completed) {
      s.add(`${l.habitId}:${l.userId}:${l.dateKey}`);
    }
  }
  return s;
}

export function SquadDashboard({ squadId }: { squadId: string }) {
  const [squad, setSquad] = useState<SquadState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tracker, setTracker] = useState<TrackerResponse | null>(null);
  const [logKeySet, setLogKeySet] = useState<Set<string>>(new Set());
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminStart, setAdminStart] = useState("");
  const [adminEnd, setAdminEnd] = useState("");
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [viewerTz, setViewerTz] = useState("UTC");

  useEffect(() => {
    try {
      setViewerTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setViewerTz("UTC");
    }
  }, []);

  const loadSquad = useCallback(async () => {
    setLoadError(null);
    const res = await fetch(`/api/squads/${squadId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Failed to load squad");
      setSquad(null);
      return;
    }
    setSquad(data.squad as SquadState);
    if (data.squad.joined) {
      setAdminName(data.squad.name);
      setAdminStart(data.squad.startDateKey ?? "");
      setAdminEnd(data.squad.endDateKey ?? "");
    }
  }, [squadId]);

  const loadTracker = useCallback(async () => {
    const qs = new URLSearchParams({ tz: viewerTz });
    const res = await fetch(`/api/squads/${squadId}/tracker?${qs}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Failed to load tracker");
      setTracker(null);
      return;
    }
    setTracker(data);
    setLogKeySet(logsToSet(data.logs ?? []));
  }, [squadId, viewerTz]);

  useEffect(() => {
    void loadSquad();
  }, [loadSquad]);

  useEffect(() => {
    if (squad && "joined" in squad && squad.joined) {
      void loadTracker();
    } else {
      setTracker(null);
    }
  }, [squad, loadTracker, viewerTz]);

  const onToggle = useCallback(
    async (
      habitId: string,
      memberUserId: string,
      dateKey: string,
      completed: boolean,
    ) => {
      const me = tracker?.currentUserId;
      if (!me || memberUserId !== me) return;
      const key = `${habitId}:${memberUserId}:${dateKey}`;
      const toggleBusyKey = `${habitId}:${dateKey}`;
      setBusyKey(toggleBusyKey);
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-day-win-tz": viewerTz,
        },
        body: JSON.stringify({ habitId, dateKey, completed }),
      });
      setBusyKey(null);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setLoadError(err.error ?? "Could not update log");
        return;
      }
      setLogKeySet((prev) => {
        const next = new Set(prev);
        if (completed) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
    [viewerTz, tracker?.currentUserId],
  );

  const onJoin = async () => {
    setLoadError(null);
    const res = await fetch(`/api/squads/${squadId}/join`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Join failed");
      return;
    }
    await loadSquad();
  };

  const onAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = habitTitle.trim();
    if (!title) return;
    const res = await fetch(`/api/squads/${squadId}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Could not add habit");
      return;
    }
    setHabitTitle("");
    await loadTracker();
  };

  const onSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !squad ||
      squad.joined !== true ||
      squad.role !== "admin"
    ) {
      return;
    }
    const res = await fetch(`/api/squads/${squadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: adminName.trim(),
        startDate: adminStart,
        endDate: adminEnd,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Update failed");
      return;
    }
    await loadSquad();
    await loadTracker();
  };

  const onDeleteSquad = async () => {
    if (!confirm("Delete this squad and all habits?")) return;
    const res = await fetch(`/api/squads/${squadId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoadError(data.error ?? "Delete failed");
      return;
    }
    window.location.href = "/squads";
  };

  const onRemoveMember = async (userId: string) => {
    if (!confirm("Remove this member?")) return;
    const res = await fetch(`/api/squads/${squadId}/members/${userId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Remove failed");
      return;
    }
    await loadSquad();
    await loadTracker();
  };

  const onSetRole = async (userId: string, role: "admin" | "member") => {
    const res = await fetch(`/api/squads/${squadId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Role update failed");
      return;
    }
    await loadSquad();
  };

  const onAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !squad ||
      squad.joined !== true ||
      squad.role !== "admin"
    ) {
      return;
    }
    const email = addMemberEmail.trim();
    if (!email) return;
    setLoadError(null);
    const res = await fetch(`/api/squads/${squadId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Could not add member");
      return;
    }
    setAddMemberEmail("");
    await loadSquad();
    await loadTracker();
  };

  const onLeave = async () => {
    if (!confirm("Leave this squad?")) return;
    const me = tracker?.currentUserId;
    if (!me) return;
    const res = await fetch(`/api/squads/${squadId}/members/${me}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Could not leave");
      return;
    }
    window.location.href = "/squads";
  };

  const onDeleteHabit = async (habitId: string) => {
    if (!confirm("Delete this habit and its logs?")) return;
    const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(data.error ?? "Delete habit failed");
      return;
    }
    await loadTracker();
  };

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/squads/${squadId}`;
  }, [squadId]);

  if (!squad && !loadError) {
    return <SquadDashboardPageSkeleton />;
  }

  if (loadError && !squad) {
    return (
      <div className={`${ui.cardMuted} space-y-4 max-w-lg`}>
        <p className={ui.errorBox}>{loadError}</p>
        <Link href="/squads" className={ui.link}>
          ← Back to squads
        </Link>
      </div>
    );
  }

  if (!squad) {
    return null;
  }

  if (!squad.joined) {
    return (
      <div className={`${ui.card} max-w-xl space-y-5`}>
        <h1 className={ui.headingCard}>{squad.name}</h1>
        <p className={ui.muted}>
          {squad.startDateKey} → {squad.endDateKey} · {squad.memberCount}{" "}
          members
        </p>
        <p className="text-sm text-zinc-800">
          You are not in this squad yet.
        </p>
        <button type="button" className={ui.btnPrimary} onClick={() => void onJoin()}>
          Join squad
        </button>
        {loadError ? <p className={ui.errorBox}>{loadError}</p> : null}
        <div>
          <Link href="/squads" className={ui.link}>
            ← Back to squads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className={ui.card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={ui.headingPage}>{squad.name}</h1>
            <p className={`${ui.muted} mt-2`}>
              <span className="font-medium text-zinc-700">
                {squad.startDateKey}
              </span>
              <span className="mx-1.5 text-zinc-400">→</span>
              <span className="font-medium text-zinc-700">
                {squad.endDateKey}
              </span>
              <span className="mx-2 text-zinc-300">·</span>
              <span className={ui.badge}>
                {squad.role === "admin" ? "Admin" : "Member"}
              </span>
            </p>
          </div>
          <Link href="/squads" className={`${ui.btnSecondary} shrink-0 text-sm`}>
            All squads
          </Link>
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Share link
          </p>
          <p className="mt-1 break-all font-mono text-xs text-zinc-700">
            {shareUrl}
          </p>
        </div>
      </header>

      {loadError ? <p className={ui.errorBox}>{loadError}</p> : null}

      {tracker ? (
        <section className={ui.card}>
          <h2 className={ui.sectionTitle}>Habit tracker</h2>
          <div className="mt-4">
            <TrackerGrid
              days={tracker.days}
              habits={tracker.habits}
              logKeySet={logKeySet}
              currentUserId={tracker.currentUserId}
              columnTimeZone={viewerTz}
              onToggle={(hid, uid, dk, done) =>
                void onToggle(hid, uid, dk, done)
              }
              busyKey={busyKey}
            />
          </div>
        </section>
      ) : (
        <section className={ui.card} aria-busy="true" role="status">
          <span className="sr-only">Loading habit tracker…</span>
          <h2 className={ui.sectionTitle}>Habit tracker</h2>
          <div className="mt-4">
            <TrackerTablesSkeleton />
          </div>
        </section>
      )}

      <section className={ui.card}>
        <h2 className={ui.sectionTitle}>
          {squad.role === "admin"
            ? "Squad habits"
            : "Squad habits (admin-managed)"}
        </h2>
        {squad.role === "admin" ? (
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={onAddHabit}
          >
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="habit-title" className={ui.sectionTitle}>
                New habit for everyone
              </label>
              <input
                id="habit-title"
                className={`${ui.input} mt-2`}
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                placeholder="e.g. Morning run"
              />
            </div>
            <button type="submit" className={ui.btnPrimary}>
              Add habit
            </button>
          </form>
        ) : (
          <p className={`${ui.muted} mt-3`}>
            Each member checks off their own cells; only admins can add or remove
            habits.
          </p>
        )}
        {tracker ? (
          <ul className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-zinc-50/50">
            {(() => {
              const seen = new Set<string>();
              const unique: TrackerHabitRow[] = [];
              for (const row of tracker.habits) {
                if (seen.has(row.habitId)) continue;
                seen.add(row.habitId);
                unique.push(row);
              }
              return unique.map((h) => (
                <li
                  key={h.habitId}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-zinc-800">
                    {h.title}
                  </span>
                  {squad.role === "admin" ? (
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-100"
                      onClick={() => void onDeleteHabit(h.habitId)}
                    >
                      Delete
                    </button>
                  ) : null}
                </li>
              ));
            })()}
          </ul>
        ) : null}
      </section>

      <section className={ui.card}>
        <h2 className={ui.sectionTitle}>Membership</h2>
        {squad.role === "admin" ? (
          <form
            className="mt-4 flex flex-wrap items-end gap-3 border-b border-zinc-100 pb-4"
            onSubmit={onAddMember}
          >
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="add-member-email" className={ui.sectionTitle}>
                Add member (Google email)
              </label>
              <input
                id="add-member-email"
                type="email"
                autoComplete="email"
                className={`${ui.input} mt-2`}
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                placeholder="friend@example.com"
              />
            </div>
            <button type="submit" className={ui.btnPrimary}>
              Add member
            </button>
          </form>
        ) : null}
        <ul className="mt-4 space-y-1">
          {squad.members.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-100 bg-white px-3 py-2.5"
            >
              <span className="text-sm text-zinc-800">
                <span className="font-medium">{m.name}</span>{" "}
                <span className="text-zinc-500">({m.role})</span>
              </span>
              {squad.role === "admin" && m.userId !== tracker?.currentUserId ? (
                <>
                  <button
                    type="button"
                    className={`${ui.btnGhost} text-xs`}
                    onClick={() =>
                      void onSetRole(
                        m.userId,
                        m.role === "admin" ? "member" : "admin",
                      )
                    }
                  >
                    Make {m.role === "admin" ? "member" : "admin"}
                  </button>
                  <button
                    type="button"
                    className={`${ui.btnGhost} text-xs text-red-700 hover:bg-red-50`}
                    onClick={() => void onRemoveMember(m.userId)}
                  >
                    Remove
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`${ui.btnSecondary} mt-4`}
          onClick={() => void onLeave()}
        >
          Leave squad
        </button>
      </section>

      {squad.role === "admin" ? (
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/35 p-5 shadow-sm sm:p-6">
          <h2 className={ui.sectionTitle}>Admin</h2>
          <form className="mt-4 grid max-w-md gap-3" onSubmit={onSaveAdmin}>
            <label className="block">
              <span className={ui.sectionTitle}>Squad name</span>
              <input
                className={`${ui.input} mt-2`}
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={ui.sectionTitle}>Start date</span>
              <input
                type="date"
                className={`${ui.input} mt-2`}
                value={adminStart}
                onChange={(e) => setAdminStart(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={ui.sectionTitle}>End date</span>
              <input
                type="date"
                className={`${ui.input} mt-2`}
                value={adminEnd}
                onChange={(e) => setAdminEnd(e.target.value)}
              />
            </label>
            <button type="submit" className={`${ui.btnPrimary} w-fit`}>
              Save squad
            </button>
          </form>
          <button
            type="button"
            className={`${ui.btnDanger} mt-4`}
            onClick={() => void onDeleteSquad()}
          >
            Delete squad
          </button>
        </section>
      ) : null}
    </div>
  );
}
