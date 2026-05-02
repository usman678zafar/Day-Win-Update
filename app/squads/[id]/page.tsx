import { SquadDashboard } from "@/components/SquadDashboard";
import { ui } from "@/lib/ui";

export default async function SquadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className={ui.page}>
      <SquadDashboard squadId={id} />
    </div>
  );
}
