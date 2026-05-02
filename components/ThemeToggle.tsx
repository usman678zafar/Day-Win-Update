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
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[1.1rem] w-[1.1rem]"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a8.97 8.97 0 003.463 6.978.75.75 0 01-.762 1.293h-.003c-1.024-.485-2.021-.88-3.058-1.19-1.091-.325-2.154-.475-3.15-.475-3.28 0-5.94-2.66-5.94-5.94 0-.996.15-2.059.475-3.15.31-1.037.705-2.034 1.19-3.058a.75.75 0 011.258.077 8.87 8.87 0 002.292 2.44 8.97 8.97 0 003.108 1.864.75.75 0 01-.292 1.465z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
