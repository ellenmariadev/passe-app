"use client";

import { Shield, Swords, Trophy } from "lucide-react";

import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSITION_LABELS } from "@/lib/domain";
import type { Duel, Match } from "../types";

const ATTRIBUTE_LABELS: Record<string, string> = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
};

const RESULT_LABELS: Record<Match["result"], string> = {
  MANDANTE: "Vitória do mandante",
  VISITANTE: "Vitória do visitante",
  EMPATE: "Empate",
};

export function MatchResult({ match }: { match: Match }) {
  const isHomeWin = match.result === "MANDANTE";
  const isAwayWin = match.result === "VISITANTE";
  const isDraw = match.result === "EMPATE";

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold">{match.home.club_name}</p>
            <Badge variant="outline" className="mt-1">
              Mandante
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-4xl font-bold ${
                isHomeWin
                  ? "text-success"
                  : isDraw
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {match.home.goals}
            </span>
            <span className="text-2xl text-muted-foreground">×</span>
            <span
              className={`text-4xl font-bold ${
                isAwayWin
                  ? "text-success"
                  : isDraw
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {match.away.goals}
            </span>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold">{match.away.club_name}</p>
            <Badge variant="outline" className="mt-1">
              Visitante
            </Badge>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Swords className="h-4 w-4" />
            Formações: {match.home.formation} × {match.away.formation}
          </span>
          <Badge
            variant={isDraw ? "secondary" : "default"}
            className="gap-1"
          >
            <Trophy className="h-3 w-3" />
            {RESULT_LABELS[match.result]}
          </Badge>
        </div>
      </div>

      {/* Duels */}
      {match.duels && match.duels.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Duelos</h3>
            <span className="text-sm text-muted-foreground">
              ({match.duels.length} duelos)
            </span>
          </div>

          <div className="space-y-3">
            {match.duels.map((duel) => (
              <DuelCard key={duel.order} duel={duel} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DuelCard({ duel }: { duel: Duel }) {
  const attackerWon = duel.goal;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Attacker */}
          <div className="flex items-center gap-3 flex-1">
            <Avatar name={duel.attacker.name} size="sm" />
            <div>
              <p className="text-sm font-medium">{duel.attacker.name}</p>
              <p className="text-xs text-muted-foreground">
                {POSITION_LABELS[
                  duel.attacker.position as keyof typeof POSITION_LABELS
                ] ?? duel.attacker.position}{" "}
                · {ATTRIBUTE_LABELS[duel.attacker.attribute] ?? duel.attacker.attribute}: {duel.attacker.value}
              </p>
            </div>
            <Badge variant="default" className="ml-2">
              Atacante
            </Badge>
          </div>

          {/* VS */}
          <div className="mx-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-semibold">×</span>
            </div>
            {duel.goal ? (
              <Badge variant="success" className="gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success-foreground" />
                Gol
              </Badge>
            ) : (
              <Badge variant="secondary">Sem gol</Badge>
            )}
          </div>

          {/* Defender */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <Badge variant="outline" className="mr-2">
              Defensor
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium">{duel.defender.name}</p>
              <p className="text-xs text-muted-foreground">
                {POSITION_LABELS[
                  duel.defender.position as keyof typeof POSITION_LABELS
                ] ?? duel.defender.position}{" "}
                · {ATTRIBUTE_LABELS[duel.defender.attribute] ?? duel.defender.attribute}: {duel.defender.value}
              </p>
            </div>
            <Avatar name={duel.defender.name} size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
