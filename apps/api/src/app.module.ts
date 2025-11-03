import { Module } from '@nestjs/common';
import { FavoritesModule } from './favorites/favorites.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';
import { AssetsModule } from './assets/assets.module';
import { SearchModule } from './search/search.module';
import { CharactersModule } from './characters/characters.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    UploadsModule,
    AssetsModule,
    SearchModule,
  FavoritesModule,
  CharactersModule,
  GamesModule,
  ],
})
export class AppModule {}
