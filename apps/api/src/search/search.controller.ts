import { Controller, Get, Query, UseGuards, Request, UnauthorizedException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { meiliClient } from '../meili/meili.client';
import { SearchAssetsDto } from './dto/search-assets.dto';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private prisma: PrismaService) {}

  private toArray(value?: string | string[]) {
    if (!value) return [] as string[];
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter(Boolean);
    }
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  private parsePagination(dto: SearchAssetsDto) {
    const limit = Math.min(Math.max(Number(dto.limit) || 20, 1), 100);
    const offset = Math.max(Number(dto.offset) || 0, 0);
    return { limit, offset };
  }

  private parseSort(sort?: string): Prisma.AssetOrderByWithRelationInput {
    if (sort === 'createdAt:asc') {
      return { createdAt: 'asc' };
    }
    return { createdAt: 'desc' };
  }

  private buildPrismaWhere(dto: SearchAssetsDto, userId?: string | null): Prisma.AssetWhereInput {
    const where: Prisma.AssetWhereInput = { deletedAt: null };
    const q = (dto.q || '').trim();
    const tags = this.toArray(dto.tags);
    const primaryTags = this.toArray(dto.primaryTag);

    if (dto.owner === 'me') {
      if (!userId) {
        throw new UnauthorizedException('Authentication required for owner=me');
      }
      where.ownerId = userId;
    } else if (dto.owner) {
      where.ownerId = dto.owner;
    }

    if (primaryTags.length > 0) {
      where.primaryTag = { in: primaryTags as any[] };
    } else if (dto.contentType === 'image') {
      where.contentType = { startsWith: 'image/' };
    } else if (dto.contentType === 'audio') {
      where.contentType = { startsWith: 'audio/' };
    }

    if (tags.length > 0) {
      where.AND = tags.map((tag) => ({ tags: { has: tag } }));
    }

    if (q) {
      const qFilter: Prisma.AssetWhereInput = {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      };

      if (where.AND) {
        where.AND = [...(where.AND as Prisma.AssetWhereInput[]), qFilter];
      } else {
        where.AND = [qFilter];
      }
    }

    return where;
  }

  private buildMeiliFilter(dto: SearchAssetsDto, userId?: string | null) {
    const filters: string[] = [];
    const primaryTags = this.toArray(dto.primaryTag);
    const tags = this.toArray(dto.tags);

    if (dto.owner === 'me') {
      if (!userId) {
        throw new UnauthorizedException('Authentication required for owner=me');
      }
      filters.push(`ownerId = "${userId}"`);
    } else if (dto.owner) {
      filters.push(`ownerId = "${dto.owner}"`);
    }

    if (dto.contentType === 'image') {
      filters.push('primaryTag IN ["IMAGE_BG", "IMAGE_CG", "IMAGE_OTHER"]');
    } else if (dto.contentType === 'audio') {
      filters.push('primaryTag IN ["AUDIO_BGM", "AUDIO_SE", "AUDIO_VOICE", "AUDIO_OTHER"]');
    }

    if (primaryTags.length > 0) {
      const contentTypeFilterIndex = filters.findIndex((f) => f.includes('primaryTag IN'));
      if (contentTypeFilterIndex !== -1) {
        filters.splice(contentTypeFilterIndex, 1);
      }
      const tagList = primaryTags.map((t) => `"${t}"`).join(', ');
      filters.push(`primaryTag IN [${tagList}]`);
    }

    if (tags.length > 0) {
      tags.forEach((tag) => {
        filters.push(`tags = "${tag}"`);
      });
    }

    return filters.length > 0 ? filters.join(' AND ') : undefined;
  }

  private async searchAssetsWithPrisma(dto: SearchAssetsDto, userId?: string | null) {
    const { limit, offset } = this.parsePagination(dto);
    const where = this.buildPrismaWhere(dto, userId);
    const orderBy = this.parseSort(dto.sort);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({ where, orderBy, skip: offset, take: limit }),
      this.prisma.asset.count({ where }),
    ]);

    return { items, limit, offset, total };
  }

  /**
   * Meilisearch で検索し、失敗時は Prisma fallback。
   * userId は opt-in の認証ユーザー ID（未認証は null）。
   * dto.owner に 'me' または実際の userId を渡すことで owner フィルタを適用する。
   * 公開範囲: Asset モデルに isPublic フィールドは存在せず、
   *   deletedAt: null が唯一の公開フィルタ（既存 /assets API と同一仕様）。
   */
  private async searchWithMeiliAndFallback(dto: SearchAssetsDto, userId: string | null) {
    const { limit, offset } = this.parsePagination(dto);
    const q = dto.q || '';
    const sort = dto.sort || 'createdAt:desc';

    try {
      const index = meiliClient.index('assets');
      const filterString = this.buildMeiliFilter(dto, userId);

      const searchResult = await index.search(q, {
        limit,
        offset,
        filter: filterString,
        sort: [sort],
      });

      const ids = searchResult.hits.map((hit: any) => hit.id);
      if (ids.length === 0) {
        return {
          items: [],
          limit,
          offset,
          total: searchResult.estimatedTotalHits || 0,
        };
      }

      const assets = await this.prisma.asset.findMany({
        where: { id: { in: ids }, deletedAt: null },
      });

      const assetMap = new Map(assets.map((a) => [a.id, a]));
      const orderedAssets = ids.map((id) => assetMap.get(id)).filter(Boolean);

      // Meilisearch にあるが Prisma に存在しない（削除済みなど）場合 fallback
      if (orderedAssets.length === 0 && ids.length > 0) {
        return this.searchAssetsWithPrisma(dto, userId);
      }

      return {
        items: orderedAssets,
        limit,
        offset,
        total: searchResult.estimatedTotalHits || 0,
      };
    } catch (error) {
      this.logger.warn(
        `Meilisearch unavailable. Fallback to Prisma. ${(error as Error)?.message || ''}`,
      );
      return this.searchAssetsWithPrisma(dto, userId);
    }
  }

  @Get('assets')
  @UseGuards(OptionalSupabaseAuthGuard)
  async searchAssets(@Query() dto: SearchAssetsDto, @Request() req: any) {
    const userId: string | null = req.user?.userId ?? null;
    return this.searchWithMeiliAndFallback(dto, userId);
  }

  @Get('assets/mine')
  @UseGuards(SupabaseAuthGuard)
  async searchMyAssets(@Query() dto: SearchAssetsDto, @Request() req: any) {
    const userId: string | null = req.user?.userId ?? null;
    if (!userId) {
      const { limit, offset } = this.parsePagination(dto);
      return { items: [], limit, offset, total: 0 };
    }
    // owner を実際の userId に固定し、Meilisearch + Prisma fallback で自分のアセットを検索
    return this.searchWithMeiliAndFallback({ ...dto, owner: userId }, userId);
  }
}
