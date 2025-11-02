import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || 'talking-dev';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'admin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'password123';
const S3_FORCE_PATH_STYLE = process.env.S3_FORCE_PATH_STYLE === 'true';
const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILI_KEY || 'masterKey123';

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: S3_FORCE_PATH_STYLE,
});

const prisma = new PrismaClient();
const meiliClient = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_KEY,
});

export const purgeWorker = new Worker(
  'purge',
  async (job) => {
    const { assetId } = job.data;
    console.log(`[${new Date().toISOString()}] Processing purge for asset ${assetId}`);

    try {
      // Load asset from DB
      const asset = await prisma.asset.findUnique({ where: { id: assetId } });

      if (!asset) {
        console.warn(`Asset ${assetId} not found, skipping purge`);
        return { success: false, reason: 'asset_not_found' };
      }

      // アセットが復元された（deletedAt が null）場合はスキップ
      if (!asset.deletedAt) {
        console.log(`Asset ${assetId} was restored, skipping purge`);
        return { success: false, reason: 'asset_restored' };
      }

      // お気に入りの外部参照を事前に削除（FK違反回避）
      await prisma.favorite.deleteMany({ where: { assetId } });

      // Collect S3 keys to delete
      const keysToDelete = [asset.key, asset.thumbKey].filter(Boolean) as string[];

      // Delete from S3
      if (keysToDelete.length > 0) {
        try {
          if (keysToDelete.length === 1) {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: S3_BUCKET,
                Key: keysToDelete[0],
              })
            );
          } else {
            await s3Client.send(
              new DeleteObjectsCommand({
                Bucket: S3_BUCKET,
                Delete: {
                  Objects: keysToDelete.map((Key) => ({ Key })),
                },
              })
            );
          }
          console.log(`Deleted ${keysToDelete.length} object(s) from S3`);
        } catch (error: any) {
          // Idempotent: if object not found in S3, continue
          if (error.name !== 'NoSuchKey' && error.name !== 'NotFound') {
            throw error;
          }
          console.warn(`S3 object(s) not found, continuing: ${error.message}`);
        }
      }

      // Delete from database (hard delete)
      await prisma.asset.delete({ where: { id: assetId } });
      console.log(`Hard deleted asset ${assetId} from database`);

      // Remove from Meilisearch (冪等性のため再度試行)
      try {
        const index = await meiliClient.getIndex('assets');
        await index.deleteDocument(assetId);
        console.log(`Removed asset ${assetId} from search index`);
      } catch (error: any) {
        console.error('Failed to delete from Meilisearch:', error.message);
        // 検索インデックスの削除失敗は致命的ではないので続行
      }

      return { success: true };
    } catch (error: any) {
      console.error(`Error purging asset ${assetId}:`, error);
      throw error; // BullMQ will retry
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

purgeWorker.on('completed', (job) => {
  console.log(`[${new Date().toISOString()}] Purge job ${job.id} completed`);
});

purgeWorker.on('failed', (job, err) => {
  console.error(`[${new Date().toISOString()}] Purge job ${job?.id} failed:`, err);
});

console.log('🗑️  Purge worker ready');
