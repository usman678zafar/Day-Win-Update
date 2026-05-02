import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { getSquadWithMembership } from "@/lib/squad-access";
import Squad from "@/models/Squad";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type Ctx = { params: Promise<{ id: string }> };

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Admin: add an existing Day Win user to the squad by email (user must have signed in once).
 */
export async function POST(req: Request, ctx: Ctx) {
  const adminUserId = await getSessionUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: squadId } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(squadId, adminUserId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  await connectDB();
  const userToAdd = await User.findOne({ email }).select("_id").lean();
  if (!userToAdd) {
    return NextResponse.json(
      {
        error:
          "No account with that email. They need to sign in to Day Win with Google once before you can add them.",
      },
      { status: 404 },
    );
  }
  const targetId = String(userToAdd._id);
  if (
    squad.members.some(
      (m: { user: unknown }) => String(m.user) === targetId,
    )
  ) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  await Squad.findByIdAndUpdate(squadId, {
    $push: { members: { user: targetId, role: "member" } },
  });
  return NextResponse.json({ ok: true, userId: targetId }, { status: 201 });
}
