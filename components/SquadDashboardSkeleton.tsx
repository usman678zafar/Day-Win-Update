import { Skeleton } from "@/components/Skeleton";

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
          <div className="overflow-x-auto border border-zinc-300 rounded-sm">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="border border-zinc-300 px-2 py-2 text-left align-middle w-32">
                    <Skeleton className="h-3.5 w-14" />
                  </th>
                  {Array.from({ length: dayCells }).map((_, di) => (
                    <th
                      key={di}
                      className="border border-zinc-300 px-1 py-2 align-middle"
                    >
                      <Skeleton className="h-3 w-9 mx-auto" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: habitRows }).map((_, ri) => (
                  <tr key={ri}>
                    <td className="border border-zinc-300 px-2 py-2 align-middle bg-white">
                      <Skeleton className="h-3.5 w-28" />
                    </td>
                    {Array.from({ length: dayCells }).map((_, di) => (
                      <td
                        key={di}
                        className="border border-zinc-300 px-1 py-2 text-center align-middle bg-white"
                      >
                        <Skeleton className="h-7 w-7 rounded-sm mx-auto" />
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
    <div className="space-y-6" aria-busy="true" role="status">
      <span className="sr-only">Loading squad…</span>
      <header className="space-y-3">
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="h-4 w-[22rem] max-w-full" />
        <Skeleton className="h-3 w-full max-w-2xl" />
      </header>
      <section className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <TrackerTablesSkeleton />
      </section>
      <section className="space-y-3 border-t border-zinc-200 pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full max-w-sm" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </section>
    </div>
  );
}
