import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/AuthButtons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ui } from "@/lib/ui";

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 pt-[env(safe-area-inset-top,0px)] dark:border-white/10 dark:bg-[#262626]">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-2 px-2.5 py-2 min-[400px]:px-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-6 sm:py-3 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-base font-bold tracking-tight text-zinc-900 transition hover:text-emerald-800 sm:text-lg dark:text-neutral-200 dark:hover:text-emerald-600/90"
        >
          Day Win
          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle ring-1 ring-emerald-200/80 sm:h-2 sm:w-2 dark:bg-emerald-600 dark:ring-emerald-800/40" />
        </Link>
        <nav className="flex min-w-0 flex-wrap items-center gap-1.5 sm:justify-end sm:gap-2">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link
                href="/squads"
                className="rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-600 touch-manipulation transition hover:bg-zinc-100 hover:text-zinc-900 sm:px-3 sm:py-2 sm:text-sm dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200"
              >
                Squads
              </Link>
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-500 sm:max-w-[12rem] sm:flex-none sm:text-sm md:max-w-[16rem] dark:text-neutral-500">
                {session.user.name ?? session.user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/"
              className={`${ui.link} rounded-lg px-2 py-2 no-underline touch-manipulation hover:bg-emerald-50 sm:py-1.5 dark:hover:bg-white/[0.06]`}
            >
              Home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
