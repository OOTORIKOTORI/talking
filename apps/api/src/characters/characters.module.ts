import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CharacterImagesController } from './character-images.controller';
import { CharacterFavoritesController } from './character-favorites.controller';
import { CharacterFavoritesService } from './character-favorites.service';

@Module({
  controllers: [CharactersController, CharacterImagesController, CharacterFavoritesController],
  providers: [CharactersService, CharacterFavoritesService],
})
export class CharactersModule {}
