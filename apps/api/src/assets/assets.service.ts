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
    });

    let itemsWithFavorite = items;
    if (query.userId && items.length) {
      const favs = await this.prisma.favorite.findMany({
        where: { userId: query.userId, assetId: { in: items.map(a => a.id) } },
        select: { assetId: true },
      });
      const favSet = new Set(favs.map(f => f.assetId));
      itemsWithFavorite = items.map(a => ({ ...a, isFavorite: favSet.has(a.id) }));
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
    });
    if (!asset) return null;
    if (userId) {
      const fav = await this.prisma.favorite.findUnique({
        where: { userId_assetId: { userId, assetId: id } },
      });
      return { ...asset, isFavorite: !!fav };
    }
    return asset;
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
  }