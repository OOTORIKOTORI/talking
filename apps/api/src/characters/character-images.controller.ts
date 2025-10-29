import { Body, Controller, Delete, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterImageDto } from './dto/create-image.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller()
@UseGuards(SupabaseAuthGuard)
export class CharacterImagesController {
  constructor(private readonly service: CharactersService) {}

  @Post('/my/characters/:id/images')
  async add(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCharacterImageDto) {
    return this.service.addImage(req.user.userId, id, dto);
  }

  @Patch('/my/characters/:id/images/:imageId')
  async update(@Req() req: any, @Param('id') id: string, @Param('imageId') imageId: string, @Body() dto: Partial<CreateCharacterImageDto>) {
    return this.service.updateImage(req.user.userId, id, imageId, dto);
  }

  @Delete('/my/characters/:id/images/:imageId')
  async remove(@Req() req: any, @Param('id') id: string, @Param('imageId') imageId: string) {
    return this.service.removeImage(req.user.userId, id, imageId);
  }
}
