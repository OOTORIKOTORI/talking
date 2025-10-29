import { Controller, Post, Delete, Param, Req, UseGuards } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'

@Controller('assets')
@UseGuards(SupabaseAuthGuard)
export class FavoritesToggleController {
  constructor(private readonly favorites: FavoritesService) {}

  @Post(':id/favorite')
  async add(@Param('id') id: string, @Req() req: any) {
    return this.favorites.add(req.user.userId, id)
  }

  @Delete(':id/favorite')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.favorites.remove(req.user.userId, id)
  }
}
