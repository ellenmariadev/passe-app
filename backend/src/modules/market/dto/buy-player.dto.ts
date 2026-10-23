import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";
import { IsBrasiliaDateTime } from "@/shared/decorators/decorators.js";

export class BuyPlayerDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  club_id: number;

  @ApiProperty({ example: "2027-03-02T10:15-03:00" })
  @IsBrasiliaDateTime()
  loyalty_until: string;
}
