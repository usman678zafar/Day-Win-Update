"use client";

import {
  formatColumnHeader,
  formatColumnHeaderParts,
  isFutureDateKey,
} from "@/lib/dates";
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
      <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-4 text-center text-xs text-zinc-600 sm:rounded-xl sm:px-4 sm:py-6 sm:text-sm">
        No squad habits yet. An admin can add them below.
      </p>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {groups.map((group) => {
        const isSelf = group.userId === currentUserId;
        return (
          <section
            key={group.userId}
            className="space-y-1.5 sm:space-y-3"
            aria-label={`Tracker for ${group.userName}`}
          >
            <h3 className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm font-semibold text-zinc-900 sm:gap-x-2 sm:text-base">
              <span className="min-w-0 break-words">{group.userName}</span>
              {isSelf ? (
                <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-medium text-emerald-800 ring-1 ring-emerald-600/15 sm:px-2 sm:py-0.5 sm:text-xs">
                  You
                </span>
              ) : null}
            </h3>
            {/* Edge-to-edge scroll on narrow screens; card padding handled by parent */}
            <div
              className="-mx-0.5 overflow-x-auto overscroll-x-contain rounded-lg border border-zinc-200/90 bg-white shadow-inner shadow-zinc-950/[0.03] ring-1 ring-zinc-950/[0.02] [scrollbar-gutter:stable] sm:mx-0 sm:rounded-xl touch-pan-x"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="min-w-max border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gradient-to-b from-emerald-50 to-emerald-50/50">
                    <th className="sticky left-0 z-20 min-w-[4.75rem] max-w-[8rem] border-b border-r border-emerald-100/90 bg-emerald-50 px-1 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wide text-emerald-900 sm:min-w-[7rem] sm:max-w-none sm:px-3 sm:py-2.5 sm:text-xs">
                      Habit
                    </th>
                    {days.map((d) => {
                      const { weekday, monthDay } = formatColumnHeaderParts(
                        d,
                        columnTimeZone,
                      );
                      return (
                        <th
                          key={d}
                          className="min-w-[2.35rem] border-b border-emerald-100/90 px-0.5 py-1 text-center align-bottom text-emerald-900/90 sm:min-w-[3.25rem] sm:px-2 sm:py-2.5"
                        >
                          <span className="hidden whitespace-nowrap text-xs font-medium sm:block">
                            {formatColumnHeader(d, columnTimeZone)}
                          </span>
                          <span className="sm:hidden">
                            <span className="block text-[9px] font-bold leading-none">
                              {weekday}
                            </span>
                            <span className="mt-0.5 block text-[9px] font-medium leading-tight text-emerald-800/85">
                              {monthDay}
                            </span>
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((h, ri) => {
                    const rowBg =
                      ri % 2 === 0 ? "bg-white" : "bg-zinc-50/50";
                    return (
                      <tr key={h.rowKey} className={rowBg}>
                        <td
                          title={h.title}
                          className={`sticky left-0 z-10 max-w-[8rem] border-b border-r border-zinc-100 ${rowBg} px-1 py-1 text-[11px] font-medium text-zinc-800 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.08)] sm:max-w-[14rem] sm:px-3 sm:py-2 sm:text-sm`}
                        >
                          <span className="line-clamp-2 sm:line-clamp-none">
                            {h.title}
                          </span>
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
                              className="border-b border-zinc-100 px-px py-0.5 text-center align-middle sm:px-1 sm:py-1.5"
                              title={editable ? undefined : readOnlyLabel}
                            >
                              {editable ? (
                                <button
                                  type="button"
                                  disabled={!!busy}
                                  className="flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-md text-sm transition hover:bg-emerald-100/80 active:bg-emerald-100 disabled:opacity-45 sm:min-h-9 sm:min-w-9 sm:rounded-lg sm:text-base"
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
                                  className="flex min-h-10 min-w-10 items-center justify-center text-sm text-zinc-800 select-none sm:min-h-9 sm:min-w-9 sm:text-base"
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
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] leading-tight text-zinc-400 sm:hidden">
              Swipe for more days
            </p>
          </section>
        );
      })}
    </div>
  );
}
