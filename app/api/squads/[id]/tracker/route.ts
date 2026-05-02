import { auth } from "@/auth";
import { buildTrackerPayload } from "@/lib/tracker-data";
import { getSquadWithMembership } from "@/lib/squad-access";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

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
  const payload = await buildTrackerPayload(squadId, userId, squad);
  return NextResponse.json(payload);
}
