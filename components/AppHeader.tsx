import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/AuthButtons";

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
      <Link href="/" className="text-lg font-semibold text-zinc-900">
        Day Win
      </Link>
      <nav className="flex flex-wrap items-center gap-3 text-sm">
        {session?.user ? (
          <>
            <Link href="/squads" className="text-zinc-700 underline">
              Squads
            </Link>
            <span className="text-zinc-600">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </>
        ) : (
          <Link href="/" className="text-zinc-700 underline">
            Home
          </Link>
        )}
      </nav>
    </header>
  );
}
