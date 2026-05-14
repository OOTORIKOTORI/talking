import { Module } from '@nestjs/common';
import { FavoritesListController } from './favorites.list.controller';
import { FavoritesToggleController } from './favorites.toggle.controller';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FavoritesListController, FavoritesToggleController],
  providers: [FavoritesService, PrismaService],
})
export class FavoritesModule {}
