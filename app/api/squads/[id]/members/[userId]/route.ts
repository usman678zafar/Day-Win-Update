import { auth } from "@/auth";
import connectDB, { ensureHabitLogStorageReady } from "@/lib/db";
import { getSquadWithMembership } from "@/lib/squad-access";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import Squad from "@/models/Squad";
import { NextResponse } from "next/server";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type Ctx = { params: Promise<{ id: string; userId: string }> };

type SquadMemberLean = { user: { toString: () => string }; role: string };

async function deleteTrackerLogsForMember(
  squadId: string,
  memberUserId: string,
) {
  const habits = await Habit.find({ squad: squadId }).select("_id").lean();
  const habitIds = habits.map((h) => h._id);
  if (habitIds.length === 0) return;
  await HabitLog.deleteMany({
    user: memberUserId,
    habit: { $in: habitIds },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const currentId = await getSessionUserId();
  if (!currentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, userId: targetUserId } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(id, currentId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.role !== "admin" && body.role !== "member") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const member = squad.members.find(
    (m: SquadMemberLean) => String(m.user) === targetUserId,
  );
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (body.role === "member" && member.role === "admin") {
    const adminCount = squad.members.filter(
      (m: SquadMemberLean) => m.role === "admin",
    ).length;
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot demote the only admin" },
        { status: 400 },
      );
    }
  }
  await connectDB();
  await Squad.updateOne(
    { _id: id, "members.user": targetUserId },
    { $set: { "members.$.role": body.role } },
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const currentId = await getSessionUserId();
  if (!currentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, userId: targetUserId } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(id, currentId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isSelf = targetUserId === currentId;
  if (isSelf) {
    const member = squad.members.find(
      (m: SquadMemberLean) => String(m.user) === currentId,
    );
    if (member?.role === "admin") {
      const adminCount = squad.members.filter(
        (m: SquadMemberLean) => m.role === "admin",
      ).length;
      if (adminCount <= 1 && squad.members.length > 1) {
        return NextResponse.json(
          { error: "Assign another admin before leaving" },
          { status: 400 },
        );
      }
    }
    await ensureHabitLogStorageReady();
    await connectDB();
    await deleteTrackerLogsForMember(id, targetUserId);
    await Squad.findByIdAndUpdate(id, {
      $pull: { members: { user: targetUserId } },
    });
    const remaining = await Squad.findById(id).lean();
    if (remaining && remaining.members.length === 0) {
      const habits = await Habit.find({ squad: id }).select("_id").lean();
      const habitIds = habits.map((h) => h._id);
      if (habitIds.length) {
        await HabitLog.deleteMany({ habit: { $in: habitIds } });
      }
      await Habit.deleteMany({ squad: id });
      await Squad.findByIdAndDelete(id);
    }
    return NextResponse.json({ ok: true });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const target = squad.members.find(
    (m: SquadMemberLean) => String(m.user) === targetUserId,
  );
  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (target.role === "admin") {
    const adminCount = squad.members.filter(
      (m: SquadMemberLean) => m.role === "admin",
    ).length;
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the only admin" },
        { status: 400 },
      );
    }
  }
  await ensureHabitLogStorageReady();
  await connectDB();
  await deleteTrackerLogsForMember(id, targetUserId);
  await Squad.findByIdAndUpdate(id, {
    $pull: { members: { user: targetUserId } },
  });
  const remaining = await Squad.findById(id).lean();
  if (remaining && remaining.members.length === 0) {
    const habits = await Habit.find({ squad: id }).select("_id").lean();
    const habitIds = habits.map((h) => h._id);
    if (habitIds.length) {
      await HabitLog.deleteMany({ habit: { $in: habitIds } });
    }
    await Habit.deleteMany({ squad: id });
    await Squad.findByIdAndDelete(id);
  }
  return NextResponse.json({ ok: true });
}
