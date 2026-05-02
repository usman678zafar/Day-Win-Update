"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      type="button"
      className="rounded border border-zinc-400 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
      onClick={() => signIn("google")}
    >
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      className="rounded border border-zinc-400 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
