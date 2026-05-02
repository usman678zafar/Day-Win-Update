import { auth } from "@/auth";
import { toDateKeyUTC } from "@/lib/dates";
import connectDB from "@/lib/db";
import Squad from "@/models/Squad";
import Link from "next/link";

type SquadMemberLean = { user: { toString: () => string }; role: string };

export default async function SquadsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }
  await connectDB();
  const squads = await Squad.find({ "members.user": userId })
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Your squads</h1>
        <Link
          href="/squads/new"
          className="rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          New squad
        </Link>
      </div>
      {squads.length === 0 ? (
        <p className="text-sm text-zinc-600">No squads yet. Create one to start.</p>
      ) : (
        <ul className="space-y-2">
          {squads.map((s) => {
            const role = s.members.find(
              (m: SquadMemberLean) => String(m.user) === userId,
            )?.role;
            return (
              <li key={String(s._id)} className="border border-zinc-300 p-3">
                <Link
                  href={`/squads/${String(s._id)}`}
                  className="font-medium text-zinc-900 underline"
                >
                  {s.name}
                </Link>
                <p className="text-xs text-zinc-600">
                  {toDateKeyUTC(s.startDate)} — {toDateKeyUTC(s.endDate)}
                  {role ? ` · ${role}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
