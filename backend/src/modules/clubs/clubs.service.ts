import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service.js";
import type { Jogador, Prisma } from "@/generated/prisma/client.js";
import { formatBrasiliaDateTime } from "@/shared/utils/date.js";
import { round2 } from "@/shared/utils/round.js";
import { marketValueOf } from "@/shared/utils/jogador-value.js";
import {
  compareByName,
  normalizeClubNameForUniqueness,
} from "@/shared/utils/names.js";
import {
  POSITION_ORDER,
  type Position,
} from "@/shared/utils/players.js";
import {
  calculatePenaltyRate,
  calculateRemainingDays,
} from "@/shared/utils/fees.js";
import { INITIAL_CLUB_CASH, MAX_CLUBS } from "@/shared/config/constants.js";
import {
  parseTransactionTypes,
  parsePlayerIdQuery,
} from "@/shared/utils/query.js";
import { CreateClubDto } from "./dto/create-club.dto.js";
import { UpdateLineupDto } from "./dto/update-lineup.dto.js";
import { toPlayerResponseDto } from "@/modules/players/dto/player-response.dto.js";

const FORMATION_COUNTS: Record<
  string,
  { defesa: number; meio: number; ataque: number }
> = {
  "3-1": { defesa: 3, meio: 0, ataque: 1 },
  "2-2": { defesa: 2, meio: 0, ataque: 2 },
  "2-1-1": { defesa: 2, meio: 1, ataque: 1 },
  "1-2-1": { defesa: 1, meio: 2, ataque: 1 },
};

