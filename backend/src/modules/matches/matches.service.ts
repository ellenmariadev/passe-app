import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service.js";
import type { Clube, Jogador, Prisma } from "@/generated/prisma/client.js";
import { formatBrasiliaDateTime } from "@/shared/utils/date.js";
import {
  simulateMatch,
  type MatchCondition,
  type MatchStarter,
  type SimulatedDuel,
} from "@/shared/utils/match.js";
import type { Position } from "@/shared/utils/players.js";
import { compareByName } from "@/shared/utils/names.js";
import { POSITION_ORDER } from "@/shared/utils/players.js";
import { parseClubIdQuery } from "@/shared/utils/query.js";
import { CreateMatchDto } from "./dto/create-match.dto.js";

function squadOrder(a: Jogador, b: Jogador): number {
  const byPosition =
    POSITION_ORDER[a.posicao as Position] -
    POSITION_ORDER[b.posicao as Position];
  if (byPosition !== 0) {
    return byPosition;
  }
  return compareByName(a.nome, a.id, b.nome, b.id);
}

function toMatchStarter(jogador: Jogador): MatchStarter {
  return {
    playerId: jogador.id,
    name: jogador.nome,
    position: jogador.posicao as Position,
    condition: jogador.condicao as MatchCondition,
    attributes: {
      velocidade: jogador.velocidade,
      finalizacao: jogador.finalizacao,
      passe: jogador.passe,
      drible: jogador.drible,
      defesa: jogador.defesa,
      fisico: jogador.fisico,
    },
  };
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) { }

  async play(dto: CreateMatchDto): Promise<Record<string, unknown>> {
    if (dto.home_club_id === dto.away_club_id) {
      throw new BadRequestException(
        "Mandante e visitante precisam ser clubes diferentes.",
      );
    }

    const homeClub = await this.prisma.clube.findUnique({
      where: { id: dto.home_club_id },
    });
    const awayClub = await this.prisma.clube.findUnique({
      where: { id: dto.away_club_id },
    });
    if (!homeClub || !awayClub) {
      throw new NotFoundException("Clube não encontrado.");
    }

    const homeStarters = await this.loadStarters(dto.home_club_id);
    const awayStarters = await this.loadStarters(dto.away_club_id);
    if (!homeStarters || !awayStarters) {
      throw new ConflictException(
        "Os dois clubes precisam de escalação completa.",
      );
    }

    const simulated = simulateMatch(
      { clubId: dto.home_club_id, starters: homeStarters },
      { clubId: dto.away_club_id, starters: awayStarters },
    );

    const playedAt = new Date();

    const partida = await this.prisma.$transaction(async (tx) => {
      const created = await tx.partida.create({
        data: {
          mandanteId: dto.home_club_id,
          visitanteId: dto.away_club_id,
          golsMandante: simulated.homeGoals,
          golsVisitante: simulated.awayGoals,
          formacaoMandante: homeClub.formacao as string,
          formacaoVisitante: awayClub.formacao as string,
          jogadaEm: playedAt,
        },
      });

      await tx.dueloPartida.createMany({
        data: simulated.duels.map((duel) => ({
          partidaId: created.id,
          ordem: duel.order,
          clubeAtacanteId: duel.attackingClubId,
          atacanteId: duel.attacker.playerId,
          defensorId: duel.defender.playerId,
          nomeAtacante: duel.attacker.name,
          nomeDefensor: duel.defender.name,
          posicaoAtacante: duel.attacker.position,
          posicaoDefensor: duel.defender.position,
          condicaoAtacante: duel.attacker.condition,
          condicaoDefensor: duel.defender.condition,
          atributoAtaque: duel.attacker.attribute,
          atributoDefesa: duel.defender.attribute,
          valorAtaque: duel.attacker.value,
          valorDefesa: duel.defender.value,
          gol: duel.goal,
        })),
      });

      return created;
    });

    return this.buildMatchResponse(
      partida,
      homeClub,
      awayClub,
      simulated.duels,
    );
  }

  async findAll(
    raw: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const clubId = parseClubIdQuery(raw.club_id);
    if (clubId !== null) {
      const clube = await this.prisma.clube.findUnique({
        where: { id: clubId },
      });
      if (!clube) {
        throw new NotFoundException("Clube não encontrado.");
      }
    }

    const where: Prisma.PartidaWhereInput =
      clubId !== null
        ? { OR: [{ mandanteId: clubId }, { visitanteId: clubId }] }
        : {};

    const partidas = await this.prisma.partida.findMany({
      where,
      include: { mandante: true, visitante: true },
      orderBy: [{ jogadaEm: "desc" }, { id: "desc" }],
    });

    return partidas.map((partida) =>
      this.buildMatchResponse(partida, partida.mandante, partida.visitante, []),
    );
  }

  async findOne(id: number): Promise<Record<string, unknown>> {
    const partida = await this.prisma.partida.findUnique({
      where: { id },
      include: {
        mandante: true,
        visitante: true,
        duelos: { orderBy: { ordem: "asc" } },
      },
    });
    if (!partida) {
      throw new NotFoundException("Partida não encontrada.");
    }

    const duels = partida.duelos.map(toDuelDto);
    return this.buildMatchResponse(
      partida,
      partida.mandante,
      partida.visitante,
      duels,
    );
  }

  async standings(): Promise<Record<string, unknown>[]> {
    const clubes = await this.prisma.clube.findMany();
    const partidas = await this.prisma.partida.findMany();

    const stats = new Map<number, Record<string, number>>();
    for (const clube of clubes) {
      stats.set(clube.id, {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
      });
    }

    for (const partida of partidas) {
      const home = stats.get(partida.mandanteId) as Record<string, number>;
      const away = stats.get(partida.visitanteId) as Record<string, number>;

      home.played += 1;
      away.played += 1;
      home.goals_for += partida.golsMandante;
      home.goals_against += partida.golsVisitante;
      away.goals_for += partida.golsVisitante;
      away.goals_against += partida.golsMandante;

      if (partida.golsMandante > partida.golsVisitante) {
        home.wins += 1;
        away.losses += 1;
      } else if (partida.golsMandante < partida.golsVisitante) {
        away.wins += 1;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
      }
    }

    const rows = clubes.map((clube) => {
      const s = stats.get(clube.id) as Record<string, number>;
      const points = s.wins * 3 + s.draws;
      return {
        club_id: clube.id,
        club_name: clube.nome,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goals_for: s.goals_for,
        goals_against: s.goals_against,
        goal_difference: s.goals_for - s.goals_against,
        points,
      };
    });

    rows.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      if (a.goal_difference !== b.goal_difference) {
        return b.goal_difference - a.goal_difference;
      }
      if (a.goals_for !== b.goals_for) {
        return b.goals_for - a.goals_for;
      }
      return compareByName(a.club_name, a.club_id, b.club_name, b.club_id);
    });

    return rows.map((row, index) => ({ position: index + 1, ...row }));
  }

  private async loadStarters(clubId: number): Promise<MatchStarter[] | null> {
    const clube = await this.prisma.clube.findUnique({ where: { id: clubId } });
    if (!clube || clube.formacao === null) {
      return null;
    }

    const escalacoes = await this.prisma.escalacao.findMany({
      where: { clubeId: clubId },
      include: { jogador: true },
    });

    const players = escalacoes
      .filter((escalacao) => escalacao.jogador.excluidoEm === null)
      .map((escalacao) => escalacao.jogador)
      .sort(squadOrder);

    if (players.length !== 5) {
      return null;
    }

    return players.map(toMatchStarter);
  }

  private buildMatchResponse(
    partida: {
      id: number;
      mandanteId: number;
      visitanteId: number;
      golsMandante: number;
      golsVisitante: number;
      formacaoMandante: string;
      formacaoVisitante: string;
      jogadaEm: Date;
    },
    homeClub: Clube,
    awayClub: Clube,
    duels: SimulatedDuel[],
  ): Record<string, unknown> {
    const result =
      partida.golsMandante > partida.golsVisitante
        ? "MANDANTE"
        : partida.golsMandante < partida.golsVisitante
          ? "VISITANTE"
          : "EMPATE";

    const response: Record<string, unknown> = {
      id: partida.id,
      played_at: formatBrasiliaDateTime(partida.jogadaEm),
      home: {
        club_id: homeClub.id,
        club_name: homeClub.nome,
        formation: partida.formacaoMandante,
        goals: partida.golsMandante,
      },
      away: {
        club_id: awayClub.id,
        club_name: awayClub.nome,
        formation: partida.formacaoVisitante,
        goals: partida.golsVisitante,
      },
      result,
    };

    if (duels.length > 0) {
      response.duels = duels;
    }

    return response;
  }
}

function toDuelDto(duel: {
  ordem: number;
  clubeAtacanteId: number;
  atacanteId: number;
  defensorId: number;
  nomeAtacante: string;
  nomeDefensor: string;
  posicaoAtacante: string;
  posicaoDefensor: string;
  condicaoAtacante: string;
  condicaoDefensor: string;
  atributoAtaque: string;
  atributoDefesa: string;
  valorAtaque: number;
  valorDefesa: number;
  gol: boolean;
}): SimulatedDuel {
  return {
    order: duel.ordem,
    attackingClubId: duel.clubeAtacanteId,
    attacker: {
      playerId: duel.atacanteId,
      name: duel.nomeAtacante,
      position: duel.posicaoAtacante as Position,
      condition: duel.condicaoAtacante as MatchCondition,
      attribute: duel.atributoAtaque,
      value: duel.valorAtaque,
    },
    defender: {
      playerId: duel.defensorId,
      name: duel.nomeDefensor,
      position: duel.posicaoDefensor as Position,
      condition: duel.condicaoDefensor as MatchCondition,
      attribute: duel.atributoDefesa,
      value: duel.valorDefesa,
    },
    goal: duel.gol,
  };
}
