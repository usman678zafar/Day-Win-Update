import { auth } from "@/auth";
import { ensureHabitLogStorageReady } from "@/lib/db";
import { dateKeyInRange } from "@/lib/dates";
import { getSquadWithMembership } from "@/lib/squad-access";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import { NextResponse } from "next/server";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
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
  if (!dateKeyInRange(dateKey, squad.startDate, squad.endDate)) {
    return NextResponse.json(
      { error: "dateKey outside squad range" },
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
