import { Module } from "@nestjs/common";
import { PrismaModule } from "@/database/prisma.module.js";
import {
  MatchesController,
  StandingsController,
} from "./matches.controller.js";
import { MatchesService } from "./matches.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [MatchesController, StandingsController],
  providers: [MatchesService],
})
export class MatchesModule {}
