/** Shared Tailwind fragments — Day Win visual system */
export const ui = {
  page: "mx-auto w-full min-w-0 max-w-6xl px-2.5 pt-4 min-[400px]:px-3 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:pb-12",
  pageNarrow:
    "mx-auto w-full min-w-0 max-w-lg px-2.5 py-5 min-[400px]:px-3 sm:px-6 sm:py-10 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
  /** Home hero + reflection — room for Arabic lines */
  pageHome:
    "mx-auto w-full min-w-0 max-w-xl px-2.5 py-5 min-[400px]:px-3 sm:px-6 sm:py-10 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
  card: "rounded-xl border border-zinc-200/90 bg-white p-3 shadow-sm shadow-zinc-950/[0.04] sm:rounded-2xl sm:p-6",
  cardMuted:
    "rounded-xl border border-zinc-200/60 bg-zinc-50/80 p-3 sm:rounded-2xl sm:p-6",
  sectionTitle:
    "text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500 sm:text-xs sm:tracking-[0.1em]",
  headingPage:
    "text-xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-3xl sm:leading-tight",
  headingCard: "text-base font-semibold text-zinc-900 sm:text-lg",
  muted: "text-xs leading-snug text-zinc-600 sm:text-sm sm:leading-relaxed",
  input:
    "min-h-10 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/15 sm:min-h-0 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm",
  btnPrimary:
    "inline-flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 active:bg-emerald-700 disabled:pointer-events-none disabled:opacity-45 sm:min-h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5",
  btnSecondary:
    "inline-flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-45 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5",
  btnDanger:
    "inline-flex min-h-10 touch-manipulation items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 transition hover:border-red-300 hover:bg-red-100 sm:rounded-xl sm:px-4 sm:py-2.5",
  btnGhost:
    "inline-flex min-h-9 touch-manipulation items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 sm:min-h-0 sm:rounded-lg sm:px-2 sm:py-1 sm:text-sm",
  link: "text-xs font-medium text-emerald-700 underline decoration-emerald-600/30 underline-offset-2 transition hover:decoration-emerald-600 sm:text-sm sm:underline-offset-[3px]",
  badge:
    "inline-flex items-center rounded-full bg-emerald-50 px-2 py-px text-[10px] font-medium text-emerald-800 ring-1 ring-emerald-600/15 sm:px-2.5 sm:py-0.5 sm:text-xs",
  errorBox:
    "rounded-lg border border-red-200 bg-red-50/90 px-2.5 py-1.5 text-xs text-red-900 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm",
} as const;
