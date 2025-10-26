import { Controller, Get, Post, Patch, Delete, Body, Query, Param, NotFoundException, UseGuards, ForbiddenException } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(@Body() createAssetDto: CreateAssetDto, @CurrentUser() user: AuthUser) {
    return this.assetsService.create(createAssetDto, user.userId);
  }

  @Get()
  findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const asset = await this.assetsService.findOne(id);
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto, @CurrentUser() user: AuthUser) {
    const asset = await this.assetsService.update(id, updateAssetDto, user.userId);
    return asset;
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.assetsService.delete(id, user.userId);
    return { ok: true };
  }
}
