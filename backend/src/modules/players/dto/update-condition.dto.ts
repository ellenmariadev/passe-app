import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export enum PlayerCondition {
  APTO = "APTO",
  MAL_CONDICIONADO = "MAL_CONDICIONADO",
  DOENTE = "DOENTE",
}

export class UpdateConditionDto {
  @ApiProperty({ enum: PlayerCondition, example: "MAL_CONDICIONADO" })
  @IsEnum(PlayerCondition)
  condition: PlayerCondition;
}
