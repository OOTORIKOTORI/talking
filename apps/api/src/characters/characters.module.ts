import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CharacterImagesController } from './character-images.controller';

@Module({
  controllers: [CharactersController, CharacterImagesController],
  providers: [CharactersService],
})
export class CharactersModule {}
