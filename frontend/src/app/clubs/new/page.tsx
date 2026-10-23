"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { ClubForm } from "@/features/clubs/components/club-form";
import type { Club } from "@/features/clubs/types";

export default function NewClubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Criar clube"
        description="O clube nasce com 300,00 em caixa e sem jogadores."
        backHref="/clubs"
      />
      <Card>
        <CardContent className="p-6">
          <ClubForm
            onSuccess={(club: Club) => {
              window.location.href = `/clubs/${club.id}`;
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
