import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { collapseSpaces } from "@/shared/utils/names.js";
import { IsPlayerName } from "@/shared/decorators/decorators.js";

export enum PlayerPosition {
  GOL = "GOL",
  ZAG = "ZAG",
  LAT = "LAT",
  MEI = "MEI",
  ATA = "ATA",
}

export class CreatePlayerDto {
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

  @ApiProperty({ example: 70 })
  @IsInt()
  @Min(1)
  @Max(99)
  pace: number;

  @ApiProperty({ example: 68 })
  @IsInt()
  @Min(1)
  @Max(99)
  shooting: number;

  @ApiProperty({ example: 82 })
  @IsInt()
  @Min(1)
  @Max(99)
  passing: number;

  @ApiProperty({ example: 79 })
  @IsInt()
  @Min(1)
  @Max(99)
  dribbling: number;

  @ApiProperty({ example: 55 })
  @IsInt()
  @Min(1)
  @Max(99)
  defending: number;

  @ApiProperty({ example: 64 })
  @IsInt()
  @Min(1)
  @Max(99)
  physical: number;

  @ApiProperty({ example: 86 })
  @IsInt()
  @Min(1)
  @Max(99)
  potential: number;
}
