import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service.js";
import type { Jogador } from "@/generated/prisma/client.js";
import {
  formatBrasiliaDateTime,
  parseBrasiliaDateTime,
} from "@/shared/utils/date.js";
import { round2 } from "@/shared/utils/round.js";
import { marketValueOf } from "@/shared/utils/jogador-value.js";
import {
  calculateCommission,
  calculatePenalty,
  calculatePenaltyRate,
  calculatePurchaseFee,
  calculateRemainingDays,
} from "@/shared/utils/fees.js";
import {
  MAX_LOYALTY_DAYS,
  MAX_SQUAD_SIZE,
  PURCHASE_LIMIT_RATIO,
} from "@/shared/config/constants.js";
import { BuyPlayerDto } from "./dto/buy-player.dto.js";

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) { }

  async buy(
    playerId: number,
    dto: BuyPlayerDto,
  ): Promise<Record<string, unknown>> {
    const loyaltyUntil = parseBrasiliaDateTime(dto.loyalty_until) as Date;
    const now = new Date();

    if (loyaltyUntil.getTime() <= now.getTime()) {
      throw new BadRequestException(
        "O fim da fidelidade precisa ser uma data futura.",
      );
    }
    const maxUntil = new Date(
      now.getTime() + MAX_LOYALTY_DAYS * 24 * 60 * 60 * 1000,
    );
    if (loyaltyUntil.getTime() > maxUntil.getTime()) {
      throw new BadRequestException(
        "O fim da fidelidade não pode passar de 1.095 dias.",
      );
    }

    const jogador = await this.findActivePlayerOrThrow(playerId);
    const clube = await this.prisma.clube.findUnique({
      where: { id: dto.club_id },
    });
    if (!clube) {
      throw new NotFoundException("Clube não encontrado.");
    }

    if (jogador.clubeId !== null) {
      throw new ConflictException("O jogador não está livre.");
    }

    const squadCount = await this.prisma.jogador.count({
      where: { clubeId: dto.club_id, excluidoEm: null },
    });
    if (squadCount >= MAX_SQUAD_SIZE) {
      throw new ConflictException(
        "O clube já atingiu o limite de 12 jogadores.",
      );
    }

    const marketValue = marketValueOf(jogador);
    const fee = calculatePurchaseFee(marketValue);
    const cost = round2(marketValue + fee);

    const cash = Number(clube.caixa);
    const limit = cash * PURCHASE_LIMIT_RATIO;
    if (cost > limit) {
      throw new ConflictException(
        `O custo da compra (${cost.toFixed(2)}) passa do limite de 50% do caixa (${limit.toFixed(2)}).`,
      );
    }

    const hasSold = await this.prisma.transacao.findFirst({
      where: { clubeId: dto.club_id, jogadorId: playerId, tipo: "VENDA" },
    });
    if (hasSold) {
      throw new ConflictException(
        "O clube não pode recomprar um jogador que ele mesmo vendeu.",
      );
    }

    const cashChange = round2(-(marketValue + fee));
    const newCash = round2(cash - cost);

    const transaction = await this.prisma.$transaction(async (tx) => {
      await tx.jogador.update({
        where: { id: playerId },
        data: { clubeId: dto.club_id },
      });
      await tx.clube.update({
        where: { id: dto.club_id },
        data: { caixa: newCash },
      });
      await tx.contrato.create({
        data: {
          jogadorId: playerId,
          clubeId: dto.club_id,
          valorCompra: marketValue,
          fidelidadeAte: loyaltyUntil,
          situacao: "ATIVO",
          iniciadoEm: now,
        },
      });
      return tx.transacao.create({
        data: {
          clubeId: dto.club_id,
          jogadorId: playerId,
          nomeJogador: jogador.nome,
          tipo: "COMPRA",
          valor: marketValue,
          taxa: fee,
          multa: 0,
          lucro: null,
          variacaoCaixa: cashChange,
          criadoEm: now,
        },
      });
    });

    return {
      id: transaction.id,
      club_id: transaction.clubeId,
      player_id: transaction.jogadorId,
      player_name: transaction.nomeJogador,
      type: "COMPRA",
      value: Number(transaction.valor),
      fee: Number(transaction.taxa),
      penalty: Number(transaction.multa),
      profit: null,
      cash_change: Number(transaction.variacaoCaixa),
      created_at: formatBrasiliaDateTime(transaction.criadoEm),
      contract: {
        purchase_value: Number(transaction.valor),
        loyalty_until: formatBrasiliaDateTime(loyaltyUntil),
        status: "ATIVO",
      },
      club_cash: newCash,
    };
  }

  async sell(playerId: number): Promise<Record<string, unknown>> {
    const jogador = await this.findActivePlayerOrThrow(playerId);

    if (jogador.clubeId === null) {
      throw new ConflictException("Jogador livre não pode ser vendido.");
    }

    const clube = await this.prisma.clube.findUnique({
      where: { id: jogador.clubeId },
    });
    if (!clube) {
      throw new NotFoundException("Clube não encontrado.");
    }

    const contrato = await this.prisma.contrato.findFirst({
      where: { jogadorId: playerId, situacao: "ATIVO" },
    });
    if (!contrato) {
      throw new NotFoundException("Contrato ativo não encontrado.");
    }

    const now = new Date();
    const marketValue = marketValueOf(jogador);
    const purchaseValue = Number(contrato.valorCompra);
    const remainingDays = calculateRemainingDays(contrato.fidelidadeAte, now);
    const penaltyRate = calculatePenaltyRate(remainingDays);
    const penalty = calculatePenalty(marketValue, remainingDays);
    const profit = round2(marketValue - purchaseValue);
    const commission = calculateCommission(profit);
    const cashChange = round2(marketValue - penalty - commission);
    const newCash = round2(Number(clube.caixa) + cashChange);
    const contractStatus = penalty > 0 ? "RESCINDIDO" : "ENCERRADO";

    const transaction = await this.prisma.$transaction(async (tx) => {
      await tx.jogador.update({
        where: { id: playerId },
        data: { clubeId: null },
      });
      await tx.clube.update({
        where: { id: clube.id },
        data: { caixa: newCash },
      });
      await tx.contrato.update({
        where: { id: contrato.id },
        data: { situacao: contractStatus, encerradoEm: now },
      });
      await tx.escalacao.deleteMany({ where: { jogadorId: playerId } });
      return tx.transacao.create({
        data: {
          clubeId: clube.id,
          jogadorId: playerId,
          nomeJogador: jogador.nome,
          tipo: "VENDA",
          valor: marketValue,
          taxa: commission,
          multa: penalty,
          lucro: profit,
          variacaoCaixa: cashChange,
          criadoEm: now,
        },
      });
    });

    return {
      id: transaction.id,
      club_id: transaction.clubeId,
      player_id: transaction.jogadorId,
      player_name: transaction.nomeJogador,
      type: "VENDA",
      value: Number(transaction.valor),
      fee: Number(transaction.taxa),
      penalty: Number(transaction.multa),
      profit: Number(transaction.lucro),
      cash_change: Number(transaction.variacaoCaixa),
      created_at: formatBrasiliaDateTime(transaction.criadoEm),
      purchase_value: purchaseValue,
      remaining_days: remainingDays,
      penalty_rate: penaltyRate,
      contract_status: contractStatus,
      club_cash: newCash,
    };
  }

  private async findActivePlayerOrThrow(id: number): Promise<Jogador> {
    const jogador = await this.prisma.jogador.findFirst({
      where: { id, excluidoEm: null },
    });
    if (!jogador) {
      throw new NotFoundException("Jogador não encontrado.");
    }
    return jogador;
  }
}
