import { SignInButton } from "@/components/AuthButtons";
import { auth } from "@/auth";
import { ui } from "@/lib/ui";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className={ui.pageNarrow}>
      <div
        className={`${ui.card} relative overflow-hidden border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/40`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-amber-100/50 blur-2xl" />
        <div className="relative space-y-3 sm:space-y-5">
          <p className={ui.badge}>Squad habits · daily wins</p>
          <h1 className={ui.headingPage}>Win the day together</h1>
          <p className={`${ui.muted} max-w-prose`}>
            Habit tracking with squad accountability. Sign in with Google to
            create or join a squad, define habits with your group, and log
            progress everyone can see—while only you check your own cells.
          </p>
          {session?.user ? (
            <Link href="/squads" className={`${ui.btnPrimary} w-full sm:w-auto`}>
              Go to your squads
            </Link>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  );
}
