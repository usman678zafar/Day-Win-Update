"use client";

import { formatColumnHeader, isFutureDateKey } from "@/lib/dates";

export type TrackerHabitRow = {
  id: string;
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
  onToggle: (habitId: string, dateKey: string, completed: boolean) => void;
  busyKey?: string | null;
};

function logKey(habitId: string, dateKey: string) {
  return `${habitId}:${dateKey}`;
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
  if (habits.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No habits yet. Add one below to start tracking.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-300">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border border-zinc-300 px-2 py-1 text-left font-medium">
              User
            </th>
            <th className="border border-zinc-300 px-2 py-1 text-left font-medium">
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
          {habits.map((h) => (
            <tr key={h.id}>
              <td className="border border-zinc-300 px-2 py-1">{h.userName}</td>
              <td className="border border-zinc-300 px-2 py-1">{h.title}</td>
              {days.map((d) => {
                const key = logKey(h.id, d);
                const done = logKeySet.has(key);
                const own = h.userId === currentUserId;
                const busy = busyKey === key;
                const future = isFutureDateKey(d, columnTimeZone);
                const editable = own && !future;

                return (
                  <td key={d} className="border border-zinc-300 px-1 py-1 text-center">
                    {editable ? (
                      <button
                        type="button"
                        disabled={!!busy}
                        className="min-w-[2rem] disabled:opacity-50"
                        onClick={() => onToggle(h.id, d, !done)}
                        aria-label={done ? "Mark incomplete" : "Mark complete"}
                      >
                        {done ? "✅" : "—"}
                      </button>
                    ) : (
                      <span>{done ? "✅" : "❌"}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
