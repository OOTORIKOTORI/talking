import { Controller, Post, Delete, Get, Param, Req, UseGuards, Query } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';

@Controller()
@UseGuards(SupabaseAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

    @Post('/assets/:id/favorite')
    async add(@Param('id') id: string, @Req() req: any) {
      const userId = req.user?.userId;
      await this.favoritesService.add(userId, id);
      return { success: true };
    }

    @Delete('/assets/:id/favorite')
    async remove(@Param('id') id: string, @Req() req: any) {
      const userId = req.user?.userId;
      await this.favoritesService.remove(userId, id);
      return { success: true };
    }

    @Get('/favorites')
    async list(@Req() req: any, @Query('limit') limit?: number, @Query('offset') offset?: number) {
      const userId = req.user?.userId;
      return await this.favoritesService.list(userId, { limit: Number(limit ?? 20), offset: Number(offset ?? 0) });
    }
}
