import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { collapseSpaces } from "@/shared/utils/names.js";
import { IsPlayerName } from "@/shared/decorators/decorators.js";
import { PlayerPosition } from "./create-player.dto.js";

export class UpdatePlayerDto {
  @ApiProperty({ example: "Meia Lua" })
  @Transform(({ value }) =>
    typeof value === "string" ? collapseSpaces(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @IsPlayerName()
  name: string;

  @ApiProperty({ enum: PlayerPosition, example: "MEI" })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(1)
  @Max(100)
  agility: number;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(16)
  @Max(45)
  age: number;
}
