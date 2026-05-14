import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AssetPrimaryTag } from '@prisma/client';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  private async getOwnerDisplayNameMap(
    ownerIds: Array<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = [
      ...new Set(
        ownerIds.filter(
          (id): id is string => typeof id === 'string' && id.trim().length > 0,
        ),
      ),
    ];
    if (ids.length === 0) return new Map();

    const profiles = await this.prisma.creatorProfile.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, displayName: true },
    });

    const map = new Map<string, string>();
    for (const p of profiles) {
      const name = p.displayName.trim();
      if (name.length > 0) map.set(p.userId, name);
    }
    return map;
  }

  private resolveOwnerDisplayName(
    ownerId: string | null | undefined,
    ownerDisplayNameSnapshot: string | null | undefined,
    ownerDisplayNameMap: Map<string, string>,
  ): string | null {
    const snapshot = ownerDisplayNameSnapshot?.trim();
    if (snapshot) return snapshot;
    if (!ownerId) return null;
    return ownerDisplayNameMap.get(ownerId) ?? null;
  }

  async add(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.deletedAt) {
      throw new NotFoundException('asset not found');
    }
    if (asset.ownerId !== userId && !asset.isPublic) {
      throw new ForbiddenException('cannot favorite a non-public asset');
    }

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
      primaryTag?: AssetPrimaryTag[]
      tags?: string[]
      sort?: 'createdAt:desc' | 'createdAt:asc'
    },
  ) {
    const q = String(opt.q ?? '').trim()
    const qTags = q.split(/\s+/).filter(Boolean)
    const assetWhere: Prisma.AssetWhereInput = {
      deletedAt: null,
      OR: [{ ownerId: userId }, { isPublic: true }],
    }

    if (q) {
      assetWhere.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { tags: { hasSome: qTags } },
          ],
        },
      ]
    }

    if (opt.type === 'image') {
      assetWhere.contentType = { startsWith: 'image/' }
    } else if (opt.type === 'audio') {
      assetWhere.contentType = { startsWith: 'audio/' }
    }

    if (opt.primaryTag?.length) {
      assetWhere.primaryTag = { in: opt.primaryTag }
    }

    if (opt.tags?.length) {
      assetWhere.tags = { hasSome: opt.tags }
    }

    const favoriteWhere: Prisma.FavoriteWhereInput = {
      userId,
      asset: assetWhere,
    }

    const orderBy: Prisma.FavoriteOrderByWithRelationInput =
      opt.sort === 'createdAt:asc'
        ? { asset: { createdAt: 'asc' } }
        : { asset: { createdAt: 'desc' } }

    const [favs, total] = await this.prisma.$transaction([
      this.prisma.favorite.findMany({
        where: favoriteWhere,
        orderBy,
        take: opt.limit,
        skip: opt.offset,
        include: {
          asset: {
            include: {
              _count: { select: { favorites: true } },
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: favoriteWhere }),
    ])

    if (!favs.length) return { items: [], total }

    const assets = favs
      .map((f) => f.asset)
      .filter((a): a is NonNullable<typeof a> => Boolean(a))

    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap(
      assets.map((asset) => asset.ownerId),
    );

    // Use isFavorited (past participle) to match frontend expectations
    return {
      items: assets.map((a: any) => {
        const { _count, ...asset } = a
        return {
          ...asset,
          ownerDisplayName: this.resolveOwnerDisplayName(
            asset.ownerId,
            asset.ownerDisplayNameSnapshot,
            ownerDisplayNameMap,
          ),
          favoriteCount: _count?.favorites ?? 0,
          isFavorited: true,
          isFavorite: true,
        }
      }),
      total,
    }
  }
}
