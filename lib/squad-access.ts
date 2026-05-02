import connectDB from "@/lib/db";
import Squad from "@/models/Squad";

export type MembershipRole = "admin" | "member";

type SquadMemberLean = { user: { toString: () => string }; role: string };

export async function getSquadWithMembership(squadId: string, userId: string) {
  await connectDB();
  const squad = await Squad.findById(squadId).lean();
  if (!squad) {
    return { squad: null as null, role: null as null };
  }
  const member = squad.members.find(
    (m: SquadMemberLean) => String(m.user) === String(userId),
  );
  if (!member) {
    return { squad, role: null as null };
  }
  return {
    squad,
    role: member.role as MembershipRole,
  };
}
