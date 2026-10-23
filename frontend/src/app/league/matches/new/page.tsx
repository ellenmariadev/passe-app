import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { MatchForm } from "@/features/matches/components/match-form";

export default function NewMatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova partida"
        description="Escolha o mandante e o visitante. O placar é calculado pela API."
        actions={<BackButton href="/league/matches" />}
      />
      <Card>
        <CardContent className="p-6">
          <MatchForm />
        </CardContent>
      </Card>
    </div>
  );
}
