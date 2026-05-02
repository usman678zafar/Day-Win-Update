"use client";

import { formatColumnHeader, isFutureDateKey } from "@/lib/dates";
import { useMemo } from "react";

export type TrackerHabitRow = {
  habitId: string;
  rowKey: string;
  title: string;
  userId: string;
  userName: string;
};

type Props = {
  days: string[];
  habits: TrackerHabitRow[];
  logKeySet: Set<string>;
  currentUserId: string;
  /** IANA zone for column headers + must match log API `x-day-win-tz`. */
  columnTimeZone?: string | null;
  onToggle: (
    habitId: string,
    memberUserId: string,
    dateKey: string,
    completed: boolean,
  ) => void;
  busyKey?: string | null;
};

function cellLogKey(habitId: string, memberUserId: string, dateKey: string) {
  return `${habitId}:${memberUserId}:${dateKey}`;
}

export function TrackerGrid({
  days,
  habits,
  logKeySet,
  currentUserId,
  columnTimeZone,
  onToggle,
  busyKey,
}: Props) {
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { userId: string; userName: string; rows: TrackerHabitRow[] }
    >();
    for (const h of habits) {
      let g = map.get(h.userId);
      if (!g) {
        g = { userId: h.userId, userName: h.userName, rows: [] };
        map.set(h.userId, g);
      }
      g.rows.push(h);
    }
    const list = Array.from(map.values());
    const mine = list.filter((g) => g.userId === currentUserId);
    const others = list.filter((g) => g.userId !== currentUserId);
    return [...mine, ...others];
  }, [habits, currentUserId]);

  if (habits.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-600">
        No squad habits yet. An admin can add them below.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const isSelf = group.userId === currentUserId;
        return (
          <section
            key={group.userId}
            className="space-y-3"
            aria-label={`Tracker for ${group.userName}`}
          >
            <h3 className="flex flex-wrap items-baseline gap-2 text-base font-semibold text-zinc-900">
              {group.userName}
              {isSelf ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/15">
                  You
                </span>
              ) : null}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-zinc-200/90 bg-white shadow-inner shadow-zinc-950/[0.03] ring-1 ring-zinc-950/[0.02]">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gradient-to-b from-emerald-50 to-emerald-50/50">
                    <th className="sticky left-0 z-10 min-w-[8rem] border-b border-r border-emerald-100/90 bg-emerald-50 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900">
                      Habit
                    </th>
                    {days.map((d) => (
                      <th
                        key={d}
                        className="border-b border-emerald-100/90 px-2 py-2.5 text-center text-xs font-medium leading-tight text-emerald-900/90 whitespace-nowrap"
                      >
                        {formatColumnHeader(d, columnTimeZone)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((h, ri) => (
                    <tr
                      key={h.rowKey}
                      className={ri % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                    >
                      <td className="sticky left-0 z-10 border-b border-r border-zinc-100 bg-inherit px-3 py-2 font-medium text-zinc-800 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.08)]">
                        {h.title}
                      </td>
                      {days.map((d) => {
                        const key = cellLogKey(h.habitId, h.userId, d);
                        const done = logKeySet.has(key);
                        const own = h.userId === currentUserId;
                        const toggleBusyKey = `${h.habitId}:${d}`;
                        const busy = busyKey === toggleBusyKey;
                        const future = isFutureDateKey(d, columnTimeZone);
                        const editable = own && !future;
                        const readOnlyLabel = own
                          ? future
                            ? "Future day — view only until the date arrives"
                            : ""
                          : future
                            ? "Future day — view only"
                            : `${h.userName}'s progress — view only; edit your table only`;
                        const readOnlySymbol = done
                          ? "✅"
                          : future
                            ? "❌"
                            : "—";

                        return (
                          <td
                            key={d}
                            className="border-b border-zinc-100 px-1 py-1.5 text-center align-middle"
                            title={editable ? undefined : readOnlyLabel}
                          >
                            {editable ? (
                              <button
                                type="button"
                                disabled={!!busy}
                                className="min-h-9 min-w-9 rounded-lg text-base transition hover:bg-emerald-100/80 disabled:opacity-45"
                                onClick={() =>
                                  onToggle(h.habitId, h.userId, d, !done)
                                }
                                aria-label={
                                  done ? "Mark incomplete" : "Mark complete"
                                }
                              >
                                {done ? "✅" : "—"}
                              </button>
                            ) : (
                              <span
                                className="inline-flex min-h-9 min-w-9 items-center justify-center text-base text-zinc-800 select-none"
                                aria-label={
                                  done
                                    ? `${h.title}, completed`
                                    : `${h.title}, not completed (view only)`
                                }
                              >
                                {readOnlySymbol}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
