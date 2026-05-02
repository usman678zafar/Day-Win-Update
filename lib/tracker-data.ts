import { ensureHabitLogStorageReady } from "@/lib/db";
import { eachSquadDayKeys } from "@/lib/dates";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import Squad from "@/models/Squad";
import { Types } from "mongoose";

export type TrackerHabit = {
  habitId: string;
  rowKey: string;
  title: string;
  userId: string;
  userName: string;
};

export type TrackerLog = {
  habitId: string;
  userId: string;
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

type PopulatedMember = {
  user: {
    _id: Types.ObjectId;
    name?: string;
    email?: string;
  };
  role: string;
};

/** Call only after verifying the user is a squad member. */
export async function buildTrackerPayload(
  squadId: string,
  userId: string,
  timeZone?: string | null,
): Promise<TrackerPayload> {
  await ensureHabitLogStorageReady();

  const populated = await Squad.findById(squadId)
    .populate("members.user", "name email")
    .lean();
  if (!populated) {
    return {
      squadId,
      days: [],
      habits: [],
      logs: [],
      currentUserId: userId,
    };
  }

  const start =
    populated.startDate instanceof Date
      ? populated.startDate
      : new Date(populated.startDate as string);
  const end =
    populated.endDate instanceof Date
      ? populated.endDate
      : new Date(populated.endDate as string);

  const habitsDocs = await Habit.find({ squad: squadId })
    .sort({ createdAt: 1 })
    .lean();

  const members = populated.members.map((m: PopulatedMember) => {
    const u = m.user;
    return {
      userId: String(u._id),
      userName: u.name ?? u.email ?? "Member",
    };
  });

  const habitPayload: TrackerHabit[] = [];
  for (const m of members) {
    for (const h of habitsDocs) {
      habitPayload.push({
        habitId: String(h._id),
        rowKey: `${String(h._id)}:${m.userId}`,
        title: h.title,
        userId: m.userId,
        userName: m.userName,
      });
    }
  }

  const habitIds = habitsDocs.map((h) => h._id);
  const logsRaw =
    habitIds.length === 0
      ? []
      : await HabitLog.find({
          habit: { $in: habitIds },
          completed: true,
        }).lean();

  const logs: TrackerLog[] = logsRaw.map((l) => ({
    habitId: String(l.habit),
    userId: String(l.user),
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
