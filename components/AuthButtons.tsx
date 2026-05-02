"use client";

import { ui } from "@/lib/ui";
import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      type="button"
      className={`${ui.btnPrimary} w-full sm:w-auto`}
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
      className={`${ui.btnSecondary} shrink-0`}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
