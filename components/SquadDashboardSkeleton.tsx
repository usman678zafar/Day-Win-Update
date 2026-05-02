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
    <div className="space-y-4 sm:space-y-8">
      {Array.from({ length: memberBlocks }).map((_, mi) => (
        <div key={mi} className="space-y-1.5 sm:space-y-2">
          <Skeleton className="h-3.5 w-36 sm:h-4 sm:w-44" />
          <div className="overflow-x-auto rounded-lg border border-zinc-200/80 bg-zinc-50/30 sm:rounded-xl">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-emerald-50/80">
                  <th className="border border-zinc-200/80 px-1.5 py-1.5 text-left align-middle w-28 sm:w-32 sm:px-2 sm:py-2">
                    <Skeleton className="h-3 w-12 sm:h-3.5 sm:w-14" />
                  </th>
                  {Array.from({ length: dayCells }).map((_, di) => (
                    <th
                      key={di}
                      className="border border-zinc-200/80 px-0.5 py-1.5 align-middle sm:px-1 sm:py-2"
                    >
                      <Skeleton className="h-2.5 w-7 mx-auto sm:h-3 sm:w-9" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: habitRows }).map((_, ri) => (
                  <tr key={ri}>
                    <td className="border border-zinc-200/80 px-1.5 py-1.5 align-middle bg-white sm:px-2 sm:py-2">
                      <Skeleton className="h-3 w-24 sm:h-3.5 sm:w-28" />
                    </td>
                    {Array.from({ length: dayCells }).map((_, di) => (
                      <td
                        key={di}
                        className="border border-zinc-200/80 px-0.5 py-1.5 text-center align-middle bg-white sm:px-1 sm:py-2"
                      >
                        <Skeleton className="h-6 w-6 rounded-md mx-auto sm:h-7 sm:w-7" />
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
    <div className="space-y-4 sm:space-y-8" aria-busy="true" role="status">
      <span className="sr-only">Loading squad…</span>
      <header className={`${ui.card} space-y-2 sm:space-y-3`}>
        <Skeleton className="h-7 w-[90%] max-w-md sm:h-8 sm:w-72" />
        <Skeleton className="h-3.5 w-[85%] max-w-sm sm:h-4 sm:w-[22rem]" />
      </header>
      <section className={ui.card}>
        <Skeleton className="h-3.5 w-24 sm:h-4 sm:w-28" />
        <div className="mt-3 sm:mt-4">
          <TrackerTablesSkeleton />
        </div>
      </section>
      <section className={ui.card}>
        <Skeleton className="h-3.5 w-28 sm:h-4 sm:w-32" />
        <div className="mt-3 space-y-2 sm:mt-4">
          <Skeleton className="h-11 w-full rounded-lg sm:h-12" />
          <Skeleton className="h-11 w-full rounded-lg sm:h-12" />
        </div>
      </section>
    </div>
  );
}
