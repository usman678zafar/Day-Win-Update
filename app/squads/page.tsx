import { auth } from "@/auth";
import { toDateKeyUTC } from "@/lib/dates";
import connectDB from "@/lib/db";
import { ui } from "@/lib/ui";
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
    <div className={ui.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h1 className={ui.headingPage}>Your squads</h1>
          <p className={ui.muted}>
            Open a squad to track habits and see everyone&apos;s progress.
          </p>
        </div>
        <Link
          href="/squads/new"
          className={`${ui.btnPrimary} w-full shrink-0 sm:w-auto`}
        >
          New squad
        </Link>
      </div>

      {squads.length === 0 ? (
        <div className={`${ui.cardMuted} mt-5 max-w-md sm:mt-8`}>
          <p className={ui.muted}>
            No squads yet. Create one to invite members and start a challenge.
          </p>
          <Link
            href="/squads/new"
            className={`${ui.btnSecondary} mt-4 w-full sm:w-auto`}
          >
            Create your first squad
          </Link>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          {squads.map((s) => {
            const role = s.members.find(
              (m: SquadMemberLean) => String(m.user) === userId,
            )?.role;
            return (
              <li key={String(s._id)}>
                <Link
                  href={`/squads/${String(s._id)}`}
                  className={`${ui.card} group block transition hover:border-emerald-200/80 hover:shadow-md hover:shadow-emerald-950/5 dark:hover:border-emerald-700/50 dark:hover:shadow-emerald-950/20`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-zinc-900 group-hover:text-emerald-900 dark:text-zinc-100 dark:group-hover:text-emerald-300">
                      {s.name}
                    </h2>
                    {role ? (
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/60">
                        {role}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {toDateKeyUTC(s.startDate)} — {toDateKeyUTC(s.endDate)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
