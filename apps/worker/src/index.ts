import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Create Redis connection
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create Queue instance for adding jobs (if needed)
export const imageQueue = new Queue('image', {
  connection,
});

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
  await imageWorker.close();
  await imageQueue.close();
  await connection.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('🚀 Worker started and listening for jobs on queue: image');
console.log(`📡 Connected to Redis: ${REDIS_URL}`);
