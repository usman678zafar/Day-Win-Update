"use client";

/* eslint-disable react-hooks/set-state-in-effect -- client-side fetch on mount for MVP dashboard */

import { TrackerGrid, type TrackerHabitRow } from "@/components/TrackerGrid";
import {
  SquadDashboardPageSkeleton,
  TrackerTablesSkeleton,
} from "@/components/SquadDashboardSkeleton";
import {
  SquadMemberAvatarStack,
  SquadMembersModal,
} from "@/components/SquadMembersAvatarModal";
import { ui } from "@/lib/ui";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SquadMember = {
  userId: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
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
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [squadHabitsPanelOpen, setSquadHabitsPanelOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
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
    const s = data.squad as SquadState;
    if (s.joined) {
      s.members = s.members.map((m) => ({
        ...m,
        image: m.image ?? null,
      }));
    }
    setSquad(s);
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

  if (!squad && !loadError) {
    return <SquadDashboardPageSkeleton />;
  }

  if (loadError && !squad) {
    return (
      <div className={`${ui.cardMuted} space-y-3 max-w-lg sm:space-y-4`}>
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
      <div className={`${ui.card} w-full max-w-xl min-w-0 space-y-3 sm:space-y-5`}>
        <h1 className={ui.headingCard}>{squad.name}</h1>
        <p className={ui.muted}>
          {squad.startDateKey} → {squad.endDateKey} · {squad.memberCount}{" "}
          members
        </p>
        <p className="text-sm text-zinc-800 dark:text-neutral-300">
          You are not in this squad yet.
        </p>
        <button type="button" className={`${ui.btnPrimary} w-full sm:w-auto`} onClick={() => void onJoin()}>
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
    <div className="min-w-0 space-y-4 sm:space-y-8">
      <header className={ui.card}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={ui.headingPage}>{squad.name}</h1>
            <p
              className={`${ui.muted} mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center`}
            >
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span className="font-medium text-zinc-700 dark:text-neutral-300">
                  {squad.startDateKey}
                </span>
                <span className="text-zinc-400 dark:text-neutral-600">→</span>
                <span className="font-medium text-zinc-700 dark:text-neutral-300">
                  {squad.endDateKey}
                </span>
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-neutral-700">·</span>
              <span className={ui.badge}>
                {squad.role === "admin" ? "Admin" : "Member"}
              </span>
            </p>
          </div>
          <SquadMemberAvatarStack
            members={squad.members}
            onOpen={() => setMembersModalOpen(true)}
          />
        </div>
      </header>

      <SquadMembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        squadName={squad.name}
        members={squad.members}
        canManageMembers={squad.role === "admin"}
        currentUserId={tracker?.currentUserId}
        onRemoveMember={
          squad.role === "admin" ? (uid) => void onRemoveMember(uid) : undefined
        }
        onSetRole={
          squad.role === "admin"
            ? (uid, role) => void onSetRole(uid, role)
            : undefined
        }
        onLeaveSquad={() => void onLeave()}
      />

      {loadError ? <p className={ui.errorBox}>{loadError}</p> : null}

      {tracker ? (
        <section className={`${ui.card} overflow-hidden`}>
          <h2 className={ui.sectionTitle}>Habit tracker</h2>
          <div className="mt-3 sm:mt-4">
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
        <section className={`${ui.card} overflow-hidden`} aria-busy="true" role="status">
          <span className="sr-only">Loading habit tracker…</span>
          <h2 className={ui.sectionTitle}>Habit tracker</h2>
          <div className="mt-3 sm:mt-4">
            <TrackerTablesSkeleton />
          </div>
        </section>
      )}

      {squad.role === "admin" ? (
        <section className={ui.card}>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <h2 className={`${ui.sectionTitle} mb-0`}>Squad habits</h2>
            <button
              type="button"
              className={`${ui.btnSecondary} shrink-0 px-3 py-1.5 text-xs sm:text-sm`}
              aria-expanded={squadHabitsPanelOpen}
              aria-controls="squad-habits-panel"
              id="squad-habits-toggle"
              onClick={() => setSquadHabitsPanelOpen((v) => !v)}
            >
              {squadHabitsPanelOpen ? "Hide" : "Show"}
            </button>
          </div>
          {squadHabitsPanelOpen ? (
            <div id="squad-habits-panel" className="mt-3 space-y-3 sm:mt-4">
          <form
            className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3"
            onSubmit={onAddHabit}
          >
            <div className="min-w-0 w-full flex-1 sm:min-w-[12rem] sm:max-w-md">
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
            <button
              type="submit"
              className={`${ui.btnPrimary} w-full shrink-0 sm:w-auto`}
            >
              Add habit
            </button>
          </form>
          {tracker ? (
            <ul className="mt-3 divide-y divide-zinc-100 rounded-lg border border-zinc-100 bg-zinc-50/50 sm:mt-4 sm:rounded-xl dark:divide-white/[0.08] dark:border-white/10 dark:bg-[#262626]">
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
                    className="flex flex-col gap-1.5 px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-3 sm:py-2.5"
                  >
                    <span className="min-w-0 text-sm font-medium text-zinc-800 dark:text-neutral-200">
                      {h.title}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 touch-manipulation transition hover:bg-red-100 sm:shrink-0 sm:py-1.5 dark:border-red-900/55 dark:bg-red-950/45 dark:text-red-200 dark:hover:bg-red-950/70"
                      onClick={() => void onDeleteHabit(h.habitId)}
                    >
                      Delete
                    </button>
                  </li>
                ));
              })()}
            </ul>
          ) : null}
            </div>
          ) : (
            <p className={`${ui.muted} mt-2 max-w-prose sm:mt-1`}>
              Expand to add habits for the squad or remove existing ones.
            </p>
          )}
        </section>
      ) : null}

      {squad.role === "admin" ? (
        <section className="rounded-xl border border-amber-200/80 bg-amber-50/35 p-3 sm:rounded-2xl sm:p-6 dark:border-white/10 dark:bg-[#262626]">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <h2 className={`${ui.sectionTitle} mb-0`}>Admin</h2>
            <button
              type="button"
              className={`${ui.btnSecondary} shrink-0 px-3 py-1.5 text-xs sm:text-sm`}
              aria-expanded={adminPanelOpen}
              aria-controls="admin-settings-panel"
              id="admin-panel-toggle"
              onClick={() => setAdminPanelOpen((v) => !v)}
            >
              {adminPanelOpen ? "Hide" : "Show"}
            </button>
          </div>
          {adminPanelOpen ? (
            <div id="admin-settings-panel" className="mt-3 sm:mt-4">
          <form
            className="flex flex-col gap-2.5 border-b border-amber-200/60 pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3 sm:pb-5 dark:border-white/10"
            onSubmit={onAddMember}
          >
            <div className="min-w-0 w-full flex-1 sm:min-w-[14rem] sm:max-w-md">
              <label htmlFor="add-member-email" className={ui.sectionTitle}>
                Invite member (Google email)
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
            <button
              type="submit"
              className={`${ui.btnPrimary} w-full shrink-0 sm:w-auto`}
            >
              Send invite
            </button>
          </form>
          <form className="mt-4 grid max-w-md gap-2.5 sm:mt-5 sm:gap-3" onSubmit={onSaveAdmin}>
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
            <button
              type="submit"
              className={`${ui.btnPrimary} w-full sm:w-fit`}
            >
              Save squad
            </button>
          </form>
          <button
            type="button"
            className={`${ui.btnDanger} mt-4 w-full sm:w-auto`}
            onClick={() => void onDeleteSquad()}
          >
            Delete squad
          </button>
            </div>
          ) : (
            <p className={`${ui.muted} mt-2 max-w-prose sm:mt-1`}>
              Expand for invites, squad dates, save, or delete squad.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
