import { Module } from "@nestjs/common";
import { PrismaModule } from "@/database/prisma.module.js";
import { MarketController } from "./market.controller.js";
import { MarketService } from "./market.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
