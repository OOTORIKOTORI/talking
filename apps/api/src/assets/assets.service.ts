import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
import { SearchProducer } from '../queues/search.producer';
import { ThumbnailProducer } from '../queues/thumbnail.producer';
import { PurgeProducer } from '../queues/purge.producer';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { meiliClient } from '../meili/meili.client';
import { AssetPrimaryTag } from '@prisma/client';

@Injectable()
export class AssetsService {
  private readonly s3PublicBase: string;
  private readonly s3Client: S3Client;
  private readonly s3Bucket: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private searchProducer: SearchProducer,
    private thumbnailProducer: ThumbnailProducer,
    private purgeProducer: PurgeProducer,
  ) {
    this.s3PublicBase = this.configService.get<string>('S3_PUBLIC_BASE');
    this.s3Bucket = this.configService.get<string>('S3_BUCKET');
    
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      },
      forcePathStyle: this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true',
    });

  }

  private validatePrimaryTag(primaryTag: AssetPrimaryTag, contentType: string) {
    const isImage = contentType.startsWith('image/');
    const isAudio = contentType.startsWith('audio/');
    
    if (isImage && !String(primaryTag).startsWith('IMAGE_')) {
      throw new BadRequestException('primaryTag must be IMAGE_* for image/* assets');
    }
    if (isAudio && !String(primaryTag).startsWith('AUDIO_')) {
      throw new BadRequestException('primaryTag must be AUDIO_* for audio/* assets');
    }
  }

  async create(createAssetDto: CreateAssetDto, ownerId: string) {
    // Validate primaryTag against contentType
    this.validatePrimaryTag(createAssetDto.primaryTag, createAssetDto.contentType);
    
    const url = `${this.s3PublicBase}/${createAssetDto.key}`;

    const asset = await this.prisma.asset.create({
      data: {
        key: createAssetDto.key,
        title: createAssetDto.title,
        description: createAssetDto.description,
        tags: createAssetDto.tags || [],
        primaryTag: createAssetDto.primaryTag,
        contentType: createAssetDto.contentType,
        size: createAssetDto.size,
        url,
        ownerId,
      },
    });

    // Enqueue for search indexing
    await this.searchProducer.enqueueAsset(asset);

    // Enqueue for thumbnail generation (if image)
    if (asset.contentType.startsWith('image/')) {
      await this.thumbnailProducer.enqueueAsset(asset.id);
    }

    return asset;
  }

  async findAll(query: QueryAssetsDto & { ownerId?: string, userId?: string }) {
    const rawLimit = Number(query.limit) || 20;
    const take = Math.min(Math.max(rawLimit, 1), 100);

    const where: any = { deletedAt: null }
    if (query.ownerId) {
      where.ownerId = query.ownerId
    }

    const items = await this.prisma.asset.findMany({
      take: take + 1,
      ...(query.cursor && {
        cursor: {
          id: query.cursor,
        },
        skip: 1,
      }),
      where,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      include: { _count: { select: { favorites: true } } },
    });

    let itemsWithFavorite = items.map((item: any) => {
      const { _count, ...asset } = item;
      return { ...asset, favoriteCount: _count?.favorites ?? 0 };
    });
    if (query.userId && items.length) {
      const favs = await this.prisma.favorite.findMany({
        where: { userId: query.userId, assetId: { in: items.map(a => a.id) } },
        select: { assetId: true },
      });
      const favSet = new Set(favs.map(f => f.assetId));
      itemsWithFavorite = itemsWithFavorite.map((a) => ({ ...a, isFavorite: favSet.has(a.id) }));
    }

    const hasNext = itemsWithFavorite.length > take;
    const nextCursor = hasNext ? itemsWithFavorite[take].id : null;
    const sliced = hasNext ? itemsWithFavorite.slice(0, take) : itemsWithFavorite;

    return {
      items: sliced,
      nextCursor,
    };
  }

  async findOne(id: string, userId?: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { favorites: true } } },
    });
    if (!asset) return null;

    const { _count, ...base } = asset as any;
    const assetWithFavoriteCount = {
      ...base,
      favoriteCount: _count?.favorites ?? 0,
    };

    if (userId) {
      const fav = await this.prisma.favorite.findUnique({
        where: { userId_assetId: { userId, assetId: id } },
      });
      return { ...assetWithFavoriteCount, isFavorite: !!fav };
    }
    return assetWithFavoriteCount;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string) {
    // Check ownership
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    if (existing.ownerId !== userId) {
      throw new ForbiddenException('You do not own this asset');
    }

    // Validate primaryTag if provided
    if (updateAssetDto.primaryTag) {
      this.validatePrimaryTag(updateAssetDto.primaryTag, existing.contentType);
    }

    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        ...(updateAssetDto.title !== undefined && { title: updateAssetDto.title }),
        ...(updateAssetDto.description !== undefined && { description: updateAssetDto.description }),
        ...(updateAssetDto.tags !== undefined && { tags: updateAssetDto.tags }),
        ...(updateAssetDto.primaryTag !== undefined && { primaryTag: updateAssetDto.primaryTag }),
      },
    });

    // Enqueue for search indexing
    await this.searchProducer.enqueueAsset(asset);

    return asset;
  }

  async delete(id: string, userId: string) {
    // Load asset
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Check ownership
    if (asset.ownerId !== userId) {
      throw new ForbiddenException('You do not own this asset');
    }

    // ソフトデリート: deletedAt を設定
    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // 検索インデックスから削除
    try {
      const index = await meiliClient.getIndex('assets');
      await index.deleteDocument(id);
    } catch (error) {
      console.error('Failed to delete from Meilisearch:', error);
    }

    // 5分後にハード削除をキューに登録
    await this.purgeProducer.enqueueHardDelete(id, 5 * 60 * 1000);

    return;
  }

  async restore(id: string, userId: string) {
    // Load asset
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset || !asset.deletedAt) {
      return; // 既に復元されているか存在しない
    }

    // Check ownership
    if (asset.ownerId !== userId) {
      throw new ForbiddenException('You do not own this asset');
    }

    // deletedAt をクリア
    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: null },
    });

    // 削除ジョブをキャンセル
    await this.purgeProducer.cancelHardDelete(id);

    // 検索インデックスに再登録
    await this.searchProducer.enqueueAsset(asset);

    return;
  }

  async getUsageImpact(id: string, userId: string) {
    // アセット存在確認（削除済みは NotFoundException）
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset || asset.deletedAt) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    if (asset.ownerId !== userId) {
      throw new ForbiddenException('You do not own this asset');
    }

    const SAMPLE_LIMIT = 10;

    // 1. カバー参照: GameProject.coverAssetId
    const coverProjects = await this.prisma.gameProject.findMany({
      where: { coverAssetId: id, deletedAt: null },
      select: { id: true, ownerId: true, title: true, isPublic: true },
    });

    // 2. ノード参照: bgAssetId / musicAssetId / sfxAssetId / portraitAssetId
    const nodeRefs = await this.prisma.gameNode.findMany({
      where: {
        OR: [
          { bgAssetId: id },
          { musicAssetId: id },
          { sfxAssetId: id },
          { portraitAssetId: id },
        ],
        scene: { project: { deletedAt: null } },
      },
      select: {
        id: true,
        order: true,
        text: true,
        bgAssetId: true,
        musicAssetId: true,
        sfxAssetId: true,
        portraitAssetId: true,
        scene: {
          select: {
            id: true,
            name: true,
            project: {
              select: { id: true, ownerId: true, title: true, isPublic: true },
            },
          },
        },
      },
    });

    // --- 集計 ---
    type ByField = {
      coverAssetId: number;
      bgAssetId: number;
      musicAssetId: number;
      sfxAssetId: number;
      portraitAssetId: number;
    };

    type GameAgg = {
      gameId: string;
      title: string;
      isOwn: boolean;
      isPublic: boolean;
      refs: Array<{
        field: keyof ByField;
        sceneId: string | null;
        sceneName: string;
        nodeId: string | null;
        nodeOrder: number | null;
        nodePreview: string;
      }>;
    };

    const gameMap = new Map<string, GameAgg>();

    const ensureGame = (
      gameId: string,
      title: string,
      ownerId: string,
      isPublic: boolean,
    ) => {
      if (!gameMap.has(gameId)) {
        gameMap.set(gameId, {
          gameId,
          title,
          isOwn: ownerId === userId,
          isPublic,
          refs: [],
        });
      }
      return gameMap.get(gameId)!;
    };

    // カバー参照を登録
    for (const p of coverProjects) {
      const g = ensureGame(p.id, p.title, p.ownerId, p.isPublic);
      g.refs.push({
        field: 'coverAssetId',
        sceneId: null,
        sceneName: '—',
        nodeId: null,
        nodeOrder: null,
        nodePreview: '（カバー画像）',
      });
    }

    // ノード参照を登録
    for (const n of nodeRefs) {
      const p = n.scene.project;
      const g = ensureGame(p.id, p.title, p.ownerId, p.isPublic);
      const nodePreview = n.text ? n.text.slice(0, 30) + (n.text.length > 30 ? '…' : '') : '';
      const fields: Array<keyof ByField> = ['bgAssetId', 'musicAssetId', 'sfxAssetId', 'portraitAssetId'];
      for (const field of fields) {
        if ((n as any)[field] === id) {
          g.refs.push({
            field,
            sceneId: n.scene.id,
            sceneName: n.scene.name,
            nodeId: n.id,
            nodeOrder: n.order,
            nodePreview,
          });
        }
      }
    }

    // 集計
    const allGames = Array.from(gameMap.values());
    const ownGames = allGames.filter(g => g.isOwn);
    const otherGames = allGames.filter(g => !g.isOwn);

    const sumByField = (games: GameAgg[]): ByField => {
      const counts: ByField = { coverAssetId: 0, bgAssetId: 0, musicAssetId: 0, sfxAssetId: 0, portraitAssetId: 0 };
      for (const g of games) {
        for (const r of g.refs) counts[r.field]++;
      }
      return counts;
    };

    const totalByField = sumByField(allGames);
    const ownByField = sumByField(ownGames);

    const totalReferenceCount = allGames.reduce((s, g) => s + g.refs.length, 0);
    const ownReferenceCount = ownGames.reduce((s, g) => s + g.refs.length, 0);

    const ownGameSamples = ownGames.slice(0, SAMPLE_LIMIT).map(g => {
      const byField = sumByField([g]);
      return {
        gameId: g.gameId,
        title: g.title,
        isPublic: g.isPublic,
        referenceCount: g.refs.length,
        byField,
        refs: g.refs,
      };
    });

    return {
      assetId: id,
      totalGameCount: allGames.length,
      ownGameCount: ownGames.length,
      otherGameCount: otherGames.length,
      totalReferenceCount,
      ownReferenceCount,
      otherReferenceCount: totalReferenceCount - ownReferenceCount,
      byField: totalByField,
      ownGameSamples,
      sampleLimit: SAMPLE_LIMIT,
      hasMoreOwnGames: ownGames.length > SAMPLE_LIMIT,
      checkedAt: new Date().toISOString(),
    };
  }
}