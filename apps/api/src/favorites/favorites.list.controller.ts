import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { FavoritesQueryDto } from './dto/favorites.query.dto'

@Controller('favorites')
@UseGuards(SupabaseAuthGuard)
export class FavoritesListController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query() query: FavoritesQueryDto & { limit?: string; offset?: string },
  ) {
    const limit = Number(query.limit ?? 20)
    const offset = Number(query.offset ?? 0)
    
    return this.favorites.list(req.user.userId, {
      limit,
      offset,
      q: query.q,
      type: query.type,
      primaryTag: query.primaryTag,
      tags: query.tags,
      sort: query.sort,
    })
  }
}
