export async function getSignedGetUrl(key: string, ttlSec = 600): Promise<string> {
  const config = useRuntimeConfig();
  const api = config.public.apiBase as string;
  if (!api) throw new Error('apiBase が未設定です（nuxt.config.ts の runtimeConfig.public.apiBase を確認）');
  const url = `${api}/uploads/signed-get?key=${encodeURIComponent(key)}&ttl=${ttlSec}`;
  const res = await $fetch<{ url: string }>(url);
  return res.url;
}
