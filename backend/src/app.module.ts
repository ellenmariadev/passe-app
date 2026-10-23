import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./database/prisma.module.js";
import { PlayersModule } from "./modules/players/players.module.js";
import { MarketModule } from "./modules/market/market.module.js";
import { ClubsModule } from "./modules/clubs/clubs.module.js";
import { MatchesModule } from "./modules/matches/matches.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PlayersModule,
    MarketModule,
    ClubsModule,
    MatchesModule,
  ],
})
export class AppModule {}
