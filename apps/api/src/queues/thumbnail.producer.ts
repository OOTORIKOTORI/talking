import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class ThumbnailProducer {
  private queue: Queue;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('thumbnails', { connection });
  }

  async enqueueAsset(assetId: string) {
    await this.queue.add('generate-thumbnail', { assetId });
  }
}
