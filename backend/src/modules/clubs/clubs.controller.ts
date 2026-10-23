import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { API_BASE } from "@/shared/config/constants.js";
import { ParseIdPipe } from "@/shared/pipes/id.pipe.js";
import { parseClubSort } from "@/shared/utils/query.js";
import { CreateClubDto } from "./dto/create-club.dto.js";
import { UpdateLineupDto } from "./dto/update-lineup.dto.js";
import { ClubsService } from "./clubs.service.js";

@ApiTags("clubs")
@Controller("clubs")
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) { }

  @Post()
  @ApiOperation({ summary: "Cria um clube (RN10)" })
  @ApiResponse({ status: 201 })
  async create(
    @Body() createClubDto: CreateClubDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const club = await this.clubsService.create(createClubDto);
    res.setHeader("Location", `${API_BASE}/clubs/${club.id}`);
    return club;
  }

  @Get()
  @ApiOperation({
    summary: "Lista clubes, ordenando por nome ou patrimônio (RN11)",
  })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query("sort") sort?: string,
  ): Promise<Record<string, unknown>[]> {
    return this.clubsService.findAll(parseClubSort(sort));
  }

  @Get(":id")
  @ApiOperation({
    summary: "Consulta um clube com o elenco e contratos (RN11)",
  })
  @ApiResponse({ status: 200 })
  async findOne(
    @Param("id", ParseIdPipe) id: number,
  ): Promise<Record<string, unknown>> {
    return this.clubsService.findOne(id);
  }

  @Put(":id/lineup")
  @ApiOperation({ summary: "Escala os 5 titulares do clube (RN19)" })
  @ApiResponse({ status: 200 })
  async setLineup(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: UpdateLineupDto,
  ): Promise<Record<string, unknown>> {
    return this.clubsService.setLineup(id, dto);
  }

  @Get(":id/lineup")
  @ApiOperation({ summary: "Consulta a escalação atual do clube (RN19)" })
  @ApiResponse({ status: 200 })
  async getLineup(
    @Param("id", ParseIdPipe) id: number,
  ): Promise<Record<string, unknown>> {
    return this.clubsService.getLineup(id);
  }

  @Get(":id/transactions")
  @ApiOperation({
    summary: "Histórico de transações do clube, com summary (RN17)",
  })
  @ApiResponse({ status: 200 })
  async transactions(
    @Param("id", ParseIdPipe) id: number,
    @Query() raw: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.clubsService.transactions(id, raw);
  }

  @Get(":id/transactions/export")
  @ApiOperation({ summary: "Exporta o histórico de transações em CSV (RN18)" })
  @ApiResponse({ status: 200 })
  async exportTransactions(
    @Param("id", ParseIdPipe) id: number,
    @Query() raw: Record<string, unknown>,
    @Res() res: Response,
  ): Promise<void> {
    const csv = await this.clubsService.exportTransactions(id, raw);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.send(csv);
  }
}
