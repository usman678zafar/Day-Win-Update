import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { getSquadWithMembership } from "@/lib/squad-access";
import Habit from "@/models/Habit";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: squadId } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(squadId, userId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const habits = await Habit.find({ squad: squadId })
    .populate("createdBy", "name email")
    .sort({ createdAt: 1 })
    .lean();

  const payload = habits.map((h) => {
    const creator = h.createdBy as unknown as {
      _id: Types.ObjectId;
      name?: string;
      email?: string;
    };
    return {
      id: String(h._id),
      title: h.title,
      createdBy: String(creator?._id ?? h.createdBy),
      createdByName: creator?.name ?? creator?.email ?? "Admin",
    };
  });

  return NextResponse.json({ habits: payload });
}

export async function POST(req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: squadId } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(squadId, userId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can add squad habits" },
      { status: 403 },
    );
  }
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
  const habit = await Habit.create({
    squad: squadId,
    createdBy: userId,
    title,
  });
  return NextResponse.json(
    {
      habit: {
        id: String(habit._id),
        title: habit.title,
        createdBy: String(habit.createdBy),
      },
    },
    { status: 201 },
  );
}
