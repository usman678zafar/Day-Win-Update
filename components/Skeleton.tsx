/** Inert pulse block for loading placeholders (no spinner). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-200/90 ${className}`.trim()}
      aria-hidden
    />
  );
}
