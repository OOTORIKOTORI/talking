import { MeiliSearch } from 'meilisearch';

const MEILI_HOST = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_KEY || '';

export const meiliClient = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_KEY,
});
