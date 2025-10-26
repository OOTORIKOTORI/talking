import type { Asset } from '@talking/types';
import { getSignedGetUrl } from './useSignedUrl';

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
      // Get signed URL for thumbnail if available, otherwise use original
      const keyToUse = item.thumbKey || item.key;
      if (keyToUse) {
        try {
          item.url = await getSignedGetUrl(keyToUse);
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

  const searchAssets = async (q: string, limit = 20, offset = 0) => {
    const query = new URLSearchParams();
    query.append('q', q);
    query.append('limit', limit.toString());
    query.append('offset', offset.toString());

    const url = `${apiBase}/search/assets?${query.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search assets: ${response.statusText}`);
    }

    const data = await response.json();
    const base = useRuntimeConfig().public.NUXT_PUBLIC_S3_PUBLIC_BASE;
    for (const item of data.items) {
      if (!item.url || item.url.startsWith('undefined')) {
        item.url = `${base}/${item.key}`;
      }
      // Get signed URL for thumbnail if available, otherwise use original
      const keyToUse = item.thumbKey || item.key;
      if (keyToUse) {
        try {
          item.url = await getSignedGetUrl(keyToUse);
        } catch (e) {
          // Fallback to public URL on error
          console.warn('Failed to get signed URL, using fallback', e);
        }
      }
    }
    return {
      items: data.items as Asset[],
      total: data.total as number,
      limit: data.limit as number,
      offset: data.offset as number,
    };
  };

  const updateAsset = async (id: string, data: { title?: string; description?: string; tags?: string[] }) => {
    const { $apiFetch } = useNuxtApp();
    
    return await $apiFetch(`/assets/${id}`, {
      method: 'PATCH',
      body: data,
    });
  };

  const deleteAsset = async (id: string) => {
    const { $apiFetch } = useNuxtApp();
    
    return await $apiFetch(`/assets/${id}`, {
      method: 'DELETE',
    });
  };

  return {
    listAssets,
    getAsset,
    searchAssets,
    updateAsset,
    deleteAsset,
  };
};
