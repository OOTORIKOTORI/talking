import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Favorite, Asset } from '@prisma/client';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, assetId: string) {
    await this.prisma.favorite.upsert({
      where: { userId_assetId: { userId, assetId } },
      update: {},
      create: { userId, assetId },
    });
  }

  async remove(userId: string, assetId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId, assetId },
    });
  }

  async list(userId: string, opt: { limit: number; offset: number }) {
    const favs = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: opt.limit,
      skip: opt.offset,
      select: { assetId: true },
    });
    const ids = favs.map(f => f.assetId);
    if (!ids.length) return [];
    const assets = await this.prisma.asset.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'desc' } });
    const idSet = new Set(ids);
    return assets.map(a => ({ ...a, isFavorite: idSet.has(a.id) }));
  }
}
