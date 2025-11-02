import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
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

export const thumbnailQueue = new Queue('thumbnails', {
  connection,
});

export const thumbnailWorker = new Worker(
  'thumbnails',
  async (job) => {
    const { assetId } = job.data;
    console.log(`[${new Date().toISOString()}] Processing thumbnail for asset ${assetId}`);

    try {
      // Load asset from DB
      const asset = await prisma.asset.findUnique({ where: { id: assetId } });
      
      if (!asset) {
        console.warn(`Asset ${assetId} not found`);
        return { success: false, reason: 'asset_not_found' };
      }

      // Skip if not an image
      if (!asset.contentType.startsWith('image/')) {
        console.log(`Asset ${assetId} is not an image, skipping thumbnail`);
        return { success: false, reason: 'not_image' };
      }

      // Skip if already has thumbnail
      if (asset.thumbKey) {
        console.log(`Asset ${assetId} already has thumbnail, skipping`);
        return { success: false, reason: 'already_has_thumbnail' };
      }

      // Download original from S3
      const getCommand = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: asset.key,
      });
      const s3Response = await s3Client.send(getCommand);
      
      if (!s3Response.Body) {
        throw new Error('No body in S3 response');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of s3Response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

        // Generate thumbnails in multiple formats
        const sharpInstance = sharp(buffer).resize(512, 512, { fit: 'cover' });
      
        const thumbnailBuffer = await sharpInstance.clone()
        .resize(512, 512, { fit: 'cover' })
        .webp({ quality: 82 })
        .toBuffer();

        const thumbnailBufferWebp = await sharpInstance.clone()
          .webp({ quality: 85 })
          .toBuffer();

        const thumbnailBufferAvif = await sharpInstance.clone()
          .avif({ quality: 80 })
          .toBuffer();

      // Upload thumbnail to S3
      const basename = asset.key.split('/').pop()?.split('.')[0] || 'thumb';
      const thumbKey = `thumbs/${basename}-${assetId}.webp`;
        const thumbKeyWebp = `thumbs/${basename}-${assetId}-webp.webp`;
        const thumbKeyAvif = `thumbs/${basename}-${assetId}-avif.avif`;

      const putCommand = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: thumbKey,
        Body: thumbnailBuffer,
        ContentType: 'image/webp',
      });
      await s3Client.send(putCommand);

        // Upload WebP
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: thumbKeyWebp,
          Body: thumbnailBufferWebp,
          ContentType: 'image/webp',
        }));

        // Upload AVIF
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: thumbKeyAvif,
          Body: thumbnailBufferAvif,
          ContentType: 'image/avif',
        }));

      // Update database
      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: {
          thumbKey,
            thumbKeyWebp,
            thumbKeyAvif,
          thumbWidth: 512,
          thumbHeight: 512,
        },
      });

      // Update Meilisearch
      try {
        const index = await meiliClient.getIndex('assets');
        await index.updateDocuments([{
          id: updated.id,
          title: updated.title || '',
          description: updated.description || '',
          tags: updated.tags,
          contentType: updated.contentType,
          url: updated.url,
          thumbKey: updated.thumbKey,
          createdAt: updated.createdAt.toISOString(),
        }]);
      } catch (error) {
        console.error('Failed to update Meilisearch:', error);
      }

      console.log(`[${new Date().toISOString()}] Thumbnail created for asset ${assetId}: ${thumbKey}`);
      
      return { success: true, thumbKey };
    } catch (error) {
      console.error(`Failed to create thumbnail for asset ${assetId}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

thumbnailWorker.on('completed', (job) => {
  console.log(`[${new Date().toISOString()}] Thumbnail job ${job.id} completed`);
});

thumbnailWorker.on('failed', (job, err) => {
  console.error(`[${new Date().toISOString()}] Thumbnail job ${job?.id} failed:`, err);
});
