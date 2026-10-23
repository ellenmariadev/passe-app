"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Shield,
  ShoppingCart,
  Trophy,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useClubs } from "@/features/clubs/hooks";
import { FormDialog } from "@/components/shared/form-dialog";
import { ClubForm } from "@/features/clubs/components/club-form";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const MARKET_ITEMS: NavItem[] = [
  { href: "/market", label: "Mercado", icon: ShoppingCart },
  { href: "/players", label: "Jogadores", icon: Users },
  { href: "/clubs", label: "Clubes", icon: Shield },
];

const LEAGUE_ITEMS: NavItem[] = [
  { href: "/league/matches", label: "Partidas", icon: Trophy },
  { href: "/league", label: "Classificação", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: clubs, refetch } = useClubs();
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-sidebar lg:flex">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4 transition-colors hover:bg-sidebar-accent"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          P
        </div>
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">Passe</div>
          <div className="text-xs text-muted-foreground">Gestão da liga</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Mercado */}
        <div>
          <div className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Mercado
          </div>
          <div className="space-y-1">
            {MARKET_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Liga */}
        <div>
          <div className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Liga
          </div>
          <div className="space-y-1">
            {LEAGUE_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Clubes */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Clubes
            </span>
            <button
              type="button"
              onClick={() => setIsCreateClubOpen(true)}
              aria-label="Adicionar clube"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {(clubs ?? []).map((club) => {
              const active = pathname === `/clubs/${club.id}` ||
                pathname.startsWith(`/clubs/${club.id}/`);
              const initial = club.acronym[0];
              return (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {initial}
                  </div>
                  <span className="flex-1 truncate">{club.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-card p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" />
            <span>Liga Fictícia 2026</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Horário de Brasília (UTC-3)</span>
          </div>
        </div>
      </div>

      <FormDialog
        open={isCreateClubOpen}
        onOpenChange={setIsCreateClubOpen}
        title="Criar clube"
        description="O clube nasce com 300,00 em caixa e sem jogadores."
      >
        {isCreateClubOpen ? (
          <ClubForm
            onSuccess={() => {
              setIsCreateClubOpen(false);
              refetch();
            }}
          />
        ) : null}
      </FormDialog>
    </aside>
  );
}
