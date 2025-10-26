import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { meiliClient } from '../meili/meili.client';

@Controller('search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  @Get('assets')
  async searchAssets(
    @Query('q') q: string = '',
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offsetNum = Math.max(Number(offset) || 0, 0);

    const index = meiliClient.index('assets');
    const searchResult = await index.search(q, {
      limit: limitNum,
      offset: offsetNum,
    });

    const ids = searchResult.hits.map((hit: any) => hit.id);
    if (ids.length === 0) {
      return {
        items: [],
        limit: limitNum,
        offset: offsetNum,
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
      limit: limitNum,
      offset: offsetNum,
      total: searchResult.estimatedTotalHits || 0,
    };
  }
}
