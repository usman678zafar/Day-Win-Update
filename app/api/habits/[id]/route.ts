import { auth } from "@/auth";
import connectDB, { ensureHabitLogStorageReady } from "@/lib/db";
import { getSquadWithMembership } from "@/lib/squad-access";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import { NextResponse } from "next/server";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: habitId } = await ctx.params;
  let body: { title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  await connectDB();
  const habit = await Habit.findById(habitId).lean();
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { role } = await getSquadWithMembership(String(habit.squad), userId);
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can edit squad habits" },
      { status: 403 },
    );
  }
  const updated = await Habit.findByIdAndUpdate(
    habitId,
    { $set: { title } },
    { new: true },
  ).lean();
  return NextResponse.json({
    habit: { id: String(updated!._id), title: updated!.title },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: habitId } = await ctx.params;
  await ensureHabitLogStorageReady();
  const habit = await Habit.findById(habitId).lean();
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { role } = await getSquadWithMembership(String(habit.squad), userId);
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can delete squad habits" },
      { status: 403 },
    );
  }
  await HabitLog.deleteMany({ habit: habitId });
  await Habit.findByIdAndDelete(habitId);
  return NextResponse.json({ ok: true });
}
