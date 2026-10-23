import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { API_BASE } from "@/shared/config/constants.js";
import { ParseIdPipe } from "@/shared/pipes/id.pipe.js";
import { CreateMatchDto } from "./dto/create-match.dto.js";
import { MatchesService } from "./matches.service.js";

@ApiTags("matches")
@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Post()
  @ApiOperation({ summary: "Joga uma partida e grava o resultado (RN20)" })
  @ApiResponse({ status: 201 })
  async create(
    @Body() dto: CreateMatchDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const match = await this.matchesService.play(dto);
    res.setHeader("Location", `${API_BASE}/matches/${match.id}`);
    return match;
  }

  @Get()
  @ApiOperation({ summary: "Histórico de partidas (RN21)" })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query() raw: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    return this.matchesService.findAll(raw);
  }

  @Get(":id")
  @ApiOperation({ summary: "Partida com os 6 duelos (RN21)" })
  @ApiResponse({ status: 200 })
  async findOne(
    @Param("id", ParseIdPipe) id: number,
  ): Promise<Record<string, unknown>> {
    return this.matchesService.findOne(id);
  }
}

@ApiTags("standings")
@Controller("standings")
export class StandingsController {
  constructor(private readonly matchesService: MatchesService) { }

  @Get()
  @ApiOperation({ summary: "Classificação de todos os clubes (RN21)" })
  @ApiResponse({ status: 200 })
  async standings(): Promise<Record<string, unknown>[]> {
    return this.matchesService.standings();
  }
}
