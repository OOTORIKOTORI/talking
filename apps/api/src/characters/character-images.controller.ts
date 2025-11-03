import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterImageDto } from './dto/create-image.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';

@Controller()
export class CharacterImagesController {
  constructor(private readonly service: CharactersService) {}

  // 自分のキャラ画像一覧（編集用）
  @Get('/my/characters/:id/images')
  @UseGuards(SupabaseAuthGuard)
  async listMine(@Req() req: any, @Param('id') id: string) {
    return this.service.listImages(req.user.userId, id, false);
  }

  // 公開キャラ画像一覧（閲覧用）
  @Get('/characters/:id/images')
  @UseGuards(OptionalSupabaseAuthGuard)
  async listPublic(@Req() req: any, @Param('id') id: string) {
    return this.service.listImages(req.user?.userId ?? null, id, true);
  }

  @Post('/my/characters/:id/images')
  @UseGuards(SupabaseAuthGuard)
  async add(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCharacterImageDto) {
    return this.service.addImage(req.user.userId, id, dto);
  }

  @Patch('/my/characters/:id/images/:imageId')
  @UseGuards(SupabaseAuthGuard)
  async update(@Req() req: any, @Param('id') id: string, @Param('imageId') imageId: string, @Body() dto: Partial<CreateCharacterImageDto>) {
    return this.service.updateImage(req.user.userId, id, imageId, dto);
  }

  @Delete('/my/characters/:id/images/:imageId')
  @UseGuards(SupabaseAuthGuard)
  async remove(@Req() req: any, @Param('id') id: string, @Param('imageId') imageId: string) {
    return this.service.removeImage(req.user.userId, id, imageId);
  }
}
