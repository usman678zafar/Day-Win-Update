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
      <p className="text-sm text-zinc-600">
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
            className="space-y-2"
            aria-label={`Tracker for ${group.userName}`}
          >
            <h3 className="text-sm font-semibold text-zinc-900">
              {group.userName}
              {isSelf ? (
                <span className="ml-2 font-normal text-xs text-zinc-500">
                  (you)
                </span>
              ) : null}
            </h3>
            <div className="overflow-x-auto border border-zinc-300 rounded-sm">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border border-zinc-300 px-2 py-1 text-left font-medium sticky left-0 bg-zinc-100 z-10 min-w-[8rem]">
                      Habit
                    </th>
                    {days.map((d) => (
                      <th
                        key={d}
                        className="border border-zinc-300 px-2 py-1 text-center text-xs font-medium whitespace-nowrap"
                      >
                        {formatColumnHeader(d, columnTimeZone)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((h) => (
                    <tr key={h.rowKey}>
                      <td className="border border-zinc-300 px-2 py-1 sticky left-0 bg-white z-10 font-medium text-zinc-800">
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
                          : `${h.userName}'s progress — view only; edit your table only`;
                        const readOnlySymbol = done
                          ? "✅"
                          : own && future
                            ? "❌"
                            : "—";

                        return (
                          <td
                            key={d}
                            className="border border-zinc-300 px-1 py-1 text-center bg-white"
                            title={editable ? undefined : readOnlyLabel}
                          >
                            {editable ? (
                              <button
                                type="button"
                                disabled={!!busy}
                                className="min-w-[2rem] disabled:opacity-50"
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
                                className="inline-block min-w-[2rem] cursor-default text-zinc-800 select-none"
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
