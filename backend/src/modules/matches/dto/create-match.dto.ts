import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class CreateMatchDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  home_club_id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  away_club_id: number;
}
