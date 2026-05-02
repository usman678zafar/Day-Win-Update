import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { getSquadWithMembership } from "@/lib/squad-access";
import Squad from "@/models/Squad";
import { NextResponse } from "next/server";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { squad, role } = await getSquadWithMembership(id, userId);
  if (!squad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (role) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }
  await connectDB();
  await Squad.findByIdAndUpdate(id, {
    $push: { members: { user: userId, role: "member" } },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
