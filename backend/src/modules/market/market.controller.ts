import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ParseIdPipe } from "@/shared/pipes/id.pipe.js";
import { BuyPlayerDto } from "./dto/buy-player.dto.js";
import { MarketService } from "./market.service.js";

@ApiTags("market")
@Controller("players")
export class MarketController {
  constructor(private readonly marketService: MarketService) { }

  @Post(":id/buy")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Compra um jogador livre (RN12 a RN14)" })
  @ApiResponse({ status: 200 })
  async buy(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<Record<string, unknown>> {
    return this.marketService.buy(id, dto);
  }

  @Post(":id/sell")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Vende um jogador do elenco (RN15 e RN16)" })
  @ApiResponse({ status: 200 })
  async sell(
    @Param("id", ParseIdPipe) id: number,
  ): Promise<Record<string, unknown>> {
    return this.marketService.sell(id);
  }
}
