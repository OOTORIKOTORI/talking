import { Controller, Post, Delete, Get, Param, Req, UseGuards, Query } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CharacterFavoritesService } from './character-favorites.service';

@Controller()
@UseGuards(SupabaseAuthGuard)
export class CharacterFavoritesController {
  constructor(private readonly favoritesService: CharacterFavoritesService) {}

  @Post('/characters/:id/favorite')
  async add(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    await this.favoritesService.add(userId, id);
    return { success: true };
  }

  @Delete('/characters/:id/favorite')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    await this.favoritesService.remove(userId, id);
    return { success: true };
  }

  @Get('/my/favorites/characters')
  async list(@Req() req: any, @Query('q') q?: string, @Query('tags') tags?: string) {
    const userId = req.user?.userId;
    const tagArray = tags ? tags.split(',').filter(Boolean) : undefined;
    return await this.favoritesService.list(userId, { q, tags: tagArray });
  }
}