function squadOrder(a: Jogador, b: Jogador): number {
  const byPosition =
    POSITION_ORDER[a.posicao as Position] -
    POSITION_ORDER[b.posicao as Position];
  if (byPosition !== 0) {
    return byPosition;
  }
  return compareByName(a.nome, a.id, b.nome, b.id);
}

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateClubDto): Promise<Record<string, unknown>> {
    const normalizedName = normalizeClubNameForUniqueness(dto.name);

    const nameClash = await this.prisma.clube.findUnique({
      where: { nomeNormalizado: normalizedName },
    });
    if (nameClash) {
      throw new ConflictException("Já existe um clube com esse nome.");
    }

    const acronymClash = await this.prisma.clube.findUnique({
      where: { sigla: dto.acronym },
    });
    if (acronymClash) {
      throw new ConflictException("Já existe um clube com essa sigla.");
    }

    const count = await this.prisma.clube.count();
    if (count >= MAX_CLUBS) {
      throw new ConflictException("A liga já atingiu o limite de 20 clubes.");
    }

    const clube = await this.prisma.clube.create({
      data: {
        nome: dto.name,
        nomeNormalizado: normalizedName,
        sigla: dto.acronym,
        caixa: INITIAL_CLUB_CASH,
      },
    });

    return {
      id: clube.id,
      name: clube.nome,
      acronym: clube.sigla,
      cash: Number(clube.caixa),
      squad_value: 0,
      net_worth: Number(clube.caixa),
    };
  }

  async findAll(sort: string): Promise<Record<string, unknown>[]> {
    const clubes = await this.prisma.clube.findMany({
      include: { jogadores: { where: { excluidoEm: null } } },
    });

    const list = clubes.map((clube) => {
      const cash = Number(clube.caixa);
      const squadValue = round2(
        clube.jogadores.reduce((sum, j) => sum + marketValueOf(j), 0),
      );
      return {
        id: clube.id,
        name: clube.nome,
        acronym: clube.sigla,
        cash,
        squad_value: squadValue,
        net_worth: round2(cash + squadValue),
      };
    });

    list.sort((a, b) => {
      if (sort === "net_worth_asc") {
        const diff = a.net_worth - b.net_worth;
        return diff !== 0 ? diff : compareByName(a.name, a.id, b.name, b.id);
      }
      if (sort === "net_worth_desc") {
        const diff = b.net_worth - a.net_worth;
        return diff !== 0 ? diff : compareByName(a.name, a.id, b.name, b.id);
      }
      return compareByName(a.name, a.id, b.name, b.id);
    });

    return list;
  }

  async findOne(id: number): Promise<Record<string, unknown>> {
    const clube = await this.prisma.clube.findUnique({
      where: { id },
      include: { jogadores: { where: { excluidoEm: null } } },
    });
    if (!clube) {
      throw new NotFoundException("Clube não encontrado.");
    }

    const contracts = await this.prisma.contrato.findMany({
      where: { clubeId: id, situacao: "ATIVO" },
    });
    const contractByPlayer = new Map(
      contracts.map((contract) => [contract.jogadorId, contract]),
    );

    const now = new Date();
    const players = clube.jogadores
      .slice()
      .sort(squadOrder)
      .map((jogador) => {
        const dto = toPlayerResponseDto(jogador);
        const contract = contractByPlayer.get(jogador.id);
        let contractInfo = null;
        if (contract) {
          const remainingDays = calculateRemainingDays(
            contract.fidelidadeAte,
            now,
          );
          contractInfo = {
            purchase_value: Number(contract.valorCompra),
            loyalty_until: formatBrasiliaDateTime(contract.fidelidadeAte),
            remaining_days: remainingDays,
            penalty_rate: calculatePenaltyRate(remainingDays),
          };
        }
        return { ...dto, contract: contractInfo };
      });

    const cash = Number(clube.caixa);
    const squadValue = round2(
      players.reduce((sum, p) => sum + p.market_value, 0),
    );

    return {
      id: clube.id,
      name: clube.nome,
      acronym: clube.sigla,
      cash,
      squad_value: squadValue,
      net_worth: round2(cash + squadValue),
      players,
    };
  }

  async getLineup(id: number): Promise<Record<string, unknown>> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException("Clube não encontrado.");
    }

    const escalacoes = await this.prisma.escalacao.findMany({
      where: { clubeId: id },
      include: { jogador: true },
    });

    const players = escalacoes
      .filter((escalacao) => escalacao.jogador.excluidoEm === null)
      .map((escalacao) => toPlayerResponseDto(escalacao.jogador))
      .sort((a, b) => {
        const byPosition =
          POSITION_ORDER[a.position as Position] -
          POSITION_ORDER[b.position as Position];
        if (byPosition !== 0) {
          return byPosition;
        }
        return compareByName(a.name, a.id, b.name, b.id);
      });

    return {
      club_id: clube.id,
      formation: clube.formacao,
      complete: clube.formacao !== null && players.length === 5,
      players,
    };
  }

  async setLineup(
    id: number,
    dto: UpdateLineupDto,
  ): Promise<Record<string, unknown>> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException("Clube não encontrado.");
    }

    const players = await this.prisma.jogador.findMany({
      where: { id: { in: dto.player_ids }, excluidoEm: null },
    });
    const playersById = new Map(players.map((p) => [p.id, p]));

    if (players.length !== dto.player_ids.length) {
      throw new NotFoundException("Jogador não encontrado.");
    }

    const lineupPlayers = dto.player_ids.map(
      (pid) => playersById.get(pid) as Jogador,
    );

    for (const player of lineupPlayers) {
      if (player.clubeId !== id) {
        throw new ConflictException("Jogador fora do elenco do clube.");
      }
      if (player.condicao === "DOENTE") {
        throw new ConflictException("Jogador DOENTE não pode ser escalado.");
      }
    }

    const counts = FORMATION_COUNTS[dto.formation];
    const goalkeeperCount = lineupPlayers.filter(
      (p) => p.posicao === "GOL",
    ).length;
    const defesaCount = lineupPlayers.filter(
      (p) => p.posicao === "ZAG" || p.posicao === "LAT",
    ).length;
    const meioCount = lineupPlayers.filter((p) => p.posicao === "MEI").length;
    const ataqueCount = lineupPlayers.filter((p) => p.posicao === "ATA").length;

    const valid =
      goalkeeperCount === 1 &&
      defesaCount === counts.defesa &&
      meioCount === counts.meio &&
      ataqueCount === counts.ataque;

    if (!valid) {
      throw new ConflictException(
        "As posições não fecham a formação escolhida.",
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.escalacao.deleteMany({ where: { clubeId: id } });
      await tx.escalacao.createMany({
        data: dto.player_ids.map((pid) => ({ clubeId: id, jogadorId: pid })),
      });
      await tx.clube.update({
        where: { id },
        data: { formacao: dto.formation },
      });
    });

    return this.getLineup(id);
  }

  async transactions(
    id: number,
    raw: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException("Clube não encontrado.");
    }

    const types = parseTransactionTypes(raw.type);
    const playerId = parsePlayerIdQuery(raw.player_id);
    if (playerId !== null) {
      const player = await this.prisma.jogador.findFirst({
        where: { id: playerId, excluidoEm: null },
      });
      if (!player) {
        throw new NotFoundException("Jogador não encontrado.");
      }
    }

    const where: Prisma.TransacaoWhereInput = { clubeId: id };
    if (types !== null) {
      where.tipo = { in: types };
    }
    if (playerId !== null) {
      where.jogadorId = playerId;
    }

    const transacoes = await this.prisma.transacao.findMany({
      where,
      orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
    });

    return {
      data: transacoes.map(toTransactionDto),
      summary: buildSummary(transacoes),
    };
  }

  async exportTransactions(
    id: number,
    raw: Record<string, unknown>,
  ): Promise<string> {
    const result = await this.transactions(id, raw);
    return buildCsv(result.data as TransactionDto[]);
  }
}

