import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { API_BASE } from "@/shared/config/constants.js";
import { ParseIdPipe } from "@/shared/pipes/id.pipe.js";
import {
  parseAge,
  parseClubIdQuery,
  parseCondition,
  parseFree,
  parseLimit,
  parseMoneyFilter,
  parsePage,
  parsePlayerSort,
  parsePosition,
  parseSearch,
} from "@/shared/utils/query.js";
import { CreatePlayerDto } from "./dto/create-player.dto.js";
import { UpdateConditionDto } from "./dto/update-condition.dto.js";
import { UpdatePlayerDto } from "./dto/update-player.dto.js";
import { PlayerResponseDto } from "./dto/player-response.dto.js";
import { ListPlayersQuery, PlayersService } from "./players.service.js";

@ApiTags("players")
@Controller("players")
export class PlayersController {
  constructor(private readonly playersService: PlayersService) { }

  @Post()
  @ApiOperation({ summary: "Cadastra um jogador (RN06)" })
  @ApiResponse({ status: 201, type: PlayerResponseDto })
  async create(
    @Body() createPlayerDto: CreatePlayerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PlayerResponseDto> {
    const player = await this.playersService.create(createPlayerDto);
    res.setHeader("Location", `${API_BASE}/players/${player.id}`);
    return player;
  }

  @Get()
  @ApiOperation({
    summary: "Lista jogadores com busca, filtros e paginação (RN07)",
  })
  @ApiResponse({ status: 200 })
  async findAll(@Query() raw: Record<string, unknown>) {
    const query: ListPlayersQuery = this.parseListQuery(raw);
    return this.playersService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Consulta um jogador por id (RN02 a RN06)" })
  @ApiResponse({ status: 200, type: PlayerResponseDto })
  async findOne(
    @Param("id", ParseIdPipe) id: number,
  ): Promise<PlayerResponseDto> {
    return this.playersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Edita nome, posição, agilidade e idade (RN08)" })
  @ApiResponse({ status: 200, type: PlayerResponseDto })
  async update(
    @Param("id", ParseIdPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Patch(":id/condition")
  @ApiOperation({ summary: "Altera a condição física (RN02, RN03, RN19)" })
  @ApiResponse({ status: 200, type: PlayerResponseDto })
  async updateCondition(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: UpdateConditionDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.updateCondition(id, dto.condition);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Exclusão lógica de jogador livre (RN09)" })
  @ApiResponse({ status: 204 })
  async remove(@Param("id", ParseIdPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }

  private parseListQuery(raw: Record<string, unknown>): ListPlayersQuery {
    const clubId = parseClubIdQuery(raw.club_id);
    const free = parseFree(raw.free);
    if (clubId !== null && free === true) {
      throw new BadRequestException(
        "O filtro free=true não pode ser combinado com club_id.",
      );
    }

    const minAge = parseAge(raw.min_age, "min_age");
    const maxAge = parseAge(raw.max_age, "max_age");
    if (minAge !== null && maxAge !== null && minAge > maxAge) {
      throw new BadRequestException("min_age não pode ser maior que max_age.");
    }

    const minValue = parseMoneyFilter(raw.min_value, "min_value");
    const maxValue = parseMoneyFilter(raw.max_value, "max_value");
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      throw new BadRequestException(
        "min_value não pode ser maior que max_value.",
      );
    }

    return {
      search: parseSearch(raw.search),
      position: parsePosition(raw.position),
      condition: parseCondition(raw.condition),
      free,
      clubId,
      minAge,
      maxAge,
      minValue,
      maxValue,
      sort: parsePlayerSort(raw.sort),
      page: parsePage(raw.page),
      limit: parseLimit(raw.limit),
    };
  }
}
