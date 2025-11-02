import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class PurgeProducer {
  private queue: Queue;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('purge', { connection });
  }

  /**
   * アセットの遅延削除をキューに登録
   * @param assetId 削除するアセットID
   * @param delayMs 遅延時間（ミリ秒）デフォルト5分
   */
  async enqueueHardDelete(assetId: string, delayMs: number = 5 * 60 * 1000) {
    await this.queue.add(
      'asset:purge',
      { assetId },
      {
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );
  }
}
