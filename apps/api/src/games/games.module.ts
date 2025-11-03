import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';

@Module({
  controllers: [GamesController],
  providers: [PrismaService, GamesService],
  exports: [GamesService],
})
export class GamesModule {}
