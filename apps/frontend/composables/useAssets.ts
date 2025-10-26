import type { Asset } from '@talking/types';

export const getSignedGetUrl = async (key: string): Promise<string> => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const response = await fetch(`${apiBase}/uploads/signed-get?key=${encodeURIComponent(key)}&ttl=300`);
  const data = await response.json();
  return data.url;
};

export const useAssets = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const listAssets = async (params?: { limit?: number; cursor?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.cursor) query.append('cursor', params.cursor);

    const url = `${apiBase}/assets${query.toString() ? '?' + query.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }

    const data = await response.json();
    const base = useRuntimeConfig().public.NUXT_PUBLIC_S3_PUBLIC_BASE;
    for (const item of data.items) {
      if (!item.url || item.url.startsWith('undefined')) {
        item.url = `${base}/${item.key}`;
      }
      // Get signed URL if key exists
      if (item.key) {
        try {
          item.url = await getSignedGetUrl(item.key);
        } catch (e) {
          // Fallback to public URL on error
          console.warn('Failed to get signed URL, using fallback', e);
        }
      }
    }
    return {
      items: data.items as Asset[],
      nextCursor: data.nextCursor as string | null,
    };
  };

  const getAsset = async (id: string): Promise<Asset> => {
    const url = `${apiBase}/assets/${id}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    const item = await response.json();
    const base = useRuntimeConfig().public.NUXT_PUBLIC_S3_PUBLIC_BASE;
    if (!item.url || item.url.startsWith('undefined')) {
      item.url = `${base}/${item.key}`;
    }
    // Get signed URL if key exists
    if (item.key) {
      try {
        item.url = await getSignedGetUrl(item.key);
      } catch (e) {
        // Fallback to public URL on error
        console.warn('Failed to get signed URL, using fallback', e);
      }
    }
    return item;
  };

  return {
    listAssets,
    getAsset,
  };
};
