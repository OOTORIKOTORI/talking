import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SearchProducer } from '../queues/search.producer';
import { CreateAssetDto } from './dto/create-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';

@Injectable()
export class AssetsService {
  private readonly s3PublicBase: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private searchProducer: SearchProducer,
  ) {
    this.s3PublicBase = this.configService.get<string>('S3_PUBLIC_BASE');
  }

  async create(createAssetDto: CreateAssetDto) {
    const url = `${this.s3PublicBase}/${createAssetDto.key}`;

    const asset = await this.prisma.asset.create({
      data: {
        key: createAssetDto.key,
        title: createAssetDto.title,
        contentType: createAssetDto.contentType,
        size: createAssetDto.size,
        url,
      },
    });

    // Enqueue for search indexing
    await this.searchProducer.enqueueAsset(asset);

    return asset;
  }

  async findAll(query: QueryAssetsDto) {
    const { limit = 20, cursor } = query;

    const items = await this.prisma.asset.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      items: results,
      nextCursor,
    };
  }

  async findOne(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
    });
  }
}
