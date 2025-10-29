import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'

@Controller('favorites')
@UseGuards(SupabaseAuthGuard)
export class FavoritesListController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  async list(@Req() req: any, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.favorites.list(req.user.userId, {
      limit: Number(limit ?? 20),
      offset: Number(offset ?? 0),
    })
  }
}
