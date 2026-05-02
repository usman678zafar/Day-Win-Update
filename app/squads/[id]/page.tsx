import { SquadDashboard } from "@/components/SquadDashboard";

export default async function SquadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl p-4">
      <SquadDashboard squadId={id} />
    </div>
  );
}
