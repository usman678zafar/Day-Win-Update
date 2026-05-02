import { auth } from "@/auth";
import { ensureHabitLogStorageReady } from "@/lib/db";
import { isFutureDateKey, squadAllowsDateKey } from "@/lib/dates";
import { getSquadWithMembership } from "@/lib/squad-access";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function timeZoneHeader(req: Request): string | null {
  const raw = req.headers.get("x-day-win-tz")?.trim();
  if (!raw || raw.length > 120) {
    return null;
  }
  return raw;
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { habitId?: string; dateKey?: string; completed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const habitId = typeof body.habitId === "string" ? body.habitId.trim() : "";
  const dateKey = typeof body.dateKey === "string" ? body.dateKey.trim() : "";
  if (!habitId || !dateKey) {
    return NextResponse.json(
      { error: "habitId and dateKey required" },
      { status: 400 },
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return NextResponse.json({ error: "dateKey must be YYYY-MM-DD" }, { status: 400 });
  }
  const completed =
    typeof body.completed === "boolean" ? body.completed : true;

  await ensureHabitLogStorageReady();
  const habit = await Habit.findById(habitId).lean();
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (String(habit.user) !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { squad, role } = await getSquadWithMembership(String(habit.squad), userId);
  if (!squad || !role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tz = timeZoneHeader(req);
  const start =
    squad.startDate instanceof Date
      ? squad.startDate
      : new Date(squad.startDate as string);
  const end =
    squad.endDate instanceof Date
      ? squad.endDate
      : new Date(squad.endDate as string);
  if (!squadAllowsDateKey(dateKey, start, end, tz)) {
    return NextResponse.json(
      { error: "dateKey outside squad range" },
      { status: 400 },
    );
  }

  if (isFutureDateKey(dateKey, tz)) {
    return NextResponse.json(
      { error: "Cannot log habits for future dates" },
      { status: 400 },
    );
  }

  if (!completed) {
    await HabitLog.deleteOne({ habit: habitId, dateKey });
    return NextResponse.json({ ok: true, completed: false });
  }

  await HabitLog.findOneAndUpdate(
    { habit: habitId, dateKey },
    {
      $set: {
        completed: true,
        user: userId,
      },
      $setOnInsert: {
        habit: habitId,
        dateKey,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  return NextResponse.json({ ok: true, completed: true });
}
