import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CharacterImagesController } from './character-images.controller';
import { CharacterFavoritesController } from './character-favorites.controller';
import { CharacterFavoritesService } from './character-favorites.service';

@Module({
  imports: [PrismaModule],
  controllers: [CharactersController, CharacterImagesController, CharacterFavoritesController],
  providers: [CharactersService, CharacterFavoritesService],
})
export class CharactersModule {}
