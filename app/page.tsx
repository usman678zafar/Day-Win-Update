import { SignInButton } from "@/components/AuthButtons";
import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Day Win</h1>
      <p className="text-sm text-zinc-700">
        Habit tracking with squad accountability. Sign in with Google to create
        or join a squad, add your habits, and track daily progress with your
        group.
      </p>
      {session?.user ? (
        <Link
          href="/squads"
          className="inline-block rounded border border-zinc-400 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Go to squads
        </Link>
      ) : (
        <SignInButton />
      )}
    </div>
  );
}
