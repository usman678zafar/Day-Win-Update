"use client";

/* eslint-disable react-hooks/set-state-in-effect -- client-side fetch on mount for MVP dashboard */

import { TrackerGrid, type TrackerHabitRow } from "@/components/TrackerGrid";
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
  logs: { habitId: string; dateKey: string; completed: boolean }[];
  currentUserId: string;
};

function logsToSet(logs: TrackerResponse["logs"]) {
  const s = new Set<string>();
  for (const l of logs) {
    if (l.completed) {
      s.add(`${l.habitId}:${l.dateKey}`);
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
    async (habitId: string, dateKey: string, completed: boolean) => {
      const key = `${habitId}:${dateKey}`;
      setBusyKey(key);
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
    [viewerTz],
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
    return <p className="text-sm text-zinc-600">Loading…</p>;
  }

  if (loadError && !squad) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-700">{loadError}</p>
        <Link href="/squads" className="text-sm underline">
          Back to squads
        </Link>
      </div>
    );
  }

  if (!squad) {
    return null;
  }

  if (!squad.joined) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{squad.name}</h1>
        <p className="text-sm text-zinc-700">
          {squad.startDateKey} → {squad.endDateKey} · {squad.memberCount}{" "}
          members
        </p>
        <p className="text-sm">You are not in this squad yet.</p>
        <button
          type="button"
          className="rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => void onJoin()}
        >
          Join squad
        </button>
        {loadError ? (
          <p className="text-sm text-red-700">{loadError}</p>
        ) : null}
        <div>
          <Link href="/squads" className="text-sm underline">
            Back to squads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{squad.name}</h1>
        <p className="text-sm text-zinc-700">
          Range: {squad.startDateKey} → {squad.endDateKey} · Your role:{" "}
          {squad.role}
        </p>
        <p className="mt-1 text-xs text-zinc-600 break-all">
          Share: {shareUrl}
        </p>
      </div>

      {loadError ? (
        <p className="text-sm text-red-700">{loadError}</p>
      ) : null}

      {tracker ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-800">Habit tracker</h2>
          <TrackerGrid
            days={tracker.days}
            habits={tracker.habits}
            logKeySet={logKeySet}
            currentUserId={tracker.currentUserId}
            columnTimeZone={viewerTz}
            onToggle={(hid, dk, done) => void onToggle(hid, dk, done)}
            busyKey={busyKey}
          />
        </section>
      ) : (
        <p className="text-sm text-zinc-600">Loading tracker…</p>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-800">Your habits</h2>
        <form className="flex flex-wrap items-end gap-2" onSubmit={onAddHabit}>
          <div>
            <label htmlFor="habit-title" className="block text-xs text-zinc-600">
              New habit
            </label>
            <input
              id="habit-title"
              className="mt-0.5 rounded border border-zinc-300 px-2 py-1 text-sm"
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder="e.g. Morning run"
            />
          </div>
          <button
            type="submit"
            className="rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Add
          </button>
        </form>
        {tracker ? (
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-800">
            {tracker.habits
              .filter((h) => h.userId === tracker.currentUserId)
              .map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-2">
                  <span>{h.title}</span>
                  <button
                    type="button"
                    className="text-xs underline text-red-800"
                    onClick={() => void onDeleteHabit(h.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-2 border-t border-zinc-200 pt-4">
        <h2 className="text-sm font-medium text-zinc-800">Membership</h2>
        <ul className="text-sm space-y-1">
          {squad.members.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center gap-2 border-b border-zinc-100 py-1"
            >
              <span>
                {m.name} ({m.role})
              </span>
              {squad.role === "admin" && m.userId !== tracker?.currentUserId ? (
                <>
                  <button
                    type="button"
                    className="text-xs underline"
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
                    className="text-xs underline text-red-800"
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
          className="mt-2 rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => void onLeave()}
        >
          Leave squad
        </button>
      </section>

      {squad.role === "admin" ? (
        <section className="space-y-2 border-t border-zinc-200 pt-4">
          <h2 className="text-sm font-medium text-zinc-800">Admin</h2>
          <form className="grid max-w-md gap-2" onSubmit={onSaveAdmin}>
            <label className="text-xs text-zinc-600">
              Name
              <input
                className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </label>
            <label className="text-xs text-zinc-600">
              Start date
              <input
                type="date"
                className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                value={adminStart}
                onChange={(e) => setAdminStart(e.target.value)}
              />
            </label>
            <label className="text-xs text-zinc-600">
              End date
              <input
                type="date"
                className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                value={adminEnd}
                onChange={(e) => setAdminEnd(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50 w-fit"
            >
              Save squad
            </button>
          </form>
          <button
            type="button"
            className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-900"
            onClick={() => void onDeleteSquad()}
          >
            Delete squad
          </button>
        </section>
      ) : null}
    </div>
  );
}
