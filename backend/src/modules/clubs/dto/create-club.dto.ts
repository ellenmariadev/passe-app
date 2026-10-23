import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { collapseSpaces } from "@/shared/utils/names.js";
import { IsAcronym, IsClubName } from "@/shared/decorators/decorators.js";

export class CreateClubDto {
  @ApiProperty({ example: "Águias FC" })
  @Transform(({ value }) =>
    typeof value === "string" ? collapseSpaces(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @IsClubName()
  name: string;

  @ApiProperty({ example: "AGU" })
  @IsString()
  @IsNotEmpty()
  @IsAcronym()
  acronym: string;
}
