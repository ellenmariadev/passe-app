import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service.js";
import type { Jogador, Prisma } from "@/generated/prisma/client.js";
import {
  calculateBaseValue,
  POSITION_ORDER,
  type Position,
} from "@/shared/utils/players.js";
import {
  compareByName,
  normalizeForSort,
} from "@/shared/utils/names.js";
import { CreatePlayerDto } from "./dto/create-player.dto.js";
import { UpdatePlayerDto } from "./dto/update-player.dto.js";
import {
  PlayerResponseDto,
  toPlayerResponseDto,
} from "./dto/player-response.dto.js";

export interface ListPlayersQuery {
  search: string | null;
  position: string | null;
  condition: string | null;
  free: boolean | null;
  clubId: number | null;
  minAge: number | null;
  maxAge: number | null;
  minValue: number | null;
  maxValue: number | null;
  sort: string[];
  page: number;
  limit: number;
}

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreatePlayerDto): Promise<PlayerResponseDto> {
    const attributes = {
      velocidade: dto.pace,
      finalizacao: dto.shooting,
      passe: dto.passing,
      drible: dto.dribbling,
      defesa: dto.defending,
      fisico: dto.physical,
    };

    const attrSum =
      dto.pace +
      dto.shooting +
      dto.passing +
      dto.dribbling +
      dto.defending +
      dto.physical;
    if (attrSum > 480) {
      throw new BadRequestException(
        "A soma dos seis atributos não pode passar de 480.",
      );
    }

    const maxAttr = Math.max(
      dto.pace,
      dto.shooting,
      dto.passing,
      dto.dribbling,
      dto.defending,
      dto.physical,
    );
    if (dto.potential < maxAttr) {
      throw new BadRequestException(
        "O potencial deve ser maior ou igual ao maior dos seis atributos.",
      );
    }

    if (dto.age >= 33 && dto.potential !== maxAttr) {
      throw new BadRequestException(
        "Para jogadores com 33 anos ou mais, o potencial deve ser igual ao maior atributo.",
      );
    }

    if (dto.age >= 35 && dto.agility > 85) {
      throw new BadRequestException(
        "Jogadores com 35 anos ou mais podem ter no máximo 85 de agilidade.",
      );
    }

    const baseValue = calculateBaseValue(
      dto.position,
      attributes,
      dto.potential,
      dto.age,
    );

    const jogador = await this.prisma.jogador.create({
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
        velocidade: dto.pace,
        finalizacao: dto.shooting,
        passe: dto.passing,
        drible: dto.dribbling,
        defesa: dto.defending,
        fisico: dto.physical,
        potencial: dto.potential,
        valorBase: baseValue,
        condicao: "APTO",
      },
    });

    return toPlayerResponseDto(jogador);
  }

  async findAll(
    query: ListPlayersQuery,
  ): Promise<{ data: PlayerResponseDto[]; meta: Record<string, number> }> {
    const where: Prisma.JogadorWhereInput = { excluidoEm: null };
    if (query.position) {
      where.posicao = query.position;
    }
    if (query.condition) {
      where.condicao = query.condition;
    }
    if (query.clubId !== null) {
      where.clubeId = query.clubId;
    } else if (query.free === true) {
      where.clubeId = null;
    } else if (query.free === false) {
      where.clubeId = { not: null };
    }
    if (query.minAge !== null || query.maxAge !== null) {
      where.idade = {
        ...(query.minAge !== null ? { gte: query.minAge } : {}),
        ...(query.maxAge !== null ? { lte: query.maxAge } : {}),
      };
    }

    const jogadores = await this.prisma.jogador.findMany({ where });
    let items = jogadores.map(toPlayerResponseDto);

    if (query.search !== null) {
      const needle = normalizeForSort(query.search);
      items = items.filter((player) =>
        normalizeForSort(player.name).includes(needle),
      );
    }

    if (query.minValue !== null || query.maxValue !== null) {
      items = items.filter((player) => {
        if (query.minValue !== null && player.market_value < query.minValue) {
          return false;
        }
        if (query.maxValue !== null && player.market_value > query.maxValue) {
          return false;
        }
        return true;
      });
    }

    items.sort((a, b) => comparePlayers(a, b, query.sort));

    const totalItems = items.length;
    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / query.limit);
    const start = (query.page - 1) * query.limit;
    const pageItems = items.slice(start, start + query.limit);

    return {
      data: pageItems,
      meta: {
        page: query.page,
        limit: query.limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async findOne(id: number): Promise<PlayerResponseDto> {
    const jogador = await this.findActiveOrThrow(id);
    return toPlayerResponseDto(jogador);
  }

  async update(id: number, dto: UpdatePlayerDto): Promise<PlayerResponseDto> {
    const jogador = await this.findActiveOrThrow(id);

    if (jogador.clubeId !== null && dto.position !== jogador.posicao) {
      throw new ConflictException(
        "Jogador com clube não pode mudar de posição.",
      );
    }

    if (dto.age < jogador.idade) {
      throw new ConflictException("A idade do jogador não pode diminuir.");
    }

    if (dto.age >= 35 && dto.agility > 85) {
      throw new BadRequestException(
        "Jogadores com 35 anos ou mais podem ter no máximo 85 de agilidade.",
      );
    }

    const updated = await this.prisma.jogador.update({
      where: { id },
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
      },
    });

    return toPlayerResponseDto(updated);
  }

  async updateCondition(
    id: number,
    condition: string,
  ): Promise<PlayerResponseDto> {
    const jogador = await this.findActiveOrThrow(id);

    if (jogador.condicao === condition) {
      return toPlayerResponseDto(jogador);
    }

    if (jogador.condicao === "DOENTE" && condition === "APTO") {
      throw new ConflictException(
        "Jogador DOENTE não pode passar direto para APTO.",
      );
    }

    if (condition === "DOENTE") {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.escalacao.deleteMany({ where: { jogadorId: id } });
        return tx.jogador.update({
          where: { id },
          data: { condicao: condition },
        });
      });
      return toPlayerResponseDto(updated);
    }

    const updated = await this.prisma.jogador.update({
      where: { id },
      data: { condicao: condition },
    });

    return toPlayerResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    const jogador = await this.findActiveOrThrow(id);

    if (jogador.clubeId !== null) {
      throw new ConflictException(
        "Jogador pertencente a um clube não pode ser excluído.",
      );
    }

    await this.prisma.jogador.update({
      where: { id },
      data: { excluidoEm: new Date() },
    });
  }

  private async findActiveOrThrow(id: number): Promise<Jogador> {
    const jogador = await this.prisma.jogador.findFirst({
      where: { id, excluidoEm: null },
    });
    if (!jogador) {
      throw new NotFoundException("Jogador não encontrado.");
    }
    return jogador;
  }
}

function compareByField(
  a: PlayerResponseDto,
  b: PlayerResponseDto,
  field: string,
): number {
  switch (field) {
    case "name":
      return compareByName(a.name, a.id, b.name, b.id);
    case "value_asc":
      return a.market_value - b.market_value;
    case "value_desc":
      return b.market_value - a.market_value;
    case "age_asc":
      return a.age - b.age;
    case "age_desc":
      return b.age - a.age;
    case "position":
      return (
        POSITION_ORDER[a.position as Position] -
        POSITION_ORDER[b.position as Position]
      );
    default:
      return 0;
  }
}

function comparePlayers(
  a: PlayerResponseDto,
  b: PlayerResponseDto,
  sortFields: string[],
): number {
  for (const field of sortFields) {
    const result = compareByField(a, b, field);
    if (result !== 0) {
      return result;
    }
  }
  return compareByName(a.name, a.id, b.name, b.id);
}
