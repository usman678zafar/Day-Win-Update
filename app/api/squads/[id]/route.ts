import { auth } from "@/auth";
import connectDB, { ensureHabitLogStorageReady } from "@/lib/db";
import {
  parseBodyDateToUTCStart,
  toDateKeyUTC,
} from "@/lib/dates";
import { getSquadWithMembership } from "@/lib/squad-access";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import Squad from "@/models/Squad";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type Ctx = { params: Promise<{ id: string }> };

type PopulatedMember = {
  user: {
    _id: Types.ObjectId;
    name?: string;
    email?: string;
  };
  role: string;
};

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(id, userId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!role) {
    return NextResponse.json({
      squad: {
        id: String(squad._id),
        name: squad.name,
        startDate: squad.startDate,
        endDate: squad.endDate,
        startDateKey: toDateKeyUTC(squad.startDate),
        endDateKey: toDateKeyUTC(squad.endDate),
        joined: false,
        memberCount: squad.members.length,
      },
    });
  }
  await connectDB();
  const populated = await Squad.findById(id)
    .populate("members.user", "name email image")
    .lean();
  if (!populated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    squad: {
      id: String(populated._id),
      name: populated.name,
      startDate: populated.startDate,
      endDate: populated.endDate,
      startDateKey: toDateKeyUTC(populated.startDate),
      endDateKey: toDateKeyUTC(populated.endDate),
      joined: true,
      role,
      members: populated.members.map((m: PopulatedMember) => {
        const u = m.user;
        return {
          userId: String(u._id),
          name: u.name ?? u.email ?? "Member",
          email: u.email ?? "",
          role: m.role,
        };
      }),
    },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(id, userId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: Partial<{
    name: string;
    startDate: string;
    endDate: string;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  let start = squad.startDate;
  let end = squad.endDate;
  if (body.startDate !== undefined) {
    try {
      start = parseBodyDateToUTCStart(String(body.startDate));
      updates.startDate = start;
    } catch {
      return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
    }
  }
  if (body.endDate !== undefined) {
    try {
      end = parseBodyDateToUTCStart(String(body.endDate));
      updates.endDate = end;
    } catch {
      return NextResponse.json({ error: "Invalid endDate" }, { status: 400 });
    }
  }
  if (start > end) {
    return NextResponse.json(
      { error: "startDate must be on or before endDate" },
      { status: 400 },
    );
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }
  await ensureHabitLogStorageReady();
  const next = await Squad.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true },
  ).lean();
  if (!next) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const habitDocs = await Habit.find({ squad: id }).select("_id").lean();
  const habitIds = habitDocs.map((h) => h._id);
  if (habitIds.length > 0) {
    await HabitLog.deleteMany({
      habit: { $in: habitIds },
      $or: [
        { dateKey: { $lt: toDateKeyUTC(next.startDate) } },
        { dateKey: { $gt: toDateKeyUTC(next.endDate) } },
      ],
    });
  }

  return NextResponse.json({
    squad: {
      id: String(next._id),
      name: next.name,
      startDate: next.startDate,
      endDate: next.endDate,
      startDateKey: toDateKeyUTC(next.startDate),
      endDateKey: toDateKeyUTC(next.endDate),
    },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(id, userId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureHabitLogStorageReady();
  const habits = await Habit.find({ squad: id }).select("_id").lean();
  const habitIds = habits.map((h) => h._id);
  if (habitIds.length) {
    await HabitLog.deleteMany({ habit: { $in: habitIds } });
  }
  await Habit.deleteMany({ squad: id });
  await Squad.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
