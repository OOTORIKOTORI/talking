import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { QueryCharactersDto } from './dto/query-characters.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';

@Controller()
export class CharactersController {
  constructor(private readonly service: CharactersService) {}

  // 公開一覧
  @Get('/characters')
  @UseGuards(OptionalSupabaseAuthGuard)
  async list(@Req() req: any, @Query() q: QueryCharactersDto) {
    const publicOnly = q.publicOnly !== 'false'; // 省略時は公開のみ
    const limit = Number(q.limit ?? 20); const offset = Number(q.offset ?? 0);
    return this.service.list(req.user?.userId ?? null, q.q, publicOnly, limit, offset);
  }

  // 公開詳細（公開のみ）
  @Get('/characters/:id')
  async findPublic(@Param('id') id: string) {
    return this.service.findPublic(id);
  }

  // マイ（作成・更新・削除・自分の詳細）
  @Post('/my/characters')
  @UseGuards(SupabaseAuthGuard)
  async create(@Req() req: any, @Body() dto: CreateCharacterDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get('/my/characters/:id')
  @UseGuards(SupabaseAuthGuard)
  async findOwned(@Req() req: any, @Param('id') id: string) {
    return this.service.findOwned(req.user.userId, id);
  }

  @Patch('/my/characters/:id')
  @UseGuards(SupabaseAuthGuard)
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCharacterDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete('/my/characters/:id')
  @UseGuards(SupabaseAuthGuard)
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
