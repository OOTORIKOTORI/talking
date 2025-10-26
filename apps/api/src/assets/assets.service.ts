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
    const rawLimit = Number(query.limit) || 20;
    const take = Math.min(Math.max(rawLimit, 1), 100);

    const items = await this.prisma.asset.findMany({
      take: take + 1,
      ...(query.cursor && {
        cursor: {
          id: query.cursor,
        },
        skip: 1,
      }),
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });

    const hasNext = items.length > take;
    const nextCursor = hasNext ? items[take].id : null;
    const sliced = hasNext ? items.slice(0, take) : items;

    return {
      items: sliced,
      nextCursor,
    };
  }

  async findOne(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
    });
  }
}
