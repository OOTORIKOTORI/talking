import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { MeiliSearch } from 'meilisearch';
import './thumbnail/thumbnail.worker';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILI_KEY || 'masterKey123';

// Create Redis connection
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create Meilisearch client
const meiliClient = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_KEY,
});

// Create Queue instance for adding jobs (if needed)
export const imageQueue = new Queue('image', {
  connection,
});

export const searchQueue = new Queue('search-index', {
  connection,
});

// Search index worker
const searchWorker = new Worker(
  'search-index',
  async (job) => {
    console.log(`[${new Date().toISOString()}] Indexing asset ${job.data.id}`);
    
    const { id, title, description, tags, primaryTag, contentType, url, createdAt } = job.data;
    
    const index = meiliClient.index('assets');
    await index.addDocuments([
      { id, title, description, tags, primaryTag, contentType, url, createdAt }
    ], { primaryKey: 'id' });
    
    console.log(`[${new Date().toISOString()}] Asset ${id} indexed`);
    
    return { indexed: true, assetId: id };
  },
  {
    connection,
    concurrency: 3,
  }
);

// Create Worker to process jobs
const imageWorker = new Worker(
  'image',
  async (job) => {
    console.log(`[${new Date().toISOString()}] Processing job ${job.id} of type ${job.name}`);
    console.log('Job data:', job.data);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[${new Date().toISOString()}] Job ${job.id} completed`);
    
    return { processed: true, jobId: job.id };
  },
  {
    connection,
    concurrency: 5,
  }
);

// Event listeners
searchWorker.on('completed', (job) => {
  console.log(`✓ Search index job ${job.id} completed`);
});

searchWorker.on('failed', (job, err) => {
  console.error(`✗ Search index job ${job?.id} failed:`, err.message);
});

searchWorker.on('error', (err) => {
  console.error('Search worker error:', err);
});

// Event listeners
imageWorker.on('completed', (job) => {
  console.log(`✓ Job ${job.id} has completed!`);
});

imageWorker.on('failed', (job, err) => {
  console.error(`✗ Job ${job?.id} has failed with error:`, err.message);
});

imageWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down worker...');
  await searchWorker.close();
  await imageWorker.close();
  await searchQueue.close();
  await imageQueue.close();
  await connection.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('🚀 Workers started and listening for jobs');
console.log(`📡 Connected to Redis: ${REDIS_URL}`);
console.log(`🔍 Connected to Meilisearch: ${MEILI_HOST}`);
console.log('📸 Thumbnail worker ready');
