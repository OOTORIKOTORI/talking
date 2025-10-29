import { Controller, Get, Query, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { meiliClient } from '../meili/meili.client';
import { SearchAssetsDto } from './dto/search-assets.dto';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  @Get('assets')
  @UseGuards(OptionalSupabaseAuthGuard)
  async searchAssets(@Query() dto: SearchAssetsDto, @Request() req: any) {
    const { q = '', primaryTag, contentType, tags, sort = 'createdAt:desc', owner } = dto;
    
    // Convert limit and offset to numbers
    const limit = Math.min(Math.max(Number(dto.limit) || 20, 1), 100);
    const offset = Math.max(Number(dto.offset) || 0, 0);

    // Build Meilisearch filter
    const filters: string[] = [];

    // owner filter
    if (owner === 'me') {
      if (!req.user?.userId) {
        throw new UnauthorizedException('Authentication required for owner=me');
      }
      filters.push(`ownerId = "${req.user.userId}"`);
    } else if (owner) {
      filters.push(`ownerId = "${owner}"`);
    }

    // contentType filter - use primaryTag as proxy since it's more reliable
    if (contentType === 'image') {
      filters.push(`primaryTag IN ["IMAGE_BG", "IMAGE_CG", "IMAGE_OTHER"]`);
    } else if (contentType === 'audio') {
      filters.push(`primaryTag IN ["AUDIO_BGM", "AUDIO_SE", "AUDIO_VOICE", "AUDIO_OTHER"]`);
    }

    // primaryTag filter (will override contentType filter if both specified)
    if (primaryTag) {
      const tagArray = Array.isArray(primaryTag) ? primaryTag : [primaryTag];
      if (tagArray.length > 0) {
        // Remove contentType filter if primaryTag is specified
        const contentTypeFilterIndex = filters.findIndex(f => f.includes('primaryTag IN'));
        if (contentTypeFilterIndex !== -1) {
          filters.splice(contentTypeFilterIndex, 1);
        }
        const tagList = tagArray.map(t => `"${t}"`).join(', ');
        filters.push(`primaryTag IN [${tagList}]`);
      }
    }

    // tags filter (AND condition)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      tagArray.forEach(tag => {
        if (tag.trim()) {
          filters.push(`tags = "${tag.trim()}"`);
        }
      });
    }

    const filterString = filters.length > 0 ? filters.join(' AND ') : undefined;

    // Build sort array
    const sortArray = sort ? [sort] : ['createdAt:desc'];

    const index = meiliClient.index('assets');
    const searchResult = await index.search(q, {
      limit,
      offset,
      filter: filterString,
      sort: sortArray,
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
      where: { id: { in: ids } },
    });

    // Preserve order from Meilisearch
    const assetMap = new Map(assets.map((a) => [a.id, a]));
    const orderedAssets = ids.map((id) => assetMap.get(id)).filter(Boolean);

    return {
      items: orderedAssets,
      limit,
      offset,
      total: searchResult.estimatedTotalHits || 0,
    };
  }

  @Get('assets/mine')
  @UseGuards(SupabaseAuthGuard)
  async searchMyAssets(@Query() dto: SearchAssetsDto, @Request() req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      return {
        items: [],
        limit: dto.limit || 20,
        offset: dto.offset || 0,
        total: 0,
      };
    }

    const { q = '', primaryTag, contentType, tags, sort = 'createdAt:desc' } = dto;
    
    // Convert limit and offset to numbers
    const limit = Math.min(Math.max(Number(dto.limit) || 20, 1), 100);
    const offset = Math.max(Number(dto.offset) || 0, 0);

    // Build Meilisearch filter (same as above but will filter by owner in Prisma)
    const filters: string[] = [];

    if (contentType === 'image') {
      filters.push(`primaryTag IN ["IMAGE_BG", "IMAGE_CG", "IMAGE_OTHER"]`);
    } else if (contentType === 'audio') {
      filters.push(`primaryTag IN ["AUDIO_BGM", "AUDIO_SE", "AUDIO_VOICE", "AUDIO_OTHER"]`);
    }

    if (primaryTag) {
      const tagArray = Array.isArray(primaryTag) ? primaryTag : [primaryTag];
      if (tagArray.length > 0) {
        // Remove contentType filter if primaryTag is specified
        const contentTypeFilterIndex = filters.findIndex(f => f.includes('primaryTag IN'));
        if (contentTypeFilterIndex !== -1) {
          filters.splice(contentTypeFilterIndex, 1);
        }
        const tagList = tagArray.map(t => `"${t}"`).join(', ');
        filters.push(`primaryTag IN [${tagList}]`);
      }
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      tagArray.forEach(tag => {
        if (tag.trim()) {
          filters.push(`tags = "${tag.trim()}"`);
        }
      });
    }

    const filterString = filters.length > 0 ? filters.join(' AND ') : undefined;
    const sortArray = sort ? [sort] : ['createdAt:desc'];

    const index = meiliClient.index('assets');
    const searchResult = await index.search(q, {
      limit: 1000, // Get more results to filter by owner
      offset: 0,
      filter: filterString,
      sort: sortArray,
    });

    const ids = searchResult.hits.map((hit: any) => hit.id);
    if (ids.length === 0) {
      return {
        items: [],
        limit,
        offset,
        total: 0,
      };
    }

    // Filter by owner and apply pagination
    const allAssets = await this.prisma.asset.findMany({
      where: { 
        id: { in: ids },
        ownerId: userId,
      },
    });

    const assetMap = new Map(allAssets.map((a) => [a.id, a]));
    const orderedAssets = ids.map((id) => assetMap.get(id)).filter(Boolean);

    const total = orderedAssets.length;
    const paginatedAssets = orderedAssets.slice(offset, offset + limit);

    return {
      items: paginatedAssets,
      limit,
      offset,
      total,
    };
  }
}
