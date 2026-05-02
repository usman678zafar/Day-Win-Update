import { Skeleton } from "@/components/Skeleton";
import { ui } from "@/lib/ui";

export function TrackerTablesSkeleton({
  memberBlocks = 2,
  habitRows = 2,
  dayCells = 9,
}: {
  memberBlocks?: number;
  habitRows?: number;
  dayCells?: number;
}) {
  return (
    <div className="space-y-8">
      {Array.from({ length: memberBlocks }).map((_, mi) => (
        <div key={mi} className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-zinc-50/30">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-50/80">
                  <th className="border border-zinc-200/80 px-2 py-2 text-left align-middle w-32">
                    <Skeleton className="h-3.5 w-14" />
                  </th>
                  {Array.from({ length: dayCells }).map((_, di) => (
                    <th
                      key={di}
                      className="border border-zinc-200/80 px-1 py-2 align-middle"
                    >
                      <Skeleton className="h-3 w-9 mx-auto" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: habitRows }).map((_, ri) => (
                  <tr key={ri}>
                    <td className="border border-zinc-200/80 px-2 py-2 align-middle bg-white">
                      <Skeleton className="h-3.5 w-28" />
                    </td>
                    {Array.from({ length: dayCells }).map((_, di) => (
                      <td
                        key={di}
                        className="border border-zinc-200/80 px-1 py-2 text-center align-middle bg-white"
                      >
                        <Skeleton className="h-7 w-7 rounded-md mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full dashboard placeholder while squad metadata is fetching. */
export function SquadDashboardPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" role="status">
      <span className="sr-only">Loading squad…</span>
      <header className={`${ui.card} space-y-3`}>
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-[22rem] max-w-full" />
        <Skeleton className="h-16 w-full max-w-2xl rounded-xl" />
      </header>
      <section className={ui.card}>
        <Skeleton className="h-4 w-28" />
        <div className="mt-4">
          <TrackerTablesSkeleton />
        </div>
      </section>
      <section className={ui.card}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-10 w-full max-w-sm rounded-xl" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-11 w-full max-w-md rounded-lg" />
          <Skeleton className="h-11 w-full max-w-lg rounded-lg" />
        </div>
      </section>
    </div>
  );
}
