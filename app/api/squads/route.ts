import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { parseBodyDateToUTCStart, toDateKeyUTC } from "@/lib/dates";
import Squad from "@/models/Squad";
import User from "@/models/User";
import { NextResponse } from "next/server";

type SquadMemberLean = { user: { toString: () => string }; role: string };

async function getSessionUserId() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    return null;
  }
  return id;
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const squads = await Squad.find({ "members.user": userId })
    .sort({ updatedAt: -1 })
    .lean();

  const payload = squads.map((s) => ({
    id: String(s._id),
    name: s.name,
    startDate: s.startDate,
    endDate: s.endDate,
    role: s.members.find((m: SquadMemberLean) => String(m.user) === userId)
      ?.role ?? null,
    memberCount: s.members.length,
  }));

  return NextResponse.json({ squads: payload });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { name?: string; startDate?: string; endDate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!body.startDate || !body.endDate) {
    return NextResponse.json(
      { error: "startDate and endDate required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }
  let startDate: Date;
  let endDate: Date;
  try {
    startDate = parseBodyDateToUTCStart(body.startDate);
    endDate = parseBodyDateToUTCStart(body.endDate);
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be on or before endDate" },
      { status: 400 },
    );
  }
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const squad = await Squad.create({
    name,
    startDate,
    endDate,
    members: [{ user: userId, role: "admin" }],
  });

  return NextResponse.json(
    {
      squad: {
        id: String(squad._id),
        name: squad.name,
        startDate: squad.startDate,
        endDate: squad.endDate,
        startDateKey: toDateKeyUTC(squad.startDate),
        endDateKey: toDateKeyUTC(squad.endDate),
        role: "admin",
      },
    },
    { status: 201 },
  );
}
