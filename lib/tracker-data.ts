import { ensureHabitLogStorageReady } from "@/lib/db";
import { eachSquadDayKeys } from "@/lib/dates";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import { Types } from "mongoose";

export type TrackerHabit = {
  id: string;
  title: string;
  userId: string;
  userName: string;
};

export type TrackerLog = {
  habitId: string;
  dateKey: string;
  completed: boolean;
};

export type TrackerPayload = {
  squadId: string;
  days: string[];
  habits: TrackerHabit[];
  logs: TrackerLog[];
  currentUserId: string;
};

/** Call only after verifying the user is a squad member. */
export async function buildTrackerPayload(
  squadId: string,
  userId: string,
  squad: { startDate: Date; endDate: Date },
  timeZone?: string | null,
): Promise<TrackerPayload> {
  await ensureHabitLogStorageReady();
  const start =
    squad.startDate instanceof Date
      ? squad.startDate
      : new Date(squad.startDate as string);
  const end =
    squad.endDate instanceof Date
      ? squad.endDate
      : new Date(squad.endDate as string);

  const habits = await Habit.find({ squad: squadId })
    .populate("user", "name email")
    .sort({ createdAt: 1 })
    .lean();

  const habitPayload: TrackerHabit[] = habits.map((h) => {
    const u = h.user as {
      _id: Types.ObjectId;
      name?: string;
      email?: string;
    };
    return {
      id: String(h._id),
      title: h.title,
      userId: String(u._id),
      userName: u.name ?? u.email ?? "Member",
    };
  });

  const habitIds = habits.map((h) => h._id);
  const logsRaw =
    habitIds.length === 0
      ? []
      : await HabitLog.find({
          habit: { $in: habitIds },
          completed: true,
        }).lean();

  const logs: TrackerLog[] = logsRaw.map((l) => ({
    habitId: String(l.habit),
    dateKey: l.dateKey,
    completed: l.completed,
  }));

  const days = eachSquadDayKeys(start, end, timeZone);

  return {
    squadId,
    days,
    habits: habitPayload,
    logs,
    currentUserId: userId,
  };
}
