import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Min,
} from "class-validator";

export const FORMATIONS = ["3-1", "2-2", "2-1-1", "1-2-1"] as const;

export class UpdateLineupDto {
  @ApiProperty({ enum: FORMATIONS, example: "2-1-1" })
  @IsIn(FORMATIONS)
  formation: string;

  @ApiProperty({ example: [34, 31, 30, 33, 32] })
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  player_ids: number[];
}
