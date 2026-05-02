import { SquadDashboardPageSkeleton } from "@/components/SquadDashboardSkeleton";
import { ui } from "@/lib/ui";

export default function SquadDetailLoading() {
  return (
    <div className={ui.page}>
      <SquadDashboardPageSkeleton />
    </div>
  );
}
