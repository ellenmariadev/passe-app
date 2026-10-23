"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { useClubs } from "@/features/clubs/hooks";
import { ClubsTable } from "@/features/clubs/components/clubs-table";
import { ClubForm } from "@/features/clubs/components/club-form";
import type { ClubSort } from "@/features/clubs/types";

const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "net_worth_desc", label: "Patrimônio (maior)" },
  { value: "net_worth_asc", label: "Patrimônio (menor)" },
];

export default function ClubsPage() {
  const router = useRouter();
  const [sort, setSort] = useState<ClubSort>("name");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: clubs, isLoading, error, refetch } = useClubs(sort);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Mercado", href: "/market" },
        { label: "Clubes" },
      ]} />

      <PageHeader
        title="Clubes"
        description="Lista de clubes com caixa, valor do elenco e patrimônio."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo clube
          </Button>
        }
      />

      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            {clubs?.length ?? 0} clubes
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
            {clubs?.length ?? 0} de 20
          </span>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as ClubSort)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ClubsTable
        clubs={clubs ?? []}
        onView={(club) => router.push(`/clubs/${club.id}`)}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />

      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Criar clube"
        description="O clube nasce com 300,00 em caixa e sem jogadores."
      >
        {isCreateOpen ? (
          <ClubForm
            onSuccess={() => {
              setIsCreateOpen(false);
              refetch();
            }}
          />
        ) : null}
      </FormDialog>
    </div>
  );
}
