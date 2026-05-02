import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/AuthButtons";
import { ui } from "@/lib/ui";

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900 transition hover:text-emerald-800"
        >
          Day Win
          <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle ring-2 ring-emerald-200" />
        </Link>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {session?.user ? (
            <>
              <Link
                href="/squads"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                Squads
              </Link>
              <span className="hidden max-w-[10rem] truncate text-sm text-zinc-500 sm:inline md:max-w-[14rem]">
                {session.user.name ?? session.user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/"
              className={`${ui.link} rounded-lg px-2 py-1.5 no-underline hover:bg-emerald-50`}
            >
              Home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