interface TransactionDto {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: string;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

function toTransactionDto(transaction: {
  id: number;
  clubeId: number;
  jogadorId: number;
  nomeJogador: string;
  tipo: string;
  valor: unknown;
  taxa: unknown;
  multa: unknown;
  lucro: unknown;
  variacaoCaixa: unknown;
  criadoEm: Date;
}): TransactionDto {
  return {
    id: transaction.id,
    club_id: transaction.clubeId,
    player_id: transaction.jogadorId,
    player_name: transaction.nomeJogador,
    type: transaction.tipo,
    value: Number(transaction.valor),
    fee: Number(transaction.taxa),
    penalty: Number(transaction.multa),
    profit: transaction.lucro === null ? null : Number(transaction.lucro),
    cash_change: Number(transaction.variacaoCaixa),
    created_at: formatBrasiliaDateTime(transaction.criadoEm),
  };
}

function buildSummary(
  transacoes: Array<{
    tipo: string;
    valor: unknown;
    taxa: unknown;
    multa: unknown;
    lucro: unknown;
    variacaoCaixa: unknown;
  }>,
) {
  let totalSpent = 0;
  let totalReceived = 0;
  let totalFees = 0;
  let totalPenalties = 0;
  let totalProfit = 0;

  for (const t of transacoes) {
    totalFees += Number(t.taxa);
    if (t.tipo === "COMPRA") {
      totalSpent += Number(t.valor) + Number(t.taxa);
    } else {
      totalReceived += Number(t.variacaoCaixa);
      totalPenalties += Number(t.multa);
      totalProfit += t.lucro === null ? 0 : Number(t.lucro);
    }
  }

  return {
    total_spent: round2(totalSpent),
    total_received: round2(totalReceived),
    total_fees: round2(totalFees),
    total_penalties: round2(totalPenalties),
    total_profit: round2(totalProfit),
  };
}

function csvEscape(value: string): string {
  if (/[;"]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvNumber(value: number | null): string {
  if (value === null) {
    return "";
  }
  return value.toFixed(2).replace(".", ",");
}

function buildCsv(data: TransactionDto[]): string {
  const header =
    "data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa";
  const lines = data.map((t) => {
    return [
      t.created_at,
      t.type,
      csvEscape(t.player_name),
      csvNumber(t.value),
      csvNumber(t.fee),
      csvNumber(t.penalty),
      csvNumber(t.profit),
      csvNumber(t.cash_change),
    ].join(";");
  });
  return [header, ...lines].join("\n") + "\n";
}
