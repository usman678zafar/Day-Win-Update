"use client";

import {
  applyThemeMode,
  getResolvedThemeMode,
  type ThemeMode,
} from "@/lib/theme";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    setMounted(true);
    setMode(getResolvedThemeMode());
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-flex h-9 w-9 shrink-0 rounded-xl border border-transparent"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        const next: ThemeMode = mode === "light" ? "dark" : "light";
        applyThemeMode(next);
        setMode(next);
      }}
      className="relative z-[60] inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-zinc-200/90 bg-white/90 text-zinc-600 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-800 active:scale-[0.97] dark:border-white/12 dark:bg-white/[0.06] dark:text-neutral-400 dark:shadow-none dark:hover:bg-white/[0.1] dark:hover:text-neutral-200"
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {mode === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[1.15rem] w-[1.15rem]"
          aria-hidden
        >
          <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[1.1rem] w-[1.1rem]"
          aria-hidden
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      )}
    </button>
  );
}
