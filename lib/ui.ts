/** Shared Tailwind fragments — Day Win visual system */
export const ui = {
  page: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
  pageNarrow: "mx-auto max-w-lg px-4 py-10 sm:px-6",
  card: "rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm shadow-zinc-950/[0.04] sm:p-6",
  cardMuted:
    "rounded-2xl border border-zinc-200/60 bg-zinc-50/80 p-5 sm:p-6",
  sectionTitle:
    "text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500",
  headingPage: "text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl",
  headingCard: "text-lg font-semibold text-zinc-900",
  muted: "text-sm text-zinc-600 leading-relaxed",
  input:
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/15",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 active:bg-emerald-700 disabled:pointer-events-none disabled:opacity-45",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-45",
  btnDanger:
    "inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 transition hover:border-red-300 hover:bg-red-100",
  btnGhost:
    "inline-flex items-center justify-center rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900",
  link: "text-sm font-medium text-emerald-700 underline decoration-emerald-600/30 underline-offset-[3px] transition hover:decoration-emerald-600",
  badge:
    "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/15",
  errorBox:
    "rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-900",
} as const;
