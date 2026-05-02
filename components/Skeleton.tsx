/** Inert pulse block for loading placeholders (no spinner). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-emerald-100/50 dark:bg-neutral-600/25 ${className}`.trim()}
      aria-hidden
    />
  );
}
