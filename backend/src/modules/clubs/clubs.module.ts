import { Module } from "@nestjs/common";
import { PrismaModule } from "@/database/prisma.module.js";
import { ClubsController } from "./clubs.controller.js";
import { ClubsService } from "./clubs.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [ClubsController],
  providers: [ClubsService],
})
export class ClubsModule {}
