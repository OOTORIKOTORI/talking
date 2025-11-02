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

  async list(
    userId: string,
    opt: {
      limit: number
      offset: number
      q?: string
      type?: 'image' | 'audio'
      primaryTag?: any[]
      tags?: string[]
      sort?: 'createdAt:desc' | 'createdAt:asc'
    },
  ) {
    const favs = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: opt.limit,
      skip: opt.offset,
      select: { assetId: true },
    })
    const ids = favs.map((f) => f.assetId)
    if (!ids.length) return { items: [], total: 0 }

    // Build where clause with filters
    const where: any = { id: { in: ids } }

    if (opt.q) {
      where.OR = [
        { title: { contains: opt.q, mode: 'insensitive' } },
        { description: { contains: opt.q, mode: 'insensitive' } },
        { tags: { hasSome: opt.q.split(/\s+/) } },
      ]
    }

    if (opt.type === 'image') {
      where.contentType = { startsWith: 'image/' }
    } else if (opt.type === 'audio') {
      where.contentType = { startsWith: 'audio/' }
    }

    if (opt.primaryTag?.length) {
      where.primaryTag = { in: opt.primaryTag }
    }

    if (opt.tags?.length) {
      where.tags = { hasSome: opt.tags }
    }

    const orderBy = opt.sort === 'createdAt:asc' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const }
    const assets = await this.prisma.asset.findMany({ where, orderBy })

    // Use isFavorited (past participle) to match frontend expectations
    return { items: assets.map((a) => ({ ...a, isFavorited: true, isFavorite: true })), total: assets.length }
  }
}
