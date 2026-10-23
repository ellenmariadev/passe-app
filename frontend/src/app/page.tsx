import Link from "next/link";
import { Shield, ShoppingCart, Trophy, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODULES = [
  {
    href: "/players",
    title: "Jogadores",
    description:
      "Cadastre, edite, altere a condição e consulte jogadores com valor de mercado e overall.",
    icon: Users,
  },
  {
    href: "/clubs",
    title: "Clubes",
    description:
      "Crie clubes e acompanhe caixa, elenco, contratos, valor do elenco e patrimônio.",
    icon: Shield,
  },
  {
    href: "/market",
    title: "Mercado",
    description:
      "Compre e venda jogadores com contrato de fidelidade e acompanhe o histórico.",
    icon: ShoppingCart,
  },
  {
    href: "/league",
    title: "Liga",
    description:
      "Escale os titulares, jogue partidas e acompanhe o histórico e a classificação.",
    icon: Trophy,
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col justify-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Passe</h1>
        <p className="text-muted-foreground">
          Mercado de jogadores de uma liga de futebol. Percorra o fluxo completo: jogadores, clubes, compra com contrato, venda, histórico,
          escalação, partidas e classificação.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
