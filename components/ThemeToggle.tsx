"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "day-win-theme";

function applyTheme(mode: "light" | "dark") {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem(STORAGE_KEY, mode);
  const content = mode === "dark" ? "#09090b" : "#fafaf9";
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((el) => el.setAttribute("content", content));
}

function readMode(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    setMode(readMode());
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-flex h-9 w-9 shrink-0 rounded-xl border border-transparent"
        aria-hidden
      />
    );
  }

  const nextIsDark = mode === "light";

  return (
    <button
      type="button"
      onClick={() => {
        const next = nextIsDark ? "dark" : "light";
        applyTheme(next);
        setMode(next);
      }}
      className="inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-zinc-200/90 bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-emerald-400/55 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-white hover:text-emerald-800 hover:shadow-emerald-500/10 active:scale-[0.97] dark:border-zinc-600/80 dark:bg-zinc-800/90 dark:text-amber-100/90 dark:shadow-black/30 dark:hover:border-amber-500/35 dark:hover:from-amber-500/15 dark:hover:to-zinc-800 dark:hover:text-amber-50 dark:hover:shadow-amber-500/15"
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
