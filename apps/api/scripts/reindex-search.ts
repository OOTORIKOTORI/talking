import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const prisma = new PrismaClient();

async function main() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });

  const searchQueue = new Queue('search-index', {
    connection,
  });

  console.log('Fetching all assets...');
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
      primaryTag: true,
      contentType: true,
      url: true,
      createdAt: true,
      ownerId: true,
    },
  });

  console.log(`Found ${assets.length} assets. Enqueueing for reindexing...`);

  for (const asset of assets) {
    await searchQueue.add('index-asset', {
      id: asset.id,
      title: asset.title || '',
      description: asset.description || '',
      tags: asset.tags,
      primaryTag: asset.primaryTag,
      contentType: asset.contentType,
      url: asset.url,
      createdAt: asset.createdAt.toISOString(),
      ownerId: asset.ownerId,
    });
  }

  console.log(`✓ Successfully enqueued ${assets.length} assets for reindexing`);

  await searchQueue.close();
  await connection.quit();
}

main()
  .catch((e) => {
    console.error('Error during reindexing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
