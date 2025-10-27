import { useApi } from '#imports'

export async function getSignedGetUrl(key: string, ttlSec = 600): Promise<string> {
  const api = useApi()
  const url = `/uploads/signed-get?key=${encodeURIComponent(key)}&ttl=${ttlSec}`;
  const res = await api<{ url: string }>(url);
  return res.url;
}
