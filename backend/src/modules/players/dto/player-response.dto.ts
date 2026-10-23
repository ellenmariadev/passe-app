import { ApiProperty } from "@nestjs/swagger";
import type { Jogador } from "@/generated/prisma/client.js";
import {
  calculateMarketValue,
  calculateOverall,
} from "@/shared/utils/players.js";
import type { Position } from "@/shared/utils/players.js";

export class PlayerResponseDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: "Meia Lua" })
  name: string;

  @ApiProperty({ example: "MEI" })
  position: string;

  @ApiProperty({ example: 85 })
  agility: number;

  @ApiProperty({ example: 25 })
  age: number;

  @ApiProperty({ example: "MAL_CONDICIONADO" })
  condition: string;

  @ApiProperty({ example: 40.0 })
  base_value: number;

  @ApiProperty({ example: 37.0 })
  market_value: number;

  @ApiProperty({ example: 70 })
  pace: number;

  @ApiProperty({ example: 68 })
  shooting: number;

  @ApiProperty({ example: 82 })
  passing: number;

  @ApiProperty({ example: 79 })
  dribbling: number;

  @ApiProperty({ example: 55 })
  defending: number;

  @ApiProperty({ example: 64 })
  physical: number;

  @ApiProperty({ example: 86 })
  potential: number;

  @ApiProperty({ example: 75 })
  overall: number;

  @ApiProperty({ example: null, nullable: true })
  club_id: number | null;
}

export function toPlayerResponseDto(jogador: Jogador): PlayerResponseDto {
  const attributes = {
    velocidade: jogador.velocidade,
    finalizacao: jogador.finalizacao,
    passe: jogador.passe,
    drible: jogador.drible,
    defesa: jogador.defesa,
    fisico: jogador.fisico,
  };

  const baseValue = Number(jogador.valorBase);

  return {
    id: jogador.id,
    name: jogador.nome,
    position: jogador.posicao,
    agility: jogador.agilidade,
    age: jogador.idade,
    condition: jogador.condicao,
    base_value: baseValue,
    market_value: calculateMarketValue({
      baseValue,
      condition: jogador.condicao,
      agility: jogador.agilidade,
      age: jogador.idade,
    }),
    pace: jogador.velocidade,
    shooting: jogador.finalizacao,
    passing: jogador.passe,
    dribbling: jogador.drible,
    defending: jogador.defesa,
    physical: jogador.fisico,
    potential: jogador.potencial,
    overall: calculateOverall(jogador.posicao as Position, attributes),
    club_id: jogador.clubeId,
  };
}
