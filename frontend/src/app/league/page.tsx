"use client";

import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { useStandings } from "@/features/matches/hooks";
import { StandingsTable } from "@/features/matches/components/standings-table";

export default function LeaguePage() {
  const { data, isLoading, error, refetch } = useStandings();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Liga" }, { label: "Classificação" }]} />
      <PageHeader
        title="Classificação"
        description="Classificação de todos os clubes, calculada pela API."
      />
      <StandingsTable
        rows={data ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}
