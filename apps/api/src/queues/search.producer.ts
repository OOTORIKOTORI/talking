import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class SearchProducer implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;
  private connection: IORedis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379';
    
    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('search-index', {
      connection: this.connection,
    });
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.connection.quit();
  }

  async enqueueAsset(asset: {
    id: string;
    title?: string;
    description?: string;
    tags: string[];
    contentType: string;
    url: string;
    createdAt: Date;
  }) {
    await this.queue.add('index-asset', {
      id: asset.id,
      title: asset.title || '',
      description: asset.description || '',
      tags: asset.tags,
      contentType: asset.contentType,
      url: asset.url,
      createdAt: asset.createdAt.toISOString(),
    });
  }
}
